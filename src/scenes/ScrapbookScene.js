import Phaser from 'phaser';

/**
 * ScrapbookScene — Assembles from moments across the game.
 * Pages flip. Present moments glow. Missed moments are blank with captions.
 * This is the game's thesis statement.
 */
export default class ScrapbookScene extends Phaser.Scene {
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

        // Navigation
        this.input.keyboard.on('keydown-RIGHT', () => this.nextPage());
        this.input.keyboard.on('keydown-LEFT', () => this.prevPage());
    }

    buildPages() {
        const scrapbook = this.registry.get('scrapbook') || [];
        const sorted = this.relationshipManager.getSorted();

        // Always-present pages — key life milestones
        const pages = [
            {
                title: 'HIGH SCHOOL GRADUATION',
                present: true,
                text: 'Mom cried. Dad pretended not to.\nYou didn\'t know yet that this was the last time\neveryone would be in the same room and happy.',
                emoji: '🎓',
            },
            {
                title: 'SAM\'S BIRTHDAY PARTY',
                present: sorted.find(r => r.id === 'sam')?.connection > 30,
                text: sorted.find(r => r.id === 'sam')?.connection > 30
                    ? 'You were there. Sam laughed so hard they snorted.\nIt was the kind of night you don\'t photograph\nbecause you\'re too busy living it.'
                    : null,
                blankCaption: 'Sam\'s birthday — you were on a work call.\nYou sent a Venmo for $50 and a 🎂 emoji.',
                emoji: '🎂',
            },
            {
                title: 'FIRST APARTMENT',
                present: true,
                text: 'The mattress was on the floor.\nThe kitchen had one pan and no spatula.\nYou made eggs anyway. They were terrible.\nYou\'ve never been happier.',
                emoji: '🏠',
            },
            {
                title: 'JORDAN\'S WEDDING',
                present: sorted.find(r => r.id === 'jordan')?.connection > 40,
                text: sorted.find(r => r.id === 'jordan')?.connection > 40
                    ? 'You walked Jordan down the aisle.\nMom ugly-cried. Dad had tissues ready.\nThe DJ played "September." Everyone danced badly.'
                    : null,
                blankCaption: 'Jordan\'s wedding — you were in Singapore\nclosing a deal that fell through anyway.',
                emoji: '💒',
            },
            {
                title: 'DAD\'S 60TH BIRTHDAY',
                present: sorted.find(r => r.id === 'dad')?.connection > 35,
                text: sorted.find(r => r.id === 'dad')?.connection > 35
                    ? 'Dad opened your gift and pretended it was\n"too much." He wore the watch every day after.\nHe told the guys at the hardware store about it. Twice.'
                    : null,
                blankCaption: 'Dad\'s 60th birthday — you sent a gift card.\nIt was to SoulCycle. He\'s 60.',
                emoji: '🎁',
            },
            {
                title: 'MOM\'S SUNDAY CALLS',
                present: sorted.find(r => r.id === 'mom')?.connection > 50,
                text: sorted.find(r => r.id === 'mom')?.connection > 50
                    ? 'She calls every Sunday. You answer now.\nSometimes you talk about nothing for 40 minutes.\nNothing has never felt so important.'
                    : null,
                blankCaption: 'Mom called 47 Sundays in a row.\nYou answered 6.',
                emoji: '📞',
            },
            {
                title: 'SAM\'S GRADUATION',
                present: sorted.find(r => r.id === 'sam')?.connection > 50,
                text: sorted.find(r => r.id === 'sam')?.connection > 50
                    ? 'You sat in the third row. You cheered too loud.\nSam found you after and said "I can\'t believe you came."\nYou said "Where else would I be?" and meant it.'
                    : null,
                blankCaption: 'Sam\'s graduation — you were in Singapore\nclosing a deal that fell through anyway.',
                emoji: '🎓',
            },
        ];

        // Add scrapbook moments from gameplay
        for (const entry of scrapbook) {
            if (entry.visited) {
                pages.push({
                    title: entry.location.toUpperCase() + ' — REVISITED',
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
            this.currentPage < this.pages.length - 1 ? '← →  to flip pages' : '[ Press ENTER to close the book ]', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#3a2a1a',
        }).setOrigin(0.5);
        this.pageGroup.push(nav);

        // On last page, allow closing
        if (this.currentPage >= this.pages.length - 1) {
            this.input.keyboard.once('keydown-ENTER', () => {
                this.cameras.main.fadeOut(1500);
                this.time.delayedCall(1500, () => {
                    this.scene.start('EndingScene');
                });
            });
        }
    }

    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.currentPage++;
            this.showPage();
        }
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.showPage();
        }
    }
}
