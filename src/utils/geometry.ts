import type {HexInfo} from './../Types'

export default class Geometry{

    static directions = [
        {x: 0, y: 1},
        {x: 1, y: 0},
        {x: 1, y: -1},
        {x: 0, y: -1},
        {x: -1, y: 0},
        {x: -1, y: 1}
    ]

    static GetAdjacentHexes(hex : HexInfo, hexes : HexInfo[])
    {
        let neigbours = [] as HexInfo[]

        Geometry.directions.forEach((direction) => {
        
            let neigbour = hexes.find(a => 
                a.location.index.x == hex.location.index.x + direction.x &&
                a.location.index.y == hex.location.index.y + direction.y 
            )

            if (neigbour != null)
            {
                neigbours.push(neigbour)
            }

        })

        return neigbours;
    }

    static GetColorBlock(hex : HexInfo, hexes : HexInfo[])
    {
        let searched = [hex.location.index]
        let block = [hex]
        let searching = Geometry.GetAdjacentHexes(hex,hexes)

        while (searching.length > 0)
        {
            let search = searching.pop()
            searched.push(search!.location.index)
            if (search?.color != hex.color)
            {
                continue;
            }
            block.push(search)
            Geometry.GetAdjacentHexes(search,hexes).forEach(neighbour => {
                if(!searched.includes(neighbour.location.index) && !searching.includes(neighbour))
                {
                    searching.push(neighbour)
                }
            })

        }

        return block
    }

}