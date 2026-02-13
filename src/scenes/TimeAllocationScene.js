import Phaser from 'phaser';

/**
 * TimeAllocationScene — The Trade-Off Wheel.
 * Dynamic slots (3 for high school, 4 for college with Night).
 */
export default class TimeAllocationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TimeAllocationScene' });
    }

    init() {
        this.timeManager = this.registry.get('timeManager');
        this.relationshipManager = this.registry.get('relationshipManager');
        this.statManager = this.registry.get('statManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.selectedSlots = [];
        this.currentSlotIndex = 0;

        // Dynamic slot count from TimeManager
        const slotNames = this.timeManager.getSlotNames();
        this.totalSlots = slotNames.length;

        // Semi-transparent overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85).setDepth(0);

        // Header
        this.add.text(width / 2, 40, this.timeManager.getWeekDisplay(), {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#6c63ff',
        }).setOrigin(0.5).setDepth(1);

        this.add.text(width / 2, 60, this.timeManager.getDayDisplay(), {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#8a8aaa',
        }).setOrigin(0.5).setDepth(1);

        this.add.text(width / 2, 85, 'PLAN YOUR DAY', {
            fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#e8e8ff',
        }).setOrigin(0.5).setDepth(1);

        // Slot indicators — dynamic count
        this.slotLabels = [];
        this.slotTexts = [];
        const slotY = 115;
        const slotSpacing = Math.min(180, (width - 100) / this.totalSlots);

        for (let i = 0; i < this.totalSlots; i++) {
            const x = width / 2 - (slotSpacing * (this.totalSlots - 1)) / 2 + i * slotSpacing;

            const label = this.add.text(x, slotY, slotNames[i], {
                fontFamily: '"Press Start 2P"', fontSize: '7px',
                color: i === 0 ? '#ffd93d' : '#4a4a6a',
            }).setOrigin(0.5).setDepth(1);
            this.slotLabels.push(label);

            const slotText = this.add.text(x, slotY + 20, '???', {
                fontFamily: 'Inter', fontSize: '10px', color: '#6a6a8a',
            }).setOrigin(0.5).setDepth(1);
            this.slotTexts.push(slotText);
        }

        // Activity buttons
        const activities = this.timeManager.activities;
        const startY = 165;
        const btnH = 44;
        const gap = 4;
        this.activityButtons = [];

        activities.forEach((activity, i) => {
            const y = startY + i * (btnH + gap);
            const btnBg = this.add.rectangle(width / 2, y, 520, btnH, 0x1a1a2e)
                .setInteractive({ useHandCursor: true }).setDepth(1);

            const btnLabel = this.add.text(width / 2 - 240, y, `${activity.icon}  ${activity.label}`, {
                fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#c8c8e8',
            }).setOrigin(0, 0.5).setDepth(2);

            const btnDesc = this.add.text(width / 2 + 250, y, activity.description, {
                fontFamily: 'Inter', fontSize: '9px', color: '#5a5a7a', fontStyle: 'italic',
            }).setOrigin(1, 0.5).setDepth(2);

            btnBg.on('pointerover', () => btnBg.setFillStyle(0x2a2a4e));
            btnBg.on('pointerout', () => btnBg.setFillStyle(0x1a1a2e));
            btnBg.on('pointerdown', () => this.selectActivity(activity));

            this.activityButtons.push({ bg: btnBg, label: btnLabel, desc: btnDesc });
        });

        // Warning
        this.warningText = this.add.text(width / 2, height - 30, '', {
            fontFamily: 'Inter', fontSize: '10px', color: '#ff6b6b', fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(1);

        this.updateWarning();
    }

    selectActivity(activity) {
        if (this.currentSlotIndex >= this.totalSlots) return;

        this.selectedSlots.push(activity);
        this.slotTexts[this.currentSlotIndex].setText(`${activity.icon} ${activity.label}`);
        this.slotTexts[this.currentSlotIndex].setColor('#c8c8e8');
        this.slotLabels[this.currentSlotIndex].setColor('#4a4a6a');

        this.currentSlotIndex++;

        if (this.currentSlotIndex < this.totalSlots) {
            this.slotLabels[this.currentSlotIndex].setColor('#ffd93d');
        }

        this.updateWarning();

        if (this.currentSlotIndex >= this.totalSlots) {
            // Track consecutive rest days for Derek popup
            const allRest = this.selectedSlots.every(s => s.id === 'rest');
            if (allRest) {
                const restDays = (this.registry.get('consecutiveRestDays') || 0) + 1;
                this.registry.set('consecutiveRestDays', restDays);
                if (restDays >= 3) {
                    this.showDerekPopup();
                    return;
                }
            } else {
                this.registry.set('consecutiveRestDays', 0);
            }
            this.time.delayedCall(400, () => this.finishAllocation());
        }
    }

    updateWarning() {
        const hasSocial = this.selectedSlots.some(s => s?.id.startsWith('socialize_') || s?.id === 'text_sam' || s?.id === 'text_family');
        if (this.currentSlotIndex > 0 && !hasSocial) {
            const sorted = this.relationshipManager.getSorted();
            const lowest = sorted[sorted.length - 1];
            if (lowest && lowest.connection < 40) {
                this.warningText.setText(`⚠ ${lowest.name}'s connection is at ${lowest.connection}%. They're starting to notice.`);
            } else {
                this.warningText.setText('Another day without seeing anyone. They\'ll understand. Probably.');
            }
        } else {
            this.warningText.setText('');
        }
    }

    finishAllocation() {
        for (const activity of this.selectedSlots) {
            this.timeManager.setSlotActivity(activity);
        }

        this.scene.stop('TimeAllocationScene');

        // Determine which scene to resume based on current act
        const act = this.timeManager.currentAct;
        if (act === 5) {
            this.scene.resume('ReckoningScene');
            const reckoning = this.scene.get('ReckoningScene');
            if (reckoning) reckoning.processDayResults?.(this.selectedSlots);
        } else if (act === 4) {
            this.scene.resume('CornerOfficeScene');
            const office = this.scene.get('CornerOfficeScene');
            if (office) office.processDayResults(this.selectedSlots);
        } else if (act === 3) {
            this.scene.resume('CityScene');
            const city = this.scene.get('CityScene');
            if (city) city.processDayResults(this.selectedSlots);
        } else if (act === 2) {
            this.scene.resume('CollegeCampusScene');
            const campus = this.scene.get('CollegeCampusScene');
            if (campus) campus.processDayResults(this.selectedSlots);
        } else {
            this.scene.resume('HighSchoolScene');
            const hs = this.scene.get('HighSchoolScene');
            if (hs) hs.processDayResults(this.selectedSlots);
        }
    }

    /**
     * "Are you sure? Derek from work just got promoted." (Derek is fictional. The anxiety is real.)
     */
    showDerekPopup() {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(width / 2, height / 2, 440, 140, 0x0a0a0f, 0.95)
            .setStrokeStyle(2, 0xff6b6b).setDepth(100);

        const msg = this.add.text(width / 2, height / 2 - 25,
            'Are you sure?\nDerek from work just got promoted.', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ff6b6b',
            align: 'center', lineSpacing: 10,
        }).setOrigin(0.5).setDepth(101);

        const subtext = this.add.text(width / 2, height / 2 + 20,
            '(Derek is fictional. The anxiety is real.)', {
            fontFamily: 'Inter', fontSize: '9px', color: '#4a4a6a', fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(101);

        const btn = this.add.text(width / 2, height / 2 + 50,
            '[ I\'m resting anyway ]', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#6c63ff',
        }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setColor('#9a93ff'));
        btn.on('pointerout', () => btn.setColor('#6c63ff'));
        btn.on('pointerdown', () => {
            overlay.destroy();
            msg.destroy();
            subtext.destroy();
            btn.destroy();
            this.time.delayedCall(200, () => this.finishAllocation());
        });
    }
}
