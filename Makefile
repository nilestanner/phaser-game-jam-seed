clean:
	rm -rf dist
	rm -rf installer

setup:
	npm ci

build:
	npm run build

watch:
	npm run dev

electron:
	npm start

build-electron:
	npm run package