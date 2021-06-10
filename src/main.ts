import * as Phaser from 'phaser';
import { StartScene } from './scene/start/start.scene';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',
  scene: StartScene,
  type: Phaser.AUTO,

  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
  },

  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    },
  },

  parent: 'game',
  backgroundColor: '#000000',
};

export const game = new Phaser.Game(gameConfig);