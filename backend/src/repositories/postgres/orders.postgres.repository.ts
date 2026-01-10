import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrdersRepository } from '../interfaces/orders.repository.interface';
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

  async create(
    order: CreateOrderDto,
  ): Promise<{ id: string } & CreateOrderDto> {
    const orderWithId = {
      id: randomUUID(),
      ...order,
      createdAt: new Date(),
    };

    this.logger.log(`Creating order with id: ${orderWithId.id}`);

    try {
      const createdOrder = this.orderRepository.create(orderWithId);
      await this.orderRepository.save(createdOrder);
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
        .where(
          `order.tickets @> '[{"film": "${filmId}", "session": "${scheduleId}"}]'`,
        )
        .getMany();

      const takenSeats: string[] = [];
      orders.forEach((order) => {
        order.tickets.forEach((ticket) => {
          if (ticket.film === filmId && ticket.session === scheduleId) {
            takenSeats.push(`${ticket.row}:${ticket.seat}`);
          }
        });
      });

      this.logger.log(`Found ${takenSeats.length} taken seats`);
      return Array.from(new Set(takenSeats));
    } catch (error) {
      this.logger.error(`Error getting taken seats: ${error.message}`);
      throw error;
    }
  }
}
