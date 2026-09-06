import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateTransactionUseCase } from './application/create-transaction.use-case';
import { GetTransactionByIdUseCase } from './application/get-transaction-by-id.use-case';
import type { Transaction } from './domain/transaction';
import { CreateTransactionDto } from './presentation/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    const result = await this.createTransactionUseCase.execute(dto);

    if (result.isFailure) {
      throw new BadRequestException(result.error.message);
    }

    return result.value;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Transaction> {
    const result = await this.getTransactionByIdUseCase.execute(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error.message);
    }

    return result.value;
  }
}
