.PHONY: build up down logs ps restart clean deploy test

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

ps:
	docker-compose ps

restart: down up

clean:
	docker-compose down -v
	docker system prune -f

deploy: build up

backend-bash:
	docker-compose exec backend sh

db-bash:
	docker-compose exec postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}