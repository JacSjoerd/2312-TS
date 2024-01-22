type DeliveryPackage = {
    destination: Id<Structure | Creep>,
    energyNeeded: number,
    carrierId: Id<Creep>,
    energyReserved: number
}

class DeliveryPlan {

    constructor(private packageList: DeliveryPackage[], private deliveryList: DeliveryPackage[]){}

    addPackage(pack: DeliveryPackage): void {
        this.packageList.push(pack);
    }

    sortPlan(): void {
        // split list in 4 parts: Spawn + Extension, Tower, Builder+Upgrader, rest

    }

    reserveDelivery(carrierId: Id<Creep>){

    }

}
