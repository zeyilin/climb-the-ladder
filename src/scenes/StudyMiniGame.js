import Phaser from 'phaser';

/**
 * StudyMiniGame — Timed memory matching card game.
 * Match pairs of academic symbols. Performance → GPA.
 */
export default class StudyMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'StudyMiniGame' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
        this.timeManager = this.registry.get('timeManager');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9).setDepth(0);

        // Title
        this.add.text(width / 2, 30, '📚 STUDY BLITZ', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#6c63ff',
        }).setOrigin(0.5).setDepth(1);

        this.add.text(width / 2, 52, 'Match the pairs before time runs out!', {
            fontFamily: 'Inter',
            fontSize: '11px',
            color: '#6a6a8a',
            fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(1);

        // Game state
        this.matchedPairs = 0;
        this.totalPairs = 8;
        this.selectedCards = [];
        this.canClick = true;
        this.timeLeft = 30 + Math.max(0, 10 - this.timeManager.currentWeek); // gets harder over time

        // Timer display
        this.timerText = this.add.text(width / 2, height - 35, `⏱ ${this.timeLeft}s`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#ffd93d',
        }).setOrigin(0.5).setDepth(1);

        // Score display
        this.scoreText = this.add.text(width - 20, 30, `Matched: 0/${this.totalPairs}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '8px',
            color: '#8a8aaa',
        }).setOrigin(1, 0.5).setDepth(1);

        // Generate card grid
        this.createCards();

        // Timer countdown
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText(`⏱ ${this.timeLeft}s`);

                if (this.timeLeft <= 5) {
                    this.timerText.setColor('#ff6b6b');
                }

                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            },
            repeat: this.timeLeft - 1,
        });
    }

    createCards() {
        const { width, height } = this.cameras.main;
        const symbols = ['📐', '📖', '🧮', '🔬', '📝', '🎓', '💡', '📊'];
        const pairs = [...symbols, ...symbols]; // 16 cards = 8 pairs

        // Shuffle
        Phaser.Utils.Array.Shuffle(pairs);

        const cols = 4;
        const rows = 4;
        const cardW = 64;
        const cardH = 72;
        const gapX = 16;
        const gapY = 12;
        const gridW = cols * (cardW + gapX) - gapX;
        const gridH = rows * (cardH + gapY) - gapY;
        const startX = (width - gridW) / 2 + cardW / 2;
        const startY = (height - gridH) / 2 + cardH / 2 + 10;

        this.cards = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                const x = startX + c * (cardW + gapX);
                const y = startY + r * (cardH + gapY);
                const symbol = pairs[idx];

                // Card background
                const cardBg = this.add.rectangle(x, y, cardW, cardH, 0x2a2a4e)
                    .setInteractive({ useHandCursor: true })
                    .setDepth(1);

                // Card border
                const border = this.add.rectangle(x, y, cardW + 2, cardH + 2, 0x3a3a6e)
                    .setDepth(0.9);

                // Symbol (hidden initially)
                const symbolText = this.add.text(x, y, symbol, {
                    fontSize: '24px',
                }).setOrigin(0.5).setDepth(2).setAlpha(0);

                // Card face text (shown when face down)
                const faceDown = this.add.text(x, y, '?', {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '16px',
                    color: '#4a4a6e',
                }).setOrigin(0.5).setDepth(2);

                const card = {
                    bg: cardBg,
                    border,
                    symbol: symbolText,
                    faceDown,
                    value: symbol,
                    revealed: false,
                    matched: false,
                    x, y,
                    index: idx,
                };

                cardBg.on('pointerdown', () => this.flipCard(card));
                cardBg.on('pointerover', () => {
                    if (!card.revealed && !card.matched) {
                        cardBg.setFillStyle(0x3a3a5e);
                    }
                });
                cardBg.on('pointerout', () => {
                    if (!card.revealed && !card.matched) {
                        cardBg.setFillStyle(0x2a2a4e);
                    }
                });

                this.cards.push(card);
            }
        }
    }

    flipCard(card) {
        if (!this.canClick || card.revealed || card.matched) return;

        // Reveal card
        card.revealed = true;
        card.faceDown.setAlpha(0);
        card.symbol.setAlpha(1);
        card.bg.setFillStyle(0x1a1a2e);

        this.selectedCards.push(card);

        if (this.selectedCards.length === 2) {
            this.canClick = false;
            const [a, b] = this.selectedCards;

            if (a.value === b.value) {
                // Match!
                a.matched = true;
                b.matched = true;
                this.matchedPairs++;
                this.scoreText.setText(`Matched: ${this.matchedPairs}/${this.totalPairs}`);

                // Flash green
                this.tweens.add({
                    targets: [a.bg, b.bg],
                    fillColor: { from: 0x2a6a2a, to: 0x1a3a1a },
                    duration: 300,
                });

                this.selectedCards = [];
                this.canClick = true;

                if (this.matchedPairs >= this.totalPairs) {
                    this.endGame();
                }
            } else {
                // No match — flip back after delay
                this.time.delayedCall(600, () => {
                    a.revealed = false;
                    b.revealed = false;
                    a.faceDown.setAlpha(1);
                    b.faceDown.setAlpha(1);
                    a.symbol.setAlpha(0);
                    b.symbol.setAlpha(0);
                    a.bg.setFillStyle(0x2a2a4e);
                    b.bg.setFillStyle(0x2a2a4e);
                    this.selectedCards = [];
                    this.canClick = true;
                });
            }
        }
    }

    endGame() {
        if (this.timerEvent) this.timerEvent.remove();

        const { width, height } = this.cameras.main;
        const score = this.matchedPairs;
        const maxScore = this.totalPairs;
        const percentage = score / maxScore;

        // GPA gain based on performance
        const gpaGain = Math.round(5 + percentage * 10); // 5-15
        this.statManager.modifyStat('gpa', gpaGain);

        // Snarky result text
        let resultText, resultColor;
        if (percentage >= 1) {
            resultText = `Perfect! +${gpaGain} GPA\n\n(Your parents would be proud.\nThey'd be prouder if you called them.)`;
            resultColor = '#98D8AA';
        } else if (percentage >= 0.5) {
            resultText = `Not bad! +${gpaGain} GPA\n\n(Good enough for a B+.\nGood enough is never enough, though, is it?)`;
            resultColor = '#FFD93D';
        } else {
            resultText = `Rough session. +${gpaGain} GPA\n\n(You stared at the textbook for 40 minutes\nthen checked your phone. Classic.)`;
            resultColor = '#FF6B6B';
        }

        // Result overlay
        this.add.rectangle(width / 2, height / 2, 400, 200, 0x0a0a0f, 0.95).setDepth(10);
        this.add.text(width / 2, height / 2, resultText, {
            fontFamily: 'Inter',
            fontSize: '13px',
            color: resultColor,
            align: 'center',
            lineSpacing: 4,
        }).setOrigin(0.5).setDepth(11);

        // Continue button
        this.time.delayedCall(1500, () => {
            const btn = this.add.text(width / 2, height / 2 + 85, '[ Continue ]', {
                fontFamily: '"Press Start 2P"',
                fontSize: '9px',
                color: '#6c63ff',
            }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#9a93ff'));
            btn.on('pointerout', () => btn.setColor('#6c63ff'));
            btn.on('pointerdown', () => {
                this.scene.stop('StudyMiniGame');
                this.scene.resume('HighSchoolScene');
                // Parent scene will handle the rest via 'resume' event
            });
        });
    }
}
