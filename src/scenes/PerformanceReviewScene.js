import Phaser from 'phaser';

/**
 * PerformanceReviewScene — Quarterly Review.
 * Your output → rating → promotion or "we need to talk about your trajectory."
 */
export default class PerformanceReviewScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PerformanceReviewScene' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
        this.resumeSystem = this.registry.get('resumeSystem');
        this.timeManager = this.registry.get('timeManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a12');
        this.cameras.main.fadeIn(600);

        const quarter = Math.ceil(this.timeManager.currentWeek / 5);
        const review = this.statManager.getPerformanceRating();
        const stats = this.statManager.getAll();

        // Header
        this.add.text(width / 2, 40, `📋 Q${quarter} PERFORMANCE REVIEW`, {
            fontFamily: '"Press Start 2P"', fontSize: '11px', color: '#6c63ff',
        }).setOrigin(0.5);

        this.add.text(width / 2, 65, 'Your manager has opinions. None of them are new.', {
            fontFamily: 'Inter', fontSize: '10px', color: '#6a6a8a', fontStyle: 'italic',
        }).setOrigin(0.5);

        // Stats summary
        const statsLines = [
            `Output: ${stats.gpa}    Network: ${stats.network}    Burnout: ${stats.burnout}`,
        ];
        this.add.text(width / 2, 100, statsLines.join('\n'), {
            fontFamily: 'Inter', fontSize: '11px', color: '#8a8aaa',
        }).setOrigin(0.5);

        // Rating box
        const ratingColors = {
            1: { bg: 0x1a3a1a, text: '#98d8aa' },
            2: { bg: 0x2a2a3e, text: '#6b93d6' },
            3: { bg: 0x3a2a1a, text: '#ffd93d' },
            4: { bg: 0x3a1a1a, text: '#ff6b6b' },
        };
        const rc = ratingColors[review.tier];

        this.add.rectangle(width / 2, 170, 400, 60, rc.bg).setStrokeStyle(2, 0x3a3a5e);
        this.add.text(width / 2, 160, review.rating, {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: rc.text,
        }).setOrigin(0.5);

        const raiseText = review.raise >= 0
            ? `Salary adjustment: +$${review.raise.toLocaleString()}`
            : `Salary adjustment: -$${Math.abs(review.raise).toLocaleString()}`;
        this.add.text(width / 2, 182, raiseText, {
            fontFamily: 'Inter', fontSize: '10px', color: review.raise >= 0 ? '#98d8aa' : '#ff6b6b',
        }).setOrigin(0.5);

        // Manager commentary
        const commentary = this.getManagerCommentary(review.tier, stats);
        this.add.text(width / 2, 240, commentary.manager, {
            fontFamily: 'Inter', fontSize: '12px', color: '#c8c8e8',
            wordWrap: { width: 550 }, align: 'center', lineSpacing: 4,
        }).setOrigin(0.5);

        // Internal monologue
        this.add.text(width / 2, 310, commentary.internal, {
            fontFamily: 'Inter', fontSize: '11px', color: '#6a6a8a', fontStyle: 'italic',
            wordWrap: { width: 550 }, align: 'center', lineSpacing: 4,
        }).setOrigin(0.5);

        // Apply effects
        this.statManager.modifyStat('wealth', review.raise, false);
        if (review.tier <= 2) {
            this.statManager.modifyStat('prestige', 5);
            if (this.resumeSystem) {
                this.resumeSystem.addToList('promotions', `Q${quarter}: ${review.rating}`);
            }
        }

        // Derek comparison (he always does better)
        this.time.delayedCall(1500, () => {
            const derekLine = review.tier <= 2
                ? 'Derek also got "Exceeds Expectations." He posted about it on LinkedIn. With a photo.'
                : 'Derek got promoted. He thanked "the team" in his post. He\'s never met the team.';

            this.add.text(width / 2, 380, `🏆 ${derekLine}`, {
                fontFamily: 'Inter', fontSize: '10px', color: '#ffd93d',
                fontStyle: 'italic', wordWrap: { width: 550 }, align: 'center',
            }).setOrigin(0.5);
        });

        // Continue button
        this.time.delayedCall(3000, () => {
            const btn = this.add.text(width / 2, height - 50, '[ Back to the Grind ]', {
                fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#4a4a6a',
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#8a8aaa'));
            btn.on('pointerout', () => btn.setColor('#4a4a6a'));
            btn.on('pointerdown', () => {
                this.scene.stop('PerformanceReviewScene');
                this.scene.resume('CityScene');
            });
        });
    }

    getManagerCommentary(tier, stats) {
        switch (tier) {
            case 1:
                return {
                    manager: '"Outstanding quarter. You\'re on the fast track. Keep this up and we\'ll talk about the Senior role in the next cycle."',
                    internal: '(The "next cycle" is always one cycle away. It\'s a Zeno\'s paradox of promotions.)',
                };
            case 2:
                return {
                    manager: '"Solid work. You\'re meeting expectations. We\'d love to see you take more ownership of cross-functional initiatives."',
                    internal: '("Take more ownership" means "do more work for the same pay." You smile and nod.)',
                };
            case 3:
                return {
                    manager: '"I think there\'s room for growth here. Let\'s align on some development areas. I\'m going to pair you with Derek as a mentor."',
                    internal: stats.burnout > 60
                        ? '(Derek as a mentor. Derek, who sends "thoughts?" emails at midnight. Perfect.)'
                        : '(Development areas. Growth opportunities. Career euphemisms for "do better or else.")',
                };
            case 4:
                return {
                    manager: '"I want to be transparent — we\'re putting you on a performance improvement plan. This isn\'t a punishment, it\'s an opportunity."',
                    internal: '(A PIP. The corporate equivalent of "we\'re not mad, just disappointed." Except they are mad.)',
                };
        }
    }
}
