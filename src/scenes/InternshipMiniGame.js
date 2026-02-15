import BaseScene from './BaseScene.js';

/**
 * InternshipMiniGame — Papers, Please-style processing.
 * Sort applications, format cover letters, and prep under time pressure.
 */
export default class InternshipMiniGame extends BaseScene {
    constructor() {
        super({ key: 'InternshipMiniGame' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a1a');

        this.statManager = this.registry.get('statManager');
        this.resumeSystem = this.registry.get('resumeSystem');

        this.score = 0;
        this.mistakes = 0;
        this.totalItems = 8;
        this.currentItem = 0;
        this.timeLimit = 45; // seconds

        // Title
        this.add.text(width / 2, 20, '💼 INTERNSHIP PREP', {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffd93d',
        }).setOrigin(0.5);

        this.add.text(width / 2, 42, 'Sort. Format. Survive. (Sound familiar?)', {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#6a6a8a',
        }).setOrigin(0.5);

        // Timer
        this.timerText = this.add.text(width - 20, 20, `${this.timeLimit}s`, {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#6c63ff',
        }).setOrigin(1, 0);

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            repeat: this.timeLimit - 1,
            callback: () => {
                this.timeLimit--;
                this.timerText.setText(`${this.timeLimit}s`);
                if (this.timeLimit <= 10) this.timerText.setColor('#FF6B6B');
                if (this.timeLimit <= 0) this.endGame();
            },
        });

        // Score
        this.scoreText = this.add.text(20, 20, 'Sorted: 0/8', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#4CAF50',
        });

        this.initBaseScene();

