import Phaser from 'phaser';

/**
 * UltimatePromotionScene — Act IV Climax.
 * CEO / MD / Partner. The toast. The crowd you don't recognize.
 * Jordan's text: "Hey, congrats I think? Are you coming to Dad's birthday?"
 * Credits almost roll. They don't.
 */
export default class UltimatePromotionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UltimatePromotionScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0804');
        this.cameras.main.fadeIn(1000);

        this.statManager = this.registry.get('statManager');
        this.resumeSystem = this.registry.get('resumeSystem');
        this.relationshipManager = this.registry.get('relationshipManager');
        this.careerTrack = this.registry.get('careerTrack') || 'consulting';

        this.time.delayedCall(500, () => this.showCelebration());
    }

    showCelebration() {
        const { width, height } = this.cameras.main;

        const titles = {
            consulting: { title: 'MANAGING DIRECTOR', salary: 450000, org: 'McKinley & Associates' },
            banking: { title: 'MANAGING DIRECTOR', salary: 800000, org: 'Goldman Sacks' },
            startup: { title: 'CEO', salary: 250000, org: 'Your startup (9 employees, 1 ping pong table nobody uses)' },
            bigtech: { title: 'SENIOR VICE PRESIDENT', salary: 650000, org: 'FaangCorp' },
        };
        const promo = titles[this.careerTrack] || titles.consulting;

        // Update resume
        if (this.resumeSystem) {
            this.resumeSystem.setField('career', `${promo.title} at ${promo.org}`);
            this.resumeSystem.addToList('promotions', promo.title);
        }
        this.statManager.modifyStat('wealth', 30);
        this.statManager.modifyStat('prestige', 20);

        // Title reveal
        const crown = this.add.text(width / 2, 80, '👑', { fontSize: '42px' }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: crown, alpha: 1, duration: 1000 });

        const title = this.add.text(width / 2, 130, promo.title, {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ffd93d',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: title, alpha: 1, delay: 600, duration: 800 });

        const org = this.add.text(width / 2, 155, promo.org, {
            fontFamily: 'Inter', fontSize: '12px', color: '#8a7a5a',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: org, alpha: 1, delay: 1000, duration: 600 });

        const salary = this.add.text(width / 2, 190, `$${promo.salary.toLocaleString()}/year`, {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#98d8aa',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: salary, alpha: 1, delay: 1400, duration: 600 });

        // The toast
        this.time.delayedCall(3000, () => this.showToast());
    }

    showToast() {
        const { width, height } = this.cameras.main;

        const toast = this.add.text(width / 2, 240, '🥂 A toast is given about your "incredible journey."', {
            fontFamily: 'Inter', fontSize: '12px', color: '#c8c8a8', fontStyle: 'italic',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: toast, alpha: 1, duration: 800 });

        const crowd = this.add.text(width / 2, 270, 'You look at the crowd. You don\'t recognize most of them.', {
            fontFamily: 'Inter', fontSize: '11px', color: '#6a6a6a',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: crowd, alpha: 1, delay: 1500, duration: 800 });

        const openbar = this.add.text(width / 2, 295, 'One person is definitely just here for the open bar.', {
            fontFamily: 'Inter', fontSize: '10px', color: '#4a4a4a', fontStyle: 'italic',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: openbar, alpha: 1, delay: 3000, duration: 600 });

        // Relationship scan
        this.time.delayedCall(5000, () => this.showRelationshipScan());
    }

    showRelationshipScan() {
        const { width, height } = this.cameras.main;

        // Show how many contacts are "grey"
        const sorted = this.relationshipManager.getSorted();
        const active = sorted.filter(r => r.connection > 25);
        const lost = sorted.filter(r => r.connection <= 25);

        const statusLine = active.length <= 1
            ? 'Your phone is quiet. Has been for months.'
            : `${active.length} contacts left who'd answer if you called.`;

        const status = this.add.text(width / 2, 340, statusLine, {
            fontFamily: 'Inter', fontSize: '11px', color: '#6a6a6a',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: status, alpha: 1, duration: 800 });

        const doorDash = this.registry.get('doorDashOrders') || 0;
        if (doorDash > 3) {
            const miguel = this.add.text(width / 2, 365, `Your most frequent contact: Miguel (DoorDash). ${doorDash} orders.`, {
                fontFamily: 'Inter', fontSize: '9px', color: '#4a4a3a', fontStyle: 'italic',
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: miguel, alpha: 1, delay: 1000, duration: 600 });
        }

        // Jordan's text
        this.time.delayedCall(3000, () => this.showJordanText());
    }

    showJordanText() {
        const { width, height } = this.cameras.main;

        // Phone buzz
        const phoneBox = this.add.rectangle(width / 2, height - 130, 420, 80, 0x1a1a2e, 0.95)
            .setStrokeStyle(2, 0x3a3a5e).setAlpha(0);
        const iMessage = this.add.text(width / 2 - 195, height - 157, '💬  Jordan', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#6b93d6',
        }).setAlpha(0);
        const jordanMsg = this.add.text(width / 2, height - 132, '"Hey, congrats I think? Mom told me.\nAnyway, are you coming to Dad\'s birthday?\nIt\'s been three years."', {
            fontFamily: 'Inter', fontSize: '10px', color: '#a8a8c8',
            align: 'left', lineSpacing: 4,
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: [phoneBox, iMessage, jordanMsg], alpha: 1, duration: 800, delay: 0 });

        // Camera slowly zooms out
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: this.cameras.main,
                zoom: 0.8,
                duration: 3000,
                ease: 'Power1',
            });
        });

        // "Credits almost roll"
        this.time.delayedCall(5000, () => {
            const credits = this.add.text(width / 2, height - 40, '[ credits almost roll ]', {
                fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#2a2a3a',
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({ targets: credits, alpha: 0.6, duration: 1500 });
        });

        // Continue button
        this.time.delayedCall(7000, () => {
            const btn = this.add.text(width / 2, height - 15, '[ ...but they don\'t. ]', {
                fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#6c63ff',
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#9a93ff'));
            btn.on('pointerout', () => btn.setColor('#6c63ff'));
            btn.on('pointerdown', () => {
                this.cameras.main.fadeOut(1500);
                this.time.delayedCall(1500, () => {
                    const timeManager = this.registry.get('timeManager');
                    if (timeManager) timeManager.advanceAct();
                    this.scene.start('ReckoningScene');
                });
            });
        });
    }
}
