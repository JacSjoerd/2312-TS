export abstract class ControlledCreep extends Creep {

    constructor(id: Id<Creep>) {
        super(id);
    }

    abstract run(): void;
    // abstract setStatus(){};

    targetIsFull(target: Structure | Creep): boolean{
        return true;
    };

    moveToRoom(roomName: String | undefined){
        if (roomName == undefined) {
            return;
        }

        const exitDir = Game.map.findExit(this.room, roomName as string);
        if (exitDir == FIND_EXIT_TOP ||
            exitDir == FIND_EXIT_RIGHT ||
            exitDir == FIND_EXIT_BOTTOM ||
            exitDir ==  FIND_EXIT_LEFT){
            const exit = this.pos.findClosestByPath(exitDir);
            if (exit != null) {
                this.moveTo(exit);
            }
        }
    }

    planEnergyDelivery(): Id<Structure | Creep> | null {
        // find Spawn and extensions
        let targetStructure = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: function(structure) {
            return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) &&
                    structure.store !== null &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }});
        if (targetStructure != null) {
            return (targetStructure.id);
        }

        // find Towers
        let creepStore = this.store;
        let targetTower = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: function(structure) {
            return (structure.structureType == STRUCTURE_TOWER &&
                    structure.store !== null &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) >= creepStore[RESOURCE_ENERGY]);
        }});
        if (targetTower != null) {
            return (targetTower.id);
        }

        // find Builders
        var targetCreep = this.pos.findClosestByPath(FIND_MY_CREEPS, {ignoreCreeps: true, filter: function(creep) {
            let count = 0;
            creep.body.forEach(function(part) {if (part.type == WORK) {count++}})
            return (creep.memory.role == 'builder') &&
                    creep.store.getFreeCapacity() > (count * 5);
        }})
        if (targetCreep != null) {
            return targetCreep.id;
        }

        // find Upgraders
        var targetCreep = this.pos.findClosestByPath(FIND_MY_CREEPS, {ignoreCreeps: true, filter: function(creep) {
            return (creep.memory.role == 'upgrader') &&
                    creep.store.getFreeCapacity() > 25;
        }})
        if (targetCreep != null) {
            return targetCreep.id;
        }

        // find Storage
        let targetStorage = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {ignoreCreeps: true, filter: function(structure) {
            return structure.structureType == STRUCTURE_STORAGE &&
                structure.store.getFreeCapacity() > 0;
        }})
        if (targetStorage != null) {
            this.room.memory.addUpgrader = true;
            return targetStorage.id;
        }

        // console.log(`Nowhere to deliver energy in room ${this.room.name}!`);
        this.room.memory.addUpgrader = true;
        return null;
    }

    planEnergyPickup(): Id<Structure | Ruin | Tombstone| Creep | Resource> | null {
        // find dropped energy
        let targetEnergy = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {ignoreCreeps: true, filter: function(resource) {
            return resource.resourceType == RESOURCE_ENERGY;
        }})
        if (targetEnergy != null) {
            return targetEnergy.id;
        }

        // find containers
        let targetContainer = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: function(structure) {
            return structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store[RESOURCE_ENERGY] > 200;
        }})
        if (targetContainer != null) {
            return targetContainer.id;
        }

        // find harvesters
        let targetCreep = this.pos.findClosestByPath(FIND_MY_CREEPS, {ignoreCreeps: true, filter: function(creep) {
            return (creep.memory.role == 'harvester' && creep.memory.carrierClose == false);
        }});
        if (targetCreep != null) {
            return (targetCreep.id);
        }

        // find Ruins
        let targetRuin = this.pos.findClosestByPath(FIND_RUINS, {ignoreCreeps: true, filter: function(ruin) {
            return ruin.store[RESOURCE_ENERGY] > 0;
        }})
        if (targetRuin != null) {
            return targetRuin.id;
        }

        // find Tombstones
        let targetTombstone = this.pos.findClosestByPath(FIND_TOMBSTONES, {ignoreCreeps: true, filter: function(tombstone) {
            return tombstone.store[RESOURCE_ENERGY] > 0;
        }})
        if (targetTombstone != null) {
            return targetTombstone.id;
        }

        // find Links
        let targetLinks = this.pos.findClosestByPath(FIND_MY_STRUCTURES,{filter: function(structure) {
            return structure.structureType == STRUCTURE_LINK &&
                    structure.store[RESOURCE_ENERGY] > 300;
        }})
        if (targetLinks != null) {
            return targetLinks.id;
        }


        // find storage
        let storage = this.room.find(FIND_MY_STRUCTURES, {filter: function(structure) {
            return structure.structureType == STRUCTURE_STORAGE &&
                    structure.store[RESOURCE_ENERGY] > 200;
        }})
        if (storage.length) {
            return storage[0].id;
        }

        // console.log(`No energy to be picked up in room ${this.room.name}!`)
        return null;
    }
}
