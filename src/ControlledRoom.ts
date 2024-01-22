import { HarvesterCreep } from "Creeps/HarvesterCreep";
import { UpgraderCreep } from "Creeps/UpgraderCreep";
import { BuilderCreep } from "Creeps/BuilderCreep";
import { CarrierCreep } from "Creeps/CarrierCreep";
import { SwordCreep } from "Creeps/SwordCreep";

import { CreepFactory } from "roomHelpers/CreepFactory";
import { UpgradeRoom } from "roomHelpers/UpgradeRoom";
import { OccupyCreep } from "Creeps/OccupyCreep";
import { ConquerRoom } from "roomHelpers/ConquerRoom";
import { RemoteHarvesterCreep } from "Creeps/RemoteHarvesterCreep";
import { Config } from "utils/Config";
import { HARVESTER, BUILDER, UPGRADER, CARRIER, SWORD, OCCUPIER, REMOTE_HARVESTER, CreepTypes, REMOTE_CARRIER } from "utils/constants";
import { ControlledCreep } from "Creeps/ControlledCreep";
import { RemoteCarrierCreep } from "Creeps/RemoteCarrierCreep";
import { min } from "lodash";
import { MiningRoom } from "roomHelpers/MiningRoom";

class SupportingRoom {
    claimers: OccupyCreep[];
    harvesters: RemoteHarvesterCreep[];
    carriers: RemoteCarrierCreep[];

    constructor(public name: string){
        this.claimers = [];
        this.harvesters = [];
        this.carriers = [];
    };

    addClaimer(claimer: OccupyCreep): number {
        return this.claimers.push(claimer);
    }

    addHarvester(harvester: RemoteHarvesterCreep): number {
        return this.harvesters.push(harvester);
    }

    addCarrier(carrier: RemoteCarrierCreep): number {
        return this.carriers.push(carrier);
    }
}

export class ControlledRoom {
    room: Room;
    name: string;
    spawns: StructureSpawn[];
    links: StructureLink[];
    creepsList: Map<string, ControlledCreep>;
    rolesAvailable: Map<string, number>;
    sources: Source[];
    config: Config;
    miningRooms: Map<String, MiningRoom>;


    constructor(room: Room) {
        this.room = room;
        this.name = room.name;
        this.spawns = room.find(FIND_MY_SPAWNS, {filter: function(spawn) {return spawn.spawning == null}});
        this.links = room.find(FIND_MY_STRUCTURES, {filter: function(structure) {return structure.structureType == STRUCTURE_LINK}});
        this.creepsList = new Map<string, ControlledCreep>;
        this.rolesAvailable = new Map<string, number>;
        this.sources = room.find(FIND_SOURCES);
        this.config = Config.getConfig();
        this.miningRooms = new Map<String, MiningRoom>;

        if (room.memory.miningRooms != undefined) {
            for (let miningRoom of room.memory.miningRooms) {
                let roomConstuctor = new MiningRoom(miningRoom, this.name);
                this.miningRooms.set(miningRoom, roomConstuctor);
            }
        }

        // New room, setup default memory structure
        if (this.room.memory.level == undefined) {
            this.room.memory.level = 1;
            room.memory.buildList = room.memory.buildList || [];
            room.memory.miningRooms = room.memory.miningRooms || [];

            room.memory.sources = [];
            for(const i in this.sources){
                room.memory.sources.push(this.sources[i].id)
            }

        }

        if (room.memory.links != null) {
            let numberOfDefinedLinks = Object.keys(room.memory.links).length;
            // console.log(`For room ${this.name} number of defined links in memory: ${numberOfDefinedLinks}`);
            if (numberOfDefinedLinks < this.links.length){
                for (const link of this.links) {
                    if (link.pos.findInRange(FIND_MY_SPAWNS, 2).length) {
                        room.memory.links[link.id] = 'receive';
                    } else {
                        room.memory.links[link.id] = 'send';
                    }
                }
            }
        }
    }


