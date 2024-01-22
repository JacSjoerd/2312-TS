
export class ControlledSource {
    source: Source | null;
    room: string | null;
    harvester: string;
    receivingRoom: string;

    constructor(id: Id<Source>, memory: {[name: string]: any}) {
        this.source = Game.getObjectById(id);

        if (this.source != null) {
            this.room = this.source.room.name;
        } else {
            this.room = null;
        }

        this.harvester = memory.harvester;
        this.receivingRoom = memory.receivingRoom;
    }

    run(): void {
        if (this.harvester == null) {
            Game.rooms[this.receivingRoom].memory.buildList.push({remote_harvester: {room: this.receivingRoom, targetRoom: this.room }})
            this.source?.room.memory
        }
    }
}
