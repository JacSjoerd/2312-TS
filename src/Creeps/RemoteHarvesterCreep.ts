import { CreepTypes, REMOTE_CARRIER, REMOTE_HARVESTER } from "utils/constants";
import { ControlledCreep } from "./ControlledCreep";

export class RemoteHarvesterCreep extends ControlledCreep {

    constructor(id: Id<Creep>) {
        super(id);
    }

    setStatus() {
        if (this.memory.harvesting && this.store.getFreeCapacity() == 0 && this.room.find(FIND_CONSTRUCTION_SITES).length) {
            this.memory.harvesting = false;
        }

        if (!this.memory.harvesting && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.harvesting = true;
        }
    }

    buildContainer(): void {
        let closeByContainerConstruction = this.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_CONTAINER;
            }
        })
        if (!closeByContainerConstruction.length) {
            this.room.createConstructionSite(this.pos.x, this.pos.y, STRUCTURE_CONTAINER);
        }
    }

    containerNeedsRepair(container: StructureContainer): boolean {
        if (container.hits < container.hitsMax) {
            this.repair(container);
            return true;
        }
        return false;
    }

    checkForNeededCarrier(container: StructureContainer): boolean {
        if (container.store[RESOURCE_ENERGY] > 1000 && !(Game.time % 100)) {
            this.addRemoteCarrier();
            return true;
        }
        return false;
    }

    addRemoteHarvester(sourceId: string): void {
        let supportedRoom = Game.rooms[this.memory.room];
        supportedRoom.memory.buildList.push({ remote_harvester: { role: REMOTE_HARVESTER, room: supportedRoom.name, targetRoom: this.room.name, harvestFrom: sourceId } })
    }

    addRemoteCarrier(): void {
        let supportedRoom = Game.rooms[this.memory.room];
        supportedRoom.memory.buildList.push({ remote_carrier: { role: REMOTE_CARRIER, room: supportedRoom.name, targetRoom: this.room.name } })
    }

    setTravelTime(target: Source | Mineral<MineralConstant>): void {
        if (this.memory.travelTime == null &&
            this.pos.getRangeTo(target.pos) <= 2) {
            this.memory.travelTime = Game.time - this.memory.bornAt;
        }
    }

    run() {
        if (this.spawning) {
            return;
        }

        if (this.memory.travelTime != null && this.ticksToLive == this.memory.travelTime) {
            if (this.memory.harvestFrom != undefined) {
                this.addRemoteHarvester(this.memory.harvestFrom);
            }
        }

        if (this.memory.targetRoom == this.room.name) {
            this.setStatus();
            if (this.memory.harvesting) {
                if (this.memory.harvestFrom != null) {
                    let target = Game.getObjectById(this.memory.harvestFrom);
                    if (target != null) {
                        let result = this.harvest(target);
                        this.setTravelTime(target);

                        if (result == ERR_NOT_IN_RANGE) {
                            this.moveTo(target);
                            return;
                        }

                        if (result == OK) {
                            let closeByContainer = this.pos.findInRange(FIND_STRUCTURES, 1, {
                                filter: function (structure) {
                                    return structure.structureType == STRUCTURE_CONTAINER;
                                }
                            })[0] as StructureContainer;
                            if (closeByContainer != null) {
                                if (!this.containerNeedsRepair(closeByContainer)) {
                                    this.transfer(closeByContainer, RESOURCE_ENERGY);
                                }
                                this.checkForNeededCarrier(closeByContainer);
                            } else {
                                this.buildContainer();
                            }
                        }

                    }
                }
            } else {
                let constructionSite = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                if (constructionSite != null) {
                    this.moveTo(constructionSite);
                    this.build(constructionSite);
                }
            }
        } else {
            this.moveToRoom(this.memory.targetRoom);
        }
    }
}
