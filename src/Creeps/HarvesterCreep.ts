import { ControlledCreep } from "./ControlledCreep";

export class HarvesterCreep extends ControlledCreep {

    constructor(id: Id<Creep>) {
        super(id);
        this.setStatus();
        if (this.memory.harvestFrom == null) {this.setSource()};
    }

    setStatus(): void{
        if (this.memory.harvesting && this.store.getFreeCapacity() == 0) {
            this.memory.harvesting = false;
            if(this.room.controller != undefined && this.room.controller.level >= 3) {
                this.room.memory.addCarrier = true;
                this.room.memory.buildList.push({carrier: {room: this.room.name}});
            }
        }

        if (!this.memory.harvesting && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.harvesting = true;
        }
    }

    setSource(): void {
        if (this.room.memory.nextSource == null || this.room.memory.nextSource >= this.room.memory.sources.length) {
            this.room.memory.nextSource = 0;
        };


        this.memory.harvestFrom = this.room.memory.sources[this.room.memory.nextSource];
        console.log(`Source for ${this.name} set to ${this.room.memory.sources[this.room.memory.nextSource]}`)
        this.room.memory.nextSource++;
    }

    run(): void {
        if (this.spawning) {
            return;
        }

        if (this.memory.travelTime != null && this.ticksToLive == this.memory.travelTime) {
            this.room.memory.buildList.unshift({harvester: {harvestFrom: this.memory.harvestFrom}});
        }

        if (this.memory.harvesting) {
            if (this.memory.harvestFrom != null) {
                let target = Game.getObjectById(this.memory.harvestFrom);
                if (target != null) {
                    let result = this.harvest(target);
                    if (this.memory.travelTime == null &&
                        this.pos.getRangeTo(target.pos) <= 2) {
                        this.memory.travelTime = Game.time - this.memory.bornAt;
                    }
                    if (result == ERR_NOT_IN_RANGE) {
                        this.moveTo(target);
                        return;
                    }
                }
            }
        } else {
            if (this.memory.deliverAt != null) {
                let target = Game.getObjectById(this.memory.deliverAt);
                if (target != null) {
                    if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        this.moveTo(target);
                    } else {
                        this.memory.deliverAt = this.planEnergyDelivery();
                    }
                }
            } else {
                this.memory.deliverAt = this.planEnergyDelivery();
            }
        }

        if (this.room.memory.links != null) {
            let closeByLink = this.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: function(structure){
                return structure.structureType == STRUCTURE_LINK;
            }})

            if (closeByLink != null) {
                // console.log(`Link found by ${this.name} in room ${this.room.name}.`);
                this.transfer(closeByLink, RESOURCE_ENERGY);
                this.memory.carrierClose = true;
                return;
            }
        }

        let closeByCreeps = this.pos.findInRange(FIND_MY_CREEPS, 1, {filter: function(creep) {
            return creep.memory.role == 'carrier' && creep.store.getFreeCapacity() > 0;
        }})
        if (closeByCreeps.length) {
            closeByCreeps.sort((a, b) => { return a.store.getFreeCapacity() - b.store.getFreeCapacity()})
            this.memory.carrierClose = true;
            this.transfer(closeByCreeps[0], RESOURCE_ENERGY);
        } else {
            this.memory.carrierClose = false;
        }
    }
}
