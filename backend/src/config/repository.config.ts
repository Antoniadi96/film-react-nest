import { Provider } from '@nestjs/common';
import { FilmsInMemoryRepository } from '../repositories/in-memory/films.in-memory.repository';
import { OrdersInMemoryRepository } from '../repositories/in-memory/orders.in-memory.repository';
import { FilmsMongoDbRepository } from '../repositories/mongodb/films.mongodb.repository';
import { OrdersMongoDbRepository } from '../repositories/mongodb/orders.mongodb.repository';

const useMongoDB = process.env.USE_MONGODB === 'true';

export const repositoryProviders: Provider[] = [
  {
    provide: 'FILMS_REPOSITORY',
    useClass: useMongoDB ? FilmsMongoDbRepository : FilmsInMemoryRepository,
  },
  {
    provide: 'ORDERS_REPOSITORY',
    useClass: useMongoDB ? OrdersMongoDbRepository : OrdersInMemoryRepository,
  },
];
