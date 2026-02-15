import Phaser from 'phaser';

/**
 * BigTechMiniGame — System Design + Office Politics.
 * You optimized a button color for 3 weeks. The stock went up anyway.
 * Navigate design reviews, 1-on-1s, and the planning doc that nobody reads.
 */
export default class BigTechMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'BigTechMiniGame' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0f0a');
        this.cameras.main.fadeIn(500);

        const burnout = this.statManager.getBurnoutEffects();
        this.score = 0;
        this.round = 0;
        this.totalRounds = 4;

        this.add.text(width / 2, 20, '💻 BIG TECH SPRINT', {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#6c63ff',
        }).setOrigin(0.5);

        this.add.text(width / 2, 42, 'Ship. Iterate. Present at the all-hands. Repeat until IPO.', {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#6a6a8a', fontStyle: 'italic',
        }).setOrigin(0.5);

        this.scoreText = this.add.text(30, 20, 'Impact: 0', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#98d8aa',
        });

        this.scenarios = this.generateScenarios();
        this.showScenario();
    }

    generateScenarios() {
        return [
            {
                title: 'DESIGN REVIEW',
                context: 'Your manager wants the button blue. The VP wants it green. Design wants it gone entirely.',
                options: [
                    {
                        text: 'A/B test all three options for 3 weeks',
                        effects: { impact: 2, politics: 5, burnout: 5 },
                        flavor: 'You optimized a button color for 3 weeks. The stock went up anyway. Nobody knows why.',
                    },
                    {
                        text: 'Go with the VP\'s choice. Always go with the VP.',
                        effects: { impact: 1, politics: 8, burnout: 2 },
                        flavor: 'The button is green. Your manager is "not upset, just disappointed." Sound familiar?',
                    },
                    {
                        text: 'Write a 15-page design doc explaining why it should be teal',
                        effects: { impact: 0, politics: 3, burnout: 8 },
                        flavor: 'The doc was thorough. Nobody read it. But it\'s on your promotion packet.',
                    },
                ],
            },
            {
                title: '1-ON-1 WITH YOUR MANAGER',
                context: '"So, how are things?" (They\'re not asking how you actually are.)',
                options: [
                    {
                        text: '"Great! Really excited about the Q4 roadmap!"',
                        effects: { impact: 0, politics: 6, burnout: 3 },
                        flavor: 'You are not excited about the Q4 roadmap. But you performed excitement well. That counts here.',
                    },
                    {
                        text: '"Honestly? I\'m burning out. The oncall rotation is killing me."',
                        effects: { impact: 1, politics: -2, burnout: -8 },
                        flavor: 'They nodded sympathetically. Then assigned you to the oncall rotation again. But they "heard you."',
                    },
                    {
                        text: '"I\'d like to discuss my promotion timeline."',
                        effects: { impact: 0, politics: 4, burnout: 0 },
                        flavor: '"We\'ll revisit in the next cycle." The cycle never revisits. The cycle just cycles.',
                    },
                ],
            },
            {
                title: 'LAUNCH DAY',
                context: 'Your feature ships to 1 billion users. You changed the loading spinner direction.',
                options: [
                    {
                        text: 'Celebrate with the team. Free kombucha on the house.',
                        effects: { impact: 3, politics: 3, burnout: -3 },
                        flavor: 'The spinner now goes clockwise. User engagement is unchanged. Morale is temporarily up.',
                    },
                    {
                        text: 'Immediately start working on the next sprint',
                        effects: { impact: 2, politics: 5, burnout: 8 },
                        flavor: 'You shipped and moved on in the same breath. Your manager noted your "urgency." It wasn\'t urgency. It was inability to stop.',
                    },
                    {
                        text: 'Write a Medium post about the "engineering challenge" of a loading spinner',
                        effects: { impact: 1, politics: 6, burnout: 2 },
                        flavor: '"How We Scaled a Loading Spinner to 1B Users." 47 claps. Your mom shared it on Facebook.',
                    },
                ],
            },
            {
                title: 'PERF REVIEW SELF-ASSESSMENT',
                context: 'Describe your impact in 500 words. Your actual impact was changing a config flag.',
                options: [
                    {
                        text: '"Drove cross-functional alignment on infrastructure optimization initiative"',
                        effects: { impact: 3, politics: 7, burnout: 3 },
                        flavor: 'Translation: "I changed a setting." But in Big Tech, saying it right IS the job.',
                    },
                    {
                        text: 'Write honestly that you changed a config flag and it took 4 months of reviews',
                        effects: { impact: 1, politics: -3, burnout: -2 },
                        flavor: 'Your manager said "I appreciate the candor" which is corporate for "please never do this again."',
                    },
                    {
                        text: 'Claim credit for the entire project and two adjacent projects',
                        effects: { impact: 2, politics: 8, burnout: 5 },
                        flavor: 'Your skip-level was impressed. Your teammates were... less so. But they also claimed credit for your work. It\'s a circle.',
                    },
                ],
            },
        ];
    }

    showScenario() {
        if (this.round >= this.totalRounds) {
            this.endGame();
            return;
        }

        const { width } = this.cameras.main;
        const s = this.scenarios[this.round];
        const burnout = this.statManager.getBurnoutEffects();

        if (this.scenarioGroup) this.scenarioGroup.forEach(o => o.destroy());
        this.scenarioGroup = [];

        const title = this.add.text(width / 2, 90, s.title, {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffd93d',
        }).setOrigin(0.5);
        this.scenarioGroup.push(title);

        const context = this.add.text(width / 2, 125, s.context, {
            fontFamily: '"VT323", monospace', fontSize: '12px', color: '#c8c8e8',
            wordWrap: { width: 580 }, align: 'center',
        }).setOrigin(0.5);
        this.scenarioGroup.push(context);

        s.options.forEach((opt, i) => {
            const y = 195 + i * 65;

            let displayText = opt.text;
            if (burnout.corruptDialogue && Math.random() < 0.4) {
                const speak = burnout.corporateSpeak;
                displayText = speak[Math.floor(Math.random() * speak.length)];
            }

            const bg = this.add.rectangle(width / 2, y, 560, 55, 0x1a1a2e)
                .setInteractive({ useHandCursor: true });
            const label = this.add.text(width / 2, y, displayText, {
                fontFamily: '"VT323", monospace', fontSize: '11px', color: '#a8a8c8',
                wordWrap: { width: 530 },
            }).setOrigin(0.5);

            bg.on('pointerover', () => bg.setFillStyle(0x2a2a4e));
            bg.on('pointerout', () => bg.setFillStyle(0x1a1a2e));
            bg.on('pointerdown', () => this.selectOption(opt, s));

            this.scenarioGroup.push(bg, label);
        });
    }

    selectOption(opt, s) {
        this.scenarioGroup.forEach(o => {
            if (o.input) o.removeInteractive();
        });

        const { width } = this.cameras.main;

        this.score += opt.effects.impact;
        this.scoreText.setText(`Impact: ${this.score}`);

        this.statManager.modifyStat('network', opt.effects.politics);
        this.statManager.modifyStat('burnout', opt.effects.burnout);

        const flavor = this.add.text(width / 2, 420, opt.flavor, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#6a6a8a', fontStyle: 'italic',
            wordWrap: { width: 550 }, align: 'center',
        }).setOrigin(0.5);
        this.scenarioGroup.push(flavor);

        this.time.delayedCall(2500, () => {
            this.round++;
            this.showScenario();
        });
    }

    endGame() {
        const { width, height } = this.cameras.main;
        if (this.scenarioGroup) this.scenarioGroup.forEach(o => o.destroy());

        this.statManager.modifyStat('gpa', this.score >= 6 ? 5 : 2);
        this.statManager.modifyStat('wealth', this.score * 6000, false);
        this.statManager.modifyStat('prestige', this.score * 3);

        this.add.text(width / 2, height / 2 - 40, 'SPRINT COMPLETE', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#6c63ff',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, `Total impact: ${this.score} (out of a possible 12)`, {
            fontFamily: '"VT323", monospace', fontSize: '13px', color: '#a8a8c8',
        }).setOrigin(0.5);

        const commentary = this.score >= 8
            ? '"You run a team of 200. Your biggest decision this quarter was approving a Slack emoji."'
            : '"You shipped a feature that 1 billion people use and will never think about. This is your legacy."';

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
