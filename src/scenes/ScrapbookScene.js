import BaseScene from './BaseScene.js';

/**
 * ScrapbookScene — Assembles from moments across the game.
 * Pages flip. Present moments glow. Missed moments are blank with captions.
 * This is the game's thesis statement.
 */
export default class ScrapbookScene extends BaseScene {
    constructor() {
        super({ key: 'ScrapbookScene' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
        this.relationshipManager = this.registry.get('relationshipManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0f0d08');
        this.cameras.main.fadeIn(1000);

        this.add.text(width / 2, 25, '📖 THE SCRAPBOOK', {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#d4a853',
        }).setOrigin(0.5);

        this.add.text(width / 2, 50, 'Every moment you showed up. Every moment you didn\'t.', {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#6a5a3a', fontStyle: 'italic',
        }).setOrigin(0.5);

        // Build pages from game history
        this.pages = this.buildPages();
        this.currentPage = 0;
        this.showPage();

        // Navigation — keyboard and click
        this.input.keyboard.on('keydown-RIGHT', () => this.nextPage());
        this.input.keyboard.on('keydown-LEFT', () => this.prevPage());

        // Click/tap navigation
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x > this.scale.width / 2) {
                this.nextPage();
            } else {
                this.prevPage();
            }
        });

        this.initBaseScene();
    }

    buildPages() {
        const scrapbook = this.registry.get('scrapbook') || [];
        const sorted = this.relationshipManager.getSorted();

        // Always-present pages — key life milestones
        const pages = [
            {
                title: 'THE KITCHEN TABLE',
                present: true,
                text: 'Ma made congee. All four chairs were full.\nYou didn\'t know yet that this was the last time\neveryone would be in the same room and happy.',
                emoji: '🍜',
            },
            {
                title: 'DEV\'S STUDY SESSIONS',
                present: sorted.find(r => r.id === 'dev')?.connection > 30,
                text: sorted.find(r => r.id === 'dev')?.connection > 30
                    ? 'Two kids carrying the weight of two generations.\nYou studied together. You dreamed together.\nThe silence between you was comfortable.'
                    : null,
                blankCaption: 'Dev texted "miss u dude" six months ago.\nYou never replied.',
                emoji: '📚',
            },
            {
                title: 'MOVE-IN DAY',
                present: true,
                text: 'Ma cried. Ba carried boxes silently.\nThe dorm room was smaller than your bedroom.\nMa left three containers of frozen dumplings\nin your mini fridge.',
                emoji: '📦',
            },
            {
                title: 'LILY\'S WEDDING',
                present: sorted.find(r => r.id === 'lily')?.connection > 40,
                text: sorted.find(r => r.id === 'lily')?.connection > 40
                    ? 'You stood at the podium. Your voice cracked twice.\nNobody cared. Lily smiled the whole time.\nBa cried. He pretended it was allergies.'
                    : null,
                blankCaption: 'Lily\'s wedding — you were in a meeting\nthat could have been an email.',
                emoji: '💒',
            },
            {
                title: 'BA\'S ENGINEERING COMPASS',
                present: sorted.find(r => r.id === 'ba')?.connection > 35,
                text: sorted.find(r => r.id === 'ba')?.connection > 35
                    ? 'Ba handed you the compass from the old country.\n"For finding your way," he said.\nHis voice cracked. Ba doesn\'t cry.\nBut his shoulders shook once.'
                    : null,
                blankCaption: 'Ba reorganized the garage again.\nThe compass is still in the drawer.',
                emoji: '🧭',
            },
            {
                title: 'MA\'S SUNDAY CALLS',
                present: sorted.find(r => r.id === 'ma')?.connection > 50,
                text: sorted.find(r => r.id === 'ma')?.connection > 50
                    ? 'She calls every Sunday. You answer now.\nSometimes you talk about nothing for 40 minutes.\nNothing has never felt so important.'
                    : null,
                blankCaption: 'Ma called 47 Sundays in a row.\nYou answered 6.',
                emoji: '📞',
            },
            {
                title: 'THE CONGEE RECIPE',
                present: sorted.find(r => r.id === 'ma')?.connection > 60,
                text: sorted.find(r => r.id === 'ma')?.connection > 60
                    ? 'Ma showed you how much water.\nHow long to stir. When to add the century egg.\nShe doesn\'t measure anything.\n"You feel it," she said.'
                    : null,
                blankCaption: 'Ma\'s congee recipe will die with her.\nYou never asked.',
                emoji: '🥣',
            },
        ];

        // Add scrapbook moments from gameplay choices
        for (const entry of scrapbook) {
            if (entry.visited) {
                pages.push({
                    title: entry.location.toUpperCase(),
                    present: true,
                    text: entry.text,
                    emoji: '🚶',
                });
            }
        }

        return pages;
    }

    showPage() {
        if (this.pageGroup) this.pageGroup.forEach(o => o.destroy());
        this.pageGroup = [];

        const { width, height } = this.cameras.main;
        const page = this.pages[this.currentPage];
        if (!page) return;

        // Page background — scrapbook page
        const pageBg = this.add.rectangle(width / 2, height / 2 + 20, 500, 380, 0x1a1508, 0.9)
            .setStrokeStyle(2, 0x3a2a1a);
        this.pageGroup.push(pageBg);

        const emoji = this.add.text(width / 2, height / 2 - 120, page.emoji, {
            fontSize: '36px',
        }).setOrigin(0.5);
        this.pageGroup.push(emoji);

        const title = this.add.text(width / 2, height / 2 - 75, page.title, {
            fontFamily: '"Press Start 2P"', fontSize: '8px',
            color: page.present ? '#d4a853' : '#4a3a2a',
        }).setOrigin(0.5);
        this.pageGroup.push(title);

        if (page.present && page.text) {
            const text = this.add.text(width / 2, height / 2 + 10, page.text, {
                fontFamily: '"VT323", monospace', fontSize: '12px', color: '#c8c8a8',
                align: 'center', lineSpacing: 8, wordWrap: { width: 420 },
            }).setOrigin(0.5);
            this.pageGroup.push(text);
        } else {
            // Blank page with caption
            const blank = this.add.rectangle(width / 2, height / 2 - 10, 200, 120, 0x0a0804)
                .setStrokeStyle(1, 0x2a1a0a);
            this.pageGroup.push(blank);

            const x = this.add.text(width / 2, height / 2 - 10, '✕', {
                fontSize: '48px', color: '#2a1a0a',
            }).setOrigin(0.5);
            this.pageGroup.push(x);

            const caption = this.add.text(width / 2, height / 2 + 80, page.blankCaption || 'You weren\'t there.', {
                fontFamily: '"VT323", monospace', fontSize: '11px', color: '#6a5a3a', fontStyle: 'italic',
                align: 'center', lineSpacing: 6,
            }).setOrigin(0.5);
            this.pageGroup.push(caption);
        }

        // Page indicator
        const pageNum = this.add.text(width / 2, height - 50,
            `${this.currentPage + 1} / ${this.pages.length}`, {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#4a3a2a',
        }).setOrigin(0.5);
        this.pageGroup.push(pageNum);

        // Navigation hints
        const nav = this.add.text(width / 2, height - 30,
            this.currentPage < this.pages.length - 1 ? '← →  or tap to flip pages' : '[ Press ENTER or tap to close the book ]', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#3a2a1a',
        }).setOrigin(0.5);
        this.pageGroup.push(nav);

        // On last page, allow closing
        if (this.currentPage >= this.pages.length - 1) {
            this.input.keyboard.once('keydown-ENTER', () => {
                this.goToEnding();
            });
        }
    }

    goToEnding() {
        this.cameras.main.fadeOut(1500);
        this.time.delayedCall(1500, () => {
            this.scene.start('EndingScene');
        });
    }

    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.currentPage++;
            this.showPage();
        } else {
            this.goToEnding();
        }
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.showPage();
        }
    }
}
