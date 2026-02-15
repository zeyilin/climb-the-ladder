import BaseScene from './BaseScene.js';

/**
 * BankingMiniGame — Spreadsheet Formatting Under Extreme Time Pressure.
 * Align numbers, fix cell references, format the pitch deck.
 * It's 3am. The associate above you is asleep under his desk. This is prestige.
 */
export default class BankingMiniGame extends BaseScene {
    constructor() {
        super({ key: 'BankingMiniGame' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a12');
        this.cameras.main.fadeIn(500);

        const burnout = this.statManager.getBurnoutEffects();
        this.score = 0;
        this.round = 0;
        this.totalRounds = 5;

        // Ambient text
        this.add.text(width / 2, 20, '🏦 PITCH DECK FORMATTING', {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#6c63ff',
        }).setOrigin(0.5);

        this.clockText = this.add.text(width - 30, 20, '3:14 AM', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ff6b6b',
        }).setOrigin(1, 0.5);

        this.add.text(width / 2, 45, 'The MD needs this by 6am. Fix the errors.', {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#6a6a8a', fontStyle: 'italic',
        }).setOrigin(0.5);

        this.scoreText = this.add.text(30, 20, 'Fixed: 0', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#98d8aa',
        });

        // Timer — fast
        this.timeLeft = 10;
        this.timerBar = this.add.rectangle(width / 2, 70, width - 60, 8, 0x6c63ff);
        this.timerEvent = this.time.addEvent({
            delay: 1000, callback: () => {
                this.timeLeft--;
                this.timerBar.width = ((width - 60) * this.timeLeft) / 10;
                if (this.timeLeft <= 3) this.timerBar.setFillStyle(0xff3333);
                if (this.timeLeft <= 0) this.timeUp();
                // Advance the clock
                const mins = 14 + (this.totalRounds - this.timeLeft) * 7;
                this.clockText.setText(`3:${String(mins % 60).padStart(2, '0')} AM`);
            }, loop: true,
        });

        this.tasks = this.generateTasks();

        this.initBaseScene();

        this.showTask();
    }

    generateTasks() {
        return [
            {
                label: 'REVENUE PROJECTION — Q3',
                cells: [
                    { display: '$14,523,000', correct: true },
                    { display: '$14.523.000', correct: false, fix: 'Wrong decimal format' },
                    { display: '$14,523,000', correct: true },
                    { display: '#REF!', correct: false, fix: 'Broken cell reference' },
                ],
            },
            {
                label: 'EBITDA MARGIN TABLE',
                cells: [
                    { display: '23.4%', correct: true },
                    { display: '2340%', correct: false, fix: 'Missing decimal point' },
                    { display: '18.7%', correct: true },
                    { display: 'NaN%', correct: false, fix: 'Formula error' },
                ],
            },
            {
                label: 'CLIENT LOGO SLIDE',
                cells: [
                    { display: 'Goldman Sachs', correct: true },
                    { display: 'Golman Sacks', correct: false, fix: 'Typo in client name' },
                    { display: 'JP Morgan', correct: true },
                    { display: 'JP Morgna', correct: false, fix: 'DO NOT send this to the client' },
                ],
            },
            {
                label: 'DEAL STRUCTURE — WATERFALL',
                cells: [
                    { display: 'Senior Debt: 4.5x', correct: true },
                    { display: 'Senior Debt: 45x', correct: false, fix: 'Off by a factor of 10' },
                    { display: 'Mezz: 1.5x', correct: true },
                    { display: 'Total: =SUM(B2:B', correct: false, fix: 'Unclosed formula' },
                ],
            },
            {
                label: 'COMPENSATION BENCHMARKING',
                cells: [
                    { display: 'Analyst: $95K', correct: true },
                    { display: 'Analyst: $95', correct: false, fix: 'Missing three zeros. The analyst would riot.' },
                    { display: 'VP: $250K', correct: true },
                    { display: 'MD: $∞', correct: false, fix: 'This... isn\'t a number. (Is it?)' },
                ],
            },
        ];
    }

