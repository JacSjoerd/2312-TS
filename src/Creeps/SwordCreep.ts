import { ControlledCreep } from "./ControlledCreep";

export class SwordCreep extends ControlledCreep {
    constructor(id: Id<Creep>) {
        super(id);
    }


    run(){
        if (this.memory.targetRoom == this.room.name) {
            // Attack flag
            let targetFlag = this.pos.findClosestByPath(FIND_FLAGS);
            if (targetFlag == null) {
                let target = this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
                if (target != null) {
                    this.moveTo(target);
                    this.attack(target);
                    // console.log(`Specific target to attack for ${this.name} in room ${this.room.name}.`);
                } else {
                    let target = this.pos.findClosestByPath(FIND_HOSTILE_CONSTRUCTION_SITES);
                    if (target != null) {
                        this.moveTo(target);
                    } else {
                        console.log(`Nothing to attack for ${this.name} in room ${this.room.name}.`);
                    }
                }

                return;
            }
            let target = targetFlag.pos.lookFor(LOOK_STRUCTURES)[0];
            if (target != null){
                this.moveTo(target);
                this.attack(target);
                this.say(target.structureType);
            }


        } else {
            // Move to target room.
            this.moveToRoom(this.memory.targetRoom);
        }
    }
}
