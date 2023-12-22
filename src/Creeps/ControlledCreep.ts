export class ControlledCreep extends Creep {

    constructor(id: Id<Creep>) {
        super(id);
    }

    findSourceDelivery(): Structure | Creep | null {
        var targetStructures = this.room.find(FIND_MY_STRUCTURES, {filter: function(structure) {
            return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) &&
                    structure.store !== null &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }});
        if (targetStructures.length) {
            return (targetStructures[0]);
        } else {
            var targetCreeps = this.room.find(FIND_MY_CREEPS, {filter: function(creep) {
                return (creep.memory.role == 'upgrader'|| creep.memory.role == 'builder') &&
                        creep.store.getFreeCapacity() > 25;
            }})

            if (targetCreeps.length) {
                return targetCreeps[0];
            } else {
                return null;
            }
        }
    }
}
