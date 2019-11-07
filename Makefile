-include .env

CANVAS_SKETCH := $(PWD)/node_modules/.bin/canvas-sketch

.PHONY: deps
deps: node_modules

node_modules: package.json yarn.lock
	@yarn install
	@touch $@

.DEFAULT_GOAL := serve
LATEST := $(shell ls src -Art | tail -n 1)
## Serve latest src/*.js at http://localhost:9966 with hot reloading
.PHONY: serve
serve: deps
	@$(CANVAS_SKETCH) src/$(LATEST)

SRC_FILES := $(wildcard src/*.js)
OBJ_FILES := $(patsubst src/%,site/%,$(SRC_FILES))
## Build site for production use
build: deps $(OBJ_FILES)

site/%.js: src/%.js
	@$(CANVAS_SKETCH) $< --dir site --build

## Deploy site/ to https://codevember.davidauthier.wearemd.com/2019/11/
.PHONY: deploy
deploy: build
	@rsync -avz ./site/ $(USER)@$(SERVER):$(SERVER_DEST)

define primary
\033[38;2;166;204;112;1m$(1)\033[0m
endef

define title
\033[38;2;255;204;102m$(1)\033[0m\n
endef

## List available commands
.PHONY: help
help:
	@printf "$(call primary,Codevember 2019)\n\n"
	@printf "$(call title,USAGE)"
	@printf "    make <SUBCOMMAND>\n\n"
	@printf "$(call title,SUBCOMMANDS)"
	@awk '{ \
		line = $$0; \
		while((n = index(line, "http")) > 0) { \
			if (match(line, "https?://[^ ]+")) { \
			  url = substr(line, RSTART, RLENGTH); \
			  sub(url, "\033[38;2;119;168;217m"url"\033[0m", $$0);  \
			  line = substr(line, n + RLENGTH); \
			} else {\
				break; \
			} \
		}\
		\
		if ($$0 ~ /^.PHONY: [a-zA-Z0-9]+$$/) { \
			helpCommand = substr($$0, index($$0, ":") + 2); \
			if (helpMessage) { \
				printf "    $(call primary,%-13s)%s\n", \
					helpCommand, helpMessage; \
				helpMessage = ""; \
			} \
		} else if ($$0 ~ /^[a-zA-Z\-\_0-9.]+:/) { \
			helpCommand = substr($$0, 0, index($$0, ":")); \
			if (helpMessage) { \
				printf "    $(call primary,%-13s)%s\n", \
					helpCommand, helpMessage; \
				helpMessage = ""; \
			} \
		} else if ($$0 ~ /^##/) { \
			if (helpMessage) { \
				helpMessage = helpMessage "\n            " substr($$0, 3); \
			} else { \
				helpMessage = substr($$0, 3); \
			} \
		} \
	}' \
	$(MAKEFILE_LIST)
