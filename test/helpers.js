// Loads TypeScript sources under test in plain Node.
//
// Phaser needs a browser (window/canvas) at import time, so the scene tests load
// the real .ts source, transpile it with the project's own `typescript` dependency, and swap
// the `phaser` import for a tiny stub of Phaser.Scene.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const loadTs = (file, stubs = {}) => {
  const source = fs.readFileSync(file, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    fileName: file
  });
  const mod = new Module(file, module);
  mod.filename = file;
  mod.paths = Module._nodeModulePaths(path.dirname(file));
  const originalRequire = mod.require.bind(mod);
  mod.require = (id) => (id in stubs ? stubs[id] : originalRequire(id));
  mod._compile(outputText, file);
  return mod.exports;
};

class FakeScene {
  constructor(config) {
    this.sceneConfig = config;
  }
}

const phaserStub = { Scene: FakeScene };

module.exports = { loadTs, phaserStub };
