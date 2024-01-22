import { ControlledCreep } from "./ControlledCreep";

export class BuilderCreep extends ControlledCreep {

    constructor(id: Id<Creep>) {
        super(id);
    }

    run() {
        let target = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (target == null) {
            let controller = this.room.controller;
            if (controller != null) {
                if (this.pos.inRangeTo(controller, 3)){
                    this.upgradeController(controller);
                } else {
                    this.moveTo(controller);
                }
            }
        } else {
            if (this.pos.inRangeTo(target, 3)){
                this.build(target);
            }
            this.moveTo(target);
        }
    }
}
