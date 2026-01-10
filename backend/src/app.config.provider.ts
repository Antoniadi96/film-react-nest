import { ConfigModule, ConfigService } from '@nestjs/config';

export const configProvider = {
  imports: [ConfigModule.forRoot()],
  provide: 'CONFIG',
  useFactory: (configService: ConfigService): AppConfig => {
    const driver = configService.get<string>('DATABASE_DRIVER', 'mongodb');

    return {
      database: {
        driver,
        url: configService.get<string>(
          'DATABASE_URL',
          'mongodb://localhost:27017/film_afisha',
        ),
        // PostgreSQL параметры
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER', 'postgres'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
        database: configService.get<string>('POSTGRES_DB', 'film_afisha'),
      },
    };
  },
  inject: [ConfigService],
};

export interface AppConfig {
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: string;
  url: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}
