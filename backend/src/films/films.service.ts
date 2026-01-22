import { Inject, Injectable, Logger } from '@nestjs/common';
import { FilmsResponseDto, ScheduleResponseDto } from './dto/films.dto';
import { FilmsRepository } from '../repositories/interfaces/films.repository.interface';

@Injectable()
export class FilmsService {
  private readonly logger = new Logger(FilmsService.name);

  constructor(
    @Inject('FILMS_REPOSITORY')
    private filmsRepository: FilmsRepository,
  ) {
    this.logger.log('FilmsService initialized');
  }

  async findAll(): Promise<FilmsResponseDto> {
    this.logger.log('FilmsService: findAll called');
    const films = await this.filmsRepository.findAll();
    this.logger.log(`FilmsService: found ${films.length} films`);
    return {
      total: films.length,
      items: films,
    };
  }

  async findSchedule(id: string): Promise<ScheduleResponseDto> {
    this.logger.log(`FilmsService: findSchedule for id ${id}`);
    const film = await this.filmsRepository.findById(id);

    if (!film) {
      this.logger.log(`FilmsService: film with id ${id} not found`);
      return {
        total: 0,
        items: [],
      };
    }

    this.logger.log(
      `FilmsService: found film ${film.title} with ${film.schedule.length} schedules`,
    );
    return {
      total: film.schedule.length,
      items: film.schedule,
    };
  }
}
