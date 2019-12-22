
class Player {
    constructor(){
        this.resources = new Resources()        // Amount of resources the player has
        this.production = new Resources()       // Amount of resources produced every turn
    }

    produce(){
        this.resources.add(this.production)
    }
}
