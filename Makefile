APPS := learning-app bewerber application application-admin profile vacancies personalgeorgien arbeitskraefte

.PHONY: dev setup $(APPS)

setup:
	@docker compose up --build --remove-orphans -d
	@pnpm --filter database exec prisma migrate reset --force
	@pnpm --filter database exec prisma migrate dev
	@pnpm --filter database exec prisma db seed

dev: $(filter-out dev setup,$(MAKECMDGOALS))
	@if [ -z "$(filter-out dev setup,$(MAKECMDGOALS))" ]; then \
		echo "Usage: make dev <app> (e.g. make dev learning-app)"; \
		echo "Available apps: $(APPS)"; \
		exit 1; \
	fi

$(APPS):
	@pnpm turbo --filter $@ dev
