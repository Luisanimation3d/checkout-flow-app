import { IsString } from 'class-validator';

export class TokenizeCardDto {
  @IsString()
  payload: string;
}
