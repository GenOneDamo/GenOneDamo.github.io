import type {HexInfo} from '../Types'
import Random from '../utils/randomNumbeGenerator'
import Connect4Communicator from '../utils/connect4Communicator'
import connect4TrackerBase from './../trackers/connect4TrackerBase'
import { names } from '../utils/monData'

export default class connect4Offline extends connect4TrackerBase{

    random: Random
    moves: {startSeed: string, path: HexInfo[], player: number, move: number}[];
    movesRecieved: {player: number, move: number}[];
    communicator: Connect4Communicator;
    hexes: HexInfo[];
    currentMove: HexInfo | null;

    constructor (seed: string, newGame: boolean, code: string)
    {
        super();
        this.random = new Random(seed);
        this.moves = [];
        this.currentMove = null;
        this.hexes = [];
        this.movesRecieved = [];
        this.communicator = new Connect4Communicator(newGame, code);
        setTimeout( () => {
           this.CheckRecieved();
        }, 200);
    }
    
    async CheckRecieved()
    {
        this.movesRecieved = this.communicator.movesMade;
        
        for (let i=0; i < this.moves.length; i++)
        {
            if (this.movesRecieved.length <= i || this.movesRecieved[i].move != this.moves[i].move ||  this.movesRecieved[i].player != this.moves[i].player)
            {
                for (let j= this.moves.length - 1; j >= i; j--)
                {
                    this.PerformUndo();
                }
                this.CheckRecieved();
                return 
            }
        }

        if (this.movesRecieved.length > this.moves.length)
        {
            let hex = this.hexes.find(mon => mon.dexNumber == this.movesRecieved[this.moves.length].move)
            hex!.color = this.movesRecieved[this.moves.length].player + 1
            this.currentMove = hex!;
            setTimeout( () => {
                this.moves.push({startSeed: this.random.CurrentSeed(), path:[], player: this.currentMove!.color-1, move: this.currentMove!.dexNumber});
                this.MakeMove();
            }, 200);
        }
        else {
            setTimeout( () => {
                this.CheckRecieved();
            }, 200);
        }
    }

    async MakeMove ()
    {
        let options = this.hexes.filter((hex) => hex.color == 0 && hex.location.index.y == this.currentMove!.location.index.y - 1 && (hex.location.index.x == this.currentMove!.location.index.x || hex.location.index.x == this.currentMove!.location.index.x + 1)).sort((a,b) => a.dexNumber - b.dexNumber )

        if (options.length == 0)
        {
            setTimeout( () => {
                this.CheckRecieved();
            }, 200);
            return;
        }

        let index = 0;
        if (options.length > 1){
            index = this.random.Generate(options.length)
        }
        let location = this.currentMove!.location;
        this.currentMove!.location = options[index].location;
        options[index].location = location;

        this.moves[this.moves.length - 1].path.push(options[index])

        setTimeout( () => {
            this.MakeMove();
        }, 100);
    }

    hexClicked(mon: HexInfo, direction: number, hexes: HexInfo[])
    {

        if (mon.color != 0 || direction < 0)
        {
            return;
        }

        this.communicator.MakeMove(mon.dexNumber)
    }

    Undo(){
        this.communicator.Undo();
    }

    PerformUndo(){
        let move = this.moves.pop();
        if (move == null)
        {
            return;
        }

        let initialLocation = move.path[0].location;

        for (let i = 0; i < move.path.length - 1; i++)
        {
            move.path[i].location = move.path[i + 1].location
        }

        let hex = this.hexes.find(h => h.dexNumber == move.move)

        move.path[move.path.length - 1].location = hex!.location;
        hex!.location = initialLocation;
        hex!.color = 0;

        this.random.Reseed(move.startSeed);
    }
  
    Moves()
    {
        var moves = [] as string[];

        for (let i = 0; i < this.movesRecieved.length; i++)
        {
            moves.push('P'+(this.movesRecieved[i].player + 1) + ': ' + names[this.movesRecieved[i].move-1])
        }
        
        return moves
    }
}
