import { Injectable, Logger } from '@nestjs/common';
import {
  FilmDto,
  ScheduleDto,
  FilmScheduleDto,
} from '../../films/dto/films.dto';
import { FilmsRepository } from '../interfaces/films.repository.interface';

// Этот класс представляет репозиторий, который хранит данные о фильмах в памяти (без БД)
@Injectable()
export class FilmsInMemoryRepository implements FilmsRepository {
  private readonly logger = new Logger(FilmsInMemoryRepository.name);
  private films: FilmScheduleDto[] = [];

  constructor() {
    this.logger.log('FilmsInMemoryRepository initialized');
    this.films = [];
  }

  // Метод для получения всех фильмов (без расписания)
  async findAll(): Promise<FilmDto[]> {
    this.logger.log('findAll called from InMemory repository');
    return this.films.map((film) => {
      return {
        id: film.id,
        rating: film.rating,
        director: film.director,
        tags: film.tags,
        title: film.title,
        about: film.about,
        description: film.description,
        image: film.image,
        cover: film.cover,
      };
    });
  }

  // Метод для поиска фильма по ID (с расписанием)
  async findById(id: string): Promise<FilmScheduleDto | null> {
    this.logger.log(`Finding film by id: ${id}`);
    const film = this.films.find((f) => f.id === id);
    return film || null;
  }

  // Метод для поиска конкретного сеанса по ID фильма и ID расписания
  async findScheduleById(
    filmId: string,
    scheduleId: string,
  ): Promise<ScheduleDto | null> {
    const film = this.films.find((f) => f.id === filmId);
    if (!film) return null;

    const schedule = film.schedule.find((s) => s.id === scheduleId);
    return schedule || null;
  }

  // Метод для обновления списка занятых мест для сеанса
  async updateScheduleSeats(
    filmId: string,
    scheduleId: string,
    takenSeats: string[],
  ): Promise<void> {
    const filmIndex = this.films.findIndex((f) => f.id === filmId);
    if (filmIndex === -1) return;

    const scheduleIndex = this.films[filmIndex].schedule.findIndex(
      (s) => s.id === scheduleId,
    );
    if (scheduleIndex === -1) return;

    this.films[filmIndex].schedule[scheduleIndex].taken = takenSeats;
  }

  // Метод для бронирования мест на сеансе (атомарная операция)
  async bookSeats(
    filmId: string,
    scheduleId: string,
    seatsToBook: string[],
  ): Promise<boolean> {
    this.logger.log(
      `Attempting to book seats: ${seatsToBook.join(', ')} for film ${filmId}, schedule ${scheduleId}`,
    );

    const filmIndex = this.films.findIndex((f) => f.id === filmId);
    if (filmIndex === -1) {
      this.logger.error(`Film ${filmId} not found`);
      return false;
    }

    const scheduleIndex = this.films[filmIndex].schedule.findIndex(
      (s) => s.id === scheduleId,
    );
    if (scheduleIndex === -1) {
      this.logger.error(`Schedule ${scheduleId} not found in film ${filmId}`);
      return false;
    }

    const schedule = this.films[filmIndex].schedule[scheduleIndex];

    // Проверяем, что места еще не заняты
    for (const seat of seatsToBook) {
      if (schedule.taken.includes(seat)) {
        this.logger.error(`Seat ${seat} is already taken`);
        return false;
      }
    }

    // Бронируем места
    schedule.taken = [...schedule.taken, ...seatsToBook];
    this.logger.log(`Successfully booked seats: ${seatsToBook.join(', ')}`);
    return true;
  }
}
