import BaseScene from './BaseScene.js';

/**
 * EndingScene — 4 endings based on cumulative relationship states.
 * 🌅 "What Matters" — kitchen table, congee, all four chairs full
 * 🌫️ "Too Late" — corner office, phone rings, weather talk
 * 🌤️ "The Long Road Back" — coffee shop, baby steps
 * 💀 "The Full Send" — TED talk, parking lot, silence
 */
export default class EndingScene extends BaseScene {
    constructor() {
        super({ key: 'EndingScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(2000);

        this.relationshipManager = this.registry.get('relationshipManager');
        this.statManager = this.registry.get('statManager');

        // Determine ending
        const sorted = this.relationshipManager.getSorted();
        const above50 = sorted.filter(r => r.connection > 50).length;
        const below25 = sorted.filter(r => r.connection <= 25).length;
        const allBelow25 = below25 === sorted.length;
        const prestige = this.statManager.stats.prestige;

        let ending;
        if (prestige >= 80 && sorted.every(r => r.connection === 0)) {
            ending = 'fullSend';
        } else if (above50 >= 3) {
            ending = 'whatMatters';
        } else if (allBelow25) {
            ending = 'tooLate';
        } else {
            ending = 'longRoad';
        }

        this.time.delayedCall(1000, () => this.playEnding(ending));

        this.initBaseScene();
    }

    playEnding(ending) {
        switch (ending) {
            case 'whatMatters': return this.endingWhatMatters();
            case 'tooLate': return this.endingTooLate();
            case 'longRoad': return this.endingLongRoad();
            case 'fullSend': return this.endingFullSend();
        }
    }

    endingWhatMatters() {
        const { width, height } = this.cameras.main;

        const emoji = this.add.text(width / 2, 80, '🌅', { fontSize: '48px' }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: emoji, alpha: 1, duration: 1500 });

        const title = this.add.text(width / 2, 130, '"WHAT MATTERS"', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ffd93d',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: title, alpha: 1, delay: 1000, duration: 1000 });

        const lines = [
            'The kitchen table.',
            'All four chairs are full.',
            'Ma made too much food. She always makes too much food.',
            'Ba is telling a joke. His English stumbles. Nobody cares.',
            'Lily is showing everyone photos of the honeymoon.',
            'Your phone is in the other room.',
            '',
            'The congee is warm.',
        ];

        lines.forEach((line, i) => {
            const t = this.add.text(width / 2, 190 + i * 28, line, {
                fontFamily: '"VT323", monospace', fontSize: '12px',
                color: line === '' ? '#000000' : '#c8c8a8',
                fontStyle: i === lines.length - 1 ? 'italic' : 'normal',
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: t, alpha: 1, delay: 2000 + i * 800, duration: 800 });
        });

        this.time.delayedCall(10000, () => {
            const postCredit = this.add.text(width / 2, height - 60,
                'Alex\'s LinkedIn still says VP.\nNobody at the table cares.', {
                fontFamily: '"VT323", monospace', fontSize: '10px', color: '#3a3a3a', fontStyle: 'italic',
                align: 'center', lineSpacing: 6,
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: postCredit, alpha: 0.6, duration: 1500 });
        });

        this.showCredits(14000);
    }

    endingTooLate() {
        const { width, height } = this.cameras.main;

        const emoji = this.add.text(width / 2, 80, '🌫️', { fontSize: '48px' }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: emoji, alpha: 1, duration: 1500 });

        const title = this.add.text(width / 2, 130, '"TOO LATE"', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#6a6a8a',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: title, alpha: 1, delay: 1000, duration: 1000 });

        const lines = [
            'Corner office. The Herman Miller is $4,200.',
            'The whiskey is $400. Single malt. 18 year.',
            'The city glitters below you.',
            '',
            'Your phone rings.',
            'It\'s Ma.',
            'You answer.',
            'She asks about the weather.',
            'You talk about the weather.',
            'She says goodbye.',
        ];

        lines.forEach((line, i) => {
            const t = this.add.text(width / 2, 180 + i * 26, line, {
                fontFamily: '"VT323", monospace', fontSize: '12px',
                color: line === '' ? '#000000' : '#8a8a8a',
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: t, alpha: 1, delay: 2000 + i * 700, duration: 700 });
        });

        this.time.delayedCall(11000, () => {
            const trophy = this.add.text(width / 2, height - 50,
                'You won. 🏆\n(It\'s not a compliment.)', {
                fontFamily: '"Inter", sans-serif', fontSize: '12px', color: '#3a3a5a',
                align: 'center', lineSpacing: 8,
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: trophy, alpha: 0.7, duration: 1000 });
        });

        this.showCredits(14000);
    }

    endingLongRoad() {
        const { width, height } = this.cameras.main;

        const emoji = this.add.text(width / 2, 80, '🌤️', { fontSize: '48px' }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: emoji, alpha: 1, duration: 1500 });

        const title = this.add.text(width / 2, 130, '"THE LONG ROAD BACK"', {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#d4a853',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: title, alpha: 1, delay: 1000, duration: 1000 });

        const lines = [
            'A coffee shop. Two people.',
            'It\'s painfully awkward.',
            'Alex says "so how are you" three times.',
            'Dev says "good, good" each time.',
            '',
            'They both order the same thing.',
            'Nobody mentions the 4 years.',
            'But nobody leaves.',
            '',
            'It\'s a start.',
        ];

        lines.forEach((line, i) => {
            const t = this.add.text(width / 2, 180 + i * 26, line, {
                fontFamily: '"VT323", monospace', fontSize: '12px',
                color: line === '' ? '#000000' : '#b8a888',
                fontStyle: i === lines.length - 1 ? 'italic' : 'normal',
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: t, alpha: 1, delay: 2000 + i * 800, duration: 800 });
        });

        this.time.delayedCall(12000, () => {
            const postCredit = this.add.text(width / 2, height - 50,
                'Alex deleted LinkedIn.\n(They reactivated it two weeks later. Baby steps.)', {
                fontFamily: '"VT323", monospace', fontSize: '10px', color: '#5a4a3a', fontStyle: 'italic',
                align: 'center', lineSpacing: 6,
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: postCredit, alpha: 0.6, duration: 1500 });
        });

        this.showCredits(15000);
    }

    endingFullSend() {
        const { width, height } = this.cameras.main;

        const emoji = this.add.text(width / 2, 80, '💀', { fontSize: '48px' }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: emoji, alpha: 1, duration: 1500 });

        const title = this.add.text(width / 2, 130, '"THE FULL SEND"', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#FF6B6B',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: title, alpha: 1, delay: 1000, duration: 1000 });

        const tedLines = [
            'A TED stage. Red circle.',
            'Alex gives a talk titled:',
            '"How I Optimized My Life"',
            '',
            'The audience applauds.',
            'Standing ovation.',
            'Alex walks offstage.',
        ];

        tedLines.forEach((line, i) => {
            const t = this.add.text(width / 2, 180 + i * 26, line, {
                fontFamily: i === 2 ? '"Press Start 2P"' : 'Inter',
                fontSize: i === 2 ? '9px' : '12px',
                color: i === 2 ? '#FF6B6B' : '#8a8a8a',
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: t, alpha: 1, delay: 2000 + i * 700, duration: 700 });
        });

        this.time.delayedCall(9000, () => {
            this.children.removeAll(true);
            this.cameras.main.setBackgroundColor('#050505');

            const car = this.add.text(width / 2, height / 2 - 20, '🅿️', {
                fontSize: '32px',
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: car, alpha: 0.5, duration: 2000 });

            const carText = this.add.text(width / 2, height / 2 + 30,
                'An empty parking lot. The engine is off.\nNo music. Ba\'s compass sits on the dashboard.\nThe needle doesn\'t move.', {
                fontFamily: '"VT323", monospace', fontSize: '11px', color: '#2a2a2a',
                align: 'center', lineSpacing: 6,
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: carText, alpha: 0.4, delay: 3000, duration: 2000 });

            this.showCredits(25000);
        });
    }

    showCredits(delay) {
        this.time.delayedCall(delay, () => {
            const { width, height } = this.cameras.main;

            const hoursWorked = this.registry.get('hoursWorked') || 0;
            const hoursWithPeople = this.registry.get('hoursWithPeople') || 0;

            const hoursBlock = this.add.text(width / 2, height - 90,
                `Hours Worked: ${hoursWorked}\nHours Spent With People Who Love You: ${hoursWithPeople}`, {
                fontFamily: '"Inter", sans-serif', fontSize: '11px', color: '#3a3a4a',
                align: 'center', lineSpacing: 8,
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: hoursBlock, alpha: 0.7, duration: 2000 });

            const credits = this.add.text(width / 2, height - 45, 'CLIMB THE LADDER', {
                fontFamily: '"Inter", sans-serif', fontSize: '12px', color: '#2a2a3a',
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: credits, alpha: 0.5, delay: 2000, duration: 2000 });

            this.time.delayedCall(5000, () => {
                const restart = this.add.text(width / 2, height - 20,
                    '[ Play Again? ]', {
                    fontFamily: '"Inter", sans-serif', fontSize: '11px', color: '#6c63ff',
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                restart.on('pointerover', () => restart.setColor('#9a93ff'));
                restart.on('pointerout', () => restart.setColor('#6c63ff'));
                restart.on('pointerdown', () => {
                    this.cameras.main.fadeOut(2000);
                    this.time.delayedCall(2000, () => {
                        this.stopAllOverlays();
                        this.scene.start('MenuScene');
                    });
                });
            });
        });
    }
}
