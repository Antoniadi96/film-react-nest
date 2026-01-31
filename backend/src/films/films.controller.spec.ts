import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import {
  FilmsResponseDto,
  ScheduleResponseDto,
  FilmDto,
  ScheduleDto,
} from './dto/films.dto';
import { HttpException } from '@nestjs/common';

describe('FilmsController', () => {
  let controller: FilmsController;
  let filmsService: FilmsService;

  const mockFilmsService = {
    findAll: jest.fn(),
    findSchedule: jest.fn(),
  };

  const mockFilm1: FilmDto = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    rating: 4.5,
    director: 'Christopher Nolan',
    tags: ['action', 'sci-fi', 'thriller'],
    title: 'Inception',
    about: 'A thief who steals corporate secrets',
    description: 'Dom Cobb is a skilled thief...',
    image: '/images/inception.jpg',
    cover: '/covers/inception-cover.jpg',
  };

  const mockFilm2: FilmDto = {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    rating: 4.0,
    director: 'Quentin Tarantino',
    tags: ['crime', 'drama', 'thriller'],
    title: 'Pulp Fiction',
    about: 'The lives of two mob hitmen...',
    description: 'The lives of two mob hitmen...',
    image: '/images/pulp-fiction.jpg',
    cover: '/covers/pulp-fiction-cover.jpg',
  };

  const mockFilmsResponse: FilmsResponseDto = {
    total: 2,
    items: [mockFilm1, mockFilm2],
  };

  const mockSchedule1: ScheduleDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    daytime: '2024-01-15T18:00:00Z',
    hall: 1,
    rows: 10,
    seats: 20,
    price: 500,
    taken: ['5:10', '6:12', '7:8'],
  };

  const mockSchedule2: ScheduleDto = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    daytime: '2024-01-15T20:00:00Z',
    hall: 2,
    rows: 15,
    seats: 25,
    price: 750,
    taken: ['3:5', '4:12'],
  };

  const mockScheduleResponse: ScheduleResponseDto = {
    total: 2,
    items: [mockSchedule1, mockSchedule2],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    filmsService = module.get<FilmsService>(FilmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all films', async () => {
      mockFilmsService.findAll.mockResolvedValue(mockFilmsResponse);

      const result = await controller.findAll();

      expect(result).toEqual(mockFilmsResponse);
      expect(filmsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException when service throws an error', async () => {
      const error = new Error('Database error');
      mockFilmsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(HttpException);
    });

    it('should handle empty film list', async () => {
      const emptyResponse: FilmsResponseDto = {
        total: 0,
        items: [],
      };
      mockFilmsService.findAll.mockResolvedValue(emptyResponse);

      const result = await controller.findAll();

      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });

  describe('findSchedule', () => {
    const filmId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return schedule for a film', async () => {
      mockFilmsService.findSchedule.mockResolvedValue(mockScheduleResponse);

      const result = await controller.findSchedule(filmId);

      expect(result).toEqual(mockScheduleResponse);
      expect(filmsService.findSchedule).toHaveBeenCalledWith(filmId);
    });

    it('should handle film not found gracefully', async () => {
      const emptySchedule: ScheduleResponseDto = {
        total: 0,
        items: [],
      };
      mockFilmsService.findSchedule.mockResolvedValue(emptySchedule);

      const result = await controller.findSchedule('non-existent-uuid');

      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it('should throw HttpException when schedule service fails', async () => {
      const error = new Error('Schedule service error');
      mockFilmsService.findSchedule.mockRejectedValue(error);

      await expect(controller.findSchedule(filmId)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
