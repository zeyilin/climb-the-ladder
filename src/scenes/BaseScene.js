import Phaser from 'phaser';

/**
 * BaseScene — Foundation class for all Climb the Ladder scenes.
 * Automatically handles cleanup of resize handlers, keyboard keys,
 * and input listeners on scene shutdown to prevent accumulation
 * across game restarts.
 */
export default class BaseScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this._resizeHandler = null;
    }

    /**
     * Call at the end of create() to register automatic cleanup.
     */
    initBaseScene() {
        this.events.off('shutdown', this._baseShutdown, this);
        this.events.on('shutdown', this._baseShutdown, this);
    }

    /**
     * Register a resize handler that auto-cleans on shutdown.
     * Immediately calls the handler with current dimensions.
     */
    registerResizeHandler(handler) {
        this._resizeHandler = handler;
        this.scale.on('resize', handler, this);
        handler.call(this, { width: this.scale.width, height: this.scale.height });
    }

    /**
     * Stop all overlay scenes (HUD, panels, etc.)
     */
    stopAllOverlays() {
        const overlays = ['HUDScene', 'RelationshipPanelScene', 'ResumeViewScene', 'InstructionsScene'];
        overlays.forEach(key => {
            try {
                if (this.scene.isActive(key) || this.scene.isPaused(key)) {
                    this.scene.stop(key);
                }
            } catch (e) { /* scene may not exist yet */ }
        });
    }

    /**
     * Automatic cleanup on scene shutdown.
     */
    _baseShutdown() {
        // Remove resize handler from global ScaleManager
        if (this._resizeHandler) {
            this.scale.off('resize', this._resizeHandler, this);
            this._resizeHandler = null;
        }

        // Remove all keyboard event listeners
        if (this.input && this.input.keyboard) {
            this.input.keyboard.removeAllListeners();
        }
    }
}
