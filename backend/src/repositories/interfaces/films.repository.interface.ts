import {
  FilmDto,
  ScheduleDto,
  FilmScheduleDto,
} from '../../films/dto/films.dto';

export interface FilmsRepository {
  findAll(): Promise<FilmDto[]>;
  findById(id: string): Promise<FilmScheduleDto | null>;
  findScheduleById(
    filmId: string,
    scheduleId: string,
  ): Promise<ScheduleDto | null>;
  updateScheduleSeats(
    filmId: string,
    scheduleId: string,
    takenSeats: string[],
  ): Promise<void>;
  bookSeats(
    filmId: string,
    scheduleId: string,
    seatsToBook: string[],
  ): Promise<boolean>;
}
