import { OccupyCreep } from "Creeps/OccupyCreep";
import { RemoteCarrierCreep } from "Creeps/RemoteCarrierCreep";
import { RemoteHarvesterCreep } from "Creeps/RemoteHarvesterCreep";
import { CreepTypes, OCCUPIER, REMOTE_CARRIER, REMOTE_HARVESTER } from "utils/constants";

export abstract class SupportingRoom {
    room: Room;
    supportedRoom: Room;

    claimers: OccupyCreep[];
    harvesters: RemoteHarvesterCreep[];
    carriers: RemoteCarrierCreep[];

    constructor(public name: string, public supportedRoomName: string){
        this.room = Game.rooms[name];
        this.supportedRoom = Game.rooms[supportedRoomName];
        this.claimers = [];
        this.harvesters = [];
        this.carriers = [];
    };

    abstract run(): void;

    abstract creepTypeInBuildList(role: CreepTypes): boolean;

    abstract assign(creep: Creep): number;

}
