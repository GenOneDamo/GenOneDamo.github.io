import type {PlayStyle} from '../Types'
import {HexInfo} from '../Types'
import {TrackerType} from '../Types'
import BattleShipsCommunicator from '../utils/battleShipsCommunicator'
import Geomerty from '../utils/geometry'


export default class battleShipsTracker implements PlayStyle{

    name = TrackerType.BattleShips;
    communicator: BattleShipsCommunicator;
    hexes: HexInfo[];
    shipsSubmitted: boolean;
    breakLine: number;
    size: number;
    movesProcessed: number;

    constructor (newGame: boolean, room: string, size: number)
    {
        this.breakLine = 0;
        this.hexes = [];
        this.size = size;
        this.shipsSubmitted = false;
        this.movesProcessed = 0;
        this.communicator = new BattleShipsCommunicator(newGame, room);
        setTimeout(()=>{this.ProcessMoves()},200)
    }

    ProcessMoves()
    {
      let movesMade = this.communicator.movesMade.length;
      for (let i = this.movesProcessed; i < movesMade; i++)
      {
        if (this.communicator.playerIndex == this.communicator.movesMade[i].player)
        {
          this.ProcessSelfMove(this.communicator.movesMade[i].move, this.communicator.movesMade[i].status);
        }
        else
        {
          this.ProcessOtherMove(this.communicator.movesMade[i].move, this.communicator.movesMade[i].status);
        }
        this.movesProcessed = i + 1;
      }
      setTimeout(()=>{this.ProcessMoves()},200)
    }

    ProcessSelfMove(move: number, status: number) {
      let mon = this.hexes.find((hex) => hex.location.index.y < this.breakLine && hex.dexNumber == move)

      if (mon == null)
      {
        return;
      }

      if (status == 0)
      {
        mon.color = 8
      }
      else if (status == 1)
      {
        mon.color = 6
      } 
      else if (status == 2)
      {
        mon.color = 6;

        let block = Geomerty.GetColorBlock(mon, this.hexes)

        block.forEach((piece) => {
          piece.color = 7
        })
      }
    }

    ProcessOtherMove(move: number, status: number) {
      let mon = this.hexes.find((hex) => hex.location.index.y > this.breakLine && hex.dexNumber == move)
      
      if (mon == null)
      {
        return;
      }

      if (status == 0)
      {
        mon.color = 4
      }
      else if (status == 1)
      {
        mon.color = 2
      } 
      else if (status == 2)
      {
        mon.color = 2;

        let block = Geomerty.GetColorBlock(mon, this.hexes)

        block.forEach((piece) => {
          piece.color = 3
        })
      }
    }
    
    hexClicked(mon: HexInfo, direction: number, hexes: HexInfo[])
    {
        if (this.communicator.setup && direction > 0 && !this.shipsSubmitted)
        {
          this.SetupClick(mon)
        }
        else if (!this.communicator.setup && mon.location.index.y < this.breakLine)
        {
          this.GameClick(mon, direction);
        }
    }

    SetupClick(mon: HexInfo){
      mon.color = 1 - mon.color;
    }

    GameClick(mon: HexInfo, direction: number){
      if (direction > 0 && (mon.color == 5 || mon.color == 9))
      {
        this.communicator.MakeMove(mon.dexNumber);
      }
      else if (mon.color == 5 || mon.color == 9)
      {
        mon.color = 14 - mon.color;
      }
    }

    SetUpComplete(){
      let ships = this.hexes.filter((mon) => mon.color == 1).map((mon) => {return {Id: mon.dexNumber, Location: mon.location.index }});
      this.communicator.SetShips(ships)
      this.DoubleMap();
      this.shipsSubmitted = true;
    }

    Start()
    {
      this.communicator.Start()
    }

    DoubleMap(){
      let min = this.hexes[0].location.index.y
      let max = this.hexes[0].location.index.y
      let ships = [] as number[]

      this.hexes.forEach(mon => {
        if (min > mon.location.index.y)
        {
          min = mon.location.index.y
        }
        else if (max < mon.location.index.y)
        {
          max = mon.location.index.y
        }
        if (mon.color == 1)
        {
          ships.push(mon.dexNumber)
        }
        mon.color = 5;
      });

      this.breakLine = max + 1
  
      let gap = max-min+4
      if (gap % 2 == 1)
      {
        gap ++
      }
      
     let newHex = this.hexes.map(mon => {
       return new HexInfo(
        {
          index: {
            x: mon.location.index.x - (gap)/2, 
            y: mon.location.index.y + gap
          },
          coordinates: {
            x: 0,
            y: 0
          } 
        },
        mon.dexNumber,
        mon.name
       );
      })

      newHex.filter(hex => ships.includes(hex.dexNumber)).forEach((hex) => {
        hex.color = 1;
      })

      this.hexes.push(...newHex)
    }

}
