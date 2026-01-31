import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { BadRequestException, HttpException } from '@nestjs/common';
import {
  CreateOrderIncomingDto,
  OrderResponseDto,
  TicketResponseDto,
  TicketIncomingDto,
} from './dto/order.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
  };

  const mockTicket1: TicketResponseDto = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    film: '550e8400-e29b-41d4-a716-446655440000',
    session: '123e4567-e89b-12d3-a456-426614174000',
    daytime: '2024-01-15T18:00:00Z',
    row: 5,
    seat: 10,
    price: 500,
  };

  const mockTicket2: TicketResponseDto = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    film: '550e8400-e29b-41d4-a716-446655440000',
    session: '123e4567-e89b-12d3-a456-426614174000',
    daytime: '2024-01-15T18:00:00Z',
    row: 5,
    seat: 11,
    price: 500,
  };

  const mockOrderResponse: OrderResponseDto = {
    total: 2,
    items: [mockTicket1, mockTicket2],
  };

  const validOrderDataWithDaytime: CreateOrderIncomingDto = {
    email: 'test@example.com',
    phone: '+79991234567',
    tickets: [
      {
        film: '550e8400-e29b-41d4-a716-446655440000',
        session: '123e4567-e89b-12d3-a456-426614174000',
        daytime: '2024-01-15T18:00:00Z',
        row: 5,
        seat: 10,
        price: 500,
      } as TicketIncomingDto,
    ],
  };

  const validOrderDataWithDayAndTime: CreateOrderIncomingDto = {
    email: 'test@example.com',
    phone: '+79991234567',
    tickets: [
      {
        film: '550e8400-e29b-41d4-a716-446655440000',
        session: '123e4567-e89b-12d3-a456-426614174000',
        day: '2024-01-15',
        time: '18:00:00',
        row: 5,
        seat: 10,
        price: 500,
      } as TicketIncomingDto,
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order with daytime format', async () => {
      mockOrdersService.create.mockResolvedValue(mockOrderResponse);

      const result = await controller.create(validOrderDataWithDaytime);

      expect(result).toEqual(mockOrderResponse);
      expect(ordersService.create).toHaveBeenCalledTimes(1);
    });

    it('should convert day and time to ISO format when daytime is not provided', async () => {
      mockOrdersService.create.mockResolvedValue(mockOrderResponse);

      await controller.create(validOrderDataWithDayAndTime);

      expect(ordersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          phone: '+79991234567',
          tickets: [
            expect.objectContaining({
              daytime: expect.stringMatching(
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
              ),
            }),
          ],
        }),
      );
    });

    it('should handle date in dd.mm.yyyy format', async () => {
      const orderData: CreateOrderIncomingDto = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [
          {
            film: '550e8400-e29b-41d4-a716-446655440000',
            session: '123e4567-e89b-12d3-a456-426614174000',
            day: '15.01.2024',
            time: '18:00',
            row: 5,
            seat: 10,
            price: 500,
          } as TicketIncomingDto,
        ],
      };

      mockOrdersService.create.mockResolvedValue(mockOrderResponse);

      await controller.create(orderData);

      expect(ordersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tickets: [
            expect.objectContaining({
              daytime: expect.stringMatching(/2024-01-15/),
            }),
          ],
        }),
      );
    });

    it('should throw BadRequestException for invalid date format', async () => {
      const invalidOrderData: CreateOrderIncomingDto = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [
          {
            film: '550e8400-e29b-41d4-a716-446655440000',
            session: '123e4567-e89b-12d3-a456-426614174000',
            day: 'invalid-date',
            time: '18:00',
            row: 5,
            seat: 10,
            price: 500,
          } as TicketIncomingDto,
        ],
      };

      await expect(controller.create(invalidOrderData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when neither daytime nor day+time provided', async () => {
      const invalidOrderData = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [
          {
            film: '550e8400-e29b-41d4-a716-446655440000',
            session: '123e4567-e89b-12d3-a456-426614174000',
            row: 5,
            seat: 10,
            price: 500,
          },
        ],
      };

      await expect(
        controller.create(invalidOrderData as CreateOrderIncomingDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should re-throw BadRequestException from service', async () => {
      const serviceError = new BadRequestException('Invalid data from service');
      mockOrdersService.create.mockRejectedValue(serviceError);

      await expect(
        controller.create(validOrderDataWithDaytime),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle multiple tickets', async () => {
      const multiTicketOrder: CreateOrderIncomingDto = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [
          {
            film: '550e8400-e29b-41d4-a716-446655440000',
            session: '123e4567-e89b-12d3-a456-426614174000',
            daytime: '2024-01-15T18:00:00Z',
            row: 5,
            seat: 10,
            price: 500,
          } as TicketIncomingDto,
          {
            film: '550e8400-e29b-41d4-a716-446655440000',
            session: '123e4567-e89b-12d3-a456-426614174000',
            daytime: '2024-01-15T18:00:00Z',
            row: 5,
            seat: 11,
            price: 500,
          } as TicketIncomingDto,
        ],
      };

      mockOrdersService.create.mockResolvedValue(mockOrderResponse);

      const result = await controller.create(multiTicketOrder);

      expect(result.total).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should return HttpException for non-BadRequest errors', async () => {
      const genericError = new Error('Some generic error');
      mockOrdersService.create.mockRejectedValue(genericError);

      await expect(
        controller.create(validOrderDataWithDaytime),
      ).rejects.toThrow(HttpException);
    });
  });
});
