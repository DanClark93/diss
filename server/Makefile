phoney: run

TAG=hotfuzz:latest
VOL=-v $(PWD):/appdir

build:
	docker build -t $(TAG) .

run:
	docker run $(VOL) -p 8080:8080 -ti $(TAG)

i:
	docker images

dev:
	docker run $(VOL) -p 8080:8080 -ti $(TAG) /bin/bash

ps:
	docker ps

up:
	docker-compose up
