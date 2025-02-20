// Level data structure for storing game-specific content
class LevelData {
    constructor(layout, entities, checkpoints) {
        this.layout = layout;         // 2D array representing level tiles
        this.entities = entities;     // Array of game entities and their positions
        this.checkpoints = checkpoints; // Array of checkpoint positions
        this.timeLimit = 300;         // Default time limit in seconds
        this.collectibles = [];       // Array of collectible items
        this.objectives = [];         // Array of level objectives
        this.backgroundLayers = [];   // Parallax background layers
    }

    addCollectible(type, position, value) {
        this.collectibles.push({ type, position, value, collected: false });
    }

    addObjective(description, requirementType, target) {
        this.objectives.push({
            description,
            requirementType, // "collect", "time", "score", etc.
            target,
            completed: false
        });
    }

    addBackgroundLayer(imageId, scrollSpeed, zIndex) {
        this.backgroundLayers.push({ imageId, scrollSpeed, zIndex });
    }
}

// Entity class for game objects
class Entity {
    constructor(type, position, properties = {}) {
        this.type = type;
        this.position = position;
        this.properties = properties;
        this.active = true;
        this.id = crypto.randomUUID();
    }

    update(delta) {
        // Basic update logic - to be overridden by specific entity types
        if (this.properties.movement) {
            this.position.x += this.properties.movement.x * delta;
            this.position.y += this.properties.movement.y * delta;
        }
    }
}

// Expanded Level class with gameplay mechanics
class GameplayLevel extends Level {
    constructor(id, name, difficulty, unlockRequirement) {
        super(id, name, difficulty, unlockRequirement);
        this.data = null;
        this.currentAttempt = {
            score: 0,
            time: 0,
            collectibles: 0,
            checkpointReached: null
        };
    }

    loadLevelData(layout, entities, checkpoints) {
        this.data = new LevelData(layout, entities, checkpoints);
        return this;
    }

    start() {
        this.currentAttempt = {
            score: 0,
            time: 0,
            collectibles: 0,
            checkpointReached: null
        };
        this.resetEntities();
    }

    resetEntities() {
        if (!this.data) return;
        
        this.data.entities = this.data.entities.map(entity => {
            return new Entity(entity.type, { ...entity.position }, { ...entity.properties });
        });
    }

    update(delta) {
        if (!this.data) return;

        // Update game time
        this.currentAttempt.time += delta;

        // Update entities
        this.data.entities.forEach(entity => {
            if (entity.active) {
                entity.update(delta);
            }
        });

        // Check objectives
        this.checkObjectives();
    }

    checkObjectives() {
        if (!this.data) return;

        this.data.objectives.forEach(objective => {
            switch (objective.requirementType) {
                case 'collect':
                    objective.completed = this.currentAttempt.collectibles >= objective.target;
                    break;
                case 'time':
                    objective.completed = this.currentAttempt.time <= objective.target;
                    break;
                case 'score':
                    objective.completed = this.currentAttempt.score >= objective.target;
                    break;
            }
        });
    }
}

// World 1 specific implementation
class World1 extends World {
    constructor() {
        super(1, "Grasslands");
        this.initializeLevels();
    }

    initializeLevels() {
        // Level 1-1: Tutorial Level
        const level1 = new GameplayLevel("1-1", "Green Beginnings", "Easy", 0);
        level1.loadLevelData(
            [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ],
            [
                new Entity("coin", { x: 3, y: 2 }),
                new Entity("enemy", { x: 6, y: 4 }, { movement: { x: 1, y: 0 } }),
                new Entity("checkpoint", { x: 8, y: 4 })
            ],
            [{ x: 8, y: 4 }]
        );
        level1.data.addObjective("Collect 3 coins", "collect", 3);
        level1.data.addObjective("Complete in 60 seconds", "time", 60);
        this.addLevel(level1);

        // Level 1-2: Introducing More Mechanics
        const level2 = new GameplayLevel("1-2", "Rolling Hills", "Easy", 1);
        level2.loadLevelData(
            [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ],
            [
                new Entity("coin", { x: 3, y: 2 }),
                new Entity("coin", { x: 7, y: 2 }),
                new Entity("enemy", { x: 5, y: 4 }, { movement: { x: 1, y: 0 } }),
                new Entity("checkpoint", { x: 10, y: 4 })
            ],
            [{ x: 10, y: 4 }]
        );
        level2.data.addObjective("Collect all coins", "collect", 2);
        level2.data.addObjective("Score 1000 points", "score", 1000);
        this.addLevel(level2);
    }

