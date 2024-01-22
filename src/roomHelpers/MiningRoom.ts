import { CreepTypes, OCCUPIER, REMOTE_CARRIER, REMOTE_HARVESTER } from "utils/constants";
import { SupportingRoom } from "./SupportingRoom"
import { OccupyCreep } from "Creeps/OccupyCreep";
import { RemoteHarvesterCreep } from "Creeps/RemoteHarvesterCreep";
import { RemoteCarrierCreep } from "Creeps/RemoteCarrierCreep";
import { Config } from "utils/Config";

export interface iMiningRoomMemory {
    name: string;
    controllingRoomName: string;

}

export class MiningRoom {
    room: Room;
    supportedRoom: Room;
    config: Config;

    claimers: OccupyCreep[];
    harvesters: RemoteHarvesterCreep[];
    carriers: RemoteCarrierCreep[];

    constructor(public name: string, public supportedRoomName: string){
        this.room = Game.rooms[name];
        this.supportedRoom = Game.rooms[supportedRoomName];
        this.config = Config.getConfig();
        this.claimers = [];
        this.harvesters = [];
        this.carriers = [];
    }

    creepTypeInBuildList(role: CreepTypes): boolean {
        for (let creep of this.supportedRoom.memory.buildList) {
            if (creep[role] != null && creep[role].targetRoom == this.name){
                return true;
            }
        }
        return false;
    }

    addClaimer(): void {
        if (!this.creepTypeInBuildList(OCCUPIER) && !this.claimers.length) {
            this.supportedRoom.memory.buildList.push({occupier: {role: OCCUPIER, room: this.supportedRoomName, targetRoom: this.name, action: 'reserve'}})
        }
    }

    addRemoteHarvester(sourceId: string): void {
        if (!this.creepTypeInBuildList(REMOTE_HARVESTER)) {
            this.supportedRoom.memory.buildList.push({remote_harvester: {role: REMOTE_HARVESTER, room: this.supportedRoomName, targetRoom: this.name, harvestFrom: sourceId}})
        }
    }

    run(): void {
        if (Game.rooms[this.name] == undefined)  {
            this.addClaimer();
        } else {
            if (!this.harvesters.length && !this.creepTypeInBuildList(REMOTE_HARVESTER)) {
                for (let source of this.room.find(FIND_SOURCES)) {
                    this.addRemoteHarvester(source.id);
                }
            }

            if (this.room.controller != null && this.room.controller.reservation != null && this.room.controller.reservation.ticksToEnd < 2000) {
                this.addClaimer();
            }
        }

        console.log(`Mining room ${this.name} has cl: ${this.claimers.length}, ha: ${this.harvesters.length}, ca: ${this.carriers.length} `);
    }



    assign(creep: Creep): number {
        let role = creep.memory.role;
        switch (role) {
            case OCCUPIER:
                return this.claimers.push(new OccupyCreep(creep.id));

            case REMOTE_HARVESTER:
                return this.harvesters.push(new RemoteHarvesterCreep(creep.id));

            case REMOTE_CARRIER:
                return this.carriers.push(new RemoteCarrierCreep(creep.id));

            default:
                return 0;
        }
    }


}
