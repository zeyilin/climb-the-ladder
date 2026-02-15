import Phaser from 'phaser';

/**
 * NetworkingMiniGame — Dialogue-tree style career fair mini-game.
 * Choose authentic vs. performative responses under time pressure.
 * Performative → +Network, −Authenticity.
 * Authentic → +Authenticity, slower network growth.
 */
export default class NetworkingMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'NetworkingMiniGame' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a1a');

        this.statManager = this.registry.get('statManager');

        // Setup
        this.currentRound = 0;
        this.totalRounds = 4;
        this.networkGain = 0;
        this.authenticityChange = 0;

        // Title
        this.add.text(width / 2, 20, '🤝 NETWORKING EVENT', {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffd93d',
        }).setOrigin(0.5);

        this.add.text(width / 2, 42, 'Free pizza. Performative handshakes. Smile.', {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#6a6a8a',
        }).setOrigin(0.5);

        // Timer bar
        this.timerBar = this.add.rectangle(width / 2, 60, 500, 6, 0x6c63ff).setOrigin(0.5);
        this.timerBg = this.add.rectangle(width / 2, 60, 500, 6, 0x1a1a2e).setOrigin(0.5).setDepth(-1);

        this.startRound();
    }

    startRound() {
        const { width, height } = this.cameras.main;

        // Clear previous
        if (this.roundContent) this.roundContent.forEach(obj => obj.destroy());
        this.roundContent = [];

        if (this.currentRound >= this.totalRounds) {
            this.endGame();
            return;
        }

        const scenarios = [
            {
                npc: 'VP at Goldman Sachs',
                emoji: '🧑‍💼',
                question: '"Tell me about yourself."',
                authentic: { text: 'I\'m a student figuring things out. I like solving puzzles and I panic-bake.', network: 2, auth: 5 },
                performative: { text: 'I\'m a high-impact, results-driven individual passionate about value creation.', network: 8, auth: -8 },
            },
            {
                npc: 'Recruiter at McKinsey',
                emoji: '👩‍💼',
                question: '"Why consulting?"',
                authentic: { text: 'Honestly? I don\'t fully know yet. I\'m exploring and this seemed interesting.', network: 3, auth: 6 },
                performative: { text: 'I thrive in high-ambiguity environments where I can drive transformative impact.', network: 9, auth: -7 },
            },
            {
                npc: 'Startup Founder',
                emoji: '🧔',
                question: '"What\'s your greatest weakness?"',
                authentic: { text: 'I sometimes prioritize achievement over relationships. Working on it.', network: 4, auth: 8 },
                performative: { text: 'I\'m too passionate. I care too much. It\'s a blessing and a curse.', network: 6, auth: -10 },
            },
            {
                npc: 'Google Recruiter',
                emoji: '🤓',
                question: '"Where do you see yourself in 5 years?"',
                authentic: { text: 'Honestly? I hope I\'m happy. I don\'t have a more specific answer.', network: 2, auth: 10 },
                performative: { text: 'Leading a cross-functional team driving 10x impact in the AI space.', network: 10, auth: -8 },
            },
            {
                npc: 'Alum from Class of \'08',
                emoji: '🍷',
                question: '"Any questions for me?"',
                authentic: { text: 'Yeah — do you talk to your college friends still? Like, for real talk to them?', network: 1, auth: 8 },
                performative: { text: 'What skills would you recommend to stay competitive in this space?', network: 7, auth: -5 },
            },
        ];

        const scenario = scenarios[this.currentRound % scenarios.length];
        const roundLabel = `${this.currentRound + 1}/${this.totalRounds}`;

        // NPC card
        const npcText = this.add.text(width / 2, 100, `${scenario.emoji} ${scenario.npc}`, {
            fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#e8e8ff',
        }).setOrigin(0.5);
        this.roundContent.push(npcText);

        const question = this.add.text(width / 2, 130, scenario.question, {
            fontFamily: '"VT323", monospace', fontSize: '14px', color: '#aaaacc', fontStyle: 'italic',
        }).setOrigin(0.5);
        this.roundContent.push(question);

        // Timer - 8 seconds to respond
        this.timeLeft = 8;
        this.timerBar.width = 500;

        this.timerEvent = this.time.addEvent({
            delay: 100,
            repeat: 79,
            callback: () => {
                this.timeLeft -= 0.1;
                this.timerBar.width = Math.max(0, (this.timeLeft / 8) * 500);
                if (this.timeLeft <= 3) this.timerBar.setFillStyle(0xff6b6b);
                if (this.timeLeft <= 0) this.timeExpired(scenario);
            },
        });

        // Choice buttons
        const btnY = 200;

        // Authentic option
        const authBox = this.add.rectangle(width / 2, btnY, 500, 60, 0x12121f)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x2a4e2a);
        this.roundContent.push(authBox);

        const authLabel = this.add.text(width / 2 - 230, btnY - 18, '✨ AUTHENTIC', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#4CAF50',
        });
        this.roundContent.push(authLabel);

        const authText = this.add.text(width / 2 - 230, btnY, scenario.authentic.text, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#8a8aaa', wordWrap: { width: 460 },
        });
        this.roundContent.push(authText);

        authBox.on('pointerover', () => authBox.setStrokeStyle(2, 0x4CAF50));
        authBox.on('pointerout', () => authBox.setStrokeStyle(1, 0x2a4e2a));
        authBox.on('pointerdown', () => this.chooseResponse(scenario, 'authentic'));

        // Performative option
        const perfBox = this.add.rectangle(width / 2, btnY + 80, 500, 60, 0x12121f)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x4e2a2a);
        this.roundContent.push(perfBox);

        const perfLabel = this.add.text(width / 2 - 230, btnY + 62, '🎭 PERFORMATIVE', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#FF6B6B',
        });
        this.roundContent.push(perfLabel);

        const perfText = this.add.text(width / 2 - 230, btnY + 80, scenario.performative.text, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#8a8aaa', wordWrap: { width: 460 },
        });
        this.roundContent.push(perfText);

        perfBox.on('pointerover', () => perfBox.setStrokeStyle(2, 0xFF6B6B));
        perfBox.on('pointerout', () => perfBox.setStrokeStyle(1, 0x4e2a2a));
        perfBox.on('pointerdown', () => this.chooseResponse(scenario, 'performative'));
    }

    chooseResponse(scenario, type) {
        if (this.timerEvent) this.timerEvent.remove();

        const { width, height } = this.cameras.main;
        const choice = scenario[type];

        this.networkGain += choice.network;
        this.authenticityChange += choice.auth;

        // Show reaction
        const reaction = type === 'authentic'
            ? Phaser.Utils.Array.GetRandom([
                '(They look surprised. In a good way.)',
                '(They blink. That wasn\'t in their script either.)',
                '(A genuine smile. Rare at these events.)',
            ])
            : Phaser.Utils.Array.GetRandom([
                '(They nod. You\'ve passed the vibe check. It means nothing.)',
                '(They hand you a business card. You\'ll never email them.)',
                '(Perfect answer. You sounded exactly like everyone else.)',
            ]);

        const reactionText = this.add.text(width / 2, 400, reaction, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: type === 'authentic' ? '#4CAF50' : '#FF6B6B',
            fontStyle: 'italic',
        }).setOrigin(0.5);
        this.roundContent.push(reactionText);

        this.time.delayedCall(1500, () => {
            this.currentRound++;
            this.startRound();
        });
    }

    timeExpired(scenario) {
        if (this.timerEvent) this.timerEvent.remove();

        const { width } = this.cameras.main;

        const timeout = this.add.text(width / 2, 400, '(You stood there too long. They walked away.\nThis is somehow worse than either answer.)', {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#ffd93d', fontStyle: 'italic', align: 'center',
        }).setOrigin(0.5);
        this.roundContent.push(timeout);

        this.authenticityChange -= 2; // Anxiety

        this.time.delayedCall(1500, () => {
            this.currentRound++;
            this.startRound();
        });
    }

    endGame() {
        const { width, height } = this.cameras.main;

        // Apply stats
        this.statManager.modifyStat('network', this.networkGain);
        this.statManager.modifyStat('authenticity', this.authenticityChange);

        // Clear everything
        this.children.removeAll(true);
        this.cameras.main.setBackgroundColor('#0a0a1a');

        // Results
        this.add.text(width / 2, height / 2 - 60, '🤝 EVENT OVER', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ffd93d',
        }).setOrigin(0.5);

        const netColor = this.networkGain > 15 ? '#4CAF50' : '#aaaacc';
        this.add.text(width / 2, height / 2 - 20, `Network: +${this.networkGain}`, {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: netColor,
        }).setOrigin(0.5);

        const authColor = this.authenticityChange > 0 ? '#4CAF50' : '#FF6B6B';
        this.add.text(width / 2, height / 2 + 5, `Authenticity: ${this.authenticityChange > 0 ? '+' : ''}${this.authenticityChange}`, {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: authColor,
        }).setOrigin(0.5);

        // Commentary
        let comment;
        if (this.authenticityChange > 10) {
            comment = 'You were honest. They didn\'t know what to do with that.';
        } else if (this.networkGain > 25) {
            comment = 'Your LinkedIn is thriving. Your soul, less so.';
        } else {
            comment = 'You ate 4 slices of pizza but networked with 0 conviction.';
        }

        this.add.text(width / 2, height / 2 + 40, comment, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#6a6a8a', fontStyle: 'italic',
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            const btn = this.add.text(width / 2, height / 2 + 80, '[ Leave Event ]', {
                fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#6c63ff',
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#9a93ff'));
            btn.on('pointerout', () => btn.setColor('#6c63ff'));
            btn.on('pointerdown', () => this.returnToCampus());
        });
    }

    returnToCampus() {
        this.scene.stop('NetworkingMiniGame');
        const campus = this.scene.get('CollegeCampusScene');
        if (campus) {
            this.scene.resume('CollegeCampusScene');
            campus.endDay();
        }
    }
}
