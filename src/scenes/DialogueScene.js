import Phaser from 'phaser';
import BaseScene from './BaseScene.js';
import Theme from '../ui/Theme.js';

/**
 * DialogueScene — Branching dialogue overlay with internal monologue.
 * "Corporate Visual Novel" Style.
 * Speaker name, dialogue text, choices, and monologue use DOM for crisp rendering.
 */
export default class DialogueScene extends BaseScene {
    constructor() {
        super({ key: 'DialogueScene' });
    }

    init(data) {
        this.dialogueKey = data.dialogueKey;
        this.characterId = data.characterId;
        this.parentSceneKey = data.parentSceneKey || 'HighSchoolScene';
        this.dialogueSystem = this.registry.get('dialogueSystem');
        this.statManager = this.registry.get('statManager');
        this.relationshipManager = this.registry.get('relationshipManager');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Cinematic overlay (Phaser)
        this.add.rectangle(width / 2, height / 2, width, height, Theme.COLORS.BG_OVERLAY, 0.6).setDepth(0);

        // Dialogue Box Dimensions
        const boxH = 260;
        const boxW = 860;
        const safeW = Math.min(boxW, width - 40);
        const boxX = width / 2;
        const boxY = height - 150;

        this.boxY = boxY;
        this.safeW = safeW;
        this.boxX = boxX;
        this.boxH = boxH;

        // Main Box Container (Phaser — for BG and portrait)
        this.boxContainer = this.add.container(0, 0);

        const boxGfx = this.add.graphics();
        // Shadow first (behind)
        boxGfx.fillStyle(0x000000, 0.5);
        boxGfx.fillRoundedRect(boxX - safeW / 2 + 8, boxY - boxH / 2 + 8, safeW, boxH, 12);
        // Glassmorphism BG
        boxGfx.fillStyle(Theme.COLORS.BG_PANEL, 0.95);
        boxGfx.fillRoundedRect(boxX - safeW / 2, boxY - boxH / 2, safeW, boxH, 12);
        // Neon Border
        boxGfx.lineStyle(2, Theme.COLORS.CORP_BLUE, 1);
        boxGfx.strokeRoundedRect(boxX - safeW / 2, boxY - boxH / 2, safeW, boxH, 12);

        this.boxContainer.add(boxGfx);
        this.boxContainer.setDepth(1);

        // --- Portrait (Phaser — uses alpha/color effects) ---
        const rel = this.relationshipManager.getRelationship(this.characterId);
        const opacity = this.relationshipManager.getPortraitOpacity(this.characterId);

        const portraitSize = 120;
        const portraitX = boxX - safeW / 2 + 80;
        const portraitY = boxY;

        const pGfx = this.add.graphics();
        const pColor = Phaser.Display.Color.HexStringToColor(rel ? Theme.toHex(Theme.COLORS.CORP_BLUE) : '#2a2a3e').color;

        pGfx.fillStyle(pColor, opacity);
        pGfx.fillCircle(portraitX, portraitY, portraitSize / 2);
        pGfx.lineStyle(2, 0xffffff, 0.3);
        pGfx.strokeCircle(portraitX, portraitY, portraitSize / 2);
        pGfx.setDepth(2);

        // Emoji
        const charData = this.cache.json.get('characters');
        const char = charData.characters.find(c => c.id === this.characterId);
        if (char) {
            this.add.text(portraitX, portraitY, char.emoji, {
                fontSize: '64px',
            }).setOrigin(0.5).setAlpha(opacity).setDepth(3);
        }

        // --- Speaker Label (DOM) ---
        const nameTagX = portraitX + 80;
        const nameTagY = boxY - 80;

        this.speakerDom = this.add.dom(nameTagX, nameTagY).createFromHTML('<div class="dlg-speaker"></div>');
        this.speakerDom.setDepth(4);
        this.speakerDom.setOrigin(0, 0.5);

        // --- Dialogue Text (DOM) ---
        const textX = portraitX + 80;
        const textY = nameTagY + 40;
        const textW = safeW - 220;

        this.dialogueDom = this.add.dom(textX, textY).createFromHTML(
            `<div class="dlg-text" style="width: ${textW}px"></div>`
        );
        this.dialogueDom.setDepth(4);
        this.dialogueDom.setOrigin(0, 0);

        // --- Internal Monologue (DOM) ---
        this.monologueDom = this.add.dom(width / 2, height / 2 - 100).createFromHTML(
            `<div class="dlg-monologue" style="width: ${Math.min(600, width - 80)}px"></div>`
        );
        this.monologueDom.setDepth(20);

        // --- Next Indicator (Phaser — uses tween bounce) ---
        this.nextIcon = this.add.text(boxX + safeW / 2 - 40, boxY + boxH / 2 - 30, '▼', {
            fontSize: '20px', color: Theme.toHex(Theme.COLORS.NEON_PINK)
        }).setOrigin(0.5).setDepth(2).setAlpha(0);

        this.tweens.add({
            targets: this.nextIcon,
            y: '+=5',
            duration: 600,
            yoyo: true,
            repeat: -1,
        });

        // --- Choices Container (DOM) ---
        this.choicesDom = this.add.dom(width / 2, height / 2).createFromHTML('<div class="dlg-choices"></div>');
        this.choicesDom.setDepth(10);

        // Start Logic
        const dialogueData = this.cache.json.get(this.dialogueKey);
        if (dialogueData) {
            this.dialogueSystem.registerTree(this.dialogueKey, dialogueData);
            const firstNode = this.dialogueSystem.start(this.dialogueKey);
            this.showNode(firstNode);
        } else {
            this.endDialogue();
        }

        // Entrance Anim
        this.boxContainer.setScale(0.95);
        this.boxContainer.setAlpha(0);
        this.tweens.add({
            targets: this.boxContainer,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 300,
            ease: 'Power2',
        });

        // --- Resize + lifecycle ---
        this.registerResizeHandler(this.handleResize);
        this.initBaseScene();
    }