    // Add methods specific to World 1 mechanics
    handlePlayerProgress(levelId, playerState) {
        const level = this.levels.get(levelId);
        if (!level || !(level instanceof GameplayLevel)) return;

        // Update player progress
        level.currentAttempt.score += playerState.scoreGained || 0;
        level.currentAttempt.collectibles += playerState.collectiblesGained || 0;

        // Check for level completion
        if (playerState.reachedEnd) {
            const finalScore = this.calculateFinalScore(level);
            this.completeLevel(levelId, finalScore);
        }
    }

    calculateFinalScore(level) {
        if (!level.data) return 0;

        let score = level.currentAttempt.score;
        
        // Time bonus
        const timeBonus = Math.max(0, level.data.timeLimit - level.currentAttempt.time);
        score += timeBonus * 10;

        // Collectibles bonus
        score += level.currentAttempt.collectibles * 100;

        // Objectives bonus
        const completedObjectives = level.data.objectives.filter(obj => obj.completed).length;
        score += completedObjectives * 500;

        return score;
    }
}

// Create and initialize World 1
const world1 = new World1();

// Example: Running a level
const level = world1.levels.get("1-1");
level.start();

// Simulate gameplay updates
const gameLoop = (delta) => {
    level.update(delta);
    
    // Example player state update
    world1.handlePlayerProgress("1-1", {
        scoreGained: 100,
        collectiblesGained: 1,
        reachedEnd: false
    });
};

// Level class to handle individual levels
class Level {
    constructor(id, name, difficulty, unlockRequirement) {
        this.id = id;
        this.name = name;
        this.difficulty = difficulty;
        this.unlockRequirement = unlockRequirement;
        this.completed = false;
        this.highScore = 0;
        this.stars = 0;
    }

    complete(score) {
        this.completed = true;
        if (score > this.highScore) {
            this.highScore = score;
            // Calculate stars based on score thresholds
            this.stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;
        }
        return this.stars;
    }

    isUnlocked(previousLevelStars) {
        return previousLevelStars >= this.unlockRequirement;
    }
}

// World class to manage multiple levels
class World {
    constructor(worldNumber, theme) {
        this.worldNumber = worldNumber;
        this.theme = theme;
        this.levels = new Map();
        this.totalStars = 0;
        this.completed = false;
    }

    addLevel(level) {
        this.levels.set(level.id, level);
    }

    completeLevel(levelId, score) {
        const level = this.levels.get(levelId);
        if (!level) return false;

        const stars = level.complete(score);
        this.totalStars += stars;
        
        // Check if world is completed
        this.completed = Array.from(this.levels.values()).every(l => l.completed);
        
        return true;
    }

    getLevelStatus(levelId) {
        const level = this.levels.get(levelId);
        if (!level) return null;

        return {
            id: level.id,
            name: level.name,
            completed: level.completed,
            stars: level.stars,
            highScore: level.highScore,
            unlocked: level.isUnlocked(this.getPreviousLevelStars(levelId))
        };
    }

    getPreviousLevelStars(currentLevelId) {
        const levelIds = Array.from(this.levels.keys());
        const currentIndex = levelIds.indexOf(currentLevelId);
        if (currentIndex <= 0) return 3; // First level always unlocked
        
        const previousLevel = this.levels.get(levelIds[currentIndex - 1]);
        return previousLevel.stars;
    }
}

// Example usage: Creating World 1
const world1 = new World(1, "Grasslands");

// Adding levels to World 1
world1.addLevel(new Level("1-1", "Green Beginnings", "Easy", 0));
world1.addLevel(new Level("1-2", "Rolling Hills", "Easy", 1));
world1.addLevel(new Level("1-3", "Flower Fields", "Medium", 2));
world1.addLevel(new Level("1-4", "Twilight Garden", "Medium", 2));
world1.addLevel(new Level("1-5", "Boss: Giant Mushroom", "Hard", 3));

// Example: Checking level status and completing levels
console.log(world1.getLevelStatus("1-1")); // First level unlocked
world1.completeLevel("1-1", 95); // Complete with 3 stars
console.log(world1.getLevelStatus("1-2")); // Now unlocked

const WORLD_1_CONFIG = {
    id: "world-1",
    name: "Grasslands",
    levels: [
        {
            id: "1-1",
            name: "Green Beginnings",
            file: "level1-1.js",
            requirements: {
                stars: 0,
                previousLevel: null
            }
        },
        {
            id: "1-2",
            name: "Rolling Hills",
            file: "level1-2.js",
            requirements: {
                stars: 1,
                previousLevel: "1-1"
            }
        },
        {
            id: "1-3",
            name: "Flower Fields",
            file: "level1-3.js",
            requirements: {
                stars: 2,
                previousLevel: "1-2"
            }
        },
        {
            id: "1-4",
            name: "Twilight Garden",
            file: "level1-4.js",
            requirements: {
                stars: 2,
                previousLevel: "1-3"
            }
        },
        {
            id: "1-5",
            name: "Boss: Giant Mushroom",
            file: "level1-5.js",
            requirements: {
                stars: 3,
                previousLevel: "1-4"
            }
        }
    ],
    theme: {
        background: "grassland_bg.png",
        music: "grassland_theme.mp3",
        ambientSounds: ["birds.mp3", "wind.mp3"]
    }
};

