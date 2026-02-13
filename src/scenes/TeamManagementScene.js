import Phaser from 'phaser';

/**
 * TeamManagementScene — You now manage people.
 * Push them hard (better output, they burn out) or support them (slower output, loyalty).
 * Their outcomes mirror your own trajectory. The irony is not lost.
 */
export default class TeamManagementScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TeamManagementScene' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
        this.relationshipManager = this.registry.get('relationshipManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a0f');
        this.cameras.main.fadeIn(500);

        this.round = 0;
        this.totalRounds = 3;
        this.teamMorale = 70;
        this.teamOutput = 50;

        this.add.text(width / 2, 25, '👥 TEAM MANAGEMENT', {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffd93d',
        }).setOrigin(0.5);

        this.add.text(width / 2, 50, 'You\'re the boss now. Three people depend on your decisions.', {
            fontFamily: 'Inter', fontSize: '10px', color: '#6a6a8a', fontStyle: 'italic',
        }).setOrigin(0.5);

        this.moraleText = this.add.text(30, 80, `Team Morale: ${this.teamMorale}%`, {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#6b93d6',
        });
        this.outputText = this.add.text(width - 30, 80, `Output: ${this.teamOutput}%`, {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#98d8aa',
        }).setOrigin(1, 0);

        this.situations = this.generateSituations();
        this.showSituation();
    }

    generateSituations() {
        return [
            {
                title: 'OVERTIME REQUEST',
                context: 'The client moved the deadline up by two weeks. Your team is already stretched.',
                employee: 'Anika, your best performer',
                options: [
                    {
                        text: '"I need everyone in this weekend. I\'ll order dinner."',
                        effects: { output: 20, morale: -20, burnout: 5 },
                        flavor: 'They came in. The dinner was cold Thai food. Anika\'s eye twitched when she said "no problem."',
                    },
                    {
                        text: '"Let me push back on the timeline. I\'ll handle the client."',
                        effects: { output: -5, morale: 15, burnout: 8 },
                        flavor: 'Your VP was displeased. Your team was relieved. You absorbed the stress. Sound familiar?',
                    },
                    {
                        text: '"Do what you can. I\'ll pick up the slack."',
                        effects: { output: 5, morale: 10, burnout: 12 },
                        flavor: 'You stayed until 2am doing their work. They don\'t know. Your back hurts. This is leadership.',
                    },
                ],
            },
            {
                title: 'PERFORMANCE CONVERSATION',
                context: 'Marcus has been underperforming for 3 months. He\'s also going through a divorce.',
                employee: 'Marcus, junior analyst',
                options: [
                    {
                        text: '"Marcus, we need to discuss your numbers. The team is counting on you."',
                        effects: { output: 15, morale: -15, burnout: 3 },
                        flavor: 'He nodded. He said he understood. He updated his LinkedIn that night. You recognize the pattern.',
                    },
                    {
                        text: '"Hey, I know things are hard. Take what you need. We\'ll cover."',
                        effects: { output: -10, morale: 20, burnout: 5 },
                        flavor: 'The team grumbled about covering his work. But Marcus came back stronger. Eventually.',
                    },
                    {
                        text: '"I\'m putting you on a PIP. It\'s company policy."',
                        effects: { output: 10, morale: -25, burnout: 0 },
                        flavor: 'You put him on a PIP. Like they put you on one, once. The cycle continues.',
                    },
                ],
            },
            {
                title: 'CREDIT ASSIGNMENT',
                context: 'Your team shipped a major project. The VP asks who led it.',
                employee: 'The whole team',
                options: [
                    {
                        text: '"It was a team effort. Particularly Anika and Marcus."',
                        effects: { output: 0, morale: 25, burnout: -3 },
                        flavor: 'Your team glowed. Your VP noted your "generosity." On the org chart, it\'s still your name.',
                    },
                    {
                        text: '"I drove the strategy and execution. My team supported."',
                        effects: { output: 10, morale: -20, burnout: 3 },
                        flavor: 'The VP was impressed. Your team was quiet in the elevator after. They learned something about you today.',
                    },
                    {
                        text: '"Anika should present it. She deserves the visibility."',
                        effects: { output: -5, morale: 30, burnout: -5 },
                        flavor: 'Anika presented. She was brilliant. Your VP promoted her. She now reports to someone else. But she remembers.',
                    },
                ],
            },
        ];
    }

    showSituation() {
        if (this.round >= this.totalRounds) {
            this.endScene();
            return;
        }

        const { width } = this.cameras.main;
        const s = this.situations[this.round];

        if (this.situationGroup) this.situationGroup.forEach(o => o.destroy());
        this.situationGroup = [];

        const title = this.add.text(width / 2, 115, s.title, {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffd93d',
        }).setOrigin(0.5);
        this.situationGroup.push(title);

        const context = this.add.text(width / 2, 145, s.context, {
            fontFamily: 'Inter', fontSize: '12px', color: '#c8c8e8',
            wordWrap: { width: 580 }, align: 'center',
        }).setOrigin(0.5);
        this.situationGroup.push(context);

        const employee = this.add.text(width / 2, 175, `Re: ${s.employee}`, {
            fontFamily: 'Inter', fontSize: '10px', color: '#6a6a8a', fontStyle: 'italic',
        }).setOrigin(0.5);
        this.situationGroup.push(employee);

        s.options.forEach((opt, i) => {
            const y = 225 + i * 65;
            const bg = this.add.rectangle(width / 2, y, 560, 55, 0x1a1a2e)
                .setInteractive({ useHandCursor: true });
            const label = this.add.text(width / 2, y, opt.text, {
                fontFamily: 'Inter', fontSize: '11px', color: '#a8a8c8',
                wordWrap: { width: 530 },
            }).setOrigin(0.5);

            bg.on('pointerover', () => bg.setFillStyle(0x2a2a4e));
            bg.on('pointerout', () => bg.setFillStyle(0x1a1a2e));
            bg.on('pointerdown', () => this.selectOption(opt));

            this.situationGroup.push(bg, label);
        });
    }

    selectOption(opt) {
        this.situationGroup.forEach(o => { if (o.input) o.removeInteractive(); });
        const { width } = this.cameras.main;

        this.teamOutput = Math.max(0, Math.min(100, this.teamOutput + opt.effects.output));
        this.teamMorale = Math.max(0, Math.min(100, this.teamMorale + opt.effects.morale));
        this.statManager.modifyStat('burnout', opt.effects.burnout);

        this.moraleText.setText(`Team Morale: ${this.teamMorale}%`);
        this.outputText.setText(`Output: ${this.teamOutput}%`);

        const flavor = this.add.text(width / 2, 430, opt.flavor, {
            fontFamily: 'Inter', fontSize: '11px', color: '#6a6a8a', fontStyle: 'italic',
            wordWrap: { width: 550 }, align: 'center',
        }).setOrigin(0.5);
        this.situationGroup.push(flavor);

        this.time.delayedCall(2500, () => { this.round++; this.showSituation(); });
    }

    endScene() {
        const { width, height } = this.cameras.main;
        if (this.situationGroup) this.situationGroup.forEach(o => o.destroy());

        // Apply team results to player stats
        this.statManager.modifyStat('gpa', Math.floor(this.teamOutput / 20));
        this.statManager.modifyStat('network', Math.floor(this.teamMorale / 20));

        const commentary = this.teamMorale > 60
            ? '"Your team likes you. That\'s rare up here. Enjoy it while it lasts."'
            : '"Your team produces. They also update LinkedIn on company time. Coincidence?"';

        this.add.text(width / 2, height / 2 - 20, 'MANAGEMENT COMPLETE', {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffd93d',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 20, commentary, {
            fontFamily: 'Inter', fontSize: '11px', color: '#6a6a8a', fontStyle: 'italic',
            wordWrap: { width: 550 }, align: 'center',
        }).setOrigin(0.5);

        this.time.delayedCall(2500, () => {
            this.scene.stop('TeamManagementScene');
            this.scene.resume('CornerOfficeScene');
        });
    }
}