    handleResize(gameSize) {
        if (!gameSize || gameSize.width <= 0 || gameSize.height <= 0) return;
        const width = gameSize.width;
        const height = gameSize.height;

        this.cameras.main.setViewport(0, 0, width, height);

        // Recalculate box positions
        const boxH = 260;
        const boxW = 860;
        const safeW = Math.min(boxW, width - 40);
        const boxX = width / 2;
        const boxY = height - 150;
        const portraitX = boxX - safeW / 2 + 80;
        const nameTagX = portraitX + 80;
        const nameTagY = boxY - 80;
        const textX = portraitX + 80;
        const textY = nameTagY + 40;
        const textW = safeW - 220;

        // Reposition speaker
        if (this.speakerDom) {
            this.speakerDom.setPosition(nameTagX, nameTagY);
        }

        // Reposition dialogue text
        if (this.dialogueDom) {
            this.dialogueDom.setPosition(textX, textY);
            this.dialogueDom.node.style.width = textW + 'px';
        }

        // Reposition monologue
        if (this.monologueDom) {
            this.monologueDom.setPosition(width / 2, height / 2 - 100);
            this.monologueDom.node.style.width = Math.min(600, width - 80) + 'px';
        }

        // Reposition choices
        if (this.choicesDom) {
            this.choicesDom.setPosition(width / 2, height / 2);
        }

        // Reposition next icon
        if (this.nextIcon) {
            this.nextIcon.setPosition(boxX + safeW / 2 - 40, boxY + boxH / 2 - 30);
        }

        // Redraw box graphics (clear and redraw at new positions)
        if (this.boxContainer && this.boxContainer.list.length > 0) {
            const boxGfx = this.boxContainer.list[0];
            if (boxGfx && boxGfx.clear) {
                boxGfx.clear();
                boxGfx.fillStyle(0x000000, 0.5);
                boxGfx.fillRoundedRect(boxX - safeW / 2 + 8, boxY - boxH / 2 + 8, safeW, boxH, 12);
                boxGfx.fillStyle(Theme.COLORS.BG_PANEL, 0.95);
                boxGfx.fillRoundedRect(boxX - safeW / 2, boxY - boxH / 2, safeW, boxH, 12);
                boxGfx.lineStyle(2, Theme.COLORS.CORP_BLUE, 1);
                boxGfx.strokeRoundedRect(boxX - safeW / 2, boxY - boxH / 2, safeW, boxH, 12);
            }
        }
    }

    showNode(node) {
        if (!node) {
            this.endDialogue();
            return;
        }

        this.clearChoices();
        this.nextIcon.setAlpha(0);

        // Update DOM speaker + text
        this.speakerDom.node.textContent = (node.speaker || '???').toUpperCase();
        this.dialogueDom.node.textContent = node.text || '...';

        if (node.choices && node.choices.length > 0) {
            this.showChoices(node.choices);
        } else {
            // Click to continue
            this.nextIcon.setAlpha(1);

            this.input.once('pointerdown', () => {
                this.endDialogue();
            });
        }
    }

    showChoices(choices) {
        const choicesEl = this.choicesDom.node;
        choicesEl.innerHTML = '';

        choices.forEach((choice, i) => {
            const btn = document.createElement('div');
            btn.className = 'dlg-choice-btn';
            btn.textContent = choice.text;
            btn.addEventListener('click', () => {
                this.selectChoice(i);
            });
            choicesEl.appendChild(btn);
        });
    }

    selectChoice(index) {
        const result = this.dialogueSystem.selectChoice(index);
        if (!result) return;

        // Apply stats
        for (const [key, value] of Object.entries(result.effects)) {
            if (key.endsWith('_connection')) {
                const charId = key.replace('_connection', '');
                this.relationshipManager.modifyConnection(charId, value);
            } else {
                this.statManager.modifyStat(key, value);
            }
        }

        if (result.internalMonologue) {
            this.clearChoices();
            const monoEl = this.monologueDom.node;
            monoEl.textContent = result.internalMonologue;
            monoEl.classList.add('visible');

            this.time.delayedCall(2500, () => {
                monoEl.classList.remove('visible');

                this.time.delayedCall(500, () => {
                    if (result.ended) {
                        this.endDialogue();
                    } else {
                        this.showNode(result.nextNode);
                    }
                });
            });
        } else {
            if (result.ended) {
                this.endDialogue();
            } else {
                this.showNode(result.nextNode);
            }
        }
    }

    clearChoices() {
        if (this.choicesDom) {
            this.choicesDom.node.innerHTML = '';
        }
    }

    endDialogue() {
        this.dialogueSystem.end();
        this.scene.stop('DialogueScene');
        this.scene.resume(this.parentSceneKey);
    }
}