    assign(creep: Creep): void {
        let role = creep.memory.role;
        let roomName: String | undefined;
        switch (role) {
            case HARVESTER:
                this.creepsList.set(creep.name, new HarvesterCreep(creep.id))
                break;

            case CARRIER:
                this.creepsList.set(creep.name, new CarrierCreep(creep.id))
                break;

            case BUILDER:
                this.creepsList.set(creep.name, new BuilderCreep(creep.id))
                break;

            case UPGRADER:
                this.creepsList.set(creep.name, new UpgraderCreep(creep.id))
                break;

            case SWORD:
                this.creepsList.set(creep.name, new SwordCreep(creep.id))
                break;

            case OCCUPIER:
                let occupier = new OccupyCreep(creep.id)
                this.creepsList.set(creep.name, occupier)
                roomName = creep.memory.targetRoom;
                if (roomName != null) {
                    let targetRoom = this.miningRooms.get(roomName)
                    targetRoom?.assign(occupier);
                } else {
                    console.log(`Cannot find target room for ${creep.name}`);
                }
                break;

            case REMOTE_HARVESTER:
                let remoteHarvester = new RemoteHarvesterCreep(creep.id)
                this.creepsList.set(creep.name, remoteHarvester)
                roomName = creep.memory.targetRoom;
                if (roomName != null) {
                    let targetRoom = this.miningRooms.get(roomName)
                    targetRoom?.assign(remoteHarvester);
                } else {
                    console.log(`Cannot find target room for ${creep.name}`);
                }
                break;

            case REMOTE_CARRIER:
                let remoteCarrier = new RemoteCarrierCreep(creep.id)
                this.creepsList.set(creep.name, remoteCarrier)
                roomName = creep.memory.targetRoom;
                if (roomName != null) {
                    let targetRoom = this.miningRooms.get(roomName)
                    targetRoom?.assign(remoteCarrier);
                } else {
                    console.log(`Cannot find target room for ${creep.name}`);
                }
                break;

            default:
                console.log(`Unknown creep role "${role}" in ControlledRoom.assign()`);
                break;
        }

        if (this.rolesAvailable.get(role) == undefined) {
            this.rolesAvailable.set(role, 1);
        } else {
            let count = this.rolesAvailable.get(role);
            if (count != undefined) {
                count++;
                this.rolesAvailable.set(role, count);
            }
        }
    }

    run() {
        let underAttack = this.defendRoom();
        if (!underAttack) {
            this.repairStructures();
        }

        this.creepsList.forEach(
            function(creep) {
                creep.run();
            }
        )

        // Check for needed creeps and spawn them
        let creepFactory = new CreepFactory(this);
        creepFactory.run();

        this.activateLinks();


        this.miningRooms.forEach(
            function(room) {
                room.run();
            }
        )

        // Check if we can add structures when room is upgraded
        if (this.room.controller != undefined && this.room.memory.level < this.room.controller.level) {
            let roomUpgrade = new UpgradeRoom(this.room);
            roomUpgrade.run();
        }

        if (this.room.memory.attackTarget != null) {
            // console.log(`${this.room.name} attacks ${this.room.memory.attackTarget}`);
            console.log('Spawns: ' + this.spawns.length);
            let conquerRoom = new ConquerRoom(this);
            conquerRoom.run();
        }

    }

    defendRoom(): boolean {
        let hostiles = this.room.find(FIND_HOSTILE_CREEPS);
        if(hostiles.length > 0) {
            let username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${this.room.name}`);
            let towers = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            towers.forEach(function(tower) {
                if (tower.structureType == STRUCTURE_TOWER)
                tower.attack(hostiles[0])
            });

            return true;
        }

        return false;
    }

    repairStructures() {
        let damagedStructures = this.room.find(FIND_STRUCTURES, {filter: function(structure) {
            if (structure.structureType == STRUCTURE_RAMPART ||
                structure.structureType == STRUCTURE_WALL) {
                return structure.hits < 1000000;
            } else {
                return structure.hits < structure.hitsMax;
            }
        }});
        if (damagedStructures.length) {
            let towers = this.room.find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            towers.forEach(function(tower) {
                if (tower.structureType == STRUCTURE_TOWER)
                    tower.repair(damagedStructures[0]);
            });
        }
    }

    activateLinks(): void {
        let links = this.room.memory.links;
        let receivingLink: StructureLink | null = null;

        // Get receiving link
        for (let link in links) {
            // console.log(`Link info: ${link}`);
            if (links[link] == 'receive') {
                receivingLink = Game.getObjectById(link);
                break;
            }
        }

        // Send energy to receiver
        for (let link in links) {
            if (receivingLink != null && links[link] == 'send') {
                let sender:StructureLink | null = Game.getObjectById(link);
                if (sender != null && !sender.cooldown && sender.store[RESOURCE_ENERGY] > 0) {
                    sender.transferEnergy(receivingLink);
                }
            }
        }
    }
}
