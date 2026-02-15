import Phaser from 'phaser';

/**
 * ConsultingMiniGame — Business Case Puzzles.
 * Match the right recommendation to the client's problem.
 * The client already knows the answer. You're just expensive validation.
 */
export default class ConsultingMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'ConsultingMiniGame' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0f0f1a');
        this.cameras.main.fadeIn(500);

        const burnout = this.statManager.getBurnoutEffects();
        this.score = 0;
        this.round = 0;
        this.totalRounds = 4;

        // Header
        this.add.text(width / 2, 30, '📊 CLIENT ENGAGEMENT', {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#6c63ff',
        }).setOrigin(0.5);

        this.add.text(width / 2, 55, 'Match the insight to the problem. They already know. You\'re $200K validation.', {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#6a6a8a', fontStyle: 'italic',
        }).setOrigin(0.5);

        // Timer
        this.timerText = this.add.text(width - 30, 30, '15', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ff6b6b',
        }).setOrigin(1, 0.5);

        this.timeLeft = 15;
        this.timerEvent = this.time.addEvent({
            delay: 1000, callback: () => {
                this.timeLeft--;
                this.timerText.setText(`${this.timeLeft}`);
                if (this.timeLeft <= 5) this.timerText.setColor('#ff3333');
                if (this.timeLeft <= 0) this.timeUp();
            }, loop: true,
        });

        // Score
        this.scoreText = this.add.text(30, 30, 'Billable: 0', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#98d8aa',
        });

        this.cases = this.generateCases();
        this.showCase();
    }

    generateCases() {
        return [
            {
                client: 'MEGACORP INC.',
                problem: '"We need to cut costs by 20% without layoffs."',
                options: [
                    { text: 'Outsource non-core functions to contractors', correct: true, flavor: 'They\'ll still lay people off. But now they have a slide for it.' },
                    { text: 'Invest in employee productivity tools', correct: false, flavor: 'They wanted cost CUTS, not cost ADDITIONS.' },
                    { text: 'Rebrand the layoffs as "organizational optimization"', correct: false, flavor: 'Too honest about the dishonesty.' },
                ],
            },
            {
                client: 'FINTECH DISRUPTORS',
                problem: '"Our app has 2 million users but we\'re losing money on every transaction."',
                options: [
                    { text: 'Raise prices and add a premium tier', correct: false, flavor: 'They said "disruptors." Raising prices is too... logical.' },
                    { text: 'Pivot to B2B and sell the user data', correct: true, flavor: 'Monetize the users. Classic. The CEO nods like this wasn\'t already his idea.' },
                    { text: 'Cut the free tier entirely', correct: false, flavor: 'You can\'t disrupt if nobody can use the product.' },
                ],
            },
            {
                client: 'OLD MONEY INDUSTRIES',
                problem: '"Our employees keep leaving for startups."',
                options: [
                    { text: 'Add a ping pong table and call it culture', correct: false, flavor: 'They already tried that. The table is dusty.' },
                    { text: 'Actually pay them competitively', correct: false, flavor: 'The CFO audibly gasped.' },
                    { text: 'Create a "innovation lab" with no real authority', correct: true, flavor: '"Innovation theater." The CEO loves it. Nothing will change. That\'s the point.' },
                ],
            },
            {
                client: 'SUSTAINABILITY CO.',
                problem: '"We want to go carbon neutral by 2030 but our board likes oil money."',
                options: [
                    { text: 'Buy carbon offsets and publish a glossy report', correct: true, flavor: 'The board is satisfied. The planet is not. But the deck looks great.' },
                    { text: 'Actually divest from fossil fuels', correct: false, flavor: 'You\'re a consultant, not a revolutionary.' },
                    { text: 'Rename "oil" to "legacy energy resources"', correct: false, flavor: 'Creative, but even PR wouldn\'t touch this one.' },
                ],
            },
        ];
    }

    showCase() {
        if (this.round >= this.totalRounds) {
            this.endGame();
            return;
        }

        const { width, height } = this.cameras.main;
        const c = this.cases[this.round];
        const burnout = this.statManager.getBurnoutEffects();

        // Clear previous
        if (this.caseGroup) this.caseGroup.forEach(o => o.destroy());
        this.caseGroup = [];

        // Client name
        const clientText = this.add.text(width / 2, 110, c.client, {
            fontFamily: '"Press Start 2P"', fontSize: '11px', color: '#ffd93d',
        }).setOrigin(0.5);
        this.caseGroup.push(clientText);

        // Problem
        const problemText = this.add.text(width / 2, 145, c.problem, {
            fontFamily: '"VT323", monospace', fontSize: '13px', color: '#c8c8e8',
            wordWrap: { width: 600 }, align: 'center',
        }).setOrigin(0.5);
        this.caseGroup.push(problemText);

        // Options
        const shuffled = Phaser.Utils.Array.Shuffle([...c.options]);
        shuffled.forEach((opt, i) => {
            const y = 220 + i * 60;

            // If burnout corrupts dialogue, replace text
            let displayText = opt.text;
            if (burnout.corruptDialogue && Math.random() < 0.4) {
                const speak = burnout.corporateSpeak;
                displayText = speak[Math.floor(Math.random() * speak.length)];
            }

            const bg = this.add.rectangle(width / 2, y, 560, 48, 0x1a1a2e)
                .setInteractive({ useHandCursor: true });
            const label = this.add.text(width / 2, y, displayText, {
                fontFamily: '"VT323", monospace', fontSize: '12px', color: '#a8a8c8',
                wordWrap: { width: 530 },
            }).setOrigin(0.5);

            bg.on('pointerover', () => bg.setFillStyle(0x2a2a4e));
            bg.on('pointerout', () => bg.setFillStyle(0x1a1a2e));
            bg.on('pointerdown', () => {
                // Burnout control delay
                if (burnout.controlDelay > 0) {
                    this.time.delayedCall(burnout.controlDelay, () => this.selectAnswer(opt, c));
                } else {
                    this.selectAnswer(opt, c);
                }
            });

            this.caseGroup.push(bg, label);
        });

        // Reset timer
        this.timeLeft = 15;
        this.timerText.setText('15').setColor('#ff6b6b');
    }

    selectAnswer(opt, c) {
        // Disable further clicks
        this.caseGroup.forEach(o => {
            if (o.input) o.removeInteractive();
        });

        const { width } = this.cameras.main;

        if (opt.correct) {
            this.score++;
            this.scoreText.setText(`Billable: ${this.score}`);
        }

        // Show flavor text
        const flavor = this.add.text(width / 2, 420, opt.flavor, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: opt.correct ? '#98d8aa' : '#ff6b6b',
            fontStyle: 'italic', wordWrap: { width: 550 }, align: 'center',
        }).setOrigin(0.5);
        this.caseGroup.push(flavor);

        this.time.delayedCall(2000, () => {
            this.round++;
            this.showCase();
        });
    }

    timeUp() {
        this.timerEvent.remove();
        this.caseGroup?.forEach(o => {
            if (o.input) o.removeInteractive();
        });

        const { width } = this.cameras.main;
        const timeout = this.add.text(width / 2, 420, 'Time\'s up. The client went with McKinsey.', {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#ff6b6b', fontStyle: 'italic',
        }).setOrigin(0.5);
        this.caseGroup.push(timeout);

        this.time.delayedCall(1500, () => {
            this.round++;
            this.showCase();
        });
    }

    endGame() {
        this.timerEvent.remove();
        const { width, height } = this.cameras.main;

        // Apply results
        const perf = this.score * 8;
        this.statManager.modifyStat('gpa', perf > 20 ? 5 : -3); // "performance" reuses gpa
        this.statManager.modifyStat('network', this.score * 3);
        this.statManager.modifyStat('burnout', 8);
        this.statManager.modifyStat('wealth', this.score * 5000, false);
        this.statManager.modifyStat('prestige', this.score * 4);

        this.add.text(width / 2, height / 2 - 30, `ENGAGEMENT COMPLETE`, {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#6c63ff',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, `You resolved ${this.score} of ${this.totalRounds} client cases.`, {
            fontFamily: '"VT323", monospace', fontSize: '13px', color: '#a8a8c8',
        }).setOrigin(0.5);

        const commentary = this.score >= 3
            ? '"You flew to Cleveland to tell a CEO what he already knew. He paid $200K for this."'
            : '"The client said they\'ll \'take your recommendations into consideration.\' They won\'t."';

        this.add.text(width / 2, height / 2 + 40, commentary, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#6a6a8a', fontStyle: 'italic',
            wordWrap: { width: 550 }, align: 'center',
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            this.cameras.main.fadeOut(600);
            this.time.delayedCall(600, () => this.scene.start('CityScene'));
        });
    }
}
