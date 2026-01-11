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
        const database = configService.get<string>('POSTGRES_DB', 'prac');

        logger.log(`Connecting to PostgreSQL at: ${host}:${port}/${database}`);

        return {
          type: 'postgres',
          host,
          port,
          username: configService.get<string>('POSTGRES_USER', 'prac'),
          password: configService.get<string>('POSTGRES_PASSWORD', 'prac'),
          database,
          entities: [Film, Schedule, Order],
          synchronize: false,
          logging: true,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Film, Schedule, Order]),
  ],
  exports: [TypeOrmModule],
})
export class TypeOrmDatabaseModule {}
