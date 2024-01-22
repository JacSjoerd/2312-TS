
export class UpgradeRoom {
    constructor(public room: Room) {
    }

    placeExtensions(pos: RoomPosition): Number {
        if (pos.x > 5 && pos.x <= 44 && pos.y > 5 && pos.y <= 44) {
            var room = Game.rooms[pos.roomName];
            pos.createConstructionSite(STRUCTURE_EXTENSION);
            var result = room.createConstructionSite(pos.x - 1, pos.y, STRUCTURE_EXTENSION);
            if(result == OK) result = room.createConstructionSite(pos.x + 1, pos.y, STRUCTURE_EXTENSION);
            if(result == OK) result = room.createConstructionSite(pos.x, pos.y - 1, STRUCTURE_EXTENSION);
            if(result == OK) result = room.createConstructionSite(pos.x, pos.y + 1, STRUCTURE_EXTENSION);

            return result;
        } else {
            console.log('Placement of extentions in room ' + pos.roomName + ' at (' + pos.x + ', ' + pos.y + ') out of bound!')
            return ERR_INVALID_TARGET;
        }
    }

    isLocationClear(pos: RoomPosition, freeSpace: number = 5): boolean{
        let suitableLocation = true;
        let room = Game.rooms[pos.roomName];
        let border = Math.ceil((freeSpace - 1)/2);
        let result = room.lookAtArea(pos.y - border, pos.x - border, pos.y + border, pos.x + border, true);
        result.forEach(function(location) {
            if(location.type == LOOK_STRUCTURES || location.type == LOOK_CONSTRUCTION_SITES || (location.type == LOOK_TERRAIN && location.terrain != 'plain' && location.terrain != 'swamp')) {
                suitableLocation = false;
            }
        });

        return suitableLocation;
    }

    findConstructionLocation(startPosition: RoomPosition, freeSpace: number = 5): RoomPosition | null {
        let positions = [];
        let offset = 4;
        if (startPosition == null) {
            return null;
        }

        while(positions.length <= 10 && offset <= 25) {
            var xMin = startPosition.x - offset <  5 ?  5 : startPosition.x - offset;
            var xMax = startPosition.x + offset > 44 ? 44 : startPosition.x + offset;
            var yMin = startPosition.y - offset <  5 ?  5 : startPosition.y - offset + 1;
            var yMax = startPosition.y + offset > 44 ? 44 : startPosition.y + offset - 1;

            for(let x = xMin; x <= xMax; x++) {
                let y = startPosition.y - offset <= 7 ? 7 : startPosition.y - offset;
                var newLocation = new RoomPosition(x, y, this.room.name);
                if(this.isLocationClear(newLocation, freeSpace)) {
                    positions.push(newLocation);
                }
                y = startPosition.y + offset >= 42 ? 42 : startPosition.y + offset;
                var newLocation = new RoomPosition(x, y, this.room.name);
                if(this.isLocationClear(newLocation, freeSpace)) {
                    positions.push(newLocation);
                }
            }

            for (let y = yMin; y <= yMax; y++) {
                let x = startPosition.x - offset <= 7 ? 7 : startPosition.x - offset;
                var newLocation = new RoomPosition(x, y, this.room.name);
                if(this.isLocationClear(newLocation, freeSpace)) {
                    positions.push(newLocation);
                }
                x = startPosition.x + offset >= 42 ? 42 : startPosition.x + offset;
                var newLocation = new RoomPosition(x, y, this.room.name);
                if(this.isLocationClear(newLocation, freeSpace)) {
                    positions.push(newLocation);
                }
            }

            offset++
        }


        if(positions.length) {
            return startPosition.findClosestByPath(positions);
        } else {
            return null;
        }
    }

