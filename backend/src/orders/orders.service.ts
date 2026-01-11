import {
  Inject,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  CreateOrderDto,
  OrderResponseDto,
  TicketResponseDto,
} from './dto/order.dto';
import { randomUUID } from 'crypto';
import { OrdersRepository } from '../repositories/interfaces/orders.repository.interface';
import { FilmsRepository } from '../repositories/interfaces/films.repository.interface';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject('ORDERS_REPOSITORY')
    private ordersRepository: OrdersRepository,
    @Inject('FILMS_REPOSITORY')
    private filmsRepository: FilmsRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    this.logger.log('OrdersService: creating order');

    if (!createOrderDto.tickets || createOrderDto.tickets.length === 0) {
      throw new BadRequestException('At least one ticket is required');
    }

    const firstTicket = createOrderDto.tickets[0];
    const sameFilmAndSession = createOrderDto.tickets.every(
      (ticket) =>
        ticket.film === firstTicket.film &&
        ticket.session === firstTicket.session,
    );

    if (!sameFilmAndSession) {
      throw new BadRequestException(
        'All tickets must be for the same film and session',
      );
    }

    const schedule = await this.filmsRepository.findScheduleById(
      firstTicket.film,
      firstTicket.session,
    );

    if (!schedule) {
      throw new BadRequestException('Schedule not found');
    }

    const seatsToBook = [];
    for (const ticket of createOrderDto.tickets) {
      if (ticket.row < 1 || ticket.row > schedule.rows) {
        throw new BadRequestException(
          `Row ${ticket.row} is out of range (1-${schedule.rows})`,
        );
      }
      if (ticket.seat < 1 || ticket.seat > schedule.seats) {
        throw new BadRequestException(
          `Seat ${ticket.seat} is out of range (1-${schedule.seats})`,
        );
      }
      seatsToBook.push(`${ticket.row}:${ticket.seat}`);
    }

    const booked = await this.filmsRepository.bookSeats(
      firstTicket.film,
      firstTicket.session,
      seatsToBook,
    );

    if (!booked) {
      const currentTakenSeats = schedule.taken;
      const conflictingSeats = seatsToBook.filter((seat) =>
        currentTakenSeats.includes(seat),
      );

      if (conflictingSeats.length > 0) {
        throw new BadRequestException(
          `Seat(s) ${conflictingSeats.join(', ')} are already taken`,
        );
      }

      throw new BadRequestException('Failed to book seats. Please try again.');
    }

    const createdOrder = await this.ordersRepository.create(createOrderDto);

    const ticketsWithId: TicketResponseDto[] = createOrderDto.tickets.map(
      (ticket) => ({
        ...ticket,
        id: randomUUID(),
      }),
    );

    this.logger.log(
      `OrdersService: order ${createdOrder.id} created with ${ticketsWithId.length} tickets`,
    );

    return {
      total: ticketsWithId.length,
      items: ticketsWithId,
    };
  }
}
