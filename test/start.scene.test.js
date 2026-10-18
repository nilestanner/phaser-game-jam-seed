const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { loadTs, phaserStub } = require('./helpers');

const { StartScene } = loadTs(path.join(__dirname, '..', 'src', 'scene', 'start', 'start.scene.ts'), {
  phaser: phaserStub
});

// Builds a scene wired to fake Phaser input/physics/add APIs.
const makeScene = (keys = {}) => {
  const scene = new StartScene();
  const state = { vx: undefined, vy: undefined, added: [], physicsAdded: [] };
  const down = (name) => ({ isDown: !!keys[name] });
  scene.input = {
    keyboard: {
      createCursorKeys: () => ({ up: down('up'), down: down('down'), left: down('left'), right: down('right') })
    }
  };
  scene.add = {
    rectangle: (...args) => {
      state.added.push(args);
      return { body: { setVelocityX: (v) => { state.vx = v; }, setVelocityY: (v) => { state.vy = v; } } };
    }
  };
  scene.physics = { add: { existing: (obj) => state.physicsAdded.push(obj) } };
  return { scene, state };
};

describe('StartScene', () => {
  it('registers itself under the "Game" key, inactive and invisible', () => {
    const { scene } = makeScene();
    assert.deepStrictEqual(scene.sceneConfig, { active: false, visible: false, key: 'Game' });
  });

  it('create() adds a 100x100 white square at (400, 400) and gives it a physics body', () => {
    const { scene, state } = makeScene();
    scene.create();
    assert.deepStrictEqual(state.added, [[400, 400, 100, 100, 0xFFFFFF]]);
    assert.strictEqual(state.physicsAdded.length, 1);
  });

  describe('update() velocity from cursor keys', () => {
    const run = (keys) => {
      const { scene, state } = makeScene(keys);
      scene.create();
      scene.update();
      return { vx: state.vx, vy: state.vy };
    };

    it('stops the square when no key is held', () => {
      assert.deepStrictEqual(run({}), { vx: 0, vy: 0 });
    });

    it('moves up (negative y) at speed 500', () => {
      assert.deepStrictEqual(run({ up: true }), { vx: 0, vy: -500 });
    });

    it('moves down at speed 500', () => {
      assert.deepStrictEqual(run({ down: true }), { vx: 0, vy: 500 });
    });

    it('moves left (negative x) at speed 500', () => {
      assert.deepStrictEqual(run({ left: true }), { vx: -500, vy: 0 });
    });

    it('moves right at speed 500', () => {
      assert.deepStrictEqual(run({ right: true }), { vx: 500, vy: 0 });
    });

    it('moves diagonally when a horizontal and vertical key are held', () => {
      assert.deepStrictEqual(run({ up: true, right: true }), { vx: 500, vy: -500 });
      assert.deepStrictEqual(run({ down: true, left: true }), { vx: -500, vy: 500 });
    });

    it('gives up priority over down, and right priority over left', () => {
      assert.deepStrictEqual(run({ up: true, down: true }), { vx: 0, vy: -500 });
      assert.deepStrictEqual(run({ left: true, right: true }), { vx: 500, vy: 0 });
    });

    it('resets velocity on the next frame once keys are released', () => {
      const keys = { up: true, right: true };
      const { scene, state } = makeScene(keys);
      scene.create();
      scene.update();
      assert.deepStrictEqual([state.vx, state.vy], [500, -500]);
      keys.up = false;
      keys.right = false;
      scene.update();
      assert.deepStrictEqual([state.vx, state.vy], [0, 0]);
    });
  });
});
