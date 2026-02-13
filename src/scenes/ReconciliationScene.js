import Phaser from 'phaser';

/**
 * ReconciliationScene — Attempt to reconnect with faded relationships.
 * Each location maps to a character. Difficulty depends on neglect level.
 * Characters reference specific choices. Some can be repaired. Some cannot.
 */
export default class ReconciliationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ReconciliationScene' });
    }

    init(data) {
        this.location = data.location || 'home';
        this.relationshipManager = this.registry.get('relationshipManager');
        this.statManager = this.registry.get('statManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a0f');
        this.cameras.main.fadeIn(600);

        const encounters = this.getEncounters();
        const encounter = encounters[this.location];
        if (!encounter) {
            this.endScene();
            return;
        }

        this.encounter = encounter;
        const connection = this.relationshipManager.getConnection(encounter.id) || 0;
        this.connection = connection;

        // Character portrait (fading mechanic)
        const opacity = this.relationshipManager.getPortraitOpacity(encounter.id);
        const portrait = this.add.text(width / 2, 80, encounter.emoji, {
            fontSize: '48px',
        }).setOrigin(0.5).setAlpha(opacity);

        this.add.text(width / 2, 120, encounter.name, {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#d4a853',
        }).setOrigin(0.5);

        // Connection bar
        const barBg = this.add.rectangle(width / 2, 145, 200, 8, 0x1a1a2e);
        const barFill = this.add.rectangle(width / 2 - 100, 145, connection * 2, 8,
            connection > 50 ? 0x4CAF50 : connection > 25 ? 0xffd93d : 0xFF6B6B
        ).setOrigin(0, 0.5);

        // NPC's opening line — based on connection
        const intro = connection < 10
            ? encounter.lines.lost
            : connection < 30
                ? encounter.lines.hurt
                : connection < 60
                    ? encounter.lines.strained
                    : encounter.lines.warm;

        const introText = this.add.text(width / 2, 195, intro, {
            fontFamily: 'Inter', fontSize: '12px', color: '#c8c8a8',
            fontStyle: 'italic', wordWrap: { width: 560 }, align: 'center',
            lineSpacing: 6,
        }).setOrigin(0.5);

        // Response choices
        const responses = this.getResponses(connection);
        this.time.delayedCall(2000, () => this.showResponses(responses));
    }

    getEncounters() {
        return {
            home: {
                id: 'mom',
                name: 'Mom',
                emoji: '👩',
                lines: {
                    lost: '"Oh. You came." She doesn\'t move from the doorway. The tulips are overgrown.',
                    hurt: '"Your room is exactly how you left it. I stopped dusting it after year two."',
                    strained: '"I made your favorite. I wasn\'t sure you\'d come but I made it anyway."',
                    warm: '"There you are." She hugs you before you\'re through the door.',
                },
            },
            highschool: {
                id: 'sam',
                name: 'Sam',
                emoji: '🧑',
                lines: {
                    lost: '"I saw your LinkedIn update. Congrats, I guess." They don\'t make eye contact.',
                    hurt: '"You didn\'t come to my wedding. You sent a Vitamix."',
                    strained: '"Remember when we said we\'d stay friends forever? That was... really funny in retrospect."',
                    warm: '"Dude. It\'s been too long." They actually seem happy to see you.',
                },
            },
            college: {
                id: 'jordan',
                name: 'Jordan',
                emoji: '🧒',
                lines: {
                    lost: '"I invited you to my kid\'s birthday. You sent a gift card. To SoulCycle. She\'s seven."',
                    hurt: '"Mom waited up for you every Christmas. She stopped after year three. She tells people you\'re \'busy.\' She says it the way people say \'fine.\'"',
                    strained: '"Three years, and I had to text you about Dad\'s birthday. That\'s where we are."',
                    warm: '"Hey, you showed up. That\'s... that\'s actually a lot."',
                },
            },
            apartment: {
                id: 'dad',
                name: 'Dad',
                emoji: '👨',
                lines: {
                    lost: 'He\'s in the garage. Sorting screws into jars. He doesn\'t look up for a long time.',
                    hurt: '"The garage looks different, doesn\'t it? I re-did it. Gave me something to do on the weekends."',
                    strained: '"Your mom said you might come. I didn\'t want to get my hopes up."',
                    warm: '"Hey kiddo. Want to help me with this shelf?" He already set out two coffees.',
                },
            },
        };
    }

    getResponses(connection) {
        if (connection < 10) {
            return [
                { text: '"I\'m sorry. I don\'t have an excuse. I don\'t even have a good lie."', effect: 8, quality: 'honest' },
                { text: '"Work was... I was just..." (you trail off)', effect: 2, quality: 'deflect' },
                { text: '"I know I can\'t fix this. I wanted to try anyway."', effect: 12, quality: 'vulnerable' },
            ];
        } else if (connection < 30) {
            return [
                { text: '"I should have been there. I chose not to be. That\'s on me."', effect: 10, quality: 'honest' },
                { text: '"Things got complicated. But that\'s not your problem."', effect: 5, quality: 'deflect' },
                { text: '"Can we start over? Not from the beginning. From here."', effect: 15, quality: 'vulnerable' },
            ];
        } else if (connection < 60) {
            return [
                { text: '"I missed a lot. I want to miss less."', effect: 8, quality: 'honest' },
                { text: '"I\'m here now. I know that doesn\'t undo anything."', effect: 6, quality: 'measured' },
                { text: '"What do you need from me? Actually. I\'m asking."', effect: 12, quality: 'vulnerable' },
            ];
        } else {
            return [
                { text: '"I love you. I\'m bad at showing it. I\'m trying."', effect: 5, quality: 'warm' },
                { text: '"Tell me everything I missed. I want to hear all of it."', effect: 8, quality: 'present' },
                { text: '(You don\'t say anything. You just sit down next to them.)', effect: 10, quality: 'quiet' },
            ];
        }
    }

    showResponses(responses) {
        const { width, height } = this.cameras.main;

        responses.forEach((r, i) => {
            const y = 280 + i * 60;
            const bg = this.add.rectangle(width / 2, y, 560, 50, 0x1a1a1a)
                .setStrokeStyle(1, 0x2a2a2e).setInteractive({ useHandCursor: true });
            const text = this.add.text(width / 2, y, r.text, {
                fontFamily: 'Inter', fontSize: '11px', color: '#a8a8a8',
                wordWrap: { width: 530 },
            }).setOrigin(0.5);

            bg.on('pointerover', () => bg.setFillStyle(0x2a2a2a));
            bg.on('pointerout', () => bg.setFillStyle(0x1a1a1a));
            bg.on('pointerdown', () => this.selectResponse(r));
        });
    }

    selectResponse(response) {
        const { width, height } = this.cameras.main;
        this.children.getAll().forEach(c => { if (c.input) c.removeInteractive(); });

        // Apply relationship change
        this.relationshipManager.modifyConnection(this.encounter.id, response.effect);
        this.statManager.modifyStat('authenticity', response.quality === 'vulnerable' ? 10 : 3);

        const newConnection = this.relationshipManager.getConnection(this.encounter.id);
        const repaired = newConnection > 25 && this.connection <= 25;
        const cannotRepair = this.connection < 5 && response.quality === 'deflect';

        let outcome;
        if (cannotRepair) {
            outcome = 'They nod. The door doesn\'t fully close. But it doesn\'t open either.';
        } else if (repaired) {
            outcome = 'Something shifts. It\'s not forgiveness yet. It\'s the space before forgiveness.';
        } else if (newConnection > this.connection) {
            outcome = 'A small step. The kind that matters.';
        } else {
            outcome = 'They heard you. Whether they believe you is another thing entirely.';
        }

        this.add.text(width / 2, height - 70, outcome, {
            fontFamily: 'Inter', fontSize: '12px', color: '#d4a853', fontStyle: 'italic',
            wordWrap: { width: 550 }, align: 'center',
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => this.endScene());
    }

    endScene() {
        this.cameras.main.fadeOut(800);
        this.time.delayedCall(800, () => {
            this.scene.stop('ReconciliationScene');
            this.scene.resume('ReckoningScene');
        });
    }
}
