build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker system prune -f

psql:
	docker exec -it sharanpj1-db-1 psql -U sharanubuntu pmdb


