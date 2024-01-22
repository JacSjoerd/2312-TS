import { Config } from "utils/Config";
import { ControlledRoom } from "../ControlledRoom";
import { HARVESTER, BUILDER, UPGRADER, CARRIER, SWORD, OCCUPIER, REMOTE_HARVESTER, CreepTypes, REMOTE_CARRIER } from "../utils/constants";

export class CreepFactory {
    config: Config;

    constructor(
        private controlledRoom: ControlledRoom){
        this.config = Config.getConfig();
    }

    getCreepName(creepType: CreepTypes): string {
        return creepType + "_" + this.controlledRoom.name + "_" + Game.time

    }

    getCreepBody(creepType: CreepTypes): (BodyPartConstant)[] {
        let energyCapacityAvailable = this.controlledRoom.room.energyCapacityAvailable;
        let energyAvailable = this.controlledRoom.room.energyAvailable;
        let body:(BodyPartConstant)[] = [];
        let baseBodyCost: number;
        let bodyParts: number;

        switch(creepType) {
            case HARVESTER:
                let harvestersAvailable = this.controlledRoom.rolesAvailable.get(HARVESTER);
                if ((harvestersAvailable == undefined && energyAvailable < 500) || energyCapacityAvailable < 500) {
                    body = [WORK, WORK, CARRY, MOVE];
                } else if (energyCapacityAvailable >= 800) {
                    body = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
                } else { // 500 <= energyCapacityAvailable < 800
                    body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                }
                console.log(`Harvester body: ${body}`);
                return body;

            case UPGRADER:
                baseBodyCost = 300; // for each [WORK, WORK, CARRY, MOVE]
                bodyParts = Math.floor(energyCapacityAvailable / baseBodyCost);
                bodyParts = bodyParts > 6 ? 6 : bodyParts;
                for (let i = 0; i < bodyParts; i++) {
                    body.push(WORK, WORK, CARRY, MOVE);
                }
                console.log(`Upgrader body: ${body}`);
                return body;

            case BUILDER:
                baseBodyCost = 300; // for each [WORK, WORK, CARRY, MOVE]
                bodyParts = Math.floor(energyCapacityAvailable / baseBodyCost);
                bodyParts = bodyParts > 6 ? 6 : bodyParts;
                for (let i = 0; i < bodyParts; i++) {
                    body.push(WORK, WORK, CARRY, MOVE);
                }
                console.log(`Builder body: ${body}`);
                return body;

            case CARRIER:
                baseBodyCost = 100 // for each [CARRY, MOVE]
                bodyParts = Math.floor((energyCapacityAvailable / 2) / baseBodyCost)
                bodyParts = bodyParts > 10 ? 10 : bodyParts;
                for (let i = 0; i < bodyParts; i++) {
                    body.push(CARRY, MOVE);
                }
                console.log(`Carrier body: ${body}\nEnergy capacity: ${energyCapacityAvailable}`);
                return body;

            case SWORD:
                baseBodyCost = 130 // for each [ATTACK, MOVE]
                bodyParts = Math.floor((energyCapacityAvailable / 2) / baseBodyCost)
                bodyParts = bodyParts > 8 ? 8 : bodyParts;
                for (let i = 0; i < bodyParts; i++) {
                    body.push(ATTACK, MOVE);
                }
                console.log(`Sword body: ${body}`);
                return body;

            case OCCUPIER:
                console.log(`Occupier body: [CLAIM, CLAIM, MOVE, MOVE]`);
                return [CLAIM, CLAIM, MOVE, MOVE];

            case REMOTE_HARVESTER:
                console.log(`RemoteHarvester body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE]`);
                return [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];

            case REMOTE_CARRIER:
                console.log(`RemoteCarrier body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]`);
                return [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
            }
    }

    getCreepMemory(creepType: CreepTypes): CreepMemory {
        const memory:CreepMemory = {
            room: this.controlledRoom.name,
            role:  creepType
        };
        switch (creepType) {
            case HARVESTER:
                memory.bornAt = Game.time;
                memory.travelTime = null;
                memory.harvesting = false;
                memory.carrierClose = true;
                break;
            case BUILDER:
                memory.upgrading = false;
                break;
            case UPGRADER:
                memory.upgrading = false;
                break;
            case CARRIER:
                memory.delivering = false;
                memory.deliverAt = null;
                memory.pickupFrom = null;
                break;
            case SWORD:
                memory.targetRoom = this.controlledRoom.room.memory.attackTarget;
                memory.task = "clear";
                break;
            case OCCUPIER:
                memory.targetRoom = this.controlledRoom.room.memory.attackTarget;
                break;
            case REMOTE_HARVESTER:
                memory.targetRoom = this.controlledRoom.room.memory.attackTarget;
                memory.harvesting = false;
                memory.harvestFrom = null;
                break;

            default:
                console.log(`Unspecified memory for ${creepType} at CreepFactory.getCreepMemory()`);
                break;
        }

        return memory;
    }

    createCreep(creepType: CreepTypes, creepMemory: CreepMemory): ScreepsReturnCode {
        let creepBody = this.getCreepBody(creepType);
        let creepName = this.getCreepName(creepType);

        // Spawn at 1st spawn that is not spawning a creep
        let result: ScreepsReturnCode;
        let creepTypeAvailable = this.controlledRoom.rolesAvailable.get(creepType);
        console.log(`Trying to build ${creepType}, available ${creepTypeAvailable}`);
        if (creepTypeAvailable == undefined || (creepTypeAvailable != undefined && creepTypeAvailable <= this.config.max(creepType))) {
            result = this.controlledRoom.spawns[0].spawnCreep(creepBody, creepName, {memory: creepMemory});
        } else {
            result = ERR_FULL;
        }

        if (result == OK || result == ERR_FULL) {
            this.controlledRoom.room.memory.buildList.shift();
        }
        return result
    }

    createFromBuildList(): ScreepsReturnCode {
        if (this.controlledRoom.room.memory.buildList.length) {
            let creep = this.controlledRoom.room.memory.buildList[0];
            let creepRole = Object.keys(creep)[0];
            let memoryExtension = creep[creepRole];
            let memory: CreepMemory;

            switch (creepRole) {
                case HARVESTER:
                    memory = this.getCreepMemory(HARVESTER);
                    memory.harvestFrom = memoryExtension.harvestFrom;
                    return this.createCreep(HARVESTER, memory);

                case CARRIER:
                    memory = this.getCreepMemory(CARRIER);
                    return this.createCreep(CARRIER, memory);

                case OCCUPIER:
                    memory = this.getCreepMemory(OCCUPIER);
                    return this.createCreep(OCCUPIER, memoryExtension);

                case REMOTE_HARVESTER:
                    memoryExtension.bornAt = Game.time;
                    return this.createCreep(REMOTE_HARVESTER, memoryExtension);

                case REMOTE_CARRIER:
                    return this.createCreep(REMOTE_CARRIER, memoryExtension);

                default:
                    console.log(`No build plan for ${creepRole} in CreepFactory.createFromBuildList()`);
                    Game.notify(`No build plan for ${creepRole} in CreepFactory.createFromBuildList()`);
                    break;
            }
            console.log(`Creeps in list in room ${this.controlledRoom.room.name}: ${this.controlledRoom.room.memory.buildList.length}`);
        }

        return ERR_NOT_FOUND;
    }

    run(): void{
        if (this.controlledRoom.spawns.length == 0) {
            console.log(`All spawns of ${this.controlledRoom.name} are busy`);
            return;
        }

        let result = this.createFromBuildList();
        console.log(`Result from createFromBuild: ${result}`);
        if (result == ERR_FULL) {
            return;
        };

        let harvestersAvailable = this.controlledRoom.rolesAvailable.get(HARVESTER);
        if (harvestersAvailable == undefined || harvestersAvailable < this.controlledRoom.sources.length) {
            this.createCreep(HARVESTER, this.getCreepMemory(HARVESTER));
            return;
        }

        let carriersAvailable = this.controlledRoom.rolesAvailable.get(CARRIER);
        if (carriersAvailable == undefined || carriersAvailable < this.controlledRoom.config.minCarriers) {
            if(this.createCreep(CARRIER, this.getCreepMemory(CARRIER)) == OK) {
                this.controlledRoom.room.memory.addCarrier = false;
            }
            return;
        }

        let buildersAvailable = this.controlledRoom.rolesAvailable.get(BUILDER);
        if (buildersAvailable == undefined || buildersAvailable < this.controlledRoom.config.maxBuilders) {
            this.createCreep(BUILDER,this.getCreepMemory(BUILDER));
            return;
        }

        let upgradersAvailable = this.controlledRoom.rolesAvailable.get(UPGRADER);
        if (upgradersAvailable == undefined || (this.controlledRoom.room.memory.addUpgrader && upgradersAvailable < this.controlledRoom.config.maxUpgraders)) {
            this.controlledRoom.room.memory.addUpgrader = false;
            this.createCreep(UPGRADER, this.getCreepMemory(UPGRADER));
            return;
        }


    }
}
