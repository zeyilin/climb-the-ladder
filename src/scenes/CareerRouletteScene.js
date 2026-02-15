import Phaser from 'phaser';

/**
 * CareerRouletteScene — Act II Climax.
 * The slot machine that randomly assigns your career.
 * The player has no say. That's the point.
 */
export default class CareerRouletteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CareerRouletteScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(800);

        this.statManager = this.registry.get('statManager');
        this.resumeSystem = this.registry.get('resumeSystem');

        // The buildup
        this.time.delayedCall(500, () => this.showGraduationIntro());
    }

    showGraduationIntro() {
        const { width, height } = this.cameras.main;

        const grad = this.add.text(width / 2, height / 2 - 40, '🎓', { fontSize: '48px' }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: grad, alpha: 1, duration: 800, ease: 'Power2' });

        const title = this.add.text(width / 2, height / 2 + 20, 'GRADUATION', {
            fontFamily: '"Press Start 2P"', fontSize: '16px', color: '#e8e8ff',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: title, alpha: 1, delay: 400, duration: 600 });

        const sub = this.add.text(width / 2, height / 2 + 50, 'You throw your cap in the air.', {
            fontFamily: '"VT323", monospace', fontSize: '13px', color: '#6a6a8a',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: sub, alpha: 1, delay: 800, duration: 600 });

        // Freeze moment text
        this.time.delayedCall(2500, () => {
            const freeze = this.add.text(width / 2, height / 2 + 80, 'The camera freezes.', {
                fontFamily: '"VT323", monospace', fontSize: '12px', color: '#ffd93d', fontStyle: 'italic',
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: freeze, alpha: 1, duration: 400 });
        });

        this.time.delayedCall(4000, () => {
            // Clear and start slot machine
            this.children.removeAll(true);
            this.showSlotMachine();
        });
    }

    showSlotMachine() {
        const { width, height } = this.cameras.main;

        // Slot machine frame
        const frame = this.add.rectangle(width / 2, height / 2, 440, 300, 0x0a0a1a)
            .setStrokeStyle(3, 0xffd93d);

        this.add.text(width / 2, height / 2 - 125, '🎰 CAREER DESTINY 🎰', {
            fontFamily: '"Press Start 2P"', fontSize: '11px', color: '#ffd93d',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 100, '"The economy has decided for you."', {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#6a6a8a', fontStyle: 'italic',
        }).setOrigin(0.5);

        // Career tracks
        this.careers = [
            {
                id: 'consulting', label: 'CONSULTING', icon: '🧳', color: '#4CAF50',
                flavor: '"You fly to Cleveland to tell a CEO what he already knew.\nHe paid $200K for this."',
            },
            {
                id: 'banking', label: 'INVESTMENT BANKING', icon: '💰', color: '#FFD700',
                flavor: '"It\'s 3am. You\'re formatting a pitch deck.\nThe associate above you is asleep under his desk.\nThis is prestige."',
            },
            {
                id: 'startup', label: 'STARTUP', icon: '🚀', color: '#FF6B6B',
                flavor: '"Your app has 12 users.\n4 of them are your mom on different devices."',
            },
            {
                id: 'bigtech', label: 'BIG TECH', icon: '💻', color: '#2196F3',
                flavor: '"You optimized a button color for 3 weeks.\nThe stock went up anyway."',
            },
        ];

        // Slot display area
        this.slotBg = this.add.rectangle(width / 2, height / 2, 380, 60, 0x000000)
            .setStrokeStyle(1, 0x2a2a4e);

        // Spinning text
        this.slotText = this.add.text(width / 2, height / 2, '', {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#e8e8ff',
        }).setOrigin(0.5);

        // Start spinning
        this.spinIndex = 0;
        this.spinSpeed = 80;
        this.totalSpins = 30 + Math.floor(Math.random() * 10);
        this.currentSpin = 0;

        // Determine result (truly random)
        this.resultIndex = Math.floor(Math.random() * this.careers.length);

        this.spinEvent = this.time.addEvent({
            delay: this.spinSpeed,
            repeat: this.totalSpins,
            callback: () => this.doSpin(),
        });
    }

    doSpin() {
        this.currentSpin++;
        const { width, height } = this.cameras.main;

        // Show current career
        const career = this.careers[this.spinIndex % this.careers.length];
        this.slotText.setText(`${career.icon} ${career.label}`);
        this.slotText.setColor(career.color);

        // Slow down near end
        if (this.currentSpin > this.totalSpins - 8) {
            this.spinSpeed += 40;
        }
        if (this.currentSpin > this.totalSpins - 4) {
            this.spinSpeed += 80;
        }

        this.spinIndex++;

        // Flash effect
        this.slotBg.setFillStyle(0x1a1a2e);
        this.time.delayedCall(40, () => this.slotBg.setFillStyle(0x000000));

        if (this.currentSpin >= this.totalSpins) {
            // Land on result
            this.spinIndex = this.resultIndex;
            const result = this.careers[this.resultIndex];
            this.slotText.setText(`${result.icon} ${result.label}`);
            this.slotText.setColor(result.color);

            this.time.delayedCall(600, () => this.showResult(result));
        }
    }

    showResult(career) {
        const { width, height } = this.cameras.main;

        // Store result
        if (this.resumeSystem) {
            this.resumeSystem.setField('career', career.label);
        }
        this.registry.set('careerTrack', career.id);

        // Flash the frame
        this.tweens.add({
            targets: this.slotText,
            scaleX: 1.3, scaleY: 1.3,
            duration: 200,
            yoyo: true,
            repeat: 2,
        });

        // Flavor text
        this.time.delayedCall(1000, () => {
            this.add.text(width / 2, height / 2 + 55, career.flavor, {
                fontFamily: '"VT323", monospace', fontSize: '11px', color: '#aaaacc',
                fontStyle: 'italic', align: 'center', lineSpacing: 4,
            }).setOrigin(0.5);
        });

        // "Congratulations" text
        this.time.delayedCall(2000, () => {
            this.add.text(width / 2, height / 2 + 110, 'Congratulations! The economy has decided for you.', {
                fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffd93d',
            }).setOrigin(0.5);
        });

        // Stats recap
        this.time.delayedCall(3000, () => {
            const hours = this.registry.get('hoursWorked') || 0;
            const peoplHours = this.registry.get('hoursWithPeople') || 0;

            this.add.text(width / 2, height - 80, `Hours worked: ${hours} | Hours with people: ${peoplHours}`, {
                fontFamily: '"VT323", monospace', fontSize: '10px', color: '#4a4a6a',
            }).setOrigin(0.5);

            const ratio = hours > 0 ? (peoplHours / hours).toFixed(1) : '∞';
            this.add.text(width / 2, height - 60, `Ratio: ${ratio}:1 (people:work)`, {
                fontFamily: '"VT323", monospace', fontSize: '10px', color: peoplHours > hours ? '#4CAF50' : '#FF6B6B',
            }).setOrigin(0.5);
        });

        // Continue button
        this.time.delayedCall(4000, () => {
            const btn = this.add.text(width / 2, height - 30, '[ Accept Your Fate ]', {
                fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#6c63ff',
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#9a93ff'));
            btn.on('pointerout', () => btn.setColor('#6c63ff'));
            btn.on('pointerdown', () => {
                this.cameras.main.fadeOut(1000);
                this.time.delayedCall(1000, () => {
                    // End of Act II → Act III (Early Career)
                    const timeManager = this.registry.get('timeManager');
                    if (timeManager) timeManager.advanceAct();
                    this.scene.start('CityScene');
                });
            });
        });
    }
}
