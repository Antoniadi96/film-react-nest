import {
  Controller,
  Get,
  Param,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsResponseDto, ScheduleResponseDto } from './dto/films.dto';

@Controller('films')
export class FilmsController {
  private readonly logger = new Logger(FilmsController.name);

  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async findAll(): Promise<FilmsResponseDto> {
    try {
      this.logger.log('GET /films called');
      return await this.filmsService.findAll();
    } catch (error) {
      this.logger.error('Error in films controller:', error);
      throw new HttpException(
        { error: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/schedule')
  async findSchedule(@Param('id') id: string): Promise<ScheduleResponseDto> {
    try {
      this.logger.log(`GET /films/${id}/schedule called`);
      return await this.filmsService.findSchedule(id);
    } catch (error) {
      this.logger.error('Error in film schedule controller:', error);
      throw new HttpException(
        { error: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
