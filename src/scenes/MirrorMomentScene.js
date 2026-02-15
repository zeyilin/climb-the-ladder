import BaseScene from './BaseScene.js';

/**
 * MirrorMomentScene — Non-interactive vignettes.
 * 5-10 seconds of silence. Your character sits alone.
 * Music cuts out. It's devastating. And also kind of funny.
 */
export default class MirrorMomentScene extends BaseScene {
    constructor() {
        super({ key: 'MirrorMomentScene' });
    }

    create() {
        this._closing = false;

        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(1000);

        // Silence — no music

        const moments = [
            {
                visual: '🏨',
                text: 'A hotel room. CNN is on. You don\'t watch the news.\nYou\'re watching the news.',
                subtext: 'Room 1247. You forgot which city.',
            },
            {
                visual: '🍜',
                text: 'Your desk. 10:47 PM. Pad thai.\nThe office is empty. The cleaning crew waves.',
                subtext: 'They know your name. Your VP doesn\'t.',
            },
            {
                visual: '📱',
                text: 'You\'re scrolling old photos.\nYou accidentally like one from 2014.\nIt\'s you and Dev at the beach.',
                subtext: 'Dev will see the notification. You hope he doesn\'t. You hope he does.',
            },
            {
                visual: '🥣',
                text: 'Sunday morning. Your apartment.\nYou\'re eating cereal with a fork.\nYou don\'t own a clean spoon.',
                subtext: 'The dishwasher has been "running" for 3 days. It hasn\'t been.',
            },
            {
                visual: '🚿',
                text: 'The shower. The water is too hot.\nYou stand there anyway.\nYou\'ve been in here for 40 minutes.',
                subtext: 'You rehearsed your resignation speech. Twice. You won\'t resign.',
            },
            {
                visual: '🅿️',
                text: 'A parking garage. Your car.\nYou\'ve been sitting here for 12 minutes.\nThe engine is off.',
                subtext: 'You don\'t want to go up. You don\'t want to go home. So you sit.',
            },
            {
                visual: '🛒',
                text: 'Whole Foods. The cheese aisle.\nYour eyes are wet. Not crying.\nNot NOT crying.',
                subtext: 'You put the $14 gouda back. You don\'t know why that\'s what did it.',
            },
        ];

        const moment = moments[Math.floor(Math.random() * moments.length)];

        // Visual emoji — big, centered
        const emoji = this.add.text(width / 2, height / 2 - 60, moment.visual, {
            fontSize: '48px',
        }).setOrigin(0.5).setAlpha(0);

        // Main text — slow reveal
        const mainText = this.add.text(width / 2, height / 2 + 10, moment.text, {
            fontFamily: '"VT323", monospace', fontSize: '13px', color: '#6a6a6a',
            align: 'center', lineSpacing: 8,
        }).setOrigin(0.5).setAlpha(0);

        // Subtext — even slower
        const subText = this.add.text(width / 2, height / 2 + 80, moment.subtext, {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#3a3a3a',
            fontStyle: 'italic',
        }).setOrigin(0.5).setAlpha(0);

        // Stagger reveals
        this.tweens.add({ targets: emoji, alpha: 1, duration: 1500, delay: 500 });
        this.tweens.add({ targets: mainText, alpha: 1, duration: 2000, delay: 1500 });
        this.tweens.add({ targets: subText, alpha: 0.7, duration: 1500, delay: 4000 });

        // Auto-close after duration
        const duration = 7000 + Math.random() * 3000;
        this.time.delayedCall(duration, () => {
            this.closeMirror();
        });

        this.initBaseScene();

        // Allow skip with any key/click after 3 seconds
        this.time.delayedCall(3000, () => {
            this.input.keyboard.once('keydown', () => this.closeMirror());
            this.input.once('pointerdown', () => this.closeMirror());
        });
    }

    closeMirror() {
        if (this._closing) return;
        this._closing = true;
        this.cameras.main.fadeOut(1000);
        this.time.delayedCall(1000, () => {
            this.scene.stop('MirrorMomentScene');
            const callback = this.registry.get('mirrorMomentCallback');
            if (callback) {
                this.registry.set('mirrorMomentCallback', null);
                callback();
            }
        });
    }
}
