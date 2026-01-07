import { CreateOrderDto } from '../../orders/dto/order.dto';

export interface OrdersRepository {
  create(order: CreateOrderDto): Promise<{ id: string } & CreateOrderDto>;
  getTakenSeats(filmId: string, scheduleId: string): Promise<string[]>;
}
