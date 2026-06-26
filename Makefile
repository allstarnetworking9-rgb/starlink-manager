SHELL := /bin/bash

.PHONY: install dev build lint test typecheck db-generate db-migrate db-deploy db-seed clean

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

lint:
	pnpm lint

test:
	pnpm test

typecheck:
	pnpm typecheck

db-generate:
	pnpm db:generate

db-migrate:
	pnpm db:migrate

db-deploy:
	pnpm db:deploy

db-seed:
	pnpm db:seed

clean:
	pnpm clean
