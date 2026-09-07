import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTransactionUseCase } from './application/create-transaction.use-case';
import { GetTransactionByIdUseCase } from './application/get-transaction-by-id.use-case';
import type { Transaction } from './domain/transaction';
import { CreateTransactionDto } from './presentation/create-transaction.dto';
import { TransactionResponseDto } from './presentation/transaction-response.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
  ) {}

  @ApiOperation({
    summary: 'Crea cliente, entrega y transacción, y la envía al proveedor de pagos con el cardToken ya tokenizado',
  })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos o producto sin stock' })
  @Post()
  async create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    const result = await this.createTransactionUseCase.execute(dto);

    if (result.isFailure) {
      throw new BadRequestException(result.error.message);
    }

    return result.value;
  }

  @ApiOperation({ summary: 'Consulta el estado actual de una transacción (para polling desde el frontend)' })
  @ApiParam({ name: 'id', example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({ description: 'La transacción no existe' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Transaction> {
    const result = await this.getTransactionByIdUseCase.execute(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error.message);
    }

    return result.value;
  }
}
