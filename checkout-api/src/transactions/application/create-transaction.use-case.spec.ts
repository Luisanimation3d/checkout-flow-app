import type { Customer } from '../../customers/domain/customer';
import type { FindOrCreateCustomerUseCase } from '../../customers/application/find-or-create-customer.use-case';
import { InvalidCustomerDataError } from '../../customers/domain/invalid-customer-data.error';
import type { Delivery } from '../../deliveries/domain/delivery';
import type { CreateDeliveryUseCase } from '../../deliveries/application/create-delivery.use-case';
import { InvalidDeliveryDataError } from '../../deliveries/domain/invalid-delivery-data.error';
import type { Product } from '../../products/domain/product';
import type { ProductRepositoryPort } from '../../products/domain/product-repository.port';
import { Result } from '../../shared/core/result';
import { ProductOutOfStockError } from '../domain/product-out-of-stock.error';
import type { Transaction } from '../domain/transaction';
import type { TransactionRepositoryPort } from '../domain/transaction-repository.port';
import type { GatewayChargeResult, PaymentGatewayPort } from '../domain/payment-gateway.port';
import { CreateTransactionUseCase } from './create-transaction.use-case';

const mockProduct: Product = {
  id: 'p1',
  title: 'Speaker',
  description: 'A speaker',
  price: 100000,
  currency: 'COP',
  stock: 5,
  images: ['a.jpg'],
  deliveryFee: 9000,
};

const mockCustomer: Customer = {
  id: 'c1',
  fullName: 'John Doe',
  documentType: 'CC',
  documentId: '1000099928',
  phone: '3001234567',
  email: 'john@example.com',
};

const mockDelivery: Delivery = {
  id: 'd1',
  address: 'Calle 123 #45-67',
  city: 'medellin',
  department: 'antioquia',
  status: 'PENDING',
};

const pendingTransaction: Transaction = {
  id: 't1',
  reference: 'checkout-123',
  productId: mockProduct.id,
  customerId: mockCustomer.id,
  deliveryId: mockDelivery.id,
  amountInCents: 11400000,
  currency: 'COP',
  status: 'PENDING',
  gatewayTransactionId: null,
  statusMessage: null,
};

const validInput = {
  productId: mockProduct.id,
  cardToken: 'tok_test',
  installments: 1,
  customer: {
    fullName: mockCustomer.fullName,
    documentType: mockCustomer.documentType,
    documentId: mockCustomer.documentId,
    phone: mockCustomer.phone,
    email: mockCustomer.email,
  },
  delivery: {
    address: mockDelivery.address,
    city: mockDelivery.city,
    department: mockDelivery.department,
  },
};

