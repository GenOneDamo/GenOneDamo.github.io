import type {HexInfo, PlayStyle} from '../Types'
import {TrackerType} from '../Types'


export default abstract class connect4 implements PlayStyle{

    name = TrackerType.Connect4;

    abstract hexClicked(mon: HexInfo, direction: number, hexes: HexInfo[]): void
    
    abstract Undo(): void;

    abstract Moves(): void;
}
