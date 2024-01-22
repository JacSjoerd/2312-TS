import { ControlledCreep } from "./ControlledCreep";

export class OccupyCreep extends ControlledCreep {
    constructor(id: Id<Creep>) {
        super(id);
    }

    run(){
        if (this.memory.targetRoom == this.room.name) {
            let controller = this.room.controller;
            if (controller != null) {
                this.moveTo(controller);
                if (this.memory.action == 'reserve') {
                    this.reserveController(controller);
                } else {
                    this.claimController(controller);
                }
            } else {
                console.log(`No controller for ${this.name}`);
            }
        } else {
            this.moveToRoom(this.memory.targetRoom);
        }
    }
}
