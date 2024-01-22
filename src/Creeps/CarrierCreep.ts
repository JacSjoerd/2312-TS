import { ControlledCreep } from "./ControlledCreep";

export class CarrierCreep extends ControlledCreep {
    constructor(id: Id<Creep>) {
        super(id);
        this.setStatus();
    }

    setStatus(): void{
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
            target.store.getFreeCapacity() == 0){
                return true;
            }

        if (target instanceof Creep && target.store.getFreeCapacity() < 25){
            return true;
        }

        return false;
    }

    run(){
        if (this.spawning) {
            return;
        }

        if (this.room.name != this.memory.room) {
            this.moveToRoom(this.memory.room);
            return;
        }

        if (this.memory.delivering) {
            // Check for correct init and for dead/destroyed target.
            if (this.memory.deliverAt == null || Game.getObjectById(this.memory.deliverAt) == null) {
                this.memory.deliverAt = this.planEnergyDelivery();
            }

            if (this.memory.deliverAt != null) {
                let target = Game.getObjectById(this.memory.deliverAt);
                if (target != null) {
                    var result = this.transfer(target, RESOURCE_ENERGY);
                    if (result == OK || result == ERR_FULL) {
                        this.memory.deliverAt = null;
                        return;
                    }
                    if (result == ERR_NOT_IN_RANGE) {
                        this.moveTo(target);
                        return;
                    }
                } else {
                    this.memory.deliverAt = this.planEnergyDelivery();
                    if (this.memory.deliverAt != null) {
                        target = Game.getObjectById(this.memory.deliverAt);
                        if (target != null) {
                            this.moveTo(target);
                        }
                    }

                }
            }
        } else {
            // Check for correct init and for dead/destroyed target.
            if (this.memory.pickupFrom == null || Game.getObjectById(this.memory.pickupFrom) == null) {
                this.memory.pickupFrom = this.planEnergyPickup();
            }

            if (this.memory.pickupFrom != null) {
                let target = Game.getObjectById(this.memory.pickupFrom);
                if (target != null) {
                    if (target instanceof Structure || target instanceof Ruin || target instanceof Tombstone || target instanceof StructureStorage) {
                        let result = this.withdraw(target, RESOURCE_ENERGY);
                        if (result == OK || result == ERR_NOT_ENOUGH_RESOURCES) {
                            this.memory.pickupFrom = null;
                        }

                        if (result == ERR_NOT_IN_RANGE) {
                            this.moveTo(target);
                        }
                    } else if (target instanceof Resource) {
                        let result = this.pickup(target);
                        if (result == OK) {
                            this.memory.pickupFrom = null;
                        }
                        if (result == ERR_NOT_IN_RANGE) {
                            this.moveTo(target);
                        }
                    } else {
                        if (target instanceof Creep &&  target.store[RESOURCE_ENERGY] == 0) {
                            this.memory.pickupFrom = null;
                        }

                        this.moveTo(target);
                    }
                } else {
                    this.memory.pickupFrom = this.planEnergyPickup();
                    if (this.memory.pickupFrom != null) {
                        target = Game.getObjectById(this.memory.pickupFrom);
                        if (target != null) {
                            this.moveTo(target);
                        }
                    }
                }
            }
        }
    }


}
