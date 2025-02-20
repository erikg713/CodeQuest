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