    showTask() {
        if (this.round >= this.totalRounds) {
            this.endGame();
            return;
        }

        const { width, height } = this.cameras.main;
        const task = this.tasks[this.round];
        const burnout = this.statManager.getBurnoutEffects();

        // Clear previous
        if (this.taskGroup) this.taskGroup.forEach(o => o.destroy());
        this.taskGroup = [];

        const label = this.add.text(width / 2, 100, task.label, {
            fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#ffd93d',
        }).setOrigin(0.5);
        this.taskGroup.push(label);

        this.add.text(width / 2, 125, 'Click the cells with errors:', {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#8a8aaa',
        }).setOrigin(0.5);

        // Draw spreadsheet cells
        const cellW = 160;
        const cellH = 50;
        const startX = width / 2 - (cellW * 2 + 10) / 2;
        const startY = 160;
        this.errorsRemaining = task.cells.filter(c => !c.correct).length;

        task.cells.forEach((cell, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = startX + col * (cellW + 10) + cellW / 2;
            const y = startY + row * (cellH + 10) + cellH / 2;

            const bg = this.add.rectangle(x, y, cellW, cellH, cell.correct ? 0x1a2a1a : 0x2a1a1a)
                .setStrokeStyle(1, 0x3a3a5e).setInteractive({ useHandCursor: true });
            const txt = this.add.text(x, y, cell.display, {
                fontFamily: 'Courier New', fontSize: '12px', color: '#c8c8e8',
            }).setOrigin(0.5);

            this.taskGroup.push(bg, txt);

            bg.on('pointerdown', () => {
                const handler = () => {
                    if (!cell.correct && !cell.clicked) {
                        cell.clicked = true;
                        bg.setFillStyle(0x1a3a1a);
                        txt.setColor('#98d8aa');
                        this.score++;
                        this.scoreText.setText(`Fixed: ${this.score}`);
                        this.errorsRemaining--;

                        // Show fix text
                        const fixTxt = this.add.text(x, y + cellH / 2 + 12, cell.fix, {
                            fontFamily: '"VT323", monospace', fontSize: '8px', color: '#98d8aa', fontStyle: 'italic',
                        }).setOrigin(0.5);
                        this.taskGroup.push(fixTxt);

                        if (this.errorsRemaining <= 0) {
                            this.time.delayedCall(800, () => {
                                this.round++;
                                this.timeLeft = 10;
                                this.timerBar.width = this.cameras.main.width - 60;
                                this.timerBar.setFillStyle(0x6c63ff);
                                this.showTask();
                            });
                        }
                    } else if (cell.correct && !cell.flaggedCorrect) {
                        cell.flaggedCorrect = true;
                        bg.setFillStyle(0x3a1a1a);
                        // Brief flash — wrong click
                        this.time.delayedCall(300, () => bg.setFillStyle(0x1a2a1a));
                    }
                };

                if (burnout.controlDelay > 0) {
                    this.time.delayedCall(burnout.controlDelay, handler);
                } else {
                    handler();
                }
            });
        });
    }

    timeUp() {
        this.round++;
        if (this.round < this.totalRounds) {
            this.timeLeft = 10;
            this.timerBar.width = this.cameras.main.width - 60;
            this.timerBar.setFillStyle(0x6c63ff);
            this.showTask();
        } else {
            this.endGame();
        }
    }

    endGame() {
        if (this.timerEvent) this.timerEvent.remove();
        const { width, height } = this.cameras.main;

        if (this.taskGroup) this.taskGroup.forEach(o => o.destroy());

        this.statManager.modifyStat('gpa', this.score >= 6 ? 6 : -2);
        this.statManager.modifyStat('burnout', 12);
        this.statManager.modifyStat('wealth', this.score * 4000, false);
        this.statManager.modifyStat('prestige', this.score * 3);

        this.add.text(width / 2, height / 2 - 40, 'DECK SHIPPED', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#6c63ff',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, `Fixed ${this.score} errors before the MD woke up.`, {
            fontFamily: '"VT323", monospace', fontSize: '13px', color: '#a8a8c8',
        }).setOrigin(0.5);

        const commentary = this.score >= 7
            ? '"It\'s 3am. You\'re formatting a pitch deck. The associate above you is asleep under his desk. This is prestige."'
            : '"The MD found three errors you missed. He didn\'t say anything. He just sighed. That\'s worse."';

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
