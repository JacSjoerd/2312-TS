import { ControlledCreep } from "./ControlledCreep";

export class BuilderCreep extends ControlledCreep {
    targetBuild: _HasId | null;

    constructor(id: Id<Creep>) {
        super(id);
        this.targetBuild = Game.getObjectById(this.memory.targetBuild);
    }

    run() {
        if (this.targetBuild == null) {
            var target = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (target == null) {
                var controller = this.room.controller;
                if (this.upgradeController(controller as StructureController) == ERR_NOT_IN_RANGE) {
                    this.moveTo(controller as StructureController);
                }
            } else {
                var result = this.build(target as ConstructionSite);
                if (result == ERR_NOT_IN_RANGE || result == ERR_NOT_ENOUGH_ENERGY) {
                    this.moveTo(target as ConstructionSite);
                }
            }
        }
    }
}
