import Phaser from 'phaser';

/**
 * LayoutManager
 * Central source of truth for responsive layout calculations.
 */
export default class LayoutManager {
    constructor(scene) {
        this.scene = scene;
    }

    get width() {
        return this.scene.scale.width;
    }

    get height() {
        return this.scene.scale.height;
    }

    get isMobile() {
        return this.width < 768;
    }

    get isTiny() {
        return this.width < 380;
    }

    // Standard spacing
    get padding() {
        return this.isMobile ? 10 : 20;
    }

    get gutter() {
        return this.isMobile ? 5 : 10;
    }

    // Grid System
    getGridWidth(cols, totalGap = 0) {
        return (this.width - (this.padding * 2) - totalGap) / cols;
    }

    // Font Sizes
    get fontSizes() {
        return {
            header: this.isMobile ? '16px' : '24px',
            body: this.isMobile ? '14px' : '18px',
            small: this.isMobile ? '10px' : '14px',
            tiny: '8px'
        };
    }
}
