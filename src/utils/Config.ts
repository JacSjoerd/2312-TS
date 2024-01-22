import {} from "./Config";
import { CreepTypes, HARVESTER } from "./constants";

enum CreepBuildPriority {

}

export class Config {
    private static instance: Config;
    public maxHarvesters: number = 2;
    public minCarriers: number = 4;
    public maxCarriers: number = 8;
    public maxUpgraders: number = 2;
    public maxBuilders: number = 1;
    public maxSwords: number = 1;
    public maxOccupiers: number = 1;
    public maxRemoteHarvesters: number = 2;
    public maxRemoteCarriers: number = 4;

    private constructor(){}

    public static getConfig(){
        if (!Config.instance) {
            Config.instance = new Config();
        }

        return Config.instance
    }

    public max(creepType: CreepTypes): number {
        switch (creepType) {
            case "harvester":
                return this.maxHarvesters;
            case "builder":
                return this.maxBuilders;
            case "upgrader":
                return this.maxUpgraders;
            case "carrier":
                return this.maxCarriers;
            case "sword":
                return this.maxSwords;
            case "occupier":
                return this.maxOccupiers;
            case "remote_harvester":
                return this.maxRemoteHarvesters;
            case "remote_carrier":
                return this.maxRemoteCarriers
            default:
                console.log(`Max CreepType not defined in Config.max()`);
                return 0
        }
    }
}
