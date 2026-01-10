import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from '../../entities/film.entity';
import { Schedule } from '../../entities/schedule.entity';
import { FilmsRepository } from '../interfaces/films.repository.interface';
import {
  FilmDto,
  ScheduleDto,
  FilmScheduleDto,
} from '../../films/dto/films.dto';

@Injectable()
export class FilmsPostgresRepository implements FilmsRepository {
  private readonly logger = new Logger(FilmsPostgresRepository.name);

  constructor(
    @InjectRepository(Film)
    private filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {
    this.logger.log('FilmsPostgresRepository initialized');
  }

  async findAll(): Promise<FilmDto[]> {
    this.logger.log('findAll called from PostgreSQL repository');
    try {
      const films = await this.filmRepository.find();
      this.logger.log(`Found ${films.length} films in PostgreSQL`);
      return films.map(this.mapToFilmDto);
    } catch (error) {
      this.logger.error('Error fetching films from PostgreSQL:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<FilmScheduleDto | null> {
    this.logger.log(`Finding film by id: ${id}`);
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedules'],
    });

    if (!film) {
      this.logger.warn(`Film with id ${id} not found`);
      return null;
    }

    this.logger.log(
      `Found film: ${film.title} with ${film.schedules.length} schedules`,
    );
    return this.mapToFilmScheduleDto(film);
  }

  async findScheduleById(
    filmId: string,
    scheduleId: string,
  ): Promise<ScheduleDto | null> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, filmId },
    });

    return schedule ? this.mapToScheduleDto(schedule) : null;
  }

  async updateScheduleSeats(
    filmId: string,
    scheduleId: string,
    takenSeats: string[],
  ): Promise<void> {
    await this.scheduleRepository.update(
      { id: scheduleId, filmId },
      { taken: takenSeats.join(',') },
    );
  }

  async bookSeats(
    filmId: string,
    scheduleId: string,
    seatsToBook: string[],
  ): Promise<boolean> {
    try {
      this.logger.log(`Attempting to book seats: ${seatsToBook.join(', ')}`);

      // Используем транзакцию для атомарности
      const result = await this.scheduleRepository.query(
        `UPDATE schedules 
                 SET taken = array_to_string(
                     array_cat(
                         string_to_array(taken, ','), 
                         $1::text[]
                     ), ','
                 )
                 WHERE id = $2 AND film_id = $3 
                 AND NOT EXISTS (
                     SELECT 1 FROM unnest(string_to_array(taken, ',')) AS seat 
                     WHERE seat = ANY($1::text[])
                 )`,
        [seatsToBook, scheduleId, filmId],
      );

      const success = result[1] > 0; // Количество обновленных строк
      if (success) {
        this.logger.log(`Successfully booked seats: ${seatsToBook.join(', ')}`);
      } else {
        this.logger.error(
          `Failed to book seats (possibly already taken or race condition)`,
        );
      }

      return success;
    } catch (error) {
      this.logger.error(`Error booking seats: ${error.message}`);
      return false;
    }
  }

  private mapToFilmDto(film: Film): FilmDto {
    const normalizeImagePath = (path: string): string => {
      if (!path) return '';
      return path.startsWith('/') ? path : '/' + path;
    };

    return {
      id: film.id,
      rating: Number(film.rating),
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
      schedule: film.schedules.map(this.mapToScheduleDto),
    };
  }

  private mapToScheduleDto(schedule: Schedule): ScheduleDto {
    return {
      id: schedule.id,
      daytime: schedule.daytime.toISOString(),
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: schedule.taken ? schedule.taken.split(',').filter(Boolean) : [],
    };
  }
}
