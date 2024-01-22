import { ControlledRoom } from "ControlledRoom";
import { UpgradeRoom } from "roomHelpers/UpgradeRoom";
import { CreepFactory } from "./CreepFactory";
import { Config } from "../utils/Config";
import { OCCUPIER, REMOTE_HARVESTER, SWORD } from "utils/constants";

export class ConquerRoom {
    roomToConquer: Room;
    config: Config;

    constructor(
        public myRoom: ControlledRoom,
    ) {
        this.roomToConquer = Game.rooms[myRoom.room.memory.attackTarget];
        this.config = Config.getConfig();
    }

    run(): void {
        if (!this.isAtWar() || this.hasSafeMode()) {
            return;
        }

        console.log(`${this.myRoom.room.name} is at war with ${this.myRoom.room.memory.attackTarget}.`)

        this.spawnCreeps();

        if (this.roomToConquer != null &&
            this.roomToConquer.controller != undefined &&
            this.roomToConquer.controller.my) {
            // start building the room
            if (this.roomToConquer.memory.level < this.roomToConquer.controller.level) {
                let roomUpgrade = new UpgradeRoom(this.roomToConquer);
                roomUpgrade.run();
            }
        }

        // if (this.remoteHarvesters.length < maxRemoteHarvesters) {
        //     var creepBody = this.creepBody(REMOTE_HARVESTER);
        //     var creepName = REMOTE_HARVESTER + "_" + this.name + "_" + Game.time
        //     let targetSource = roomToOccupy.memory.nextSource | 0;
        //     let targetSourceId = roomToOccupy.find(FIND_SOURCES)[targetSource].id;
        //     if(this.spawns[0].spawnCreep(creepBody, creepName, {
        //                 memory: {role: REMOTE_HARVESTER, room: this.name, targetRoom: this.room.memory.attackTarget, harvesting: false, harvestFrom: targetSourceId}
        //             }) == OK) {
        //         roomToOccupy.memory.nextSource = (roomToOccupy.memory.nextSource == 0 || roomToOccupy.memory.nextSource == null) ? 1 : 0;
        //         console.log(`${this.spawns[0].name} spawned ${creepName}`)
        //     }
        //     return;
        // }

    }

    isAtWar(): boolean {
        if (this.roomToConquer != null &&
            this.roomToConquer.controller != undefined &&
            this.roomToConquer.controller.my &&
            this.roomToConquer.controller.level > 2 &&
            this.roomToConquer.find(FIND_MY_SPAWNS).length) {
            delete this.myRoom.room.memory.attackTarget;
        }

        if (this.myRoom.room.memory.attackTarget == null) {
            console.log(`${this.myRoom.room.name} is not at war.`)
            return false;
        } else {
            console.log(`${this.myRoom.room.name} is at war with ${this.myRoom.room.memory.attackTarget}.`)
            return true;
        }
    }

    hasSafeMode(): boolean {
        if (this.roomToConquer != null && this.roomToConquer.controller != null && this.roomToConquer.controller.safeMode) {
            delete this.myRoom.room.memory.attackTarget;
            console.log(`Room ${this.roomToConquer.name} has Safemode on.`);
            Game.notify(`Room ${this.roomToConquer.name} has Safemode on.`);
            return true;
        }

        return false;
    }

    spawnCreeps(): void {
        console.log('Spawns: ' + this.myRoom.spawns.length);

        if (this.myRoom.spawns.length == 0) {
            return;
        }

        console.log(`Spawning war creeps in ${this.myRoom.room.name}`);
        let creepFactory = new CreepFactory(this.myRoom);
        let nrOftypeAvailable: number | undefined;

        nrOftypeAvailable = this.myRoom.rolesAvailable.get(SWORD);
        if (this.myRoom.room.memory.attackTarget && (nrOftypeAvailable == undefined || nrOftypeAvailable < this.config.maxSwords)) {
            creepFactory.createCreep(SWORD, creepFactory.getCreepMemory(SWORD));
            return;
        }

        nrOftypeAvailable = this.myRoom.rolesAvailable.get(OCCUPIER);
        if (this.myRoom.room.memory.attackTarget && (nrOftypeAvailable == undefined || nrOftypeAvailable < this.config.maxOccupiers)) {
            creepFactory.createCreep(OCCUPIER, creepFactory.getCreepMemory(OCCUPIER));
            return;
        }

        nrOftypeAvailable = this.myRoom.rolesAvailable.get(REMOTE_HARVESTER);
        if (this.myRoom.room.memory.attackTarget && (nrOftypeAvailable == undefined || nrOftypeAvailable < this.config.maxOccupiers)) {
            creepFactory.createCreep(REMOTE_HARVESTER, creepFactory.getCreepMemory(REMOTE_HARVESTER));
            return;
        }
    }


}