describe('CreateTransactionUseCase', () => {
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;
  let findOrCreateCustomer: { execute: jest.Mock };
  let createDelivery: { execute: jest.Mock };
  let useCase: CreateTransactionUseCase;

  beforeEach(() => {
    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(mockProduct),
      decreaseStock: jest.fn(),
    };
    transactionRepository = {
      create: jest.fn().mockResolvedValue(pendingTransaction),
      findById: jest.fn(),
      transitionFromPending: jest.fn(),
    };
    paymentGateway = {
      createCardTransaction: jest.fn(),
      getTransactionStatus: jest.fn(),
      getTokenizationPublicKey: jest.fn(),
      tokenizeCard: jest.fn(),
    };
    findOrCreateCustomer = { execute: jest.fn().mockResolvedValue(Result.ok(mockCustomer)) };
    createDelivery = { execute: jest.fn().mockResolvedValue(Result.ok(mockDelivery)) };

    useCase = new CreateTransactionUseCase(
      productRepository,
      findOrCreateCustomer as unknown as FindOrCreateCustomerUseCase,
      createDelivery as unknown as CreateDeliveryUseCase,
      transactionRepository,
      paymentGateway,
    );
  });

  const approvedCharge: GatewayChargeResult = {
    gatewayTransactionId: 'gateway-txn-1',
    status: 'APPROVED',
    statusMessage: null,
  };

  it('fails when the product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(validInput);

    expect(result.isFailure).toBe(true);
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('fails with ProductOutOfStockError when stock is 0', async () => {
    productRepository.findById.mockResolvedValue({ ...mockProduct, stock: 0 });

    const result = await useCase.execute(validInput);

    expect(result.isFailure).toBe(true);
    if (result.isFailure) expect(result.error).toBeInstanceOf(ProductOutOfStockError);
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('fails when customer data is invalid, without touching the gateway', async () => {
    findOrCreateCustomer.execute.mockResolvedValue(
      Result.fail(new InvalidCustomerDataError('bad email')),
    );

    const result = await useCase.execute(validInput);

    expect(result.isFailure).toBe(true);
    if (result.isFailure) expect(result.error).toBeInstanceOf(InvalidCustomerDataError);
    expect(transactionRepository.create).not.toHaveBeenCalled();
    expect(paymentGateway.createCardTransaction).not.toHaveBeenCalled();
  });

  it('fails when delivery data is invalid, without touching the gateway', async () => {
    createDelivery.execute.mockResolvedValue(
      Result.fail(new InvalidDeliveryDataError('bad address')),
    );

    const result = await useCase.execute(validInput);

    expect(result.isFailure).toBe(true);
    if (result.isFailure) expect(result.error).toBeInstanceOf(InvalidDeliveryDataError);
    expect(paymentGateway.createCardTransaction).not.toHaveBeenCalled();
  });

  it('creates the transaction as PENDING before charging the gateway, using the server-recalculated amount', async () => {
    paymentGateway.createCardTransaction.mockResolvedValue(approvedCharge);
    transactionRepository.transitionFromPending.mockResolvedValue({
      transaction: { ...pendingTransaction, status: 'APPROVED' },
      didTransition: true,
    });

    await useCase.execute(validInput);

    // medellin -> multiplicador 1x: deliveryFee = 9000; amount = (100000+5000+9000)*100
    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: mockProduct.id,
        customerId: mockCustomer.id,
        deliveryId: mockDelivery.id,
        amountInCents: 11400000,
        currency: 'COP',
        status: 'PENDING',
      }),
    );
    expect(paymentGateway.createCardTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amountInCents: 11400000,
        currency: 'COP',
        cardToken: validInput.cardToken,
        installments: validInput.installments,
        customerEmail: validInput.customer.email,
      }),
    );
  });

  it('decreases stock when the charge is approved and this call won the transition', async () => {
    paymentGateway.createCardTransaction.mockResolvedValue(approvedCharge);
    transactionRepository.transitionFromPending.mockResolvedValue({
      transaction: { ...pendingTransaction, status: 'APPROVED' },
      didTransition: true,
    });

    const result = await useCase.execute(validInput);

    expect(productRepository.decreaseStock).toHaveBeenCalledWith(mockProduct.id);
    expect(result.isSuccess).toBe(true);
  });

  it('does NOT decrease stock when approved but another concurrent call already won the transition', async () => {
    paymentGateway.createCardTransaction.mockResolvedValue(approvedCharge);
    transactionRepository.transitionFromPending.mockResolvedValue({
      transaction: { ...pendingTransaction, status: 'APPROVED' },
      didTransition: false,
    });

    await useCase.execute(validInput);

    expect(productRepository.decreaseStock).not.toHaveBeenCalled();
  });

  it('does not decrease stock when the charge is declined, but still returns success', async () => {
    paymentGateway.createCardTransaction.mockResolvedValue({
      gatewayTransactionId: 'gateway-txn-1',
      status: 'DECLINED',
      statusMessage: 'Fondos insuficientes',
    });
    transactionRepository.transitionFromPending.mockResolvedValue({
      transaction: { ...pendingTransaction, status: 'DECLINED' },
      didTransition: true,
    });

    const result = await useCase.execute(validInput);

    expect(productRepository.decreaseStock).not.toHaveBeenCalled();
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) expect(result.value.status).toBe('DECLINED');
  });

  it('marks the transaction as ERROR and fails cleanly when gateway communication throws', async () => {
    paymentGateway.createCardTransaction.mockRejectedValue(
      new Error('Unable to fetch gateway merchant info: 500'),
    );
    transactionRepository.transitionFromPending.mockResolvedValue({
      transaction: { ...pendingTransaction, status: 'ERROR' },
      didTransition: true,
    });

    const result = await useCase.execute(validInput);

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.message).toBe('Unable to fetch gateway merchant info: 500');
    }
    expect(transactionRepository.transitionFromPending).toHaveBeenCalledWith(
      pendingTransaction.id,
      expect.objectContaining({ status: 'ERROR', gatewayTransactionId: null }),
    );
    expect(productRepository.decreaseStock).not.toHaveBeenCalled();
  });
});
