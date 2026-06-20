export class Device {
    constructor(id, name, manufacturer, model, units = 1) {
        this.id = id || crypto.randomUUID();
        this.name = name || 'Nuevo Dispositivo';
        this.manufacturer = manufacturer || 'Genérico';
        this.model = model || 'Genérico';
        this.units = units;
        this.ports = [];
        this.position = null; // Posición en U dentro del rack
    }
}
