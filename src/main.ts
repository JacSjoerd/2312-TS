import { ErrorMapper } from "utils/ErrorMapper";
import { ControlledRoom } from "ControlledRoom";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    flagging: boolean;
  }

  interface CreepMemory {
    role: string;
    room: string;

    // States depending on the role
    building?: boolean;
    harvesting?: boolean;
    upgrading?: boolean;
    delivering?: boolean;

    // Transports
    deliverAt?: Id<Structure | Creep> | null;
    pickupFrom?: Id<Structure | Creep | Ruin | Tombstone | Resource> | null;

    // Harvest location
    harvestFrom?: Id<Source | Mineral> | null;

    targetRoom?: String;

    [name: string]: any;
  }

  interface FlagMemory { [name: string]: any }
  interface SpawnMemory { [name: string]: any }
  interface RoomMemory { [name: string]: any }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  const roomList = new Map<string, ControlledRoom>();
  for (const roomName in Game.rooms) {
    let room = Game.rooms[roomName];
    if (room.controller != undefined && room.controller.my && room.controller.reservation == null) {
      roomList.set(roomName, new ControlledRoom(room));
    }
  }

  // Gather info on creeps in rooms or delete memory of missing creeps
  for (const creepName in Memory.creeps) {
    if (!(creepName in Game.creeps)) {
      delete Memory.creeps[creepName];
    } else {
      let creep = Game.creeps[creepName];
      let creepsRoom = roomList.get(creep.memory.room);
      if (creepsRoom != undefined) {
        creepsRoom.assign(creep);
      }
    }
  }
  // console.log(`CPU after creep instantiation: ${Game.cpu.getUsed()}`)

  roomList.forEach(
    function(room) {
      console.log(`Running room ${room.name}`);
      room.run();
      // console.log(`CPU after room.run() of ${room.name}: ${Game.cpu.getUsed()}`)
    }
  )

  if (Memory.flagging) {

    Memory.flagging = false;
  }

  if(Game.shard.name == "shard3" && Game.cpu.bucket == 10000) {
    Game.cpu.generatePixel();
    console.log('Generated 1 pixel');
  }

});
