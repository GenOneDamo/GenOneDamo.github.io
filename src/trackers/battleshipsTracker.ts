import type {HexInfo, PlayStyle} from '../Types'

export default class battleshipsTracker implements PlayStyle{

    name = "battleships";

    constructor ()
    {

    }
    
    hexClicked(mon: HexInfo, direction: number, hexes: HexInfo[])
    {
        mon.color = 1
    }

}
