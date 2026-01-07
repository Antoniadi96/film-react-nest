import { Module } from '@nestjs/common';
import { FilmsInMemoryRepository } from './in-memory/films.in-memory.repository';
import { OrdersInMemoryRepository } from './in-memory/orders.in-memory.repository';
import { FilmsMongoDbRepository } from './mongodb/films.mongodb.repository';
import { OrdersMongoDbRepository } from './mongodb/orders.mongodb.repository';
import { DatabaseModule } from '../database/database.module';

// Убедимся что используем MongoDB
const useMongoDB = true;

@Module({
  imports: useMongoDB ? [DatabaseModule] : [],
  providers: [
    {
      provide: 'FILMS_REPOSITORY',
      useClass: useMongoDB ? FilmsMongoDbRepository : FilmsInMemoryRepository,
    },
    {
      provide: 'ORDERS_REPOSITORY',
      useClass: useMongoDB ? OrdersMongoDbRepository : OrdersInMemoryRepository,
    },
  ],
  exports: ['FILMS_REPOSITORY', 'ORDERS_REPOSITORY'],
})
export class RepositoriesModule {}
