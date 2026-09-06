import type { ProductRepositoryPort } from '../../products/domain/product-repository.port';
import { TransactionNotFoundError } from '../domain/transaction-not-found.error';
import type { Transaction } from '../domain/transaction';
import type { TransactionRepositoryPort } from '../domain/transaction-repository.port';
import type { WompiChargeResult, WompiGatewayPort } from '../domain/wompi-gateway.port';
import { GetTransactionByIdUseCase } from './get-transaction-by-id.use-case';

const pendingTransaction: Transaction = {
  id: 't1',
  reference: 'checkout-123',
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  amountInCents: 11400000,
  currency: 'COP',
  status: 'PENDING',
  wompiTransactionId: 'wompi-1',
  statusMessage: null,
};

describe('GetTransactionByIdUseCase', () => {
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let wompiGateway: jest.Mocked<WompiGatewayPort>;
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let useCase: GetTransactionByIdUseCase;

  beforeEach(() => {
    transactionRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(pendingTransaction),
      transitionFromPending: jest.fn(),
    };
    wompiGateway = {
      createCardTransaction: jest.fn(),
      getTransactionStatus: jest.fn(),
      getTokenizationPublicKey: jest.fn(),
      tokenizeCard: jest.fn(),
    };
    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      decreaseStock: jest.fn(),
    };

    useCase = new GetTransactionByIdUseCase(
      transactionRepository,
      wompiGateway,
      productRepository,
    );
  });

  it('fails with TransactionNotFoundError when the transaction does not exist', async () => {
    transactionRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('missing');

    expect(result.isFailure).toBe(true);
    if (result.isFailure) expect(result.error).toBeInstanceOf(TransactionNotFoundError);
    expect(wompiGateway.getTransactionStatus).not.toHaveBeenCalled();
  });

  it('does not poll Wompi when the transaction is already resolved (not PENDING)', async () => {
    transactionRepository.findById.mockResolvedValue({
      ...pendingTransaction,
      status: 'APPROVED',
    });

    const result = await useCase.execute('t1');

    expect(wompiGateway.getTransactionStatus).not.toHaveBeenCalled();
    expect(result.isSuccess).toBe(true);
  });

  it('polls Wompi while PENDING and returns the same transaction when nothing changed', async () => {
    wompiGateway.getTransactionStatus.mockResolvedValue({
      wompiTransactionId: 'wompi-1',
      status: 'PENDING',
      statusMessage: null,
    });

    const result = await useCase.execute('t1');

    expect(wompiGateway.getTransactionStatus).toHaveBeenCalledWith('wompi-1');
    expect(transactionRepository.transitionFromPending).not.toHaveBeenCalled();
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) expect(result.value.status).toBe('PENDING');
  });

  it('updates the transaction and decreases stock when Wompi resolves to APPROVED', async () => {
    const approvedCharge: WompiChargeResult = {
      wompiTransactionId: 'wompi-1',
      status: 'APPROVED',
      statusMessage: null,
    };
    wompiGateway.getTransactionStatus.mockResolvedValue(approvedCharge);
    transactionRepository.transitionFromPending.mockResolvedValue({
      transaction: { ...pendingTransaction, status: 'APPROVED' },
      didTransition: true,
    });

    const result = await useCase.execute('t1');

    expect(transactionRepository.transitionFromPending).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ status: 'APPROVED', wompiTransactionId: 'wompi-1' }),
    );
    expect(productRepository.decreaseStock).toHaveBeenCalledWith('p1');
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) expect(result.value.status).toBe('APPROVED');
  });

  it('updates the transaction to DECLINED without touching stock', async () => {
    wompiGateway.getTransactionStatus.mockResolvedValue({
      wompiTransactionId: 'wompi-1',
      status: 'DECLINED',
      statusMessage: 'Fondos insuficientes',
    });
    transactionRepository.transitionFromPending.mockResolvedValue({
      transaction: { ...pendingTransaction, status: 'DECLINED' },
      didTransition: true,
    });

    const result = await useCase.execute('t1');

    expect(productRepository.decreaseStock).not.toHaveBeenCalled();
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) expect(result.value.status).toBe('DECLINED');
  });

  it('does not decrease stock twice when another concurrent request already won the APPROVED transition', async () => {
    wompiGateway.getTransactionStatus.mockResolvedValue({
      wompiTransactionId: 'wompi-1',
      status: 'APPROVED',
      statusMessage: null,
    });
    transactionRepository.transitionFromPending.mockResolvedValue({
      transaction: { ...pendingTransaction, status: 'APPROVED' },
      didTransition: false,
    });

    await useCase.execute('t1');

    expect(productRepository.decreaseStock).not.toHaveBeenCalled();
  });
});
