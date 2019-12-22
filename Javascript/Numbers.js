
function getAllResourceTypes(){
    return ['food', 'gold', 'materials', 'might', 'magic']
}

class Resources {
    constructor(resources){
        this.food = 0
        this.gold = 0
        this.materials = 0
        this.might = 0
        this.magic = 0
        this.add(resources)
    }

    getResourceTypes(){
        return getAllResourceTypes().filter(r => this[r] != 0)
    }

    add(resources){
        for(let resource of getAllResourceTypes()){
            if(resources[resource]){
                this[resource] += resources[resource]
            }
        }
    }

    subtract(resources){
        for(let resource of getAllResourceTypes()){
            if(resources[resource]) this[resource] -= resources[resource]
        }
    }
}
