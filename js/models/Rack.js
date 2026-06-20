export class Rack {
    constructor(id, name, totalUnits = 42) {
        this.id = id || crypto.randomUUID();
        this.name = name || 'Nuevo Rack';
        this.totalUnits = totalUnits;
        this.devices = []; // Array of Device objects
    }

    addDevice(device, unitPosition) {
        device.position = unitPosition;
        this.devices.push(device);
    }

    removeDevice(deviceId) {
        this.devices = this.devices.filter(d => d.id !== deviceId);
    }

    getAvailableUnits() {
        return this.totalUnits - this.devices.reduce((acc, dev) => acc + dev.units, 0);
    }
}
