import { ControlledCreep } from "./ControlledCreep";

export class UpgraderCreep extends ControlledCreep {
    constructor(id: Id<Creep>) {
        super(id);
    }

    run() {
        var target = this.room.controller;
        if (target != null) {
            if (this.memory.upgrading || this.pos.inRangeTo(target, 2)){
                this.upgradeController(target);
                this.memory.upgrading = true;
            } else {
                this.moveTo(target);
            }
        }
    }
}
