import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../../schemas/order.schema';
import { OrdersRepository } from '../interfaces/orders.repository.interface';
import { CreateOrderDto } from '../../orders/dto/order.dto';
import { randomUUID } from 'crypto';

// Этот класс представляет репозиторий, который хранит данные о заказах в MongoDB
@Injectable()
export class OrdersMongoDbRepository implements OrdersRepository {
  private readonly logger = new Logger(OrdersMongoDbRepository.name);

  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {
    this.logger.log('OrdersMongoDbRepository initialized');
  }

  // Метод для создания нового заказа в MongoDB
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
      const createdOrder = new this.orderModel(orderWithId);
      await createdOrder.save();
      return orderWithId;
    } catch (error) {
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Метод для получения списка занятых мест для определенного фильма и сеанса
  async getTakenSeats(filmId: string, scheduleId: string): Promise<string[]> {
    this.logger.log(
      `Getting taken seats for film ${filmId}, schedule ${scheduleId}`,
    );

    try {
      const orders = await this.orderModel
        .find({
          'tickets.film': filmId,
          'tickets.session': scheduleId,
        })
        .exec();

      const takenSeats: string[] = [];
      orders.forEach((order) => {
        order.tickets.forEach((ticket) => {
          takenSeats.push(`${ticket.row}:${ticket.seat}`);
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
