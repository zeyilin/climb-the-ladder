import Phaser from 'phaser';

/**
 * InsuranceAdjustingMiniGame — The hidden 5th career track.
 * 10% chance when you pivot. You fill out forms. That's it.
 * This is the game's funniest bit.
 */
export default class InsuranceAdjustingMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'InsuranceAdjustingMiniGame' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#f5f5f0');

        this.score = 0;
        this.round = 0;
        this.totalRounds = 5;

        // The most boring header imaginable
        this.add.text(width / 2, 25, '📋 INSURANCE ADJUSTING', {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#4a4a4a',
        }).setOrigin(0.5);

        this.add.text(width / 2, 50, 'Fill out the forms. That\'s it. That\'s the job.', {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#8a8a8a', fontStyle: 'italic',
        }).setOrigin(0.5);

        this.scoreText = this.add.text(30, 75, 'Forms: 0/5', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#6a6a6a',
        });

        this.claims = this.generateClaims();
        this.showClaim();
    }

    generateClaims() {
        return [
            {
                type: 'AUTO', claimant: 'Gerald Hutchins, 62',
                desc: 'Backed into a fire hydrant while looking at his phone. Claims the hydrant "came out of nowhere."',
                fields: ['Liability: Driver', 'Damage: $2,400', 'Status: DENIED'],
                correct: 2, // DENIED
            },
            {
                type: 'HOME', claimant: 'Karen Whitfield, 45',
                desc: 'Claims her basement flooded due to "an act of God." Inspector found she left the garden hose running for 3 days.',
                fields: ['Liability: Policyholder', 'Damage: $8,200', 'Status: DENIED'],
                correct: 2,
            },
            {
                type: 'HEALTH', claimant: 'Tyler Brooks, 28',
                desc: 'Sprained ankle at a corporate retreat during mandatory "team bonding" obstacle course. His company doesn\'t have workers\' comp.',
                fields: ['Liability: Employer', 'Damage: $1,100', 'Status: APPROVED'],
                correct: 2,
            },
            {
                type: 'AUTO', claimant: 'Patricia Nguyen, 38',
                desc: 'Deer jumped through her windshield at 6am. Deer survived. Patricia\'s commute did not.',
                fields: ['Liability: Deer', 'Damage: $4,800', 'Status: APPROVED'],
                correct: 2,
            },
            {
                type: 'HOME', claimant: 'Dave Morrison, 55',
                desc: 'Claims his shed was destroyed by "a very large raccoon." Neighbors confirm the raccoon was average-sized. Dave is dramatic.',
                fields: ['Liability: Raccoon', 'Damage: $900', 'Status: DENIED'],
                correct: 2,
            },
        ];
    }

    showClaim() {
        if (this.round >= this.totalRounds) {
            this.endGame();
            return;
        }

        const { width } = this.cameras.main;
        const claim = this.claims[this.round];

        if (this.claimGroup) this.claimGroup.forEach(o => o.destroy());
        this.claimGroup = [];

        // Claim card — looks like a real form
        const formBg = this.add.rectangle(width / 2, 260, 560, 280, 0xffffff)
            .setStrokeStyle(2, 0xcccccc);
        this.claimGroup.push(formBg);

        const header = this.add.text(width / 2 - 260, 135, `CLAIM #${1000 + this.round}  |  ${claim.type} INSURANCE`, {
            fontFamily: 'Courier New', fontSize: '10px', color: '#333333',
        });
        this.claimGroup.push(header);

        const claimant = this.add.text(width / 2 - 260, 160, `Claimant: ${claim.claimant}`, {
            fontFamily: 'Courier New', fontSize: '10px', color: '#555555',
        });
        this.claimGroup.push(claimant);

        const desc = this.add.text(width / 2, 210, claim.desc, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#444444',
            wordWrap: { width: 520 }, align: 'left', lineSpacing: 4,
        }).setOrigin(0.5);
        this.claimGroup.push(desc);

        // Stamp buttons — APPROVED / DENIED / REFER TO SUPERVISOR
        const options = ['✅ APPROVE', '❌ DENY', '📎 REFER TO SUPERVISOR'];
        options.forEach((opt, i) => {
            const y = 310 + i * 48;
            const bg = this.add.rectangle(width / 2, y, 320, 38, 0xeeeeee)
                .setStrokeStyle(1, 0xcccccc).setInteractive({ useHandCursor: true });
            const text = this.add.text(width / 2, y, opt, {
                fontFamily: 'Courier New', fontSize: '11px', color: '#333333',
            }).setOrigin(0.5);

            bg.on('pointerover', () => bg.setFillStyle(0xdddddd));
            bg.on('pointerout', () => bg.setFillStyle(0xeeeeee));
            bg.on('pointerdown', () => {
                this.claimGroup.forEach(o => { if (o.input) o.removeInteractive(); });

                // All options are "correct" — the joke is that it doesn't matter
                this.score++;
                this.scoreText.setText(`Forms: ${this.score}/${this.totalRounds}`);

                const responses = [
                    'Form processed. Next.',
                    'Stamped. Filed. Forgotten.',
                    'Another day in the cubicle.',
                    'You wonder if this is what you studied for.',
                    'The fluorescent light flickers. You don\'t notice anymore.',
                ];
                const response = this.add.text(width / 2, 460, responses[this.round], {
                    fontFamily: '"VT323", monospace', fontSize: '10px', color: '#888888', fontStyle: 'italic',
                }).setOrigin(0.5);
                this.claimGroup.push(response);

                this.time.delayedCall(1500, () => { this.round++; this.showClaim(); });
            });

            this.claimGroup.push(bg, text);
        });
    }

    endGame() {
        const { width, height } = this.cameras.main;
        if (this.claimGroup) this.claimGroup.forEach(o => o.destroy());

        this.statManager.modifyStat('burnout', 5);
        this.statManager.modifyStat('prestige', -5);

        this.add.text(width / 2, height / 2 - 50, '📋 SHIFT COMPLETE', {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#4a4a4a',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, '5 forms processed.\nYour cubicle smells like microwave popcorn.\nIt\'s not your popcorn.', {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#6a6a6a',
            align: 'center', lineSpacing: 6,
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 50, 'The algorithm has spoken.', {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#aaaaaa', fontStyle: 'italic',
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            // Return to the overworld for the current act
            const act = this.registry.get('timeManager')?.currentAct || 3;
            if (act === 3) this.scene.start('CityScene');
            else if (act === 4) this.scene.start('CornerOfficeScene');
            else this.scene.start('CityScene');
        });
    }
}