        this.showNextItem();
    }

    showNextItem() {
        const { width, height } = this.cameras.main;

        if (this.currentItem >= this.totalItems || this.timeLimit <= 0) {
            this.endGame();
            return;
        }

        // Clear previous
        if (this.itemContent) this.itemContent.forEach(obj => obj.destroy());
        this.itemContent = [];

        const items = [
            { type: 'resume', title: 'RÉSUMÉ: Chad Thunderbro', detail: 'GPA: 2.1 | Skills: "Being a leader" | Font: Papyrus', correct: 'reject', joke: 'Papyrus.' },
            { type: 'cover_letter', title: 'COVER LETTER: Entry-Level Position', detail: 'Requires 5 years experience. The position pays $15/hr.\nDear Hiring Manager, I am a passionate...', correct: 'approve', joke: 'Entry-level. 5 years experience. The math never maths.' },
            { type: 'resume', title: 'RÉSUMÉ: You (draft)', detail: 'Has a typo in your own name. Lists "Microsoft Word"\nas a skill. The font is Comic Sans.', correct: 'fix', joke: 'You misspelled Park. Your last name.' },
            { type: 'email', title: 'EMAIL: Recruiter Follow-up', detail: '"Dear [CANDIDATE NAME], we were impressed\nby your [SKILL]. Please [ACTION ITEM]."', correct: 'reject', joke: 'Mail merge casualties. You\'ve received 40 of these.' },
            { type: 'cover_letter', title: 'COVER LETTER: Genuine Passion', detail: '"I chose this field because I genuinely care about\nmaking the world 0.01% less terrible."', correct: 'approve', joke: 'Honesty in a cover letter? Revolutionary. Rejected.' },
            { type: 'resume', title: 'RÉSUMÉ: Priya (she asked you to review)', detail: 'Flawless. 4.0 GPA. 3 internships. Fluent in 4 languages.\nYou feel a flash of something ugly.', correct: 'approve', joke: 'That ugly flash is called "comparison." It lives here now.' },
            { type: 'email', title: 'EMAIL: From Mom', detail: '"Hi sweetie, are you eating? Here\'s a recipe.\nAlso Dad says hi. We\'re proud of you.\nCall when you can? ❤️"', correct: 'approve', joke: 'This isn\'t work-related. You sorted it into your inbox anyway.' },
            { type: 'resume', title: 'RÉSUMÉ: Derek (of course)', detail: '3 internships completed. One converted to full-time.\nHe also runs a charity. Derek is always running a charity.', correct: 'approve', joke: 'Derek. Always Derek.' },
        ];

        const item = items[this.currentItem];

        // Document card
        const cardBg = this.add.rectangle(width / 2, height / 2 - 20, 480, 160, 0x12121f)
            .setStrokeStyle(1, 0x2a2a4e);
        this.itemContent.push(cardBg);

        const typeLabel = this.add.text(width / 2 - 220, height / 2 - 80, `📄 ${item.type.toUpperCase()}`, {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#6a6a8a',
        });
        this.itemContent.push(typeLabel);

        const titleText = this.add.text(width / 2 - 220, height / 2 - 60, item.title, {
            fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#e8e8ff',
        });
        this.itemContent.push(titleText);

        const detail = this.add.text(width / 2 - 220, height / 2 - 35, item.detail, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#8a8aaa', lineSpacing: 3,
        });
        this.itemContent.push(detail);

        // Action buttons
        const btnY = height / 2 + 80;
        const actions = [
            { label: '✅ APPROVE', action: 'approve', color: '#4CAF50', x: width / 2 - 160 },
            { label: '❌ REJECT', action: 'reject', color: '#FF6B6B', x: width / 2 },
            { label: '🔧 FIX', action: 'fix', color: '#ffd93d', x: width / 2 + 160 },
        ];

        actions.forEach(act => {
            const btn = this.add.text(act.x, btnY, act.label, {
                fontFamily: '"Press Start 2P"', fontSize: '8px', color: act.color,
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            this.itemContent.push(btn);

            btn.on('pointerover', () => btn.setScale(1.1));
            btn.on('pointerout', () => btn.setScale(1));
            btn.on('pointerdown', () => this.processAction(act.action, item));
        });
    }

    processAction(action, item) {
        const { width, height } = this.cameras.main;

        const correct = action === item.correct;
        if (correct) {
            this.score++;
        } else {
            this.mistakes++;
        }

        // Feedback
        const feedback = this.add.text(width / 2, height / 2 + 120, correct
            ? `✓ Correct! ${item.joke}`
            : `✗ Wrong. ${item.joke}`, {
            fontFamily: '"VT323", monospace', fontSize: '10px',
            color: correct ? '#4CAF50' : '#FF6B6B', fontStyle: 'italic',
        }).setOrigin(0.5);
        this.itemContent.push(feedback);

        this.scoreText.setText(`Sorted: ${this.score}/${this.totalItems}`);

        this.currentItem++;
        this.time.delayedCall(1200, () => this.showNextItem());
    }

    endGame() {
        if (this.timerEvent) this.timerEvent.remove();

        const { width, height } = this.cameras.main;
        this.children.removeAll(true);
        this.cameras.main.setBackgroundColor('#0a0a1a');

        // Apply stats based on performance
        const performanceRatio = this.score / this.totalItems;
        const networkGain = Math.round(performanceRatio * 12);
        const gpaBump = Math.round(performanceRatio * 5);
        const burnoutCost = Math.round((1 - performanceRatio) * 8) + 3;

        this.statManager.modifyStat('network', networkGain);
        this.statManager.modifyStat('gpa', gpaBump);
        this.statManager.modifyStat('burnout', burnoutCost);

        // Add to résumé
        if (performanceRatio >= 0.6 && this.resumeSystem) {
            this.resumeSystem.addToList('internships', 'Internship Prep (completed)');
        }

        // Results
        this.add.text(width / 2, height / 2 - 60, '💼 PREP COMPLETE', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ffd93d',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 20, `Sorted: ${this.score}/${this.totalItems} | Mistakes: ${this.mistakes}`, {
            fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#e8e8ff',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 10, `Network +${networkGain} | GPA +${gpaBump} | Burnout +${burnoutCost}`, {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#6c63ff',
        }).setOrigin(0.5);

        // Commentary
        let comment;
        if (performanceRatio >= 0.8) {
            comment = 'You crushed it. Your cover letter uses "synergy" unironically now.';
        } else if (performanceRatio >= 0.5) {
            comment = 'Decent. Your résumé still has a typo but nobody notices. (They notice.)';
        } else {
            comment = 'You tried. That counts. (It doesn\'t count on your résumé, though.)';
        }

        this.add.text(width / 2, height / 2 + 50, comment, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#6a6a8a', fontStyle: 'italic', align: 'center',
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            const btn = this.add.text(width / 2, height / 2 + 90, '[ Back to Campus ]', {
                fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#6c63ff',
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#9a93ff'));
            btn.on('pointerout', () => btn.setColor('#6c63ff'));
            btn.on('pointerdown', () => {
                this.scene.stop('InternshipMiniGame');
                const campus = this.scene.get('CollegeCampusScene');
                if (campus) { this.scene.resume('CollegeCampusScene'); campus.endDay(); }
            });
        });
    }
}
