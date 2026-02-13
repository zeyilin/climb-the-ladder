import Phaser from 'phaser';

/**
 * RelationshipPanelScene — Fading portraits panel.
 * The core emotional mechanic: portraits grey out as connections decay.
 */
export default class RelationshipPanelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RelationshipPanelScene' });
    }

    init() {
        this.relationshipManager = this.registry.get('relationshipManager');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background overlay
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85)
            .setInteractive()
            .setDepth(200);

        // Panel
        const panelW = 400;
        const panelH = 350;
        this.add.rectangle(width / 2, height / 2, panelW, panelH, 0x12121f)
            .setDepth(201);
        this.add.rectangle(width / 2, height / 2, panelW - 2, panelH - 2, 0x000000, 0)
            .setStrokeStyle(1, 0x2a2a4e)
            .setDepth(201);

        // Title
        this.add.text(width / 2, height / 2 - panelH / 2 + 25, '❤️ RELATIONSHIPS', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#6c63ff',
        }).setOrigin(0.5).setDepth(202);

        this.add.text(width / 2, height / 2 - panelH / 2 + 45, 'They fade when you stop showing up.', {
            fontFamily: 'Inter',
            fontSize: '10px',
            color: '#4a4a6a',
            fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(202);

        // Character data
        const charData = this.cache.json.get('characters');
        const characters = charData.characters;
        const sorted = this.relationshipManager.getSorted();

        const startY = height / 2 - panelH / 2 + 80;
        const rowH = 60;

        sorted.forEach((rel, i) => {
            const y = startY + i * rowH;
            const x = width / 2 - panelW / 2 + 40;
            const opacity = this.relationshipManager.getPortraitOpacity(rel.id);
            const char = characters.find(c => c.id === rel.id);

            // Portrait box
            const portraitSize = 40;
            const portraitBg = this.add.rectangle(x + portraitSize / 2, y + portraitSize / 2, portraitSize, portraitSize,
                Phaser.Display.Color.HexStringToColor(char?.color || '#3a3a5e').color)
                .setAlpha(opacity).setDepth(202);

            // Emoji
            if (char) {
                this.add.text(x + portraitSize / 2, y + portraitSize / 2, char.emoji, {
                    fontSize: '20px',
                }).setOrigin(0.5).setAlpha(opacity).setDepth(203);
            }

            // Name
            this.add.text(x + portraitSize + 15, y + 5, rel.name, {
                fontFamily: '"Press Start 2P"',
                fontSize: '9px',
                color: '#c8c8e8',
            }).setAlpha(opacity).setDepth(202);

            // Role text
            if (char) {
                this.add.text(x + portraitSize + 15, y + 22, char.role, {
                    fontFamily: 'Inter',
                    fontSize: '9px',
                    color: '#5a5a7a',
                }).setAlpha(Math.max(0.3, opacity)).setDepth(202);
            }

            // Connection bar
            const barX = x + portraitSize + 15;
            const barY = y + 38;
            const barW = 180;
            const barH = 6;
            const fillW = (rel.connection / 100) * barW;

            this.add.rectangle(barX + barW / 2, barY, barW, barH, 0x1a1a2e).setDepth(202);

            const fillColor = rel.connection > 50 ? 0x98D8AA :
                rel.connection > 25 ? 0xFFD93D : 0xFF6B6B;
            this.add.rectangle(barX + fillW / 2, barY, fillW, barH, fillColor)
                .setOrigin(0, 0.5).setAlpha(opacity).setDepth(202);

            // Connection value
            const connText = rel.lost ? 'LOST' : `${rel.connection}%`;
            const connColor = rel.lost ? '#FF6B6B' : '#6a6a8a';
            this.add.text(barX + barW + 10, barY, connText, {
                fontFamily: 'Inter',
                fontSize: '10px',
                color: connColor,
                fontStyle: rel.lost ? 'italic' : 'normal',
            }).setOrigin(0, 0.5).setAlpha(opacity).setDepth(202);

            // Status indicator
            if (!rel.reachesOut && !rel.lost) {
                this.add.text(barX + barW + 45, barY, '(stopped texting)', {
                    fontFamily: 'Inter',
                    fontSize: '8px',
                    color: '#FF6B6B',
                    fontStyle: 'italic',
                }).setOrigin(0, 0.5).setDepth(202);
            }
        });

        // Close instruction
        this.add.text(width / 2, height / 2 + panelH / 2 - 20, 'Press TAB to close', {
            fontFamily: '"Press Start 2P"',
            fontSize: '7px',
            color: '#3a3a5a',
        }).setOrigin(0.5).setDepth(202);

        // Close on TAB
        const tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
        tabKey.on('down', () => {
            this.scene.stop('RelationshipPanelScene');
        });

        // Also close on clicking background
        bg.on('pointerdown', () => {
            this.scene.stop('RelationshipPanelScene');
        });
    }
}
