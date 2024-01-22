import { ControlledRoom } from "../ControlledRoom";
import { HARVESTER, BUILDER, UPGRADER, CARRIER, SWORD, OCCUPIER, REMOTE_HARVESTER, CreepTypes } from "../utils/constants";

export class ControlledSpawn extends StructureSpawn {

    constructor(id: Id<StructureSpawn>){
        super(id);
    }

    creepName(creepType: CreepTypes): string {
        return creepType + "_" + this.name + "_" + Game.time

    }

    creepBody(creepType: CreepTypes): (BodyPartConstant)[] {
        var energyCapacityAvailable = this.room.energyCapacityAvailable;
        let energyAvailable = this.room.energyAvailable;
        var body:(BodyPartConstant)[] = [];

        switch(creepType) {
            case HARVESTER:
                let harvestersAvailable = 1 // this.rolesAvailable.get(HARVESTER);
                if (harvestersAvailable == undefined && energyAvailable < 500) {
                    return [WORK, WORK, CARRY, MOVE];
                }
                if (energyCapacityAvailable >= 700) {
                    return [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                }
                if (energyCapacityAvailable >= 500) {
                    return [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                }
                return [WORK, WORK, CARRY, MOVE];
            case UPGRADER:
                var baseBodyCost = 300; // for each [WORK, WORK, CARRY, MOVE]
                var bodyParts = Math.floor(energyCapacityAvailable / baseBodyCost);
                bodyParts = bodyParts > 4 ? 4 : bodyParts;
                for (let i = 0; i < bodyParts; i++) {
                    body.push(WORK, WORK, CARRY, MOVE);
                }
                console.log(`Upgrader body: ${body}`);
                return body;
            case BUILDER:
                var baseBodyCost = 300; // for each [WORK, WORK, CARRY, MOVE]
                var bodyParts = Math.floor(energyCapacityAvailable / baseBodyCost);
                bodyParts = bodyParts > 4 ? 4 : bodyParts;
                for (let i = 0; i < bodyParts; i++) {
                    body.push(WORK, WORK, CARRY, MOVE);
                }
                console.log(`Builder body: ${body}`);
                return body;
            case CARRIER:
                var baseBodyCost = 100 // for each [CARRY, MOVE]
                var bodyParts = Math.floor((energyCapacityAvailable / 2) / baseBodyCost)
                bodyParts = bodyParts > 8 ? 8 : bodyParts;
                for (let i = 0; i < bodyParts; i++) {

                    body.push(CARRY, MOVE);
                }
                console.log(`Carrier body: ${body}`);
                return body;
            case SWORD:
                var baseBodyCost = 130 // for each [ATTACK, MOVE]
                var bodyParts = Math.floor((energyCapacityAvailable / 2) / baseBodyCost)
                bodyParts = bodyParts > 8 ? 8 : bodyParts;
                for (let i = 0; i < bodyParts; i++) {
                    body.push(ATTACK, MOVE);
                }
                console.log(`Sword body: ${body}`);
                return body;
            case OCCUPIER:
                console.log(`Occupier body: [CLAIM, MOVE]`);
                return [CLAIM, MOVE];
            case REMOTE_HARVESTER:
                console.log(`RemoteHarvester body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE]`);
                return [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
        }
    }

    spawnCreepOfRole(room: ControlledRoom, creepType: CreepTypes): ScreepsReturnCode {
        var creepBody = this.creepBody(creepType);
        var creepName = this.creepName(creepType);

        switch (creepType) {
            case HARVESTER:
                let memory = {
                    role: HARVESTER,
                    room: this.room.name,

                }
                break;

            default:
                break;
        }

        return super.spawnCreep(creepBody, creepName, {
            memory: {role: creepType, room: this.name, upgrading: false}
        })
    }

}
