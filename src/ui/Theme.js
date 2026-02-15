/**
 * Theme.js
 * Central source of truth for UI styling (Phaser canvas objects).
 * "Corporate Cyber-Retro" Aesthetic.
 *
 * NOTE: Color values are duplicated as CSS custom properties in src/ui/styles.css
 * for DOM-rendered panels. Keep both files in sync when changing colors.
 */

const COLORS = {
    // Backgrounds
    BG_DARK: 0x050508,      // Vantablack-ish
    BG_PANEL: 0x0a0a14,     // Slightly lighter dark
    BG_OVERLAY: 0x000000,   // For dimming

    // Accents (Neon Palette)
    NEON_CYAN: 0x00f3ff,
    NEON_PINK: 0xff00ff,
    NEON_GREEN: 0x00ff9f,
    NEON_YELLOW: 0xe2ff00,
    CORP_BLUE: 0x4d4dff,

    // Semantic
    SUCCESS: 0x00ff9f, // Neon Green
    WARNING: 0xe2ff00, // Neon Yellow
    DANGER: 0xff2a2a,  // Bright Red
    MUTED: 0x555577,   // Grey-ish purple
    WHITE: 0xffffff,
};

const FONTS = {
    DISPLAY: '"Press Start 2P", monospace', // Big titles only
    HEADER: '"Inter", sans-serif',          // UI labels, buttons, headers
    BODY: '"VT323", monospace',             // Narrative body text
};

const STYLES = {
    HEADER_LG: {
        fontFamily: FONTS.DISPLAY,
        fontSize: '48px',
        color: '#ffffff',
    },
    HEADER_MD: {
        fontFamily: FONTS.HEADER,
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
    },
    HEADER_SM: {
        fontFamily: FONTS.HEADER,
        fontSize: '13px',
        color: '#00f3ff',
        fontStyle: 'bold',
    },
    BODY_LG: {
        fontFamily: FONTS.BODY,
        fontSize: '32px',
        color: '#ffffff',
    },
    BODY_MD: {
        fontFamily: FONTS.BODY,
        fontSize: '24px',
        color: '#cccccc',
    },
    BODY_SM: {
        fontFamily: FONTS.BODY,
        fontSize: '18px',
        color: '#8888aa',
    }
};

export default {
    COLORS,
    FONTS,
    STYLES,
    // Helper to get hex string for HTML/CSS
    toHex: (num) => '#' + num.toString(16).padStart(6, '0'),
};
