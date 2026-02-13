import Phaser from 'phaser';

/**
 * MenuScene — Title screen.
 * "CLIMB THE LADDER" with darkly comedic tagline and New Game button.
 */
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark atmospheric background
        this.cameras.main.setBackgroundColor('#0a0a0f');

        // Ladder visual — decorative pixel lines
        const gfx = this.add.graphics();
        gfx.lineStyle(2, 0x1a1a3e);
        for (let i = 0; i < 15; i++) {
            const y = 50 + i * 35;
            gfx.lineBetween(width / 2 - 60, y, width / 2 + 60, y);
        }
        gfx.lineStyle(2, 0x1a1a3e);
        gfx.lineBetween(width / 2 - 60, 50, width / 2 - 60, 50 + 14 * 35);
        gfx.lineBetween(width / 2 + 60, 50, width / 2 + 60, 50 + 14 * 35);
        gfx.setAlpha(0.3);

        // Title
        const title = this.add.text(width / 2, height * 0.3, 'CLIMB THE\nLADDER', {
            fontFamily: '"Press Start 2P"',
            fontSize: '28px',
            color: '#e8e8ff',
            align: 'center',
            lineSpacing: 12,
        }).setOrigin(0.5);

        // Pulse effect on title
        this.tweens.add({
            targets: title,
            alpha: { from: 0.85, to: 1 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
        });

        // Tagline
        const taglines = [
            '"Because your parents didn\'t sacrifice everything\nfor you to have work-life balance."',
            '"LinkedIn is just Instagram for people\nwho peaked in college."',
            '"Your worth is not defined by your job title.\nHaha, just kidding. It totally is."',
            '"A game about climbing a ladder\nthat\'s leaning against the wrong wall."',
            '"Alexa, play Everybody Wants to Rule the World\nbut make it ironic."',
        ];
        const tagline = Phaser.Math.RND.pick(taglines);

        this.add.text(width / 2, height * 0.52, tagline, {
            fontFamily: 'Inter',
            fontSize: '13px',
            color: '#6a6a8a',
            align: 'center',
            fontStyle: 'italic',
            lineSpacing: 4,
        }).setOrigin(0.5);

        // New Game button
        const btnY = height * 0.72;
        const btn = this.add.rectangle(width / 2, btnY, 200, 45, 0x2a2a4e)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                btn.setFillStyle(0x4a4a6e);
                btnText.setColor('#ffffff');
            })
            .on('pointerout', () => {
                btn.setFillStyle(0x2a2a4e);
                btnText.setColor('#c8c8e8');
            })
            .on('pointerdown', () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    this.scene.start('HighSchoolScene');
                });
            });

        const btnText = this.add.text(width / 2, btnY, '▶  NEW GAME', {
            fontFamily: '"Press Start 2P"',
            fontSize: '11px',
            color: '#c8c8e8',
        }).setOrigin(0.5);

        // Version
        this.add.text(width / 2, height - 25, 'v0.1 — Act I Prototype', {
            fontFamily: 'Inter',
            fontSize: '10px',
            color: '#333355',
        }).setOrigin(0.5);

        // Fade in
        this.cameras.main.fadeIn(800, 0, 0, 0);
    }
}
