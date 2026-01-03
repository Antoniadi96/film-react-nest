import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsResponseDto, ScheduleResponseDto } from './dto/films.dto';
import { Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Film } from '../schemas/film.schema';

// Декоратор @Controller определяет базовый маршрут для этого контроллера
@Controller('films')
export class FilmsController {
  constructor(
    private readonly filmsService: FilmsService,
    @Inject('FilmModel') private filmModel: Model<Film>,
  ) {}

  // Обработчик GET-запроса для получения списка всех фильмов
  @Get()
  async findAll(): Promise<FilmsResponseDto> {
    try {
      const testCount = await this.filmModel.countDocuments();
      console.log(`Total films in DB: ${testCount}`);

      return await this.filmsService.findAll();
    } catch (error) {
      console.error('Error in films controller:', error);
      throw new HttpException(
        { error: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Обработчик GET-запроса для получения расписания конкретного фильма
  @Get(':id/schedule')
  async findSchedule(@Param('id') id: string): Promise<ScheduleResponseDto> {
    try {
      return await this.filmsService.findSchedule(id);
    } catch (error) {
      console.error('Error in film schedule controller:', error);
      throw new HttpException(
        { error: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Тестовый эндпоинт для проверки подключения к базе данных
  @Get('test/connection')
  async testConnection() {
    try {
      const count = await this.filmModel.countDocuments();
      const firstFilm = await this.filmModel.findOne();

      return {
        success: true,
        message: 'MongoDB connection test',
        filmCount: count,
        sampleFilm: firstFilm
          ? {
              id: firstFilm.id,
              title: firstFilm.title,
            }
          : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
