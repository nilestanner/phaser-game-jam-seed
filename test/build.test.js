const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const webpackConfig = require(path.join(root, 'webpack.config.js'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const scriptSrcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
const vendorsFile = webpackConfig.optimization.splitChunks.cacheGroups.commons.filename.replace('[name]', 'vendors');

describe('webpack config and index.html', () => {
  it('index.html loads the vendors bundle, then the app bundle, that webpack emits', () => {
    assert.deepStrictEqual(scriptSrcs, [vendorsFile, webpackConfig.output.filename]);
  });

  it('has the game entry point and TypeScript loader configured', () => {
    assert.strictEqual(webpackConfig.entry.app, './src/main.ts');
    assert.ok(webpackConfig.module.rules.some((r) => r.use === 'ts-loader'));
  });

  it('copies index.html and main.js into dist', () => {
    const copied = webpackConfig.plugins
      .filter((p) => p.constructor.name === 'CopyPlugin')
      .flatMap((p) => p.patterns.map((x) => x.from));
    assert.deepStrictEqual(copied.sort(), ['index.html', 'main.js']);
  });
});

// Run `npm run build` first (CI does). Skipped when dist/ has not been built.
const dist = path.join(root, 'dist');
describe('build output smoke test', { skip: !fs.existsSync(path.join(dist, 'app.bundle.js')) && 'dist/ not built (run `npm run build`)' }, () => {
  it('emits every file index.html references, plus main.js', () => {
    for (const file of [...scriptSrcs, 'index.html', 'main.js']) {
      assert.ok(fs.existsSync(path.join(dist, file)), `dist/${file} missing`);
    }
  });

  it('bundles the game scene into the app bundle', () => {
    const bundle = fs.readFileSync(path.join(dist, 'app.bundle.js'), 'utf8');
    assert.match(bundle, /StartScene/);
  });
});
