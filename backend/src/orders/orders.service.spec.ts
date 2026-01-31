import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrdersRepository = {
    create: jest.fn(),
  };

  const mockFilmsRepository = {
    findScheduleById: jest.fn(),
    bookSeats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: 'ORDERS_REPOSITORY',
          useValue: mockOrdersRepository,
        },
        {
          provide: 'FILMS_REPOSITORY',
          useValue: mockFilmsRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
