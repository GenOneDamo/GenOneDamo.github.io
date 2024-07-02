import type {HexInfo, InfoSettings, PlayStyle} from '../Types'
import {types, typeNames} from '../utils/monData' 

export default class dominoTracker implements PlayStyle{

    name = "domino";
    settings: InfoSettings;
    lastMon: HexInfo | null;
    selections: HexInfo[];
    allowCheat: boolean;

    constructor (settings: InfoSettings)
    {
        this.settings = settings;
        this.lastMon = null;
        this.selections = [];
        this.allowCheat = false;
    }
    
    hexClicked(mon: HexInfo, direction: number, hexes: HexInfo[])
    {
        if (direction < 0)
        {
            return this.RightClick(mon);
        }
        
        if (this.lastMon != null)
        {
            if (!(types[mon.dexNumber - 1] & types[this.lastMon.dexNumber - 1]))
            {
                if (this.allowCheat)
                {
                    this.allowCheat = false;
                }
                else
                {
                    return;
                }
            }

            this.lastMon.color = 3
        }

        this.selections.push(mon);
        this.lastMon = mon;
        mon.color = 5;

        this.UpdateAll(hexes);
    }

    UpdateAll(hexes: HexInfo[])
    {
        hexes.forEach((hex) => {
            if (hex.color == 0 || hex.color == 1)
            {
                hex.color = types[this.lastMon!.dexNumber - 1] & types[hex.dexNumber - 1] ? 1 : 0
            }
            if (hex.color == 3 || hex.color == 4)
            {
                hex.color = types[this.lastMon!.dexNumber - 1] & types[hex.dexNumber - 1] ? 4 : 3
            }
        })
    }

    RightClick(mon: HexInfo)
    {
        if (mon.color <= 1)
        {
            mon.color = 2;
        }
        else if(mon.color == 2)
        {
            mon.color = this.lastMon != null && (types[mon.dexNumber - 1] & types[this.lastMon.dexNumber - 1]) ? 1 : 0
        }
    }

    Cheat()
    {
        this.allowCheat = true;
    }

    Undo(hexes: HexInfo[])
    {
        let  removal = this.selections.pop()

        if (removal == null)
        {
                return;
        }

        removal.color = this.selections.includes(removal)? 3 : 0

        if (this.selections.length == 0)
        {
            this.lastMon = null;
            hexes.forEach((hex)=>{hex.color = 0});
            return;
        }

        this.lastMon = this.selections[this.selections.length - 1]
        this.lastMon.color = 5

        this.UpdateAll(hexes)
    }

    CurrentDetails()
    {
        if (this.lastMon == null)
        {
                return "";
        }
        let currentTypes = []

        for (let i =0; i<15; i++)
        {
            if ((types[this.lastMon!.dexNumber-1] >>> i) & 1)
            {
                currentTypes.push(typeNames[i])
            }
        }
        return this.lastMon.name + ": " + currentTypes.join(", ")
    }
}
