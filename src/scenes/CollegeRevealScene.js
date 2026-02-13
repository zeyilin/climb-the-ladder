import Phaser from 'phaser';

/**
 * CollegeRevealScene — Act I Climax.
 * Envelope opening animation. Tier reveal. Transitions to Act II.
 */
export default class CollegeRevealScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CollegeRevealScene' });
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

        const tier = this.statManager.getCollegeTier();
        const stats = this.statManager.getAll();

        this.add.text(width / 2, 40, 'SEMESTER COMPLETE', {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#6c63ff',
        }).setOrigin(0.5);

        const statsText = [
            `GPA: ${stats.gpa}`, `Network: ${stats.network}`,
            `Authenticity: ${stats.authenticity}`, `Burnout: ${stats.burnout}`,
        ].join('  •  ');

        this.add.text(width / 2, 70, statsText, {
            fontFamily: 'Inter', fontSize: '11px', color: '#6a6a8a',
        }).setOrigin(0.5);

        // Relationship recap
        const sorted = this.relationshipManager.getSorted();
        let recapY = 100;
        this.add.text(width / 2, recapY, 'RELATIONSHIPS', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#4a4a6a',
        }).setOrigin(0.5);

        recapY += 25;
        for (const rel of sorted) {
            const barW = 120;
            const fillW = (rel.connection / 100) * barW;
            const x = width / 2 - 80;

            this.add.text(x - 50, recapY, rel.name, {
                fontFamily: 'Inter', fontSize: '11px', color: '#a8a8c8',
            }).setOrigin(0, 0.5).setAlpha(this.relationshipManager.getPortraitOpacity(rel.id));

            this.add.rectangle(x + barW / 2, recapY, barW, 8, 0x1a1a2e);
            const fillColor = rel.connection > 50 ? 0x98D8AA : rel.connection > 25 ? 0xFFD93D : 0xFF6B6B;
            this.add.rectangle(x + fillW / 2, recapY, fillW, 8, fillColor);

            this.add.text(x + barW + 15, recapY, `${rel.connection}%`, {
                fontFamily: 'Inter', fontSize: '10px', color: '#6a6a8a',
            }).setOrigin(0, 0.5);

            recapY += 22;
        }

        this.time.delayedCall(2000, () => this.showEnvelope(tier));
    }

    showEnvelope(tier) {
        const { width, height } = this.cameras.main;
        const envelopeY = height * 0.6;

        const envelope = this.add.rectangle(width / 2, envelopeY, 200, 120, 0x2a2a4e).setAlpha(0);
        const prompt = this.add.text(width / 2, envelopeY - 70, '📬 A letter has arrived...', {
            fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#8a8aaa',
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: [envelope, prompt], alpha: 1, duration: 800 });

        this.time.delayedCall(1200, () => {
            const openBtn = this.add.text(width / 2, envelopeY, '[ Open Letter ]', {
                fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffd93d',
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            openBtn.on('pointerover', () => openBtn.setColor('#ffffff'));
            openBtn.on('pointerout', () => openBtn.setColor('#ffd93d'));
            openBtn.on('pointerdown', () => {
                openBtn.destroy();
                envelope.setFillStyle(0x1a1a2e);
                this.revealResult(tier);
            });
        });
    }

    revealResult(tier) {
        const { width, height } = this.cameras.main;
        const y = height * 0.6;

        let schoolName, schoolMotto, commentary, color;

        switch (tier) {
            case 1:
                schoolName = 'HARBRIDGE UNIVERSITY';
                schoolMotto = '"Ambition is a virtue. Sleep is for the weak.™"';
                commentary = 'You got into the best school in the country.\nYour parents cried. Your GPA cried harder.\nSam texted "proud of u." You responded 4 hours later.';
                color = '#FFD700';
                break;
            case 2:
                schoolName = 'STATEVIEW UNIVERSITY';
                schoolMotto = '"Good enough. Like everything else in your life."';
                commentary = 'A solid school. Respectable. Your parents said "that\'s great!"\nwith exactly one exclamation mark.\nSam said "sick, we can still hang." You felt something.';
                color = '#6B93D6';
                break;
            case 3:
                schoolName = 'GREENFIELD COLLEGE';
                schoolMotto = '"Where community matters. Seriously. We mean it."';
                commentary = 'Not the school on your vision board. Not even on the list.\nBut Sam is going here too. And Mom seemed... actually happy?\nNot the proud-happy. The relieved-happy.';
                color = '#98D8AA';
                break;
        }

        // Store on resume
        if (this.resumeSystem) {
            this.resumeSystem.setField('college', schoolName);
            this.resumeSystem.setField('collegeTier', tier);
            this.resumeSystem.setField('gpa', this.statManager.getStat('gpa'));
        }
        this.registry.set('collegeTier', tier);

        const nameText = this.add.text(width / 2, y - 20, schoolName, {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color, align: 'center',
        }).setOrigin(0.5).setAlpha(0);

        const mottoText = this.add.text(width / 2, y + 10, schoolMotto, {
            fontFamily: 'Inter', fontSize: '11px', color: '#6a6a8a', fontStyle: 'italic', align: 'center',
        }).setOrigin(0.5).setAlpha(0);

        const commentaryText = this.add.text(width / 2, y + 55, commentary, {
            fontFamily: 'Inter', fontSize: '12px', color: '#a8a8c8', align: 'center', lineSpacing: 4,
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: nameText, alpha: 1, duration: 600, delay: 300 });
        this.tweens.add({ targets: mottoText, alpha: 1, duration: 600, delay: 800 });
        this.tweens.add({ targets: commentaryText, alpha: 1, duration: 800, delay: 1500 });

        // Transition to Act II
        this.time.delayedCall(4000, () => {
            const btn = this.add.text(width / 2, height - 50,
                'Act I Complete.\n\n[ Begin Act II — College ]', {
                fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#4a4a6a',
                align: 'center', lineSpacing: 8,
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#8a8aaa'));
            btn.on('pointerout', () => btn.setColor('#4a4a6a'));
            btn.on('pointerdown', () => {
                this.cameras.main.fadeOut(800, 0, 0, 0);
                this.time.delayedCall(800, () => {
                    this.timeManager.advanceAct();
                    this.scene.start('MajorSelectionScene');
                });
            });
        });
    }
}
