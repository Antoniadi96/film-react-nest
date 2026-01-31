import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderIncomingDto,
  OrderResponseDto,
  CreateOrderDto,
  TicketIncomingDto,
} from './dto/order.dto';

@Controller('order')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Body() createOrderIncomingDto: CreateOrderIncomingDto,
  ): Promise<OrderResponseDto> {
    try {
      this.logger.log('POST /order');
      this.logger.log(
        'Received data:',
        JSON.stringify(createOrderIncomingDto, null, 2),
      );

      // Преобразуем входящий DTO в формат, ожидаемый сервисом
      const createOrderDto: CreateOrderDto = {
        email: createOrderIncomingDto.email,
        phone: createOrderIncomingDto.phone,
        tickets: createOrderIncomingDto.tickets.map((ticket) =>
          this.convertTicketIncomingToTicketDto(ticket),
        ),
      };

      this.logger.log('Converted to:', JSON.stringify(createOrderDto, null, 2));

      return await this.ordersService.create(createOrderDto);
    } catch (error) {
      this.logger.error('Error in orders controller:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error.getStatus && error.getStatus() === HttpStatus.BAD_REQUEST) {
        throw error;
      }

      throw new HttpException(
        { error: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private convertTicketIncomingToTicketDto(ticketIncoming: TicketIncomingDto) {
    let daytime: string;

    if (ticketIncoming.daytime) {
      daytime = ticketIncoming.daytime;
    } else if (ticketIncoming.day && ticketIncoming.time) {
      daytime = this.combineDayTime(ticketIncoming.day, ticketIncoming.time);
    } else {
      throw new BadRequestException(
        'Ticket must have either daytime or both day and time',
      );
    }

    return {
      film: ticketIncoming.film,
      session: ticketIncoming.session,
      daytime: this.ensureISODateFormat(daytime),
      row: ticketIncoming.row,
      seat: ticketIncoming.seat,
      price: ticketIncoming.price,
    };
  }

  private combineDayTime(day: string, time: string): string {
    let date: Date;

    if (day.includes('-')) {
      date = new Date(day);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(`Invalid date format: ${day}`);
      }
    } else if (day.includes('.')) {
      const parts = day.split('.');
      if (parts.length === 3) {
        // Формат dd.mm.yyyy
        const dayNum = parseInt(parts[0], 10);
        const monthNum = parseInt(parts[1], 10) - 1;
        const yearNum = parseInt(parts[2], 10);

        date = new Date(yearNum, monthNum, dayNum);
        if (isNaN(date.getTime())) {
          throw new BadRequestException(`Invalid date format: ${day}`);
        }
      } else {
        throw new BadRequestException(`Invalid date format: ${day}`);
      }
    } else {
      throw new BadRequestException(`Invalid date format: ${day}`);
    }

    const [hours, minutes, seconds = '00'] = time.split(':');
    date.setHours(
      parseInt(hours, 10),
      parseInt(minutes, 10),
      parseInt(seconds, 10),
      0,
    );

    return date.toISOString();
  }

  private ensureISODateFormat(dateString: string): string {
    if (dateString.includes('T') && dateString.endsWith('Z')) {
      return dateString;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date format: ${dateString}`);
    }

    return date.toISOString();
  }
}
