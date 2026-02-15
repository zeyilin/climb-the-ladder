import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import HighSchoolScene from './scenes/HighSchoolScene.js';
import TimeAllocationScene from './scenes/TimeAllocationScene.js';
import StudyMiniGame from './scenes/StudyMiniGame.js';
import DialogueScene from './scenes/DialogueScene.js';
import CollegeRevealScene from './scenes/CollegeRevealScene.js';
// Act II scenes
import MajorSelectionScene from './scenes/MajorSelectionScene.js';
import CollegeCampusScene from './scenes/CollegeCampusScene.js';
import NetworkingMiniGame from './scenes/NetworkingMiniGame.js';
import InternshipMiniGame from './scenes/InternshipMiniGame.js';
import CareerRouletteScene from './scenes/CareerRouletteScene.js';
// Act III scenes
import CityScene from './scenes/CityScene.js';
import ConsultingMiniGame from './scenes/ConsultingMiniGame.js';
import BankingMiniGame from './scenes/BankingMiniGame.js';
import StartupMiniGame from './scenes/StartupMiniGame.js';
import BigTechMiniGame from './scenes/BigTechMiniGame.js';
import PerformanceReviewScene from './scenes/PerformanceReviewScene.js';
import PromotionScene from './scenes/PromotionScene.js';
import InsuranceAdjustingMiniGame from './scenes/InsuranceAdjustingMiniGame.js';
// Act IV scenes
import CornerOfficeScene from './scenes/CornerOfficeScene.js';
import EscalatedMiniGame from './scenes/EscalatedMiniGame.js';
import TeamManagementScene from './scenes/TeamManagementScene.js';
import MirrorMomentScene from './scenes/MirrorMomentScene.js';
import UltimatePromotionScene from './scenes/UltimatePromotionScene.js';
// Act V scenes
import ReckoningScene from './scenes/ReckoningScene.js';
import ReconciliationScene from './scenes/ReconciliationScene.js';
import ScrapbookScene from './scenes/ScrapbookScene.js';
import EndingScene from './scenes/EndingScene.js';
// UI
import HUDScene from './ui/HUD.js';
import RelationshipPanelScene from './ui/RelationshipPanel.js';
import ResumeViewScene from './ui/ResumeView.js';
import InstructionsScene from './scenes/InstructionsScene.js';
// Systems
import StatManager from './systems/StatManager.js';
import RelationshipManager from './systems/RelationshipManager.js';
import TimeManager from './systems/TimeManager.js';
import DialogueSystem from './systems/DialogueSystem.js';
import ResumeSystem from './systems/ResumeSystem.js';
import AudioCues from './systems/AudioCues.js';
import PersistenceManager from './systems/PersistenceManager.js';
// Data
import characterData from './data/characters.json';

/**
 * Climb the Ladder — Main Entry Point
 * A darkly comedic 2D pixel-art life-sim about grinding yourself
 * into a husk for a corner office you'll eat sad desk salads in.
 */

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280, // Fixed 4:3 high-res
    height: 960,
    resolution: window.devicePixelRatio, // Ensure crisp rendering on high-DPI screens
    roundPixels: true, // Fixes fuzzy text
    backgroundColor: '#050508', // Theme.BG_DARK
    pixelArt: true, // REQUIRED for sharp pixel fonts!
    dom: {
        createContainer: true,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [
        BootScene,
        MenuScene,
        // Act I
        HighSchoolScene,
        TimeAllocationScene,
        StudyMiniGame,
        DialogueScene,
        CollegeRevealScene,
        // Act II
        MajorSelectionScene,
        CollegeCampusScene,
        NetworkingMiniGame,
        InternshipMiniGame,
        CareerRouletteScene,
        // Act III
        CityScene,
        ConsultingMiniGame,
        BankingMiniGame,
        StartupMiniGame,
        BigTechMiniGame,
        PerformanceReviewScene,
        PromotionScene,
        InsuranceAdjustingMiniGame,
        // Act IV
        CornerOfficeScene,
        EscalatedMiniGame,
        TeamManagementScene,
        MirrorMomentScene,
        UltimatePromotionScene,
        // Act V
        ReckoningScene,
        ReconciliationScene,
        ScrapbookScene,
        EndingScene,
        // UI overlays
        HUDScene,
        RelationshipPanelScene,
        ResumeViewScene,
        InstructionsScene,
    ],
    scale: {
        mode: Phaser.Scale.NONE, // Manual control to prevent stretching/black screens
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(config);

// --- System Instantiation & Registry ---
const statManager = new StatManager();
const relationshipManager = new RelationshipManager();
const timeManager = new TimeManager();
const dialogueSystem = new DialogueSystem();
const resumeSystem = new ResumeSystem();
const audioCues = new AudioCues();
const persistenceManager = new PersistenceManager(game);

// Wire up audio cues
statManager.setAudioCues(audioCues);
relationshipManager.setAudioCues(audioCues);

// Initialize relationships from character data
relationshipManager.init(characterData.characters);

// Register in Phaser registry so all scenes can access
game.registry.set('statManager', statManager);
game.registry.set('relationshipManager', relationshipManager);
game.registry.set('timeManager', timeManager);
game.registry.set('dialogueSystem', dialogueSystem);
game.registry.set('resumeSystem', resumeSystem);
game.registry.set('audioCues', audioCues);
game.registry.set('persistenceManager', persistenceManager);

// --- Manual Resize Management ---
// Wraps resizing logic to ensure canvas buffer matches window size 1:1
const resizeGame = () => {
    if (!game || !game.scale) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Force the canvas size to match the window
    game.scale.resize(w, h);

    // Explicitly refresh scale manager
    game.scale.refresh();

    console.log(`Manual Resize: ${w}x${h}`);
};

window.addEventListener('resize', resizeGame);

// Initial sizing
window.addEventListener('load', () => {
    resizeGame();
});

// Also trigger once quickly in case load already fired
setTimeout(resizeGame, 100);
