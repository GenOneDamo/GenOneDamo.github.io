import type {HexInfo, PlayStyle} from '../Types'
import {TrackerType} from '../Types'


export default class basicTracker implements PlayStyle{

    colorCount: number;
    name = TrackerType.Basic;

    constructor (colorCount: number)
    {
        this.colorCount = colorCount
    }
    
    hexClicked(mon: HexInfo, direction: number, hexes: HexInfo[])
    {
        mon.color = (mon.color + direction + this.colorCount) % this.colorCount
    }

}
