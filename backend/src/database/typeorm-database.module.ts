import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Film } from '../entities/film.entity';
import { Schedule } from '../entities/schedule.entity';
import { Order } from '../entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('PostgreSQL');
        const host = configService.get<string>('POSTGRES_HOST', 'localhost');
        const port = configService.get<number>('POSTGRES_PORT', 5432);
        const database = configService.get<string>(
          'POSTGRES_DB',
          'film_afisha',
        );

        logger.log(`Connecting to PostgreSQL at: ${host}:${port}/${database}`);

        return {
          type: 'postgres',
          host,
          port,
          username: configService.get<string>('POSTGRES_USER', 'postgres'),
          password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
          database,
          entities: [Film, Schedule, Order],
          synchronize: process.env.NODE_ENV !== 'production',
          logging: process.env.NODE_ENV === 'development',
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Film, Schedule, Order]),
  ],
  exports: [TypeOrmModule],
})
export class TypeOrmDatabaseModule {}
