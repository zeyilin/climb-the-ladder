import Phaser from 'phaser';

/**
 * BootScene — Generates all placeholder assets procedurally and loads data.
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

        // Load dialogue JSON — Act I
        this.load.json('dialogue_mom', '/src/data/dialogue/act1_mom.json');
        this.load.json('dialogue_sam', '/src/data/dialogue/act1_sam.json');
        this.load.json('dialogue_dad', '/src/data/dialogue/act1_dad.json');
        this.load.json('dialogue_jordan', '/src/data/dialogue/act1_jordan.json');
        // Act II dialogues
        this.load.json('dialogue_priya', '/src/data/dialogue/act2_priya.json');
        this.load.json('dialogue_morgan', '/src/data/dialogue/act2_morgan.json');
        // Act III dialogues
        this.load.json('dialogue_act3_mom', '/src/data/dialogue/act3_mom.json');
        this.load.json('dialogue_colleague', '/src/data/dialogue/act3_colleague.json');
        // Character data
        this.load.json('characters', '/src/data/characters.json');
        this.load.json('act2_characters', '/src/data/act2_characters.json');
        this.load.json('act3_characters', '/src/data/act3_characters.json');
    }

    create() {
        // Generate placeholder sprite textures procedurally
        this.generateSprite('player', 0x6c63ff, 24, 32);
        this.generateSprite('npc_mom', 0xFF9AA2, 24, 32);
        this.generateSprite('npc_dad', 0x6B93D6, 24, 32);
        this.generateSprite('npc_jordan', 0x98D8AA, 24, 32);
        this.generateSprite('npc_sam', 0xFFD93D, 24, 32);

        // Tiles
        this.generateSprite('tile_floor', 0x2a2a3e, 32, 32);
        this.generateSprite('tile_wall', 0x1a1a2e, 32, 32);
        this.generateSprite('tile_grass', 0x1a3a1a, 32, 32);
        this.generateSprite('tile_school', 0x3a2a2a, 32, 32);
        this.generateSprite('tile_path', 0x3a3a3a, 32, 32);

        // Interaction indicators
        this.generateSprite('indicator', 0xffd93d, 8, 8);

        // Act II NPCs
        this.generateSprite('npc_priya', 0xE88D67, 24, 32);
        this.generateSprite('npc_morgan', 0xC084FC, 24, 32);

        // College tiles
        this.generateSprite('tile_dorm', 0x3a2a4e, 32, 32);
        this.generateSprite('tile_lecture', 0x2a3a4e, 32, 32);
        this.generateSprite('tile_library', 0x2a2a3e, 32, 32);
        this.generateSprite('tile_career', 0x4a3a2a, 32, 32);

        // Card backs for study mini-game
        this.generateSprite('card_back', 0x3a3a5e, 64, 80);
        this.generateSprite('card_front', 0x1a1a2e, 64, 80);

        // Act III NPCs — desaturated grey-blue tones
        this.generateSprite('npc_derek', 0x5a6a7a, 24, 32);
        this.generateSprite('npc_colleague', 0x7a8a6a, 24, 32);
        this.generateSprite('npc_boss', 0x8a6a7a, 24, 32);

        // City tiles — grey-blue fluorescent
        this.generateSprite('tile_office', 0x1a2a3e, 32, 32);
        this.generateSprite('tile_apartment', 0x2a2a2e, 32, 32);
        this.generateSprite('tile_sweetgreen', 0x1a3a2a, 32, 32);
        this.generateSprite('tile_subway', 0x2a1a1a, 32, 32);

        // Act IV NPCs — gold/black tones
        this.generateSprite('npc_mentor', 0x8a7a4a, 24, 32);

        // Act IV tiles
        this.generateSprite('tile_penthouse', 0x2a2010, 32, 32);
        this.generateSprite('tile_club', 0x2a1a2a, 32, 32);
        this.generateSprite('tile_lounge', 0x1a2a3a, 32, 32);

        this.scene.start('MenuScene');
    }

    generateSprite(key, color, w, h) {
        const gfx = this.add.graphics();
        gfx.fillStyle(color);
        gfx.fillRoundedRect(0, 0, w, h, 3);

        // Add subtle pixel detail
        gfx.fillStyle(Phaser.Display.Color.IntegerToColor(color).brighten(20).color);
        gfx.fillRect(2, 2, w - 4, 2); // highlight top
        gfx.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(20).color);
        gfx.fillRect(2, h - 4, w - 4, 2); // shadow bottom

        gfx.generateTexture(key, w, h);
        gfx.destroy();
    }
}
