import { ControlledCreep } from "./ControlledCreep";

export class HarvesterCreep extends ControlledCreep {
    targetSource: _HasId | null;
    targetDelivery: _HasId | null;

    constructor(id: Id<Creep>) {
        super(id);
        this.targetSource = Game.getObjectById(this.memory.targetSouce);
        this.targetDelivery = Game.getObjectById(this.memory.targetDelivery);
    }

    run() {
        if (this.memory.harvesting && this.store.getFreeCapacity() == 0) {
            this.memory.harvesting = false;
            this.targetDelivery = this.findSourceDelivery();
            if (this.targetDelivery !== null) {
                this.memory.targetDelivery = this.targetDelivery.id;
            }
            this.say('🚚');
        }

        if (!this.memory.harvesting && this.store.getUsedCapacity() == 0) {
            this.memory.harvesting = true;
            this.say('⛏️');
        }

        if (this.memory.harvesting) {
            var target = Game.getObjectById(this.memory.targetSource)
            if (this.harvest(target as Source | Mineral<MineralConstant> | Deposit) == ERR_NOT_IN_RANGE) {
                this.moveTo(target as Source | Mineral<MineralConstant> | Deposit);
            }
        } else {
            var target = Game.getObjectById(this.memory.targetDelivery);
            if (this.transfer(target as Structure | Creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                this.moveTo(target as Structure | Creep)
            } else {
                this.targetDelivery = this.findSourceDelivery();
                if (this.targetDelivery !== null) {
                    this.memory.targetDelivery = this.targetDelivery.id;
                }

            }
        }

    }
}
