APPS := $(patsubst apps/%/package.json,%,$(wildcard apps/*/package.json))

.PHONY: dev build setup create-next

setup:
	@docker compose up --build --remove-orphans -d
	@pnpm --filter database exec prisma migrate reset --force
	@pnpm --filter database exec prisma migrate dev
	@pnpm --filter database exec prisma db seed

dev: $(filter-out dev build setup create-next,$(MAKECMDGOALS))
	@APP="$(firstword $(filter-out dev build setup create-next,$(MAKECMDGOALS)))"; \
	if [ -z "$$APP" ]; then \
		echo "Usage: make dev <app> (e.g. make dev learning-app)"; \
		echo "Available apps: $(APPS)"; \
		exit 1; \
	fi; \
	if [ ! -f "./apps/$$APP/package.json" ]; then \
		echo "Error: ./apps/$$APP does not exist"; \
		exit 1; \
	fi; \
	pnpm turbo --filter $$APP dev

build: $(filter-out build dev setup create-next,$(MAKECMDGOALS))
	@APP="$(firstword $(filter-out build dev setup create-next,$(MAKECMDGOALS)))"; \
	if [ -z "$$APP" ]; then \
		echo "Usage: make build <app> (e.g. make build application)"; \
		echo "Available apps: $(APPS)"; \
		exit 1; \
	fi; \
	if [ ! -f "./apps/$$APP/package.json" ]; then \
		echo "Error: ./apps/$$APP does not exist"; \
		exit 1; \
	fi; \
	pnpm turbo --filter $$APP build

create-next: $(filter-out create-next,$(MAKECMDGOALS))
	@APP="$(firstword $(filter-out create-next,$(MAKECMDGOALS)))"; \
	if [ -z "$$APP" ]; then \
		echo "Usage: make create-next <app-name> (e.g. make create-next learning-app-admin)"; \
		echo "Creates a Next.js application in ./apps/<app-name>"; \
		exit 1; \
	fi; \
	if [ -d "./apps/$$APP" ]; then \
		echo "Error: ./apps/$$APP already exists"; \
		exit 1; \
	fi; \
	pnpm create next-app@latest --ts --tailwind --app --eslint --use-pnpm --yes --disable-git "./apps/$$APP"

%:
	@:
