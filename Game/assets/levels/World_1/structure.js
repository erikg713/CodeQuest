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

export 
