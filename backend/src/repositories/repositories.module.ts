import { Module, DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

// Репозитории
import { FilmsInMemoryRepository } from './in-memory/films.in-memory.repository';
import { OrdersInMemoryRepository } from './in-memory/orders.in-memory.repository';
import { FilmsMongoDbRepository } from './mongodb/films.mongodb.repository';
import { OrdersMongoDbRepository } from './mongodb/orders.mongodb.repository';
import { FilmsPostgresRepository } from './postgres/films.postgres.repository';
import { OrdersPostgresRepository } from './postgres/orders.postgres.repository';

// MongoDB схемы
import { Film, FilmSchema } from '../schemas/film.schema';
import { Order, OrderSchema } from '../schemas/order.schema';

// TypeORM сущности
import { Film as FilmEntity } from '../entities/film.entity';
import { Schedule } from '../entities/schedule.entity';
import { Order as OrderEntity } from '../entities/order.entity';

@Module({})
export class RepositoriesModule {
  static forRoot(databaseDriver: string): DynamicModule {
    const imports = [];
    const providers = [];

    switch (databaseDriver) {
      case 'mongodb':
        imports.push(
          MongooseModule.forFeature([
            { name: Film.name, schema: FilmSchema },
            { name: Order.name, schema: OrderSchema },
          ]),
        );
        providers.push(
          {
            provide: 'FILMS_REPOSITORY',
            useClass: FilmsMongoDbRepository,
          },
          {
            provide: 'ORDERS_REPOSITORY',
            useClass: OrdersMongoDbRepository,
          },
        );
        break;

      case 'postgres':
        imports.push(
          TypeOrmModule.forFeature([FilmEntity, Schedule, OrderEntity]),
        );
        providers.push(
          {
            provide: 'FILMS_REPOSITORY',
            useClass: FilmsPostgresRepository,
          },
          {
            provide: 'ORDERS_REPOSITORY',
            useClass: OrdersPostgresRepository,
          },
        );
        break;

      default:
        providers.push(
          {
            provide: 'FILMS_REPOSITORY',
            useClass: FilmsInMemoryRepository,
          },
          {
            provide: 'ORDERS_REPOSITORY',
            useClass: OrdersInMemoryRepository,
          },
        );
        break;
    }

    return {
      module: RepositoriesModule,
      imports,
      providers,
      exports: ['FILMS_REPOSITORY', 'ORDERS_REPOSITORY'],
    };
  }
}
