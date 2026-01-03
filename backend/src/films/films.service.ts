import { Inject, Injectable } from '@nestjs/common';
import { FilmsResponseDto, ScheduleResponseDto } from './dto/films.dto';
import { FilmsRepository } from '../repositories/interfaces/films.repository.interface';

// Этот сервис содержит бизнес-логику работы с фильмами
@Injectable()
export class FilmsService {
  constructor(
    @Inject('FILMS_REPOSITORY')
    private filmsRepository: FilmsRepository,
  ) {}

  // Метод для получения всех фильмов
  async findAll(): Promise<FilmsResponseDto> {
    console.log('FilmsService: findAll called');
    const films = await this.filmsRepository.findAll();
    console.log(`FilmsService: found ${films.length} films`);
    return {
      total: films.length,
      items: films,
    };
  }

  // Метод для получения расписания конкретного фильма по его ID
  async findSchedule(id: string): Promise<ScheduleResponseDto> {
    console.log(`FilmsService: findSchedule for id ${id}`);
    const film = await this.filmsRepository.findById(id);

    if (!film) {
      console.log(`FilmsService: film with id ${id} not found`);
      return {
        total: 0,
        items: [],
      };
    }

    console.log(
      `FilmsService: found film ${film.title} with ${film.schedule.length} schedules`,
    );
    return {
      total: film.schedule.length,
      items: film.schedule,
    };
  }

  // Метод для получения списка занятых мест для конкретного сеанса
  async getTakenSeats(filmId: string, scheduleId: string): Promise<string[]> {
    const schedule = await this.filmsRepository.findScheduleById(
      filmId,
      scheduleId,
    );
    return schedule ? schedule.taken : [];
  }

  // Метод для обновления списка занятых мест для сеанса
  async updateTakenSeats(
    filmId: string,
    scheduleId: string,
    takenSeats: string[],
  ): Promise<void> {
    await this.filmsRepository.updateScheduleSeats(
      filmId,
      scheduleId,
      takenSeats,
    );
  }
}
