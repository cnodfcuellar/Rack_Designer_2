export class Cable {
    constructor(id, type, color, length) {
        this.id = id || crypto.randomUUID();
        this.type = type || 'Cat6'; // e.g., Cat6, Fiber
        this.color = color || 'blue';
        this.length = length || 1.0; // en metros
        this.sourceEndpoint = null;
        this.targetEndpoint = null;
    }

    connect(sourceEndpoint, targetEndpoint) {
        this.sourceEndpoint = sourceEndpoint;
        this.targetEndpoint = targetEndpoint;
    }
}
