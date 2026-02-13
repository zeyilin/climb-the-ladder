import Phaser from 'phaser';

/**
 * PromotionScene — Act III Climax.
 * The big promotion. The salary number. The screenshot you almost send.
 * The text from Mom that's been sitting unread for 3 days.
 */
export default class PromotionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PromotionScene' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
        this.relationshipManager = this.registry.get('relationshipManager');
        this.resumeSystem = this.registry.get('resumeSystem');
        this.timeManager = this.registry.get('timeManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a0f');
        this.cameras.main.fadeIn(1000);

        const stats = this.statManager.getAll();
        const careerTrack = this.registry.get('careerTrack') || 'consulting';

        // Act III stats summary
        this.add.text(width / 2, 35, 'THE GRIND ENDS', {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#6c63ff',
        }).setOrigin(0.5);

        this.add.text(width / 2, 55, '(The grind never ends.)', {
            fontFamily: 'Inter', fontSize: '10px', color: '#4a4a6a', fontStyle: 'italic',
        }).setOrigin(0.5);

        // Stats
        const statsText = [
            `Performance: ${stats.gpa}`, `Network: ${stats.network}`,
            `Burnout: ${stats.burnout}`, `Wealth: $${stats.wealth.toLocaleString()}`,
        ].join('  •  ');

        this.add.text(width / 2, 85, statsText, {
            fontFamily: 'Inter', fontSize: '10px', color: '#6a6a8a',
        }).setOrigin(0.5);

        // Relationship recap — showing the fading portraits
        const sorted = this.relationshipManager.getSorted();
        const y0 = 115;
        this.add.text(width / 2, y0, 'RELATIONSHIPS', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#4a4a6a',
        }).setOrigin(0.5);

        let recapY = y0 + 22;
        const lostCount = sorted.filter(r => r.lost).length;

        for (const rel of sorted.slice(0, 6)) {
            const barW = 100;
            const fillW = (rel.connection / 100) * barW;
            const x = width / 2 - 60;
            const opacity = this.relationshipManager.getPortraitOpacity(rel.id);

            this.add.text(x - 55, recapY, rel.name, {
                fontFamily: 'Inter', fontSize: '10px', color: '#a8a8c8',
            }).setOrigin(0, 0.5).setAlpha(opacity);

            this.add.rectangle(x + barW / 2, recapY, barW, 6, 0x1a1a2e);
            const fillColor = rel.connection > 50 ? 0x98D8AA : rel.connection > 25 ? 0xFFD93D : 0xFF6B6B;
            if (fillW > 0) this.add.rectangle(x + fillW / 2, recapY, fillW, 6, fillColor);

            this.add.text(x + barW + 10, recapY, `${rel.connection}%`, {
                fontFamily: 'Inter', fontSize: '9px', color: '#6a6a8a',
            }).setOrigin(0, 0.5);

            recapY += 18;
        }

        if (lostCount > 0) {
            this.add.text(width / 2, recapY + 5, `${lostCount} relationship${lostCount > 1 ? 's' : ''} permanently lost.`, {
                fontFamily: 'Inter', fontSize: '9px', color: '#ff6b6b', fontStyle: 'italic',
            }).setOrigin(0.5);
        }

        // The promotion — dramatic reveal
        this.time.delayedCall(3000, () => this.showPromotion(careerTrack, stats));
    }

    showPromotion(track, stats) {
        const { width, height } = this.cameras.main;
        const promoY = height * 0.55;

        const titles = {
            consulting: { title: 'SENIOR ASSOCIATE → ENGAGEMENT MANAGER', salary: 185000, firm: 'McKinley & Associates' },
            banking: { title: 'ASSOCIATE → VICE PRESIDENT', salary: 250000, firm: 'Goldstein Brothers' },
            startup: { title: 'FOUNDER → CEO (ACQUIRED)', salary: 120000, firm: 'Your startup (now owned by Google)' },
            bigtech: { title: 'L5 → L6 SENIOR ENGINEER', salary: 320000, firm: 'MegaCorp Technologies' },
        };

        const promo = titles[track] || titles.consulting;

        // Store on resume
        if (this.resumeSystem) {
            this.resumeSystem.setField('career', `${promo.title} at ${promo.firm}`);
            this.resumeSystem.addToList('promotions', promo.title);
        }

        // Title card
        const titleText = this.add.text(width / 2, promoY - 30, '🎉 PROMOTED', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ffd93d',
        }).setOrigin(0.5).setAlpha(0);

        const roleText = this.add.text(width / 2, promoY, promo.title, {
            fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#c8c8e8',
        }).setOrigin(0.5).setAlpha(0);

        const firmText = this.add.text(width / 2, promoY + 20, promo.firm, {
            fontFamily: 'Inter', fontSize: '11px', color: '#6a6a8a', fontStyle: 'italic',
        }).setOrigin(0.5).setAlpha(0);

        // The salary number — big
        const salaryText = this.add.text(width / 2, promoY + 55,
            `$${promo.salary.toLocaleString()}/yr`, {
            fontFamily: '"Press Start 2P"', fontSize: '16px', color: '#98d8aa',
        }).setOrigin(0.5).setAlpha(0);

        // Stagger reveals
        this.tweens.add({ targets: titleText, alpha: 1, duration: 600, delay: 0 });
        this.tweens.add({ targets: roleText, alpha: 1, duration: 600, delay: 400 });
        this.tweens.add({ targets: firmText, alpha: 1, duration: 600, delay: 800 });
        this.tweens.add({ targets: salaryText, alpha: 1, duration: 800, delay: 1200 });

        // The emotional gut-punch
        this.time.delayedCall(3000, () => this.showGutPunch(promo));
    }

    showGutPunch(promo) {
        const { width, height } = this.cameras.main;
        const y = height * 0.8;

        // You almost screenshot it...
        const lines = [
            'You screenshot the offer letter.',
            'You open the group chat to share it.',
            '...',
            'You left the group chat 8 months ago.',
            '',
            '📱 1 unread message from Mom (3 days ago):',
            '"We miss you, sweetie. Call when you can. Love, Mom"',
            '',
            '47 unread notifications.',
        ];

        let currentLine = 0;
        const textObj = this.add.text(width / 2, y - 40, '', {
            fontFamily: 'Inter', fontSize: '11px', color: '#8a8aaa',
            align: 'center', lineSpacing: 6,
        }).setOrigin(0.5, 0).setAlpha(0);

        this.tweens.add({ targets: textObj, alpha: 1, duration: 400 });

        const typeLines = () => {
            if (currentLine >= lines.length) {
                this.time.delayedCall(2000, () => this.showContinue());
                return;
            }

            const displayedLines = lines.slice(0, currentLine + 1).join('\n');
            textObj.setText(displayedLines);
            currentLine++;

            const delay = lines[currentLine - 1] === '...' ? 1500 :
                lines[currentLine - 1] === '' ? 500 : 800;
            this.time.delayedCall(delay, typeLines);
        };

        typeLines();
    }

    showContinue() {
        const { width, height } = this.cameras.main;

        // Work / Social ratio
        const hoursWorked = this.registry.get('hoursWorked') || 0;
        const hoursWithPeople = this.registry.get('hoursWithPeople') || 0;
        const total = hoursWorked + hoursWithPeople || 1;

        const btn = this.add.text(width / 2, height - 30,
            'Act III Complete.\n\n[ Continue ]', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#4a4a6a',
            align: 'center', lineSpacing: 8,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setColor('#8a8aaa'));
        btn.on('pointerout', () => btn.setColor('#4a4a6a'));
        btn.on('pointerdown', () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.time.delayedCall(800, () => {
                // Act III → Act IV transition
                this.timeManager.advanceAct();
                this.scene.start('CornerOfficeScene');
            });
        });
    }
}
