import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Film, FilmSchema } from '../schemas/film.schema';
import { Order, OrderSchema } from '../schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>(
          'DATABASE_URL',
          'mongodb://localhost:27017/film_afisha',
        );
        const logger = new Logger('MongoDB');
        logger.log(`Connecting to MongoDB at: ${uri}`);

        return {
          uri,
          retryWrites: true,
          w: 'majority',
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Film.name, schema: FilmSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