export 
// Game/assets/levels/World1/structure.js
const WORLD_1_CONFIG = {
    id: "world-1",
    name: "Grasslands",
    levels: [
        {
            id: "1-1",
            name: "Green Beginnings",
            file: "level1-1.js",
            requirements: {
                stars: 0,
                previousLevel: null
            }
        },
        {
            id: "1-2",
            name: "Rolling Hills",
            file: "level1-2.js",
            requirements: {
                stars: 1,
                previousLevel: "1-1"
            }
        },
        {
            id: "1-3",
            name: "Flower Fields",
            file: "level1-3.js",
            requirements: {
                stars: 2,
                previousLevel: "1-2"
            }
        },
        {
            id: "1-4",
            name: "Twilight Garden",
            file: "level1-4.js",
            requirements: {
                stars: 2,
                previousLevel: "1-3"
            }
        },
        {
            id: "1-5",
            name: "Boss: Giant Mushroom",
            file: "level1-5.js",
            requirements: {
                stars: 3,
                previousLevel: "1-4"
            }
        }
    ],
    theme: {
        background: "grassland_bg.png",
        music: "grassland_theme.mp3",
        ambientSounds: ["birds.mp3", "wind.mp3"]
    }
};

export default WORLD_1_CONFIG;
</antArtifact><antArtifact identifier="level1-1" type="application/vnd.ant.code" language="javascript" title="Game/assets/levels/World1/level1-1.js">
// Game/assets/levels/World1/level1-1.js
const LEVEL_1_1 = {
    metadata: {
        id: "1-1",
        name: "Green Beginnings",
        difficulty: "Easy",
        timeLimit: 180, // seconds
        targetScore: 1000
    },

    // Tile mapping: 0 = air, 1 = grass platform, 2 = solid block, 3 = hazard
    layout: [
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [2, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 2],
        [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [2, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 2],
        [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    ],

    entities: {
        player: {
            startPosition: { x: 2, y: 2 }
        },
        collectibles: [
            { type: "coin", position: { x: 4, y: 3 }, value: 100 },
            { type: "coin", position: { x: 8, y: 3 }, value: 100 },
            { type: "powerup", position: { x: 6, y: 5 }, type: "speed" }
        ],
        enemies: [
            {
                type: "basic",
                position: { x: 6, y: 4 },
                patrol: {
                    points: [{ x: 4, y: 4 }, { x: 8, y: 4 }],
                    speed: 2
                }
            }
        ],
        checkpoints: [
            { position: { x: 10, y: 5 } }
        ]
    },

    objectives: [
        {
            id: "collect_coins",
            type: "collection",
            target: 2,
            description: "Collect all coins"
        },
        {
            id: "reach_end",
            type: "checkpoint",
            target: "finish",
            description: "Reach the end of the level"
        }
    ],

    environment: {
        background: {
            layers: [
                { image: "bg_sky.png", scrollSpeed: 0.1 },
                { image: "bg_clouds.png", scrollSpeed: 0.3 },
                { image: "bg_mountains.png", scrollSpeed: 0.5 }
            ]
        },
        lighting: {
            ambient: 1.0,
            sources: [
                { type: "directional", direction: "right", intensity: 0.7 }
            ]
        }
    }
};

export default LEVEL_1_1;
</antArtifact><antArtifact identifier="level1-2" type="application/vnd.ant.code" language="javascript" title="Game/assets/levels/World1/level1-2.js">
// Game/assets/levels/World1/level1-2.js
const LEVEL_1_2 = {
    metadata: {
        id: "1-2",
        name: "Rolling Hills",
        difficulty: "Easy",
        timeLimit: 240,
        targetScore: 1500
    },

    layout: [
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 2],
        [2, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2],
        [2, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2],
        [2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    ],

    entities: {
        player: {
            startPosition: { x: 2, y: 2 }
        },
        collectibles: [
            { type: "coin", position: { x: 4, y: 2 }, value: 100 },
            { type: "coin", position: { x: 9, y: 2 }, value: 100 },
            { type: "coin", position: { x: 7, y: 3 }, value: 100 },
            { type: "gem", position: { x: 11, y: 4 }, value: 500 }
        ],
        enemies: [
            {
                type: "walker",
                position: { x: 6, y: 5 },
                patrol: {
                    points: [{ x: 4, y: 5 }, { x: 8, y: 5 }],
                    speed: 2
                }
            },
            {
                type: "flyer",
                position: { x: 10, y: 3 },
                patrol: {
                    points: [{ x: 8, y: 2 }, { x: 12, y: 4 }],
                    speed: 3
                }
            }
        ],
        checkpoints: [
            { position: { x: 7, y: 5 } },
            { position: { x: 12, y: 7 } }
        ]
    },

    objectives: [
        {
            id: "collect_coins",
            type: "collection",
            target: 3,
            description: "Collect at least 3 coins"
        },
        {
            id: "find_gem",
            type: "collection",
            target: 1,
            description: "Find the hidden gem"
        },
        {
            id: "reach_end",
            type: "checkpoint",
            target: "finish",
            description: "Reach the end of the level"
        }
    ],

    environment: {
        background: {
            layers: [
                { image: "bg_sky.png", scrollSpeed: 0.1 },
                { image: "bg_clouds.png", scrollSpeed: 0.3 },
                { image: "bg_hills.png", scrollSpeed: 0.5 },
                { image: "bg_trees.png", scrollSpeed: 0.7 }
            ]
        },
        lighting: {
            ambient: 0.9,
            sources: [
                { type: "directional", direction: "right", intensity: 0.8 },
                { type: "point", position: { x: 11, y: 4 }, intensity: 0.3, color: "blue" }
            ]
        },
        particles: [
            {
                type: "leaves",
                spawnRate: 0.5,
                direction: { x: -1, y: 0.2 },
                speed: 1
            }
        ]
    }
};

export default LEVEL_1_2;
</antArtifact><antArtifact identifier="tileset-config" type="application/vnd.ant.code" title="Game/assets/levels/World1/tileset.js">
// Game/assets/levels/World1/tileset.js
const WORLD_1_TILESET = {
    tileSize: 32,
    tiles: {
        0: {
            id: "air",
            solid: false,
            texture: null
        },
        1: {
            id: "grass_platform",
            solid: true,
            texture: "grass_platform.png",
            variants: ["grass_platform_left.png", "grass_platform_middle.png", "grass_platform_right.png"],
            autoTile: true,
            collider: {
                type: "rectangle",
                offset: { x: 0, y: 0 },
                size: { width: 32, height: 32 }
            }
        },
        2: {
            id: "solid_block",
            solid: true,
            texture: "solid_block.png",
            variants: [
                "solid_block_top.png",
                "solid_block_middle.png",
                "solid_block_bottom.png"
            ],
            autoTile: true,
            collider: {
                type: "rectangle",
                offset: { x: 0, y: 0 },
                size: { width: 32, height: 32 }
            }
        },
        3: {
            id: "hazard_spikes",
            solid: false,
            texture: "spikes.png",
            damage: 1,
            collider: {
                type: "triangle",
                offset: { x: 0, y: 16 },
                size: { width: 32, height: 16 }
            }
        }
    },

    decorations: {
        "flower_red": {
            texture: "flower_red.png",
            layer: "foreground",
            randomize: {
                rotation: [-5, 5],
                scale: [0.9, 1.1]
            }
        },
        "flower_yellow": {
            texture: "flower_yellow.png",
            layer: "foreground",
            randomize: {
                rotation: [-5, 5],
                scale: [0.9, 1.1]
            }
        },
        "grass_tall": {
            texture: "grass_tall.png",
            layer: "foreground",
            animate: {
                type: "wave",
                speed: 1,
                amplitude: 5
            }
        },
        "bush_small": {
            texture: "bush_small.png",
            layer: "background"
        }
    },

    animations: {
        "grass_wave": {
            frames: ["grass_1.png", "grass_2.png", "grass_3.png", "grass_2.png"],
            frameRate: 8,
            loop: true
        },
        "flower_sway": {
            frames: ["flower_1.png", "flower_2.png", "flower_3.png", "flower_2.png"],
            frameRate: 6,
            loop: true
        }
    },

    rules: {
        autotiling: {
            "grass_platform": {
                neighbors: {
                    top: [0],
                    right: [1, 2],
                    bottom: [1, 2],
                    left: [1, 2]
                }
            },
            "solid_block": {
                neighbors: {
                    top: [2],
                    right: [2],
                    bottom: [2],
                    left: [2]
                }
            }
        },
        decoration: {
            "grass_platform": {
                top: {
                    decorations: ["flower_red", "flower_yellow", "grass
