import { CreateOrderDto } from '../../orders/dto/order.dto';

export interface OrderWithId extends CreateOrderDto {
  id: string;
}

export interface OrdersRepository {
  create(order: CreateOrderDto): Promise<OrderWithId>;
  getTakenSeats(filmId: string, scheduleId: string): Promise<string[]>;
}
