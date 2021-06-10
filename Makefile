NODE_BIN="node_modules/.bin"

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

build-nw:
	tar.exe -x -f out.zip dist