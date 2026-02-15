import Phaser from 'phaser';

/**
 * BootScene — Loads narrative data and character JSON.
 * No more sprite generation — the game is text-selection based.
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Loading bar
        const { width, height } = this.cameras.main;
        const barW = 300, barH = 20;
        const barX = (width - barW) / 2;
        const barY = height / 2;

        const bg = this.add.rectangle(width / 2, barY, barW + 4, barH + 4, 0x1a1a2e);
        const fill = this.add.rectangle(barX + 2, barY, 0, barH, 0x6c63ff).setOrigin(0, 0.5);

        const loadText = this.add.text(width / 2, barY - 30, 'Loading...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#8888aa',
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            fill.width = barW * value;
        });

        this.load.on('complete', () => {
            bg.destroy();
            fill.destroy();
            loadText.destroy();
        });

        // Character data
        this.load.json('characters', '/src/data/characters.json');
        this.load.json('act2_characters', '/src/data/act2_characters.json');
        this.load.json('act3_characters', '/src/data/act3_characters.json');

        // Palette data
        this.load.json('palettes', '/src/data/narrative/palettes.json');

        // Act manifests
        this.load.json('act1_manifest', '/src/data/narrative/act1_manifest.json');
        this.load.json('act2_manifest', '/src/data/narrative/act2_manifest.json');
        this.load.json('act3_manifest', '/src/data/narrative/act3_manifest.json');
        this.load.json('act4_manifest', '/src/data/narrative/act4_manifest.json');
        this.load.json('act5_manifest', '/src/data/narrative/act5_manifest.json');

        // Act moments (narrative content)
        this.load.json('act1_moments', '/src/data/narrative/act1_moments.json');
        this.load.json('act2_moments', '/src/data/narrative/act2_moments.json');
        this.load.json('act3_moments', '/src/data/narrative/act3_moments.json');
        this.load.json('act4_moments', '/src/data/narrative/act4_moments.json');
        this.load.json('act5_moments', '/src/data/narrative/act5_moments.json');
    }

    create() {
        // Wait for fonts to load before starting
        document.fonts.ready.then(() => {
            this.scale.refresh();
            this.scene.start('MenuScene');
        });
    }
}
