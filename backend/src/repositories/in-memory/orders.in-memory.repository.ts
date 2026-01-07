import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../interfaces/orders.repository.interface';
import { CreateOrderDto } from '../../orders/dto/order.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class OrdersInMemoryRepository implements OrdersRepository {
  private orders: ({ id: string } & CreateOrderDto)[] = [];
  private takenSeatsMap: Map<string, string[]> = new Map();

  async create(
    order: CreateOrderDto,
  ): Promise<{ id: string } & CreateOrderDto> {
    const orderWithId = {
      id: randomUUID(),
      ...order,
    };

    this.orders.push(orderWithId);

    // Обновляем занятые места
    const key = `${order.tickets[0].film}-${order.tickets[0].session}`;
    const currentTakenSeats = this.takenSeatsMap.get(key) || [];

    // Добавляем новые занятые места
    const newTakenSeats = order.tickets.map(
      (ticket) => `${ticket.row}:${ticket.seat}`,
    );
    this.takenSeatsMap.set(key, [...currentTakenSeats, ...newTakenSeats]);

    return orderWithId;
  }

  async getTakenSeats(filmId: string, scheduleId: string): Promise<string[]> {
    const key = `${filmId}-${scheduleId}`;
    return this.takenSeatsMap.get(key) || [];
  }
}
