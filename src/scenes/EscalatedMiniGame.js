import Phaser from 'phaser';

/**
 * EscalatedMiniGame — Act IV career mini-games.
 * Same puzzles as Act III. Bigger numbers. That's the point.
 * The hedonic treadmill is a game mechanic.
 */
export default class EscalatedMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'EscalatedMiniGame' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
        this.careerTrack = this.registry.get('careerTrack') || 'consulting';
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0804');

        const burnout = this.statManager.getBurnoutEffects();
        this.score = 0;
        this.round = 0;
        this.totalRounds = 4;

        // Track-specific config
        const trackMeta = {
            consulting: {
                title: 'VP STRATEGY SESSION', icon: '🧳',
                subtitle: 'The same deck. $5M price tag now.',
            },
            banking: {
                title: 'MD DEAL REVIEW', icon: '💰',
                subtitle: 'The numbers have more zeroes. Your soul doesn\'t.',
            },
            startup: {
                title: 'BOARD MEETING', icon: '🚀',
                subtitle: 'Your Series C deck. 40 slides of hockey sticks.',
            },
            bigtech: {
                title: 'SVP ALL-HANDS', icon: '💻',
                subtitle: 'You present "strategy" to 5,000 people who alt-tab after slide 3.',
            },
        };
        const meta = trackMeta[this.careerTrack] || trackMeta.consulting;

        this.add.text(width / 2, 25, `${meta.icon} ${meta.title}`, {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffd93d',
        }).setOrigin(0.5);

        this.add.text(width / 2, 50, meta.subtitle, {
            fontFamily: 'Inter', fontSize: '10px', color: '#6a6a8a', fontStyle: 'italic',
        }).setOrigin(0.5);

        // Multiplier callout
        this.add.text(width / 2, 75, '10× MULTIPLIER — Same game, bigger stakes', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#3a3a5a',
        }).setOrigin(0.5);

        this.scoreText = this.add.text(30, 95, 'Score: 0', {
            fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#c8c8a8',
        });

        // Burnout visual effects
        if (burnout.desaturation > 0) {
            this.cameras.main.postFX.addColorMatrix().desaturate();
        }

        this.challenges = this.generateChallenges();
        this.showChallenge();
    }

    generateChallenges() {
        const base = {
            consulting: [
                {
                    q: 'The client wants to "disrupt" their industry. Their industry is plumbing.',
                    answers: ['Recommend McKinsey framework', 'Suggest AI-powered pipes', 'Tell them they\'re already disrupted'],
                    correct: 0, value: 50000
                },
                {
                    q: 'Your 200-slide deck has a typo on slide 3. The CEO saw it.',
                    answers: ['Blame the analyst', 'Own it with corporate humility', 'Gaslight: "It\'s a British spelling"'],
                    correct: 2, value: 30000
                },
                {
                    q: 'The client\'s "quick question" is a $2M scope expansion.',
                    answers: ['Scope it properly', '"Let me circle back"', 'Say yes, figure it out later'],
                    correct: 0, value: 70000
                },
                {
                    q: 'Your team is in 4 time zones. Nobody knows who\'s leading.',
                    answers: ['You\'re leading. Always.', 'Create a RACI matrix', 'Let chaos reign and bill for it'],
                    correct: 2, value: 40000
                },
            ],
            banking: [
                {
                    q: 'The deal is $3 billion. The model is wrong. The pitch is in 2 hours.',
                    answers: ['Fix the model', 'Round aggressively', 'The model is "directional"'],
                    correct: 0, value: 80000
                },
                {
                    q: 'Your MD just forwarded a client email with "???" and nothing else.',
                    answers: ['Panic-fix whatever it is', 'Reply: "On it"', 'Forward to the analyst below you (the cycle continues)'],
                    correct: 1, value: 40000
                },
                {
                    q: 'It\'s 4am. You\'re at the printer. It\'s jammed. The books are due at 6am.',
                    answers: ['Fix the printer', 'Use the one on floor 12', 'Send it as a PDF and pray'],
                    correct: 2, value: 50000
                },
                {
                    q: 'The client wants to meet "for drinks." It\'s Monday at 4pm.',
                    answers: ['Clear your calendar', 'You\'re already at the bar', '"I have a hard stop at 6" (you don\'t)'],
                    correct: 0, value: 60000
                },
            ],
            startup: [
                {
                    q: 'You have 6 months of runway. Your board wants you to "go big."',
                    answers: ['Double marketing spend', 'Cut to 2 months runway with a Hail Mary', 'Extend runway by cutting free snacks'],
                    correct: 0, value: 50000
                },
                {
                    q: 'Your cofounder wants to pivot. Again. This is pivot #4.',
                    answers: ['"We said no more pivots"', 'Actually, this one might work', 'Pivot away from the cofounder'],
                    correct: 1, value: 60000
                },
                {
                    q: 'TechCrunch wants to write about you. They got your ARR wrong by 10x.',
                    answers: ['Correct them', 'Let it ride', '"The number is directional"'],
                    correct: 1, value: 70000
                },
                {
                    q: 'You need to fire someone. They were the first hire. Employee #2.',
                    answers: ['Do it yourself, honestly', 'Have HR handle it', 'Restructure their role into nothing (quiet-fire)'],
                    correct: 0, value: 40000
                },
            ],
            bigtech: [
                {
                    q: 'Your VP asks for your "hot take." This is a trap.',
                    answers: ['Give the real hot take', 'Echo their opinions back louder', 'Refer to the data (there is no data)'],
                    correct: 1, value: 50000
                },
                {
                    q: 'Your feature launch was delayed 6 months. Write the post-mortem.',
                    answers: ['"Learnings from a thoughtful process"', '"We prioritized quality over speed"', 'Blame the previous SVP who left'],
                    correct: 2, value: 60000
                },
                {
                    q: 'You\'re asked to present at an all-hands about "impact." 200 engineers will be there.',
                    answers: ['Real metrics', 'Vanity metrics with good charts', '"Impact isn\'t always measurable" (it is, yours isn\'t)'],
                    correct: 1, value: 70000
                },
                {
                    q: 'Your skip-level wants a 1:1. Your manager doesn\'t know.',
                    answers: ['Tell your manager', 'Go and be honest', 'Go and be strategic'],
                    correct: 2, value: 40000
                },
            ],
        };
        return base[this.careerTrack] || base.consulting;
    }

    showChallenge() {
        if (this.round >= this.totalRounds) {
            this.endGame();
            return;
        }

        const { width } = this.cameras.main;
        const c = this.challenges[this.round];
        if (this.challengeGroup) this.challengeGroup.forEach(o => o.destroy());
        this.challengeGroup = [];

        const value = this.add.text(width / 2, 120, `💰 ${c.value.toLocaleString()} at stake`, {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffd93d',
        }).setOrigin(0.5);
        this.challengeGroup.push(value);

        const q = this.add.text(width / 2, 170, c.q, {
            fontFamily: 'Inter', fontSize: '13px', color: '#e8e8d8',
            wordWrap: { width: 580 }, align: 'center',
        }).setOrigin(0.5);
        this.challengeGroup.push(q);

        c.answers.forEach((ans, i) => {
            const y = 240 + i * 55;
            const bg = this.add.rectangle(width / 2, y, 560, 45, 0x1a1508)
                .setStrokeStyle(1, 0x2a2518).setInteractive({ useHandCursor: true });
            const text = this.add.text(width / 2, y, ans, {
                fontFamily: 'Inter', fontSize: '11px', color: '#a8a898',
            }).setOrigin(0.5);

            bg.on('pointerover', () => bg.setFillStyle(0x2a2518));
            bg.on('pointerout', () => bg.setFillStyle(0x1a1508));
            bg.on('pointerdown', () => {
                this.challengeGroup.forEach(o => { if (o.input) o.removeInteractive(); });
                const correct = i === c.correct;
                if (correct) this.score += c.value;
                bg.setFillStyle(correct ? 0x1a3a1a : 0x3a1a1a);
                this.scoreText.setText(`Score: ${this.score.toLocaleString()}`);
                this.time.delayedCall(1200, () => { this.round++; this.showChallenge(); });
            });

            this.challengeGroup.push(bg, text);
        });
    }

    endGame() {
        const { width, height } = this.cameras.main;
        if (this.challengeGroup) this.challengeGroup.forEach(o => o.destroy());

        const rating = this.score >= 180000 ? 'Crushing It' :
            this.score >= 100000 ? 'Competent' : 'Replaceable';

        this.statManager.modifyStat('wealth', Math.floor(this.score / 10000));
        this.statManager.modifyStat('prestige', this.score >= 180000 ? 10 : 3);
        this.statManager.modifyStat('burnout', 12);

        this.add.text(width / 2, height / 2 - 30, rating.toUpperCase(), {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ffd93d',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 10, `Total value: $${this.score.toLocaleString()}`, {
            fontFamily: 'Inter', fontSize: '12px', color: '#c8c8a8',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 40, 'The game is the same. The numbers just got bigger.', {
            fontFamily: 'Inter', fontSize: '10px', color: '#6a6a4a', fontStyle: 'italic',
        }).setOrigin(0.5);

        this.time.delayedCall(2500, () => {
            this.scene.start('CornerOfficeScene');
        });
    }
}
