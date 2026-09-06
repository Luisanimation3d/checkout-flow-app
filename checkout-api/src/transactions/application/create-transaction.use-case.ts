import { Inject, Injectable, Logger } from '@nestjs/common';
import { FindOrCreateCustomerUseCase } from '../../customers/application/find-or-create-customer.use-case';
import type { CustomerInput } from '../../customers/domain/customer-validation';
import { CreateDeliveryUseCase } from '../../deliveries/application/create-delivery.use-case';
import type { DeliveryInput } from '../../deliveries/domain/delivery-validation';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from '../../products/domain/product-repository.port';
import { Result } from '../../shared/core/result';
import { generateReference } from '../../shared/core/generate-reference';
import {
  calculateDeliveryFee,
  getOrderAmountInCents,
} from '../domain/checkout-pricing';
import { ProductOutOfStockError } from '../domain/product-out-of-stock.error';
import type { Transaction } from '../domain/transaction';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../domain/transaction-repository.port';
import {
  WOMPI_GATEWAY,
  type WompiChargeResult,
  type WompiGatewayPort,
} from '../domain/wompi-gateway.port';

export interface CreateTransactionInput {
  productId: string;
  cardToken: string;
  installments: number;
  customer: CustomerInput;
  delivery: DeliveryInput;
}

@Injectable()
export class CreateTransactionUseCase {
  private readonly logger = new Logger(CreateTransactionUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    private readonly findOrCreateCustomer: FindOrCreateCustomerUseCase,
    private readonly createDelivery: CreateDeliveryUseCase,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(WOMPI_GATEWAY)
    private readonly wompiGateway: WompiGatewayPort,
  ) {}

  async execute(input: CreateTransactionInput): Promise<Result<Transaction>> {
    this.logger.log(
      `Iniciando checkout — producto=${input.productId} cuotas=${input.installments}`,
    );

    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      this.logger.warn(`Producto "${input.productId}" no existe`);
      return Result.fail(
        new Error(`Product with id "${input.productId}" was not found`),
      );
    }
    if (product.stock <= 0) {
      this.logger.warn(`Producto "${product.id}" sin stock disponible`);
      return Result.fail(new ProductOutOfStockError(input.productId));
    }
    this.logger.log(`Producto "${product.title}" — stock=${product.stock}`);

    const customerResult = await this.findOrCreateCustomer.execute(
      input.customer,
    );
    if (customerResult.isFailure) {
      this.logger.warn(`Datos de cliente inválidos: ${customerResult.error.message}`);
      return Result.fail(customerResult.error);
    }
    this.logger.log(`Cliente resuelto — id=${customerResult.value.id}`);

    const deliveryResult = await this.createDelivery.execute(input.delivery);
    if (deliveryResult.isFailure) {
      this.logger.warn(`Datos de entrega inválidos: ${deliveryResult.error.message}`);
      return Result.fail(deliveryResult.error);
    }
    this.logger.log(`Entrega creada — id=${deliveryResult.value.id}`);

    // El total nunca lo decide el frontend: se recalcula acá con las mismas reglas.
    const deliveryFee = calculateDeliveryFee(
      product.deliveryFee,
      input.delivery.city,
    );
    const amountInCents = getOrderAmountInCents(product.price, deliveryFee);
    const reference = generateReference();
    this.logger.log(
      `Monto calculado — ${amountInCents} centavos ${product.currency} (referencia=${reference})`,
    );

    let transaction = await this.transactionRepository.create({
      reference,
      productId: product.id,
      customerId: customerResult.value.id,
      deliveryId: deliveryResult.value.id,
      amountInCents,
      currency: product.currency,
      status: 'PENDING',
      wompiTransactionId: null,
      statusMessage: null,
    });
    this.logger.log(`Transacción "${transaction.id}" creada en estado PENDING`);

    this.logger.log(`Enviando cobro a Wompi — referencia=${reference}`);
    let charge: WompiChargeResult;
    try {
      charge = await this.wompiGateway.createCardTransaction({
        reference,
        amountInCents,
        currency: product.currency,
        cardToken: input.cardToken,
        installments: input.installments,
        customerEmail: input.customer.email,
      });
    } catch (err) {
      // Si Wompi falla acá (p. ej. no pudimos obtener los acceptance tokens),
      // la transacción ya quedó creada en PENDING: hay que cerrarla como ERROR
      // en vez de dejarla huérfana, y no dejar que el Error escape sin control
      // (Nest lo convertiría en un 500 genérico, perdiendo el motivo real).
      const message =
        err instanceof Error ? err.message : 'No pudimos comunicarnos con Wompi.';
      this.logger.error(`Fallo de comunicación con Wompi: ${message}`);
      await this.transactionRepository.transitionFromPending(transaction.id, {
        status: 'ERROR',
        wompiTransactionId: null,
        statusMessage: message,
      });
      return Result.fail(new Error(message));
    }
    this.logger.log(
      `Wompi respondió — status=${charge.status} wompiId="${charge.wompiTransactionId}"`,
    );

    const { transaction: updatedTransaction, didTransition } =
      await this.transactionRepository.transitionFromPending(transaction.id, {
        status: charge.status,
        wompiTransactionId: charge.wompiTransactionId,
        statusMessage: charge.statusMessage,
      });
    transaction = updatedTransaction;

    if (didTransition && charge.status === 'APPROVED') {
      await this.productRepository.decreaseStock(product.id);
      this.logger.log(`Stock de "${product.id}" decrementado (pago aprobado)`);
    }

    this.logger.log(
      `Checkout finalizado — transacción="${transaction.id}" status=${transaction.status}`,
    );
    return Result.ok(transaction);
  }
}
