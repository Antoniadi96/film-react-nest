import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import {
  OrdersRepository,
  OrderWithId,
} from '../interfaces/orders.repository.interface';
import { CreateOrderDto } from '../../orders/dto/order.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class OrdersPostgresRepository implements OrdersRepository {
  private readonly logger = new Logger(OrdersPostgresRepository.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {
    this.logger.log('OrdersPostgresRepository initialized');
  }

  async create(order: CreateOrderDto): Promise<OrderWithId> {
    const orderId = randomUUID();
    const orderWithId: OrderWithId = {
      id: orderId,
      ...order,
    };

    this.logger.log(`Creating order with id: ${orderWithId.id}`);

    try {
      const createdOrder = this.orderRepository.create(orderWithId);
      await this.orderRepository.save(createdOrder);

      this.logger.log(`Order ${orderId} created successfully`);
      return orderWithId;
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      throw error;
    }
  }

  async getTakenSeats(filmId: string, scheduleId: string): Promise<string[]> {
    this.logger.log(
      `Getting taken seats for film ${filmId}, schedule ${scheduleId}`,
    );

    try {
      const orders = await this.orderRepository
        .createQueryBuilder('order')
        .where(`order.tickets @> :ticketFilter`, {
          ticketFilter: JSON.stringify([{ film: filmId, session: scheduleId }]),
        })
        .getMany();

      const takenSeats: Set<string> = new Set();

      orders.forEach((order) => {
        order.tickets.forEach((ticket: any) => {
          if (ticket.film === filmId && ticket.session === scheduleId) {
            takenSeats.add(`${ticket.row}:${ticket.seat}`);
          }
        });
      });

      this.logger.log(`Found ${takenSeats.size} taken seats`);
      return Array.from(takenSeats);
    } catch (error) {
      this.logger.error(`Error getting taken seats: ${error.message}`);
      return [];
    }
  }
}
