
type PickupPackage = {
    destination: Id<Structure | Creep>,
    energyAvailable: number,
    carrierId: Id<Creep>,
    energyReserved: number
}

class PickupPlan {

    constructor(private packageList: PickupPackage[], private deliveryList: PickupPackage[]){}

    addPackage(pack: PickupPackage): void {
        this.packageList.push(pack);
    }

    sortPlan(): void {
        // split list in 4 parts: Spawn + Extension, Tower, Builder+Upgrader, rest

    }

    reservePickup(carrierId: Id<Creep>){

    }

}
