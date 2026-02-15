import Phaser from 'phaser';
import Theme from '../ui/Theme.js';
import UIButton from '../ui/components/UIButton.js';
import LayoutManager from '../ui/LayoutManager.js';

/**
 * TimeAllocationScene — The Trade-Off Wheel.
 * "Corporate Planner" Style.
 * Header + slots use DOM for crisp text; activity buttons remain Phaser UIButton.
 */
export default class TimeAllocationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TimeAllocationScene' });
    }

    init() {
        this.timeManager = this.registry.get('timeManager');
        this.relationshipManager = this.registry.get('relationshipManager');
        this.statManager = this.registry.get('statManager');
        this.layout = new LayoutManager(this);
    }

    create() {
        this.selectedSlots = [];
        this.currentSlotIndex = 0;
        this.uiButtons = [];

        // Dynamic slot count
        const slotNames = this.timeManager.getSlotNames();
        this.totalSlots = slotNames.length;
        this.slotNames = slotNames;

        // Overlay
        this.overlay = this.add.rectangle(0, 0, 0, 0, Theme.COLORS.BG_OVERLAY, 0.95).setDepth(0);

        // --- DOM Header ---
        const headerHTML = this.buildHeaderHTML();
        this.headerDom = this.add.dom(0, 0).createFromHTML(headerHTML);
        this.headerDom.setDepth(1);

        // --- DOM Slots ---
        const slotsHTML = this.buildSlotsHTML();
        this.slotsDom = this.add.dom(0, 0).createFromHTML(slotsHTML);
        this.slotsDom.setDepth(1);

        // --- Activity Buttons (Phaser UIButton — unchanged) ---
        const activities = this.timeManager.activities;

        activities.forEach((activity) => {
            const btn = new UIButton(this, 0, 0, 600, 50, {
                label: activity.label,
                icon: activity.icon,
                description: activity.description,
                onClick: () => this.selectActivity(activity),
            });
            btn.setDepth(2);
            this.uiButtons.push(btn);
        });

        // --- DOM Warning ---
        this.warningDom = this.add.dom(0, 0).createFromHTML('<div class="ta-warning"></div>');
        this.warningDom.setDepth(2);

        this.updateWarning();

        // --- Resize ---
        this.scale.on('resize', this.handleResize, this);
        this.events.on('shutdown', () => {
            this.scale.off('resize', this.handleResize, this);
        });
        this.handleResize({ width: this.scale.width, height: this.scale.height });

        // --- Launch HUD ---
        this.scene.launch('HUDScene');
        this.scene.bringToTop('HUDScene');
    }

    buildHeaderHTML() {
        return `
            <div class="ta-header">
                <div class="ta-week">${this.timeManager.getWeekDisplay().toUpperCase()}</div>
                <div class="ta-day">${this.timeManager.getDayDisplay()}</div>
                <div class="ta-title">ALLOCATE RESOURCES</div>
            </div>
        `;
    }

    buildSlotsHTML() {
        const slots = this.slotNames.map((name, i) => {
            const isActive = i === 0;
            return `
                <div class="ta-slot" data-slot="${i}">
                    <div class="ta-slot-label ${isActive ? 'active' : ''}">${name.toUpperCase()}</div>
                    <div class="ta-slot-box">
                        <div class="ta-slot-text">[ EMPTY ]</div>
                    </div>
                </div>
            `;
        }).join('');

        return `<div class="ta-slots">${slots}</div>`;
    }

    handleResize(gameSize) {
        if (!gameSize || gameSize.width <= 0 || gameSize.height <= 0) return;

        const width = gameSize.width;
        const height = gameSize.height;
        const isMobile = this.layout.isMobile;

        this.cameras.main.setViewport(0, 0, width, height);

        // Overlay
        this.overlay.setPosition(width / 2, height / 2);
        this.overlay.setSize(width, height);

        // Header — shifted down for HUD (84px)
        const hudHeight = 84;
        const headerY = isMobile ? hudHeight + 30 : hudHeight + 40;
        if (this.headerDom) {
            this.headerDom.setPosition(width / 2, headerY);
            // Update mobile font sizes via node
            const el = this.headerDom.node;
            el.querySelector('.ta-week').style.fontSize = isMobile ? '16px' : '24px';
            el.querySelector('.ta-day').style.fontSize = isMobile ? '20px' : '32px';
            el.querySelector('.ta-title').style.fontSize = isMobile ? '10px' : '14px';
        }

        // Slots
        const slotsY = headerY + (isMobile ? 70 : 90);
        if (this.slotsDom) {
            this.slotsDom.setPosition(width / 2, slotsY);
            // Scale slot widths for mobile
            const slotEls = this.slotsDom.node.querySelectorAll('.ta-slot');
            const slotBoxEls = this.slotsDom.node.querySelectorAll('.ta-slot-box');
            const slotW = isMobile ? '100px' : '160px';
            slotEls.forEach(el => el.style.width = slotW);
            slotBoxEls.forEach(el => el.style.width = slotW);
        }

        // Activity Buttons
        const startY = slotsY + (isMobile ? 50 : 70);
        const btnH = isMobile ? 42 : 50;
        const gap = isMobile ? 6 : 10;
        const btnW = Math.min(600, width - (this.layout.padding * 2));

        this.uiButtons.forEach((btn, i) => {
            const y = startY + i * (btnH + gap);
            btn.setPosition(width / 2, y);
            btn.updateLayout(btnW, btnH);
        });

        // Warning
        if (this.warningDom) {
            this.warningDom.setPosition(width / 2, height - 40);
            this.warningDom.node.style.fontSize = isMobile ? '12px' : '16px';
            this.warningDom.node.style.maxWidth = (width - 40) + 'px';
        }
    }

    selectActivity(activity) {
        if (this.currentSlotIndex >= this.totalSlots) return;

        this.selectedSlots.push(activity);

        // Update slot DOM
        const slotEl = this.slotsDom.node.querySelector(`[data-slot="${this.currentSlotIndex}"]`);
        if (slotEl) {
            const textEl = slotEl.querySelector('.ta-slot-text');
            textEl.textContent = activity.label.toUpperCase();
            textEl.classList.add('filled');

            // Dim the label
            slotEl.querySelector('.ta-slot-label').classList.remove('active');
        }

        this.currentSlotIndex++;

        // Highlight next label
        if (this.currentSlotIndex < this.totalSlots) {
            const nextSlotEl = this.slotsDom.node.querySelector(`[data-slot="${this.currentSlotIndex}"]`);
            if (nextSlotEl) {
                nextSlotEl.querySelector('.ta-slot-label').classList.add('active');
            }
        }

        this.updateWarning();

        if (this.currentSlotIndex >= this.totalSlots) {
            // Derek Logic handling
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
        const warningEl = this.warningDom?.node;
        if (!warningEl) return;

        const hasSocial = this.selectedSlots.some(s => s?.id.startsWith('socialize_') || s?.id === 'text_sam' || s?.id === 'text_family');
        if (this.currentSlotIndex > 0 && !hasSocial) {
            const sorted = this.relationshipManager.getSorted();
            const lowest = sorted[sorted.length - 1];
            if (lowest && lowest.connection < 40) {
                warningEl.textContent = `⚠ ${lowest.name}'s connection is critical (${lowest.connection}%).`;
            } else {
                warningEl.textContent = 'Isolation detected. Efficiency +10%. Happiness -20%.';
            }
        } else {
            warningEl.textContent = '';
        }
    }

    finishAllocation() {
        for (const activity of this.selectedSlots) {
            this.timeManager.setSlotActivity(activity);
        }

        // Auto-Save
        const persistence = this.registry.get('persistenceManager');
        if (persistence) persistence.save();

        this.scene.stop('TimeAllocationScene');
        const act = this.timeManager.currentAct;
        const getScene = (key) => {
            this.scene.resume(key);
            const s = this.scene.get(key);
            if (s) s.processDayResults?.(this.selectedSlots);
        };

        if (act === 5) getScene('ReckoningScene');
        else if (act === 4) getScene('CornerOfficeScene');
        else if (act === 3) getScene('CityScene');
        else if (act === 2) getScene('CollegeCampusScene');
        else getScene('HighSchoolScene');
    }

    showDerekPopup() {
        const width = this.scale.width;
        const height = this.scale.height;

        const container = this.add.container(width / 2, height / 2);

        const bg = this.add.rectangle(0, 0, 500, 200, 0x000000, 0.95).setStrokeStyle(4, Theme.COLORS.DANGER);

        const title = this.add.text(0, -40, 'WARNING: PEER PRESSURE', {
            ...Theme.STYLES.HEADER_SM, color: Theme.toHex(Theme.COLORS.DANGER)
        }).setOrigin(0.5);

        const msg = this.add.text(0, 0, 'Derek from work just got promoted.\nAre you sure you want to rest?', {
            ...Theme.STYLES.BODY_MD, align: 'center'
        }).setOrigin(0.5);

        const btn = this.add.text(0, 50, '[ I DON\'T CARE ABOUT DEREK ]', {
            ...Theme.STYLES.HEADER_SM, color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        container.add([bg, title, msg, btn]);
        container.setDepth(999);

        btn.on('pointerdown', () => {
            container.destroy();
            this.time.delayedCall(200, () => this.finishAllocation());
        });
    }
}
