import { ControlledCreep } from "./ControlledCreep";

export class RemoteCarrierCreep extends ControlledCreep {
    constructor(id: Id<Creep>) {
        super(id);
        this.setStatus();
    }

    setStatus(): void {
        if (this.memory.delivering && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.delivering = false;
            this.memory.pickupFrom = this.planEnergyPickup();
        }

        if (!this.memory.delivering && this.store.getFreeCapacity() == 0) {
            this.memory.delivering = true;
            this.memory.deliverAt = this.planEnergyDelivery();
        }
    }

    targetIsFull(target: Structure | Creep): boolean {
        if ((target instanceof StructureSpawn || target instanceof StructureExtension || target instanceof Creep) &&
            target.store.getFreeCapacity() == 0) {
            return true;
        }

        if (target instanceof Creep && target.store.getFreeCapacity() < 25) {
            return true;
        }

        return false;
    }

    run() {
        if (this.spawning) {
            return;
        }

        if (this.memory.delivering) {
            if (this.memory.room == this.room.name) {
                let dropOff = this.room.find(FIND_MY_STRUCTURES, { filter: function (structure) { return structure.structureType == STRUCTURE_STORAGE } })[0];
                if (dropOff != null) {
                    this.moveTo(dropOff);
                    this.transfer(dropOff, RESOURCE_ENERGY);
                }
            } else {
                this.moveToRoom(this.memory.room);
            }
        } else {
            if (this.memory.targetRoom == this.room.name) {
                let droppedResource = this.room.find(FIND_DROPPED_RESOURCES)[0];
                if (droppedResource == null) {
                    let capacity = this.store.getCapacity();
                    let pickup = this.room.find(FIND_STRUCTURES, {
                        filter: function (structure) {
                            return structure.structureType == STRUCTURE_CONTAINER &&
                                structure.store[RESOURCE_ENERGY] > capacity
                        }
                    })[0];
                    if (pickup != null) {
                        this.moveTo(pickup);
                        this.withdraw(pickup, RESOURCE_ENERGY)
                    }
                } else {
                    this.moveTo(droppedResource);
                    this.pickup(droppedResource);
                }
            } else {
                this.moveToRoom(this.memory.targetRoom);
            }
        }
    }


}
