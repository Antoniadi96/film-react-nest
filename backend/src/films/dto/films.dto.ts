import {
  IsString,
  IsNumber,
  IsArray,
  Min,
  Max,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class FilmDto {
  @IsUUID()
  id: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @IsString()
  director: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  title: string;

  @IsString()
  about: string;

  @IsString()
  description: string;

  @IsString()
  image: string;

  @IsString()
  cover: string;
}

export class FilmScheduleDto extends FilmDto {
  @IsArray()
  schedule: ScheduleDto[];
}

export class FilmsResponseDto {
  total: number;
  items: FilmDto[];
}

export class ScheduleDto {
  @IsUUID()
  id: string;

  @IsDateString()
  daytime: string;

  @IsString()
  hall: string;

  @IsNumber()
  rows: number;

  @IsNumber()
  seats: number;

  @IsNumber()
  price: number;

  @IsArray()
  @IsString({ each: true })
  taken: string[];
}

export class ScheduleResponseDto {
  total: number;
  items: ScheduleDto[];
}
