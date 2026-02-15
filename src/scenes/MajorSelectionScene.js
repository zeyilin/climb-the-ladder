import Phaser from 'phaser';
import BaseScene from './BaseScene.js';

/**
 * MajorSelectionScene — One-time scene at start of Act II.
 * Pick your major. It won't matter as much as you think.
 */
export default class MajorSelectionScene extends BaseScene {
    constructor() {
        super({ key: 'MajorSelectionScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a1a');
        this.cameras.main.fadeIn(400);

        // Title
        this.add.text(width / 2, 40, '📋 DECLARE YOUR MAJOR', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#e8e8ff',
        }).setOrigin(0.5);

        this.add.text(width / 2, 65, 'Choose wisely. (It won\'t matter.)', {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#6a6a8a',
        }).setOrigin(0.5);

        const majors = [
            {
                id: 'economics',
                label: 'Economics / Finance',
                icon: '📈',
                desc: 'You tell everyone it\'s "versatile."\nThey nod in the way people nod when\nthey\'re not listening.',
                color: '#4CAF50',
            },
            {
                id: 'cs',
                label: 'Computer Science',
                icon: '💻',
                desc: 'You tell everyone it\'s "the future."\nYou will say "it\'s basically just problem-\nsolving" 847 times before graduating.',
                color: '#2196F3',
            },
            {
                id: 'business',
                label: 'Business Administration',
                icon: '💼',
                desc: 'You tell everyone it\'s "practical."\nYour philosophy major friend will outlive\nyou. Not in years. In joy.',
                color: '#FF9800',
            },
            {
                id: 'philosophy',
                label: 'Philosophy',
                icon: '🤔',
                desc: 'You tell everyone...\nActually, nobody asks.\nYou\'re happier than all of them and can\'t\nexplain why.',
                color: '#9C27B0',
            },
        ];

        const startY = 110;
        const cardH = 80;
        const gap = 12;

        majors.forEach((major, i) => {
            const y = startY + i * (cardH + gap);

            // Card background
            const card = this.add.rectangle(width / 2, y + cardH / 2, 500, cardH, 0x12121f)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(1, 0x2a2a4e);

            // Icon
            this.add.text(width / 2 - 220, y + 15, major.icon, { fontSize: '24px' });

            // Title
            const title = this.add.text(width / 2 - 185, y + 12, major.label, {
                fontFamily: '"Press Start 2P"', fontSize: '9px', color: major.color,
            });

            // Description
            this.add.text(width / 2 - 185, y + 32, major.desc, {
                fontFamily: '"VT323", monospace', fontSize: '10px', color: '#7a7a9a',
                lineSpacing: 2,
            });

            // Hover effects
            card.on('pointerover', () => {
                card.setFillStyle(0x1a1a2e);
                card.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(major.color).color);
            });
            card.on('pointerout', () => {
                card.setFillStyle(0x12121f);
                card.setStrokeStyle(1, 0x2a2a4e);
            });

            // Select major
            card.on('pointerdown', () => {
                this.selectMajor(major);
            });
        });

        this.initBaseScene();
    }

    selectMajor(major) {
        const { width, height } = this.cameras.main;
        const resumeSystem = this.registry.get('resumeSystem');
        resumeSystem.setField('major', major.label);

        // Flash confirmation
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85).setDepth(20);
        this.add.text(width / 2, height / 2 - 30, `${major.icon} ${major.label}`, {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: major.color,
        }).setOrigin(0.5).setDepth(21);

        this.add.text(width / 2, height / 2 + 10, 'DECLARED', {
            fontFamily: '"Press Start 2P"', fontSize: '18px', color: '#e8e8ff',
        }).setOrigin(0.5).setDepth(21);

        this.add.text(width / 2, height / 2 + 45, '(Your parents are relieved. For now.)', {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#6a6a8a',
        }).setOrigin(0.5).setDepth(21);

        this.time.delayedCall(2000, () => {
            this.cameras.main.fadeOut(500);
            this.time.delayedCall(500, () => {
                this.scene.start('CollegeCampusScene');
            });
        });
    }
}
