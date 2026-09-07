import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateDeliveryUseCase } from './application/create-delivery.use-case';
import { GetDeliveryByIdUseCase } from './application/get-delivery-by-id.use-case';
import { DeliveriesController } from './deliveries.controller';
import { DELIVERY_REPOSITORY } from './domain/delivery-repository.port';
import { DeliveryTypeOrmRepository } from './infrastructure/delivery-typeorm.repository';
import { DeliveryOrmEntity } from './infrastructure/delivery.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryOrmEntity])],
  controllers: [DeliveriesController],
  providers: [
    GetDeliveryByIdUseCase,
    CreateDeliveryUseCase,
    { provide: DELIVERY_REPOSITORY, useClass: DeliveryTypeOrmRepository },
  ],
  exports: [CreateDeliveryUseCase],
})
export class DeliveriesModule {}
