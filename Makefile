kill-test: 
	docker compose -f docker-compose.test.yml stop && docker compose -f docker-compose.test.yml down

run-test: 
	docker compose -f docker-compose.test.yml build 
	docker compose -f docker-compose.test.yml up -d postgres_test rabbitmq redis
	docker compose -f docker-compose.test.yml up --build --no-deps title-creator-test
	
run: 
	docker compose build 
	docker compose up -d postgres rabbitmq redis
	docker compose up -d postgres title-creator-web
	docker compose up -d postgres title-creator-mq

kill: 
	docker compose -f docker-compose.yml stop && docker compose -f docker-compose.yml down