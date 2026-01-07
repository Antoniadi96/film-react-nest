import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from '../../schemas/film.schema';
import { FilmsRepository } from '../interfaces/films.repository.interface';
import {
  FilmDto,
  ScheduleDto,
  FilmScheduleDto,
} from '../../films/dto/films.dto';

// Этот класс представляет репозиторий, который хранит данные о фильмах в MongoDB
@Injectable()
export class FilmsMongoDbRepository implements FilmsRepository {
  private readonly logger = new Logger(FilmsMongoDbRepository.name);

  constructor(@InjectModel(Film.name) private filmModel: Model<Film>) {
    this.logger.log('FilmsMongoDbRepository initialized');
  }

  // Метод для получения всех фильмов (без расписания) из MongoDB
  async findAll(): Promise<FilmDto[]> {
    this.logger.log('findAll called from MongoDB repository');
    try {
      const films = await this.filmModel.find().exec();
      this.logger.log(`Found ${films.length} films in MongoDB`);
      return films.map(this.mapToFilmDto);
    } catch (error) {
      this.logger.error('Error fetching films from MongoDB:', error);
      throw error;
    }
  }

  // Метод для поиска фильма по ID (с расписанием) в MongoDB
  async findById(id: string): Promise<FilmScheduleDto | null> {
    this.logger.log(`Finding film by id: ${id}`);
    const film = await this.filmModel.findOne({ id }).exec();
    if (!film) {
      this.logger.warn(`Film with id ${id} not found`);
      return null;
    }

    this.logger.log(`Found film: ${film.title}`);
    return this.mapToFilmScheduleDto(film);
  }

  // Метод для поиска конкретного сеанса по ID фильма и ID расписания
  async findScheduleById(
    filmId: string,
    scheduleId: string,
  ): Promise<ScheduleDto | null> {
    const film = await this.filmModel.findOne({ id: filmId }).exec();
    if (!film) return null;

    const schedule = film.schedule.find((s) => s.id === scheduleId);
    if (!schedule) return null;

    return this.mapToScheduleDto(schedule);
  }

  // Метод для обновления списка занятых мест для сеанса в MongoDB
  async updateScheduleSeats(
    filmId: string,
    scheduleId: string,
    takenSeats: string[],
  ): Promise<void> {
    await this.filmModel
      .updateOne(
        { id: filmId, 'schedule.id': scheduleId },
        { $set: { 'schedule.$.taken': takenSeats } },
      )
      .exec();
  }

  // Метод для атомарного бронирования мест на сеансе с проверкой на race condition
  async bookSeats(
    filmId: string,
    scheduleId: string,
    seatsToBook: string[],
  ): Promise<boolean> {
    try {
      this.logger.log(
        `Attempting to book seats: ${seatsToBook.join(', ')} for film ${filmId}, schedule ${scheduleId}`,
      );

      // Находим фильм и расписание
      const film = await this.filmModel.findOne({ id: filmId }).exec();
      if (!film) {
        this.logger.error(`Film ${filmId} not found`);
        return false;
      }

      const schedule = film.schedule.find((s) => s.id === scheduleId);
      if (!schedule) {
        this.logger.error(`Schedule ${scheduleId} not found in film ${filmId}`);
        return false;
      }

      // Проверяем, что места еще не заняты
      for (const seat of seatsToBook) {
        if (schedule.taken.includes(seat)) {
          this.logger.error(`Seat ${seat} is already taken`);
          return false;
        }
      }

      // Атомарная операция добавления мест
      const result = await this.filmModel.updateOne(
        {
          id: filmId,
          'schedule.id': scheduleId,
          'schedule.taken': {
            $not: {
              $elemMatch: {
                $in: seatsToBook,
              },
            },
          },
        },
        {
          $addToSet: {
            'schedule.$.taken': {
              $each: seatsToBook,
            },
          },
        },
      );

      const success = result.modifiedCount > 0;
      if (success) {
        this.logger.log(`Successfully booked seats: ${seatsToBook.join(', ')}`);
      } else {
        this.logger.error(`Failed to book seats (possibly race condition)`);
      }

      return success;
    } catch (error) {
      this.logger.error(
        `Error booking seats for film ${filmId}, schedule ${scheduleId}:`,
        error,
      );
      return false;
    }
  }

  // Приватный метод для преобразования документа Mongoose в FilmDto
  private mapToFilmDto(film: Film): FilmDto {
    const normalizeImagePath = (path: string): string => {
        if (!path) return '';
        
        // Убираем лишние слеши
        let normalized = path.replace(/^\/+/, '');
        normalized = '/' + normalized;
        
        return normalized;
    };

    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: normalizeImagePath(film.image),
      cover: normalizeImagePath(film.cover),
    };
  }

  private mapToFilmScheduleDto(film: Film): FilmScheduleDto {
    return {
      ...this.mapToFilmDto(film),
      schedule: film.schedule.map(this.mapToScheduleDto),
    };
  }

  private mapToScheduleDto(schedule: any): ScheduleDto {
    return {
        id: schedule.id,
        daytime: schedule.daytime instanceof Date 
            ? schedule.daytime.toISOString() 
            : new Date(schedule.daytime).toISOString(),
        hall: Number(schedule.hall),
        rows: schedule.rows,
        seats: schedule.seats,
        price: schedule.price,
        taken: schedule.taken || [],
    };
}
}