    numberOfStructuresBuild(structureTypeToCheck:string): number {
        let numberOfConstructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: function(structure) {
            return structure.structureType == structureTypeToCheck}}).length;
        let numberOfStructures = this.room.find(FIND_MY_STRUCTURES, {filter: function(structure){
            return structure.structureType == structureTypeToCheck}}).length;

         return numberOfConstructionSites + numberOfStructures;
    }

    placeFirstSpawn(){
        let source1 = this.room.find(FIND_SOURCES)[0];
        let source2 = this.room.find(FIND_SOURCES)[1];

        let sourcePath = this.room.findPath(source1.pos, source2.pos, {ignoreCreeps: true});
        let mid = sourcePath[Math.floor(sourcePath.length / 2)];
        let midPos = new RoomPosition(mid.x, mid.y, this.room.name);

        if (this.room.controller != undefined) {
            let controllerPath = this.room.findPath(midPos, this.room.controller.pos);
            mid = controllerPath[Math.floor(controllerPath.length / 3)];
            let startPosition = new RoomPosition(mid.x, mid.y, this.room.name);
            let location = this.findConstructionLocation(startPosition, 7);
            if (location != null) {
                this.room.createConstructionSite(location.x + 1, location.y, STRUCTURE_SPAWN);
                for (let x = -1; x <= 1; x++){
                    for (let y = -1; y <= 1; y++) {
                        this.room.createConstructionSite(location.x + x, location.y + y, STRUCTURE_RAMPART)
                    }
                }
            }
        }
    }

    isWall(x: number, y: number): boolean {
        let locationContent = this.room.lookAt(x, y);

        for (const content of locationContent) {
            if (content.type == 'terrain' && content.terrain == 'wall'){
                return true;
            }
        }

        return false;
    }

    placeLink(sourceId: Id<Source>): void{
        let source = Game.getObjectById(sourceId);

        if (source != null) {

            let freeSpots: RoomPosition[] = [];
            let foundFreeSpot: boolean = false;
            let foundBlockedSpot: boolean = false;
            let consecutiveSpots: number = 0;

            let x = source.pos.x;
            let xAdd = -1;
            let y = source.pos.y;
            let yAdd = -1;
            let direction: string = "down";
            for (let i = 0; i < 16; i++) {

                // Find consecutive free spots
                if (this.isWall(x + xAdd, y + yAdd)) {
                    foundBlockedSpot = true;
                    if (foundFreeSpot) {
                        break;
                    }
                } else {
                    if (foundBlockedSpot) {
                        foundFreeSpot = true;
                        freeSpots.push(new RoomPosition(x + xAdd, y + yAdd, this.room.name));
                    }
                }

                switch (direction) {
                    case "down":
                        if (yAdd < 1) {
                            yAdd++;
                        } else {
                            xAdd++;
                            direction = "right"
                        }
                        break;
                    case "right":
                        if (xAdd < 1) {
                            xAdd++;
                        } else {
                            yAdd--;
                            direction = "up";
                        }
                        break;
                    case "up":
                        if (yAdd > -1) {
                            yAdd--;
                        } else {
                            xAdd--;
                            direction = "left";
                        }
                        break;
                    case "left":
                        if (xAdd > -1) {
                            xAdd--;
                        }   else {
                            yAdd++;
                            direction = "down"
                        }
                }
            }

            if (freeSpots.length == 1) {
                let xShift = (freeSpots[0].x - x) * 2;
                let yShift = (freeSpots[0].y - y) * 2;
                this.room.createConstructionSite(x + xShift, y + yShift, STRUCTURE_LINK);
                // this.room.createFlag(x + xShift, y + yShift);
            } else {
                let location = freeSpots[Math.ceil(freeSpots.length / 2) - 1];
                this.room.createConstructionSite(location, STRUCTURE_LINK);
                // this.room.createFlag(location);
            }
        }
    }

    checkStructuresInRoom() {
        if (this.room.controller == undefined) {
            return;
        }

        let controllerLevel = this.room.controller.level;
        let startingSpawn = this.room.find(FIND_MY_SPAWNS)[0];

        let extensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][controllerLevel];
        if (this.numberOfStructuresBuild(STRUCTURE_EXTENSION) < extensions) {
            let constructionLocation = this.findConstructionLocation(startingSpawn.pos, 5);
            if (constructionLocation != null){
                this.placeExtensions(constructionLocation);
            }
            return;
        }

        let spawns = CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][controllerLevel];
        if (this.numberOfStructuresBuild(STRUCTURE_SPAWN) < spawns){
            if (controllerLevel <= 5) {
                this.placeFirstSpawn();
            } else {
                let location = new RoomPosition(startingSpawn.pos.x, startingSpawn.pos.y, this.room.name);
                if (location != null) {
                    this.room.createConstructionSite(location, STRUCTURE_SPAWN);
                }
            }
            return;
        }

        let links = CONTROLLER_STRUCTURES[STRUCTURE_LINK][controllerLevel];
        let numberOfLinks = this.numberOfStructuresBuild(STRUCTURE_LINK)
        console.log(`${numberOfLinks} built, ${links} possible`);
        if (numberOfLinks < links && numberOfLinks < this.room.memory.sources.length + 1) {
            switch (numberOfLinks) {
                case 0:
                    this.room.createConstructionSite(startingSpawn.pos.x - 2, startingSpawn.pos.y, STRUCTURE_LINK);
                    this.room.memory.links = {};
                    break;
                case 1:
                    this.placeLink(this.room.memory.sources[0]);
                    break;
                case 2:
                    this.placeLink(this.room.memory.sources[1]);
                    break;
            }
            return;
        }

        let storages = CONTROLLER_STRUCTURES[STRUCTURE_STORAGE][controllerLevel];
        if (this.numberOfStructuresBuild(STRUCTURE_STORAGE) < storages) {
            let spawn1 = this.room.find(FIND_MY_SPAWNS)[0];
            if (spawn1 != null) {
                let result = this.room.createConstructionSite(startingSpawn.pos.x - 1, startingSpawn.pos.y - 1, STRUCTURE_STORAGE);
                if (result != OK) {
                    Game.notify(`Room ${this.room.name} needs manual placement of storage.`);
                }
                return;
            }
        }


        let towers = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][controllerLevel];
        if (this.numberOfStructuresBuild(STRUCTURE_TOWER) < towers) {
            let constructionLocation = this.findConstructionLocation(startingSpawn.pos, 3);
            if (constructionLocation != null) {
                let result = this.room.createConstructionSite(constructionLocation.x, constructionLocation.y, STRUCTURE_TOWER);
            }

            return;
        }

        let terminals = CONTROLLER_STRUCTURES[STRUCTURE_TERMINAL][controllerLevel];
        if (this.numberOfStructuresBuild(STRUCTURE_TERMINAL) < terminals) {
            let constructionLocation = this.findConstructionLocation(startingSpawn.pos, 3);
            if (constructionLocation != null) {
                let result = this.room.createConstructionSite(startingSpawn.pos.x - 1, startingSpawn.pos.y + 1, STRUCTURE_TERMINAL);
            }

            return;
        }

        // all tests have passed. Stored room level can be upgraded
        this.room.memory.level++;
    }

    run() {
        if (this.room.controller == null) {
            return;
        }

        if (this.room.memory.level == null) {
            this.room.memory.level = 1;
        }

        this.checkStructuresInRoom();
    }
}
