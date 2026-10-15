const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Runs the real main.js with a fake `electron` module and returns the registered app handlers.
const loadMain = (openWindows = []) => {
  const handlers = {};
  const created = [];
  class BrowserWindow {
    constructor(opts) { this.opts = opts; created.push(this); }
    loadURL(url) { this.url = url; }
    static getAllWindows() { return openWindows; }
  }
  const electron = { app: { on: (event, fn) => { handlers[event] = fn; } }, BrowserWindow, shell: {}, remote: {} };
  const file = path.join(__dirname, '..', 'main.js');
  const fakeRequire = (id) => (id === 'electron' ? electron : require(id));
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), { require: fakeRequire, __dirname: path.dirname(file), console });
  return { handlers, created };
};

describe('main.js (Electron entry)', () => {
  it('creates the window when the app is ready', () => {
    const { handlers, created } = loadMain();
    handlers.ready();
    assert.strictEqual(created.length, 1);
    assert.match(created[0].url, /^file:\/\/\/.*index\.html$/);
  });

  it('re-creates the window on activate when none are open (macOS dock click)', () => {
    const { handlers, created } = loadMain([]);
    handlers.activate();
    assert.strictEqual(created.length, 1);
  });

  it('does not open a second window on activate when one already exists', () => {
    const { handlers, created } = loadMain([{}]);
    handlers.activate();
    assert.strictEqual(created.length, 0);
  });
});
