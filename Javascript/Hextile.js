const HEXTILE_WIDTH = 128
const HEXTILE_HEIGHT = 128

class Hex {
    constructor({hexmap, i, j}){
        this.hexmap = hexmap
        this.i = i
        this.j = j
    }

    getLeft(){ return this.hexmap.getLeft(this.i, this.j)}
    getRight(){ return this.hexmap.getRight(this.i, this.j)}
    getTopLeft(){ return this.hexmap.getTopLeft(this.i, this.j)}
    getBottomLeft(){ return this.hexmap.getBottomLeft(this.i, this.j)}
    getTopRight(){ return this.hexmap.getTopRight(this.i, this.j)}
    getBottomRight(){ return this.hexmap.getBottomRight(this.i, this.j)}
}

function createHextileResourceIndicatorContent(resources){
    let div = createElement('div', '.hextile-resource-indicator')
    console.log(resources)
    for(let resourceName of resources.getResourceTypes()){
        let resourceBox = createElement('div', '.hextile-resource-indicator-box')
        for(let i = 1; i<=resources[resourceName]; i++){
            resourceBox.appendChild(createImage(`Assets/Icons/${resourceName}.png`), 'hextile-resource-icon')
        }
        div.appendChild(resourceBox)
    }
    return div
}

class Hextile extends Hex {
    constructor({x, y, hexmap, i, j, terrainTypeName}){
        super({hexmap, i, j})
        this.terrainType = TerrainTypes[terrainTypeName]
        this.dom = dom(
            `<div class="hextile-wrapper">
                <img class="hextile-img" src="Assets/Hextiles/${this.terrainType.name}.png">
                <div class="hextile-content"> </div>
                <div class="hextile-resource-indicator-wrapper"> </div>
                <div class="hextile-click-listener-div"> &nbsp; </div>
             </div>`)
        this.clickListenerDiv = this.dom.getElementsByClassName('hextile-click-listener-div')[0]
        this.clickListenerDiv.addEventListener('click', evt => this.onClick())
        this.content = this.dom.getElementsByClassName('hextile-content')       // Dom content
        this.updateResources()
        this.setX(x)
        this.setY(y)
        this.onClick = null
        get('Window').appendChild(this.dom)
    }


    updateResources(){
        this.resources = new Resources(this.terrainType.resources)
        let resourceIndicatorWrapper = this.dom.getElementsByClassName('hextile-resource-indicator-wrapper')[0]
        removeAllChildren(resourceIndicatorWrapper)
        resourceIndicatorWrapper.appendChild(createHextileResourceIndicatorContent(this.resources))
    }

    change({x, y, hexmap, i, j, terrainTypeName}){
        if(x) this.setX(x)
        if(y) this.setY(y)
        if(hexmap) this.hexmap = hexmap
        if(i) this.i = i
        if(j) this.j = j
        if(terrainTypeName){
            this.terrainType = TerrainTypes[terrainTypeName]
            let img = this.dom.getElementsByClassName('hextile-img')[0]
            img.setAttribute('src', `Assets/Hextiles/${this.terrainType.name}.png`)
            this.updateResources()
        }
    }

    setX(x){
        this.x = x
        setX(this.dom, x)
    }

    setY(y){
        this.y = y
        setY(this.dom, y)
    }

    toString(){
        return `${this.i}, ${this.j} at ${this.x}, ${this.y}`
    }

    getTerrainType(){
        return this.terrainType
    }
}


class Hexmap {
    constructor({xOffset, yOffset, nRows, nCols}){
        this.nRows = nRows
        this.nCols = nCols
        this.xOffset = xOffset
        this.yOffset = yOffset
        this.matrix = createMatrix(nRows, nCols)
        forEachInMatrix(this.matrix, (_, r, c) => {
            let x = xOffset + c*HEXTILE_WIDTH + (r%2)*HEXTILE_WIDTH/2
            let y = yOffset + r*HEXTILE_HEIGHT - r/4*HEXTILE_HEIGHT
            this.matrix[r][c] = new Hextile({
                x : x,
                y : y,
                hexmap : this,
                i : r,
                j : c,
                terrainTypeName : 'Water'
            })
        })
        this.generateLand()
        this.generateBasicVariation()
        this.generateUncommonVariation()
    }

    generateLand(){     // Repopulates the map with only Grass and Water
        forEachInMatrix(this.matrix, (elem) => {
            if(percentChance(66)){
                elem.change({terrainTypeName : 'Grass'})
            } else {
                elem.change({terrainTypeName : 'Water'})
            }
        })
    }

    generateBasicVariation(){ // Replaces Grass and Water with some variations
        let terrainTypesArray = objectToArray(TerrainTypes)
        let basicLands = terrainTypesArray.filter(t => t.rarity == 'basic' && t.borne == 'land')
        this.forEach(hextile => {
            let terrainType = hextile.getTerrainType()
            if(terrainType.borne == 'land'){
                if(terrainType.rarity == 'basic'){
                    hextile.change({terrainTypeName : randomOf(...basicLands).name})
                }
            } else if(terrainType.borne == 'water'){
                return
            }
        })
    }

    generateUncommonVariation(){
        let terrainTypesArray = objectToArray(TerrainTypes)
        let uncommonLands = terrainTypesArray.filter(t => t.rarity == 'uncommon' && t.borne == 'land')
        let uncommonWaters = terrainTypesArray.filter(t => t.rarity == 'uncommon' && t.borne == 'water')
        this.forEach(hextile => {
            let terrainType = hextile.getTerrainType()
            if(terrainType.borne == 'land'){
                if(terrainType.rarity == 'basic'){
                    if(percentChance(33)){
                        hextile.change({terrainTypeName : randomOf(...uncommonLands).name})
                    }
                }
            } else if(terrainType.borne == 'water'){
                if(terrainType.rarity == 'basic'){
                    if(percentChance(33)){
                        hextile.change({terrainTypeName : randomOf(...uncommonWaters).name})
                    }
                }
            }
        })
    }

    get(i, j){
        try {
            return this.matrix[i][j]
        } catch {
            return null
        }
    }

    getLeft(i, j){
        return this.get(i, j-1)
    }

    getRight(i, j){
        return this.get(i, j+1)
    }

    getTopRight(i, j){
        if(i%2 == 0) return this.get(i-1, j)
        else return this.get(i-1, j+1)
    }

    getTopLeft(i, j){
        if(i%2 == 0) return this.get(i-1, j-1)
        else return this.get(i-1, j)
    }

    getBottomLeft(i, j){
        if(i%2 == 0) return this.get(i+1, j-1)
        else return this.get(i+1, j)
    }

    getBottomRight(i, j){
        if(i%2 == 0) return this.get(i+1, j)
        else return this.get(i+1, j+1)
    }

    forEach(callback){
        forEachInMatrix(this.matrix, callback)
    }



}
