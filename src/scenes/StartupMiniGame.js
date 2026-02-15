import BaseScene from './BaseScene.js';

/**
 * StartupMiniGame — Resource Management + VC Pitch.
 * Your app has 12 users. 4 of them are your mom on different devices.
 * Manage runway, build features, pitch VCs before you go broke.
 */
export default class StartupMiniGame extends BaseScene {
    constructor() {
        super({ key: 'StartupMiniGame' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0f0a0a');
        this.cameras.main.fadeIn(500);

        this.runway = 50000;
        this.users = 12;
        this.morale = 70;
        this.round = 0;
        this.totalRounds = 4;

        // Header
        this.add.text(width / 2, 20, '🚀 STARTUP SURVIVAL', {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ff6b6b',
        }).setOrigin(0.5);

        this.add.text(width / 2, 42, 'Your app has 12 users. 4 of them are your mom on different devices.', {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#6a6a8a', fontStyle: 'italic',
        }).setOrigin(0.5);

        // Stats bar
        this.runwayText = this.add.text(30, 70, `Runway: $${this.runway.toLocaleString()}`, {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#98d8aa',
        });
        this.usersText = this.add.text(width / 2, 70, `Users: ${this.users}`, {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffd93d',
        }).setOrigin(0.5);
        this.moraleText = this.add.text(width - 30, 70, `Morale: ${this.morale}%`, {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#6b93d6',
        }).setOrigin(1, 0.5);

        this.decisions = this.generateDecisions();

        this.initBaseScene();

        this.showDecision();
    }

    generateDecisions() {
        return [
            {
                title: 'SPRINT PLANNING',
                prompt: 'Your CTO (you) has to pick this week\'s priority:',
                options: [
                    {
                        text: 'Build the feature nobody asked for but VCs love',
                        effects: { runway: -8000, users: 2, morale: -10 },
                        flavor: 'You added AI to a to-do app. Investors are intrigued. Users are confused.',
                    },
                    {
                        text: 'Fix the bug that deletes user data on Tuesdays',
                        effects: { runway: -3000, users: 5, morale: 15 },
                        flavor: 'Users can now use your app on Tuesdays. Revolutionary, truly.',
                    },
                    {
                        text: 'Redesign the logo for the third time',
                        effects: { runway: -5000, users: 0, morale: 5 },
                        flavor: 'The new logo is slightly more teal. Nobody notices. You notice.',
                    },
                ],
            },
            {
                title: 'VC PITCH MEETING',
                prompt: 'Sequoia wants to hear your vision. What\'s the play?',
                options: [
                    {
                        text: '"We\'re Uber for... laundry. But with blockchain."',
                        effects: { runway: 30000, users: 0, morale: -5 },
                        flavor: 'They wrote a check. They don\'t understand the product. Neither do you. Perfect.',
                    },
                    {
                        text: 'Be honest about your metrics and growth challenges',
                        effects: { runway: 10000, users: 3, morale: 20 },
                        flavor: '"Refreshing honesty," they said. The check was... smaller. But real.',
                    },
                    {
                        text: 'Show the hockey stick graph where you altered the Y-axis',
                        effects: { runway: 25000, users: 0, morale: -15 },
                        flavor: 'The graph goes up and to the right. So does your anxiety.',
                    },
                ],
            },
            {
                title: 'HIRING DECISION',
                prompt: 'Your 3-person team is burning out. What do you do?',
                options: [
                    {
                        text: 'Hire a senior engineer at $180K (you make $60K)',
                        effects: { runway: -20000, users: 8, morale: 10 },
                        flavor: 'They\'re better than you at your own product. This is fine.',
                    },
                    {
                        text: 'Hire an unpaid intern and call it "equity compensation"',
                        effects: { runway: -2000, users: 2, morale: -10 },
                        flavor: 'The intern will last 3 months. The guilt will last longer.',
                    },
                    {
                        text: 'Do nothing and just work harder yourself',
                        effects: { runway: 0, users: 1, morale: -20 },
                        flavor: 'You slept at the office. Your cofounder (also you) is concerned.',
                    },
                ],
            },
            {
                title: 'ACQUISITION OFFER',
                prompt: 'A big tech company offers to buy you for $500K. Your VC wants $5M.',
                options: [
                    {
                        text: 'Take the $500K. You\'re tired. So tired.',
                        effects: { runway: 50000, users: 0, morale: 30 },
                        flavor: 'You sold. Your LinkedIn says "Founder (Acquired)" which sounds better than it is.',
                    },
                    {
                        text: 'Reject and keep building. This is your dream.',
                        effects: { runway: -10000, users: 5, morale: -5 },
                        flavor: 'Was it your dream? Or just something you said at a pitch competition?',
                    },
                    {
                        text: 'Counter at $2M and negotiate for 3 months',
                        effects: { runway: -15000, users: 0, morale: 0 },
                        flavor: 'They ghosted you. Your VC says "that\'s negotiation." It\'s not.',
                    },
                ],
            },
        ];
    }

    showDecision() {
        if (this.round >= this.totalRounds || this.runway <= 0) {
            this.endGame();
            return;
        }

        const { width } = this.cameras.main;
        const d = this.decisions[this.round];

        if (this.decisionGroup) this.decisionGroup.forEach(o => o.destroy());
        this.decisionGroup = [];

        const title = this.add.text(width / 2, 110, d.title, {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffd93d',
        }).setOrigin(0.5);
        this.decisionGroup.push(title);

        const prompt = this.add.text(width / 2, 140, d.prompt, {
            fontFamily: '"VT323", monospace', fontSize: '12px', color: '#c8c8e8',
            wordWrap: { width: 580 }, align: 'center',
        }).setOrigin(0.5);
        this.decisionGroup.push(prompt);

        d.options.forEach((opt, i) => {
            const y = 200 + i * 65;
            const bg = this.add.rectangle(width / 2, y, 560, 55, 0x1a1a2e)
                .setInteractive({ useHandCursor: true });
            const label = this.add.text(width / 2, y, opt.text, {
                fontFamily: '"VT323", monospace', fontSize: '11px', color: '#a8a8c8',
                wordWrap: { width: 530 },
            }).setOrigin(0.5);

            bg.on('pointerover', () => bg.setFillStyle(0x2a2a4e));
            bg.on('pointerout', () => bg.setFillStyle(0x1a1a2e));
            bg.on('pointerdown', () => this.selectOption(opt));

            this.decisionGroup.push(bg, label);
        });
    }

    selectOption(opt) {
        this.decisionGroup.forEach(o => {
            if (o.input) o.removeInteractive();
        });

        const { width } = this.cameras.main;

        // Apply effects
        this.runway += opt.effects.runway;
        this.users += opt.effects.users;
        this.morale = Math.max(0, Math.min(100, this.morale + opt.effects.morale));

        this.runwayText.setText(`Runway: $${Math.max(0, this.runway).toLocaleString()}`);
        this.usersText.setText(`Users: ${this.users}`);
        this.moraleText.setText(`Morale: ${this.morale}%`);

        if (this.runway <= 0) this.runwayText.setColor('#ff3333');
        if (this.morale <= 20) this.moraleText.setColor('#ff3333');

        const flavor = this.add.text(width / 2, 430, opt.flavor, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#6a6a8a', fontStyle: 'italic',
            wordWrap: { width: 550 }, align: 'center',
        }).setOrigin(0.5);
        this.decisionGroup.push(flavor);

        this.time.delayedCall(2500, () => {
            this.round++;
            this.showDecision();
        });
    }

    endGame() {
        const { width, height } = this.cameras.main;
        if (this.decisionGroup) this.decisionGroup.forEach(o => o.destroy());

        const survived = this.runway > 0;
        const gained = this.users - 12;

        this.statManager.modifyStat('gpa', survived ? 4 : -5);
        this.statManager.modifyStat('network', Math.floor(gained / 2));
        this.statManager.modifyStat('burnout', 10);
        this.statManager.modifyStat('authenticity', this.morale > 50 ? 5 : -5);
        this.statManager.modifyStat('wealth', survived ? Math.floor(this.runway / 10) : 0, false);
        this.statManager.modifyStat('prestige', survived ? 5 : -3);

        this.add.text(width / 2, height / 2 - 40, survived ? 'STILL ALIVE' : 'OUT OF RUNWAY', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: survived ? '#98d8aa' : '#ff6b6b',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, `${this.users} users. $${Math.max(0, this.runway).toLocaleString()} remaining. Morale: ${this.morale}%.`, {
            fontFamily: '"VT323", monospace', fontSize: '12px', color: '#a8a8c8',
        }).setOrigin(0.5);

        const commentary = survived
            ? `"Your app has ${this.users} users. ${Math.min(4, this.users)} of them are your mom on different devices."`
            : '"You failed. But you\'ll tell people you were a \'serial entrepreneur.\' It sounds better than \'broke.\'"';

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
