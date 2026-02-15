import BaseScene from './BaseScene.js';
import Theme from '../ui/Theme.js';

/**
 * NarrativeScene — THE core scene.
 * Renders narrative moments: setting description, character dialogue,
 * choices, internal monologue. Replaces all overworld scenes, mini-games,
 * DialogueScene, and transition scenes.
 *
 * Full-screen text-selection scene with atmospheric gradient backgrounds.
 */
export default class NarrativeScene extends BaseScene {
    constructor() {
        super({ key: 'NarrativeScene' });
    }

    init(data) {
        this.narrativeEngine = this.registry.get('narrativeEngine');
        this.statManager = this.registry.get('statManager');
        this.relationshipManager = this.registry.get('relationshipManager');
        this.timeManager = this.registry.get('timeManager');

        // Data passed from PlanningScene or act flow
        this.momentId = data.momentId || null;
        this.momentData = data.momentData || null;
        this.returnScene = data.returnScene || null;
        this.onComplete = data.onComplete || null;
        this.actNumber = data.actNumber || this.timeManager.currentAct;
        this.titleCardOnly = data.titleCardOnly || false;
    }

    create() {
        const { width, height } = this.cameras.main;

        // --- Atmospheric Gradient Background (Phaser Graphics) ---
        this.bgGraphics = this.add.graphics().setDepth(0);

        // --- DOM Container for all text content ---
        this.contentDom = this.add.dom(width / 2, height / 2).createFromHTML(
            '<div class="narrative-container"></div>'
        );
        this.contentDom.setDepth(5);

        // Title card mode — just draw background, no moment rendering
        if (this.titleCardOnly) {
            this.drawGradient(width, height);
            // Title card will be shown by GameFlowController via showTitleCard()
        } else {
            // Load moment data
            let moment = this.momentData;
            if (!moment && this.momentId) {
                moment = this.narrativeEngine.loadMoment(this.momentId);
            }

            if (moment) {
                this.currentMoment = moment;
                this.renderMoment(moment);
            } else {
                this.endMoment();
            }
        }

        // Launch HUD
        if (!this.scene.isActive('HUDScene')) {
            this.scene.launch('HUDScene');
            this.scene.bringToTop('HUDScene');
        }

        // Fade in
        this.cameras.main.fadeIn(600);

        // Resize + lifecycle
        this.registerResizeHandler(this.handleResize);
        this.initBaseScene();
    }

    handleResize(gameSize) {
        if (!gameSize || gameSize.width <= 0 || gameSize.height <= 0) return;
        const width = gameSize.width;
        const height = gameSize.height;

        this.cameras.main.setViewport(0, 0, width, height);

        // Redraw gradient
        this.drawGradient(width, height);

        // Reposition content
        if (this.contentDom) {
            this.contentDom.setPosition(width / 2, height / 2 + 42);
            const el = this.contentDom.node;
            el.style.width = Math.min(800, width - 40) + 'px';
            el.style.height = (height - 124) + 'px';
        }
    }

    drawGradient(width, height) {
        if (!this.bgGraphics) return;
        this.bgGraphics.clear();

        // Get palette for current act
        const palettes = this.cache.json.get('palettes');
        const actPalette = palettes?.actPalettes?.[this.actNumber] || 'warmGold';
        const palette = palettes?.palettes?.[actPalette] || {
            top: '#1a1a2e', bottom: '#050508'
        };

        const topColor = Phaser.Display.Color.HexStringToColor(palette.top);
        const bottomColor = Phaser.Display.Color.HexStringToColor(palette.bottom);

        // Draw gradient using horizontal lines
        const steps = 60;
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const r = Phaser.Math.Linear(topColor.red, bottomColor.red, t);
            const g = Phaser.Math.Linear(topColor.green, bottomColor.green, t);
            const b = Phaser.Math.Linear(topColor.blue, bottomColor.blue, t);
            const color = Phaser.Display.Color.GetColor(Math.round(r), Math.round(g), Math.round(b));

            const bandH = Math.ceil(height / steps);
            this.bgGraphics.fillStyle(color, 1);
            this.bgGraphics.fillRect(0, i * bandH, width, bandH + 1);
        }

