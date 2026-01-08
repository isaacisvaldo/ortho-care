

COMPOSE_DEV=-f docker-compose.yml 


up-dev:
	docker compose $(COMPOSE_DEV) up -d --build


# Parar todos os containers
down:
	docker compose down