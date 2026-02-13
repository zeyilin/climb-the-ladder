import Phaser from 'phaser';

/**
 * DialogueScene — Branching dialogue overlay with internal monologue.
 * Shows character portrait, speaker name, text, choices.
 */
export default class DialogueScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DialogueScene' });
    }

    init(data) {
        this.dialogueKey = data.dialogueKey;
        this.characterId = data.characterId;
        this.dialogueSystem = this.registry.get('dialogueSystem');
        this.statManager = this.registry.get('statManager');
        this.relationshipManager = this.registry.get('relationshipManager');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Semi-transparent overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(0);

        // Dialogue box background
        const boxH = 220;
        const boxY = height - boxH / 2 - 20;
        this.dialogueBox = this.add.rectangle(width / 2, boxY, width - 60, boxH, 0x12121f, 0.95)
            .setDepth(1);
        this.add.rectangle(width / 2, boxY, width - 58, boxH - 2, 0x000000, 0)
            .setStrokeStyle(1, 0x2a2a4e)
            .setDepth(1);

        // Character portrait (colored square with emoji)
        const rel = this.relationshipManager.getRelationship(this.characterId);
        const opacity = this.relationshipManager.getPortraitOpacity(this.characterId);

        const portraitX = 80;
        const portraitY = boxY - boxH / 2 + 45;
        this.add.rectangle(portraitX, portraitY, 50, 50, Phaser.Display.Color.HexStringToColor(rel ? '#3a3a5e' : '#2a2a3e').color)
            .setAlpha(opacity).setDepth(2);

        // Character data
        const charData = this.cache.json.get('characters');
        const char = charData.characters.find(c => c.id === this.characterId);
        if (char) {
            this.add.text(portraitX, portraitY, char.emoji, {
                fontSize: '24px',
            }).setOrigin(0.5).setAlpha(opacity).setDepth(3);
        }

        // Speaker name
        this.speakerText = this.add.text(120, boxY - boxH / 2 + 20, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#6c63ff',
        }).setDepth(2);

        // Dialogue text
        this.dialogueText = this.add.text(120, boxY - boxH / 2 + 45, '', {
            fontFamily: 'Inter',
            fontSize: '14px',
            color: '#d8d8e8',
            wordWrap: { width: width - 180 },
            lineSpacing: 4,
        }).setDepth(2);

        // Internal monologue text
        this.monologueText = this.add.text(width / 2, boxY + boxH / 2 + 20, '', {
            fontFamily: 'Inter',
            fontSize: '11px',
            color: '#6a6a8a',
            fontStyle: 'italic',
            align: 'center',
            wordWrap: { width: width - 100 },
        }).setOrigin(0.5).setDepth(2);

        // Choices container
        this.choiceTexts = [];
        this.choiceY = boxY - 10;

        // Start dialogue
        const dialogueData = this.cache.json.get(this.dialogueKey);
        if (dialogueData) {
            this.dialogueSystem.registerTree(this.dialogueKey, dialogueData);
            const firstNode = this.dialogueSystem.start(this.dialogueKey);
            this.showNode(firstNode);
        } else {
            this.endDialogue();
        }
    }

    showNode(node) {
        if (!node) {
            this.endDialogue();
            return;
        }

        // Clear previous choices
        this.clearChoices();
        this.monologueText.setText('');

        // Set speaker and text
        this.speakerText.setText(node.speaker || '???');
        this.dialogueText.setText(node.text || '...');

        // Show choices
        if (node.choices && node.choices.length > 0) {
            this.showChoices(node.choices);
        } else {
            // No choices — click to continue/end
            this.time.delayedCall(300, () => {
                const continueText = this.add.text(this.cameras.main.width / 2, this.choiceY + 40,
                    '[ Click to continue ]', {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '8px',
                    color: '#4a4a6a',
                }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true });

                continueText.on('pointerdown', () => {
                    this.endDialogue();
                });

                this.choiceTexts.push(continueText);
            });
        }
    }

    showChoices(choices) {
        const { width } = this.cameras.main;
        const startY = this.choiceY;

        choices.forEach((choice, i) => {
            const y = startY + i * 30;

            const choiceText = this.add.text(140, y, `▸ ${choice.text}`, {
                fontFamily: 'Inter',
                fontSize: '12px',
                color: '#a8a8c8',
                wordWrap: { width: width - 200 },
            }).setDepth(2).setInteractive({ useHandCursor: true });

            choiceText.on('pointerover', () => choiceText.setColor('#ffffff'));
            choiceText.on('pointerout', () => choiceText.setColor('#a8a8c8'));
            choiceText.on('pointerdown', () => this.selectChoice(i));

            this.choiceTexts.push(choiceText);
        });
    }

    selectChoice(index) {
        const result = this.dialogueSystem.selectChoice(index);
        if (!result) return;

        // Apply stat effects
        for (const [key, value] of Object.entries(result.effects)) {
            if (key.endsWith('_connection')) {
                const charId = key.replace('_connection', '');
                this.relationshipManager.modifyConnection(charId, value);
            } else {
                this.statManager.modifyStat(key, value);
            }
        }

        // Show internal monologue
        if (result.internalMonologue) {
            this.monologueText.setText(result.internalMonologue);
            this.monologueText.setAlpha(0);

            this.tweens.add({
                targets: this.monologueText,
                alpha: 1,
                duration: 500,
                delay: 200,
            });

            // Wait for monologue to be read, then advance
            this.time.delayedCall(2000, () => {
                if (result.ended) {
                    this.endDialogue();
                } else {
                    this.showNode(result.nextNode);
                }
            });

            this.clearChoices();
        } else {
            if (result.ended) {
                this.endDialogue();
            } else {
                this.showNode(result.nextNode);
            }
        }
    }

    clearChoices() {
        for (const ct of this.choiceTexts) {
            ct.destroy();
        }
        this.choiceTexts = [];
    }

    endDialogue() {
        this.dialogueSystem.end();
        this.scene.stop('DialogueScene');
        this.scene.resume('HighSchoolScene');

        // Parent scene (HighSchoolScene) will handle the queue in its 'resume' event
    }
}
