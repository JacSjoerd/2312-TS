import { ControlledCreep } from "./ControlledCreep";

export class UpgraderCreep extends ControlledCreep {
    constructor(id: Id<Creep>) {
        super(id);
    }

    run() {
        var target = this.room.controller;
        var result = this.upgradeController(target as StructureController);
        if (result == ERR_NOT_IN_RANGE || result == ERR_NOT_ENOUGH_ENERGY) {
            this.moveTo(target as StructureController);
        }
    }
}
