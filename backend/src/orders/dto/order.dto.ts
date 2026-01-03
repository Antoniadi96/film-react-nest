import {
  IsString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsNumber,
  Min,
  IsEmail,
  IsPhoneNumber,
  IsDateString,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

// Входящие данные от фронтенда
export class TicketIncomingDto {
  @IsUUID()
  film: string;

  @IsUUID()
  session: string;

  @IsOptional()
  @IsString()
  daytime?: string;

  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsNumber()
  @Min(1)
  row: number;

  @IsNumber()
  @Min(1)
  seat: number;

  @IsNumber()
  @Min(0)
  price: number;
}

// Формат для внутреннего использования сервисом
export class TicketDto {
  @IsUUID()
  film: string;

  @IsUUID()
  session: string;

  @IsDateString()
  daytime: string;

  @IsNumber()
  @Min(1)
  row: number;

  @IsNumber()
  @Min(1)
  seat: number;

  @IsNumber()
  @Min(0)
  price: number;
}

// Входящий DTO для заказа
export class CreateOrderIncomingDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber('RU')
  phone: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TicketIncomingDto)
  tickets: TicketIncomingDto[];
}

// DTO для внутреннего использования
export class CreateOrderDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber('RU')
  phone: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];
}

export class TicketResponseDto extends TicketDto {
  @IsUUID()
  id: string;
}

export class OrderResponseDto {
  total: number;
  items: TicketResponseDto[];
}

export class ErrorResponseDto {
  error: string;
}
