clean:
	rm -rf dist

setup:
	npm ci

build:
	npm run build

watch:
	npm run dev

electron:
	npm start

build-electron:
	cd dist && ../node_modules/.bin/electron-builder