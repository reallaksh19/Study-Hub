/**
 * @typedef {Object} Skill
 * @property {string} id - The unique identifier for the skill (e.g., 'patterns.recognize-repetition')
 * @property {string} name - Human-readable name of the skill
 * @property {string[]} prerequisites - Array of prerequisite skill IDs
 */

/**
 * @typedef {Object} TargetDefinition
 * @property {string} id - The unique identifier for the target (e.g., 'imo-class-4-patterns')
 * @property {string} name - The name of the target
 * @property {string[]} requiredSkills - The skills that must be mastered to complete the target
 */

/**
 * @typedef {'Unknown' | 'Not ready' | 'Supported' | 'Independent' | 'Secure'} EvidenceState
 */

/**
 * @typedef {Object} LearnerEvidence
 * @property {Record<string, EvidenceState>} skills - Map of skill ID to the learner's evidence state
 */

/**
 * @typedef {Object} CapacityProfile
 * @property {boolean} [shortInstructions]
 * @property {number} [maxVisibleSequenceLength]
 * @property {number} [maxAnswerChoices]
 * @property {'visual' | 'numeric' | 'mixed'} [representation]
 * @property {boolean} [readAloudSupport]
 */

/**
 * @typedef {'probe' | 'instruction' | 'practice' | 'readiness-check'} UnitType
 */

/**
 * @typedef {Object} BridgeUnit
 * @property {string} skillId - The skill this unit addresses
 * @property {UnitType} type - The type of activity required
 * @property {CapacityProfile} [supportProfile] - The capacity/support adaptations to apply
 */

/**
 * @typedef {Object} BridgePlan
 * @property {string} targetId - The target this bridge plan is for
 * @property {BridgeUnit[]} units - The ordered sequence of bridge units to execute
 */

export {};
