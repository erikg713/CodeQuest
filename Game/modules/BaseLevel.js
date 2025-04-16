class BaseLevel {
    constructor(metadata, layout, entities, environment) {
        this.metadata = metadata;
        this.layout = layout;
        this.entities = entities;
        this.environment = environment;
    }

    loadEntities(entities) {
        this.entities = entities.map(entity => new Entity(entity.type, entity.position, entity.properties));
    }
}

class GrasslandLevel extends BaseLevel {
    constructor(metadata, layout, entities, environment, theme) {
        super(metadata, layout, entities, environment);
        this.theme = theme; // World-specific elements like background music
    }
}
