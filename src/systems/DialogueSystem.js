/**
 * DialogueSystem — Branching dialogue engine with internal monologue.
 * Loads JSON dialogue trees and renders them via Phaser text objects.
 */
export default class DialogueSystem {
    constructor() {
        this.dialogueTrees = {};
        this.currentTree = null;
        this.currentNode = null;
    }

    reset() {
        this.dialogueTrees = {};
        this.currentTree = null;
        this.currentNode = null;
    }

    /**
     * Register a dialogue tree by ID
     * @param {string} treeId
     * @param {object} tree - { nodes: { [nodeId]: { speaker, text, internal_monologue?, choices? } } }
     */
    registerTree(treeId, tree) {
        this.dialogueTrees[treeId] = tree;
    }

    /**
     * Start a dialogue tree from its root node
     * @param {string} treeId
     * @returns {object} The first node
     */
    start(treeId) {
        const tree = this.dialogueTrees[treeId];
        if (!tree) return null;

        this.currentTree = tree;
        this.currentNode = tree.nodes[tree.start || 'root'];
        return this.currentNode;
    }

    /**
     * Select a choice by index in the current node
     * @param {number} choiceIndex
     * @returns {{ effects, internalMonologue, nextNode }}
     */
    selectChoice(choiceIndex) {
        if (!this.currentNode?.choices?.[choiceIndex]) return null;

        const choice = this.currentNode.choices[choiceIndex];
        const effects = choice.effects || {};
        const internalMonologue = choice.internal_monologue || null;
        const nextNodeId = choice.next;

        if (nextNodeId && this.currentTree.nodes[nextNodeId]) {
            this.currentNode = this.currentTree.nodes[nextNodeId];
        } else {
            this.currentNode = null; // dialogue ended
        }

        return {
            effects,
            internalMonologue,
            nextNode: this.currentNode,
            ended: this.currentNode === null,
        };
    }

    /**
     * Get current node (for rendering)
     */
    getCurrentNode() {
        return this.currentNode;
    }

    /**
     * Check if dialogue is active
     */
    isActive() {
        return this.currentNode !== null;
    }

    /**
     * End dialogue immediately
     */
    end() {
        this.currentNode = null;
        this.currentTree = null;
    }
}