        // Apply burnout desaturation overlay
        const burnoutEffects = this.statManager.getBurnoutEffects();
        if (burnoutEffects.desaturation > 0) {
            this.bgGraphics.fillStyle(0x808080, burnoutEffects.desaturation * 0.3);
            this.bgGraphics.fillRect(0, 0, width, height);
        }
    }

    /**
     * Render a complete narrative moment
     */
    renderMoment(moment) {
        const container = this.contentDom.node;
        container.innerHTML = '';
        container.className = 'narrative-container';

        const { width } = this.cameras.main;
        container.style.width = Math.min(800, width - 40) + 'px';

        // Draw background gradient
        this.drawGradient(this.cameras.main.width, this.cameras.main.height);

        // Setting header
        if (moment.setting) {
            const settingDiv = document.createElement('div');
            settingDiv.className = 'narr-setting';

            if (moment.setting.location) {
                const locEl = document.createElement('div');
                locEl.className = 'narr-location';
                locEl.textContent = moment.setting.location;
                settingDiv.appendChild(locEl);
            }

            if (moment.setting.description) {
                const descEl = document.createElement('div');
                descEl.className = 'narr-setting-desc';
                descEl.textContent = moment.setting.description;
                settingDiv.appendChild(descEl);
            }

            container.appendChild(settingDiv);
        }

        // Render narrative entries sequentially
        this.narrativeIndex = 0;
        this.narrativeEntries = this.narrativeEngine.filterByConditions(
            moment.narrative || [],
            this.statManager,
            this.relationshipManager
        );

        this.renderNextEntry();
    }

    /**
     * Render the next entry in the narrative sequence
     */
    renderNextEntry() {
        if (this.narrativeIndex >= this.narrativeEntries.length) {
            // All entries shown, no choices — auto-end after brief pause
            this.time.delayedCall(1500, () => this.endMoment());
            return;
        }

        const entry = this.narrativeEntries[this.narrativeIndex];
        this.narrativeIndex++;

        switch (entry.type) {
            case 'description':
                this.renderDescription(entry);
                break;
            case 'dialogue':
                this.renderDialogue(entry);
                break;
            case 'choices':
                this.renderChoices(entry);
                return; // Choices block progression
            case 'monologue':
                this.renderMonologue(entry);
                return; // Monologue blocks then continues
            default:
                this.renderNextEntry();
        }
    }

    /**
     * Render a description/narration block
     */
    renderDescription(entry) {
        const container = this.contentDom.node;

        const descDiv = document.createElement('div');
        descDiv.className = 'narr-description';

        // Burnout dialogue corruption
        const burnoutEffects = this.statManager.getBurnoutEffects();
        if (burnoutEffects.corruptDialogue && Math.random() > 0.7) {
            const corporate = burnoutEffects.corporateSpeak;
            descDiv.textContent = corporate[Math.floor(Math.random() * corporate.length)];
            descDiv.classList.add('narr-corrupted');
        } else {
            descDiv.textContent = entry.text;
        }

        descDiv.style.opacity = '0';
        container.appendChild(descDiv);

        // Typewriter-style fade in
        requestAnimationFrame(() => {
            descDiv.style.transition = 'opacity 0.6s ease';
            descDiv.style.opacity = '1';
        });

        // Continue to next entry after brief pause
        this.time.delayedCall(800, () => this.renderNextEntry());
    }

    /**
     * Render a dialogue block with portrait
     */
    renderDialogue(entry) {
        const container = this.contentDom.node;

        const dlgDiv = document.createElement('div');
        dlgDiv.className = 'narr-dialogue';

        // Portrait
        const portraitDiv = document.createElement('div');
        portraitDiv.className = 'narr-portrait';

        const speakerId = entry.speakerId;
        const charData = this.cache.json.get('characters');
        const allChars = [
            ...(charData?.characters || []),
            ...(this.cache.json.get('act2_characters')?.characters || []),
            ...(this.cache.json.get('act3_characters')?.characters || []),
        ];
        const char = allChars.find(c => c.id === speakerId);

        if (char) {
            const opacity = this.relationshipManager.getPortraitOpacity(speakerId);
            portraitDiv.textContent = char.emoji;
            portraitDiv.style.opacity = opacity;
            portraitDiv.style.borderColor = char.color || 'rgba(255,255,255,0.3)';
        } else {
            portraitDiv.textContent = '👤';
        }

        // Speaker name + text
        const textDiv = document.createElement('div');
        textDiv.className = 'narr-dialogue-content';

        const nameEl = document.createElement('div');
        nameEl.className = 'narr-speaker';
        nameEl.textContent = (entry.speaker || '???').toUpperCase();

        const textEl = document.createElement('div');
        textEl.className = 'narr-dialogue-text';

        // Apply burnout corruption
        const burnoutEffects = this.statManager.getBurnoutEffects();
        if (burnoutEffects.corruptDialogue && Math.random() > 0.6) {
            const corporate = burnoutEffects.corporateSpeak;
            textEl.textContent = corporate[Math.floor(Math.random() * corporate.length)];
            textEl.classList.add('narr-corrupted');
        } else {
            textEl.textContent = entry.text;
        }

        textDiv.appendChild(nameEl);
        textDiv.appendChild(textEl);

        dlgDiv.appendChild(portraitDiv);
        dlgDiv.appendChild(textDiv);

        dlgDiv.style.opacity = '0';
        container.appendChild(dlgDiv);

        requestAnimationFrame(() => {
            dlgDiv.style.transition = 'opacity 0.5s ease';
            dlgDiv.style.opacity = '1';
        });

        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;

        this.time.delayedCall(800, () => this.renderNextEntry());
    }

    /**
     * Render choices — blocks progression until player selects
     */
    renderChoices(entry) {
        const container = this.contentDom.node;

        const choicesDiv = document.createElement('div');
        choicesDiv.className = 'dlg-choices';

        entry.options.forEach((option, i) => {
            const btn = document.createElement('div');
            btn.className = 'dlg-choice-btn';
            btn.textContent = option.text;
            btn.style.animationDelay = `${i * 100}ms`;

            btn.addEventListener('click', () => {
                this.selectChoice(option, entry);
                choicesDiv.remove();
            });

            choicesDiv.appendChild(btn);
        });

        container.appendChild(choicesDiv);
        container.scrollTop = container.scrollHeight;
    }

    /**
     * Handle a choice selection
     */
    selectChoice(option, entry) {
        // Apply effects
        if (option.effects) {
            for (const [key, value] of Object.entries(option.effects)) {
                if (key.endsWith('_connection')) {
                    const charId = key.replace('_connection', '');
                    this.relationshipManager.modifyConnection(charId, value);
                } else {
                    this.statManager.modifyStat(key, value);
                }
            }
        }

        // Track scrapbook-relevant choices
        if (option.scrapbook) {
            const scrapbook = this.registry.get('scrapbook') || [];
            scrapbook.push(option.scrapbook);
            this.registry.set('scrapbook', scrapbook);
        }

        // Track hours
        if (option.effects) {
            if (option.effects.gpa > 0 || option.effects.network > 0 || option.effects.prestige > 0) {
                const hours = this.registry.get('hoursWorked') || 0;
                this.registry.set('hoursWorked', hours + 1);
            }
            // Check if any connection was boosted
            const hasConnection = Object.keys(option.effects).some(k => k.endsWith('_connection') && option.effects[k] > 0);
            if (hasConnection) {
                const hours = this.registry.get('hoursWithPeople') || 0;
                this.registry.set('hoursWithPeople', hours + 1);
            }
        }

        // Record choice
        if (this.currentMoment) {
            this.narrativeEngine.completeMoment(this.currentMoment.id, option.next || option.text);
        }

        // Show internal monologue if present
        if (option.internal_monologue) {
            this.showMonologue(option.internal_monologue, () => {
                this.handleChoiceNext(option);
            });
        } else {
            this.handleChoiceNext(option);
        }
    }

    handleChoiceNext(option) {
        if (option.next && this.narrativeEngine.moments[option.next]) {
            // Load next moment
            const nextMoment = this.narrativeEngine.loadMoment(option.next);
            if (nextMoment) {
                this.currentMoment = nextMoment;
                this.cameras.main.fadeOut(400);
                this.time.delayedCall(400, () => {
                    this.cameras.main.fadeIn(400);
                    this.renderMoment(nextMoment);
                });
                return;
            }
        }

        // If remaining narrative entries exist, continue them
        if (this.narrativeIndex < this.narrativeEntries.length) {
            this.renderNextEntry();
        } else {
            this.endMoment();
        }
    }

    /**
     * Render internal monologue
     */
    renderMonologue(entry) {
        this.showMonologue(entry.text, () => {
            this.renderNextEntry();
        });
    }

    /**
     * Show monologue overlay
     */
    showMonologue(text, onComplete) {
        const container = this.contentDom.node;

        const monoDiv = document.createElement('div');
        monoDiv.className = 'narr-monologue';
        monoDiv.textContent = text;
        monoDiv.style.opacity = '0';
        container.appendChild(monoDiv);

        requestAnimationFrame(() => {
            monoDiv.style.transition = 'opacity 0.5s ease';
            monoDiv.style.opacity = '1';
        });

        container.scrollTop = container.scrollHeight;

        this.time.delayedCall(2500, () => {
            monoDiv.style.transition = 'opacity 0.5s ease';
            monoDiv.style.opacity = '0.4';

            this.time.delayedCall(500, () => {
                if (onComplete) onComplete();
            });
        });
    }

    /**
     * End the current moment and return control
     */
    endMoment() {
        // Auto-save
        const persistence = this.registry.get('persistenceManager');
        if (persistence) persistence.save();

        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => {
            this.scene.stop('NarrativeScene');

            if (this.onComplete) {
                this.onComplete();
            } else if (this.returnScene) {
                this.scene.resume(this.returnScene);
            }
        });
    }

    /**
     * Render a title card (ACT I — THE GOOD KID)
     */
    static showTitleCard(scene, title, subtitle, callback) {
        const { width, height } = scene.cameras.main;

        const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 1).setDepth(100);

        const titleText = scene.add.text(width / 2, height / 2 - 20, title, {
            fontFamily: '"Press Start 2P"',
            fontSize: '32px',
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setAlpha(0).setDepth(101);

        const subtitleText = scene.add.text(width / 2, height / 2 + 30, subtitle, {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#d4a853',
            align: 'center',
        }).setOrigin(0.5).setAlpha(0).setDepth(101);

        scene.tweens.add({ targets: titleText, alpha: 1, duration: 1500, delay: 500 });
        scene.tweens.add({ targets: subtitleText, alpha: 1, duration: 1000, delay: 1500 });

        scene.time.delayedCall(4000, () => {
            scene.tweens.add({ targets: [titleText, subtitleText, overlay], alpha: 0, duration: 1000 });
            scene.time.delayedCall(1000, () => {
                overlay.destroy();
                titleText.destroy();
                subtitleText.destroy();
                if (callback) callback();
            });
        });
    }
}
