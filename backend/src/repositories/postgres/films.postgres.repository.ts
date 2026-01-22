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
      const films = await this.filmRepository.find({
        relations: ['schedules'],
      });
      this.logger.log(`Found ${films.length} films in PostgreSQL`);

      return films.map((film) => this.mapToFilmDto(film));
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

    this.logger.log(`Found film: ${film.title} with schedules`);
    return this.mapToFilmScheduleDto(film);
  }

  async findScheduleById(
    filmId: string,
    scheduleId: string,
  ): Promise<ScheduleDto | null> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, filmId: filmId },
    });

    return schedule ? this.mapToScheduleDto(schedule) : null;
  }

  async updateScheduleSeats(
    filmId: string,
    scheduleId: string,
    takenSeats: string[],
  ): Promise<void> {
    await this.scheduleRepository.update(
      { id: scheduleId, filmId: filmId },
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
      const schedule = await this.scheduleRepository.findOne({
        where: { id: scheduleId, filmId: filmId },
      });

      if (!schedule) {
        this.logger.error(`Schedule ${scheduleId} not found`);
        return false;
      }

      const currentTaken = schedule.taken
        ? schedule.taken.split(',').filter(Boolean)
        : [];
      const conflictingSeats = seatsToBook.filter((seat) =>
        currentTaken.includes(seat),
      );

      if (conflictingSeats.length > 0) {
        this.logger.error(
          `Seats already taken: ${conflictingSeats.join(', ')}`,
        );
        return false;
      }

      const updatedTaken = [...currentTaken, ...seatsToBook].join(',');
      await this.scheduleRepository.update(scheduleId, {
        taken: updatedTaken,
      });

      this.logger.log(`Successfully booked seats: ${seatsToBook.join(', ')}`);
      return true;
    } catch (error) {
      this.logger.error(`Error booking seats: ${error.message}`);
      return false;
    }
  }

  private mapToFilmDto(film: Film): FilmDto {
    const tagsArray = film.tags
      ? film.tags.split(',').map((tag) => tag.trim())
      : [];

    return {
      id: film.id,
      rating: Number(film.rating),
      director: film.director,
      tags: tagsArray,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image.startsWith('/') ? film.image : '/' + film.image,
      cover: film.cover.startsWith('/') ? film.cover : '/' + film.cover,
    };
  }

  private mapToFilmScheduleDto(film: Film): FilmScheduleDto {
    const schedules =
      film.schedules?.map((schedule) => this.mapToScheduleDto(schedule)) || [];

    return {
      ...this.mapToFilmDto(film),
      schedule: schedules,
    };
  }

  private mapToScheduleDto(schedule: Schedule): ScheduleDto {
    let daytimeString: string;

    if (typeof schedule.daytime === 'string') {
      const date = new Date(schedule.daytime);
      daytimeString = isNaN(date.getTime())
        ? schedule.daytime
        : date.toISOString();
    } else {
      daytimeString = String(schedule.daytime);
    }

    return {
      id: schedule.id,
      daytime: daytimeString,
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: Number(schedule.price),
      taken: schedule.taken ? schedule.taken.split(',').filter(Boolean) : [],
    };
  }
}
