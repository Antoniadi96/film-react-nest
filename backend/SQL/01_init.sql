-- Создание расширения и таблиц
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица фильмов
CREATE TABLE IF NOT EXISTS films (
    id          UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    rating      DOUBLE PRECISION                NOT NULL,
    director    VARCHAR                         NOT NULL,
    tags        TEXT                            NOT NULL,
    image       VARCHAR                         NOT NULL,
    cover       VARCHAR                         NOT NULL,
    title       VARCHAR                         NOT NULL,
    about       VARCHAR                         NOT NULL,
    description VARCHAR                         NOT NULL
);

-- Таблица расписаний
CREATE TABLE IF NOT EXISTS schedules (
    id       UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    daytime  VARCHAR                         NOT NULL,
    hall     INTEGER                         NOT NULL,
    rows     INTEGER                         NOT NULL,
    seats    INTEGER                         NOT NULL,
    price    DOUBLE PRECISION                NOT NULL,
    taken    TEXT                            NOT NULL DEFAULT '',
    "filmId" UUID REFERENCES films(id) ON DELETE CASCADE
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id         UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    email      VARCHAR(255)                    NOT NULL,
    phone      VARCHAR(50)                     NOT NULL,
    tickets    JSONB                           NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Даем пользователю prac ВСЕ права на базу данных
GRANT ALL PRIVILEGES ON DATABASE prac TO prac;

-- Даем ВСЕ права на все таблицы
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO prac;

-- Даем права на использование последовательностей
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO prac;

-- Даем права на выполнение функций
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO prac;

-- Устанавливаем права по умолчанию для будущих таблиц
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO prac;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO prac;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO prac;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TYPES TO prac;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SCHEMAS TO prac;

-- Даем полный доступ к схеме public
GRANT USAGE ON SCHEMA public TO prac;
GRANT CREATE ON SCHEMA public TO prac;

-- Делаем пользователя prac владельцем таблиц
ALTER TABLE films OWNER TO prac;
ALTER TABLE schedules OWNER TO prac;
ALTER TABLE orders OWNER TO prac;

-- Создаем индексы для таблицы orders
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
