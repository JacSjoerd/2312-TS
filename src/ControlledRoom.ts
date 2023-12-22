import { HarvesterCreep } from "Creeps/HarvesterCreep";
import { UpgraderCreep } from "Creeps/UpgraderCreep";
import { BuilderCreep } from "Creeps/BuilderCreep";


export class ControlledRoom {
    room: Room;
    name: string;
    spawns: StructureSpawn[];
    harvesters: HarvesterCreep[];
    upgraders: Creep[];
    builders: Creep[];
    carriers: Creep[];
    sources: Source[];


    constructor(room: Room) {
        this.room = room;
        this.name = room.name;
        this.spawns = room.find(FIND_MY_STRUCTURES, {filter: function(structure) {return structure.structureType == STRUCTURE_SPAWN}});
        this.harvesters = room.find(FIND_MY_CREEPS, {filter: function (creep) {return creep.memory.role == 'harvester'}});
        this.builders = room.find(FIND_MY_CREEPS, {filter: function (creep) {return creep.memory.role == 'builder'}});
        this.upgraders = room.find(FIND_MY_CREEPS, {filter: function (creep) {return creep.memory.role == 'upgrader'}});
        this.carriers = room.find(FIND_MY_CREEPS, {filter: function (creep) {return creep.memory.role == 'carrier'}});
        this.sources = room.find(FIND_SOURCES);

    }

    run() {
        if (this.builders.length < 1) {
            var creepBody = [WORK, CARRY, MOVE];
            var creepName = "builder_" + this.name + "_" + Game.time
            if(this.spawns[0].spawnCreep(creepBody, creepName, {
                        memory: {role: "builder", room: this.name, upgrading: false}
                    }) == OK) {
                console.log(`${this.spawns[0].name} spawned ${creepName}`)
            }
        }

        if (this.upgraders.length < 1) {
            var creepBody = [WORK, CARRY, MOVE];
            var creepName = "upgrader_" + this.name + "_" + Game.time
            if(this.spawns[0].spawnCreep(creepBody, creepName, {
                        memory: {role: "upgrader", room: this.name, upgrading: false}
                    }) == OK) {
                console.log(`${this.spawns[0].name} spawned ${creepName}`)
            }
        }

        if (this.harvesters.length < 2) {
            var creepBody = [WORK, CARRY, MOVE];
            var creepName = "harvester_" + this.name + "_" + Game.time
            if (this.room.memory.nextSource == null) {
                this.room.memory.nextSource = 0;
            }
            var sourceID = this.room.memory.nextSource;
            var targetSource = this.sources[sourceID].id;
            if(this.spawns[0].spawnCreep(creepBody, creepName, {
                memory: {role: "harvester", room: this.name, harvesting: true, targetSource: targetSource}
            }) == OK) {
                console.log(`${this.spawns[0].name} spawned ${creepName}`)
                this.room.memory.nextSource = this.room.memory.nextSource == 1 ? 0 : 1;
            }
        }

        this.harvesters.forEach(function(creep){
            let harvester = new HarvesterCreep(creep.id);
            harvester.run();
        })

        this.upgraders.forEach(function(creep){
            let upgrader = new UpgraderCreep(creep.id);
            upgrader.run();
        })

        this.builders.forEach(function(creep){
            let builder = new BuilderCreep(creep.id);
            builder.run();
        })
    }
}
