import type {HexInfo, PlayStyle} from '../Types'
import Random from '../utils/randomNumbeGenerator'


export default class connect4 implements PlayStyle{

    name = "connect4";
    random: Random
    timerRunning: boolean;
    queue: {color: number, hex: HexInfo | null, hexes: HexInfo[]}[];
    moves: {startSeed: string, hex: HexInfo, path: HexInfo[]}[];

    constructor (seed: string)
    {
        this.random = new Random(seed);
        this.timerRunning = false;
        this.queue = [];
        this.moves = [];
    }
    
    hexClicked(mon: HexInfo, direction: number, hexes: HexInfo[])
    {
        if (mon.color != 0)
        {
            return;
        }

        if (this.timerRunning)
        {
            this.queue.push({color: 1 + (1-direction)/2, hex: mon, hexes: hexes})
            return
        }

        this.timerRunning = true;
        mon.color = 1 + (1-direction)/2;
        this.moves.push({startSeed: this.random.CurrentSeed(), hex: mon, path: []});
        this.DropHex(mon, hexes);
    }

    DropHex(mon: HexInfo, hexes: HexInfo[])
    {
        let options = hexes.filter((hex) => hex.color == 0 && hex.location.index.y == mon.location.index.y - 1 && (hex.location.index.x == mon.location.index.x || hex.location.index.x == mon.location.index.x + 1)).sort((a,b) => a.dexNumber - b.dexNumber )

        if (options.length > 0)
        {
            let index = 0;
            if (options.length > 1){
                index = this.random.Generate(options.length)
            }
            let location = mon.location;
            mon.location = options[index].location;
            options[index].location = location;

            this.moves[this.moves.length - 1].path.push(options[index])


            setTimeout( () => {
                this.DropHex(mon, hexes)
            }, 100);
            return;
        }
        
        let task = this.queue.shift();
        while (task != null && (task.color < 0 || task.hex!.color != 0))
        {
            if (task.color < 0)
            {
                this.PerformUndo();
            }

            task = this.queue.shift();
        }

        if (task != null)
        {
            setTimeout( () => {
                task.hex!.color = task.color;
                this.moves.push({startSeed: this.random.CurrentSeed(), hex: task.hex!, path: []});
                this.DropHex(task.hex!, task.hexes)
            }, 200);
            return;
        }

        this.timerRunning = false;
    }

    Undo(){
        if (this.timerRunning)
        {
            this.queue.push({color: -1, hex: null, hexes: [] as HexInfo[]})
            return;
        }

        this.PerformUndo();
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

        move.path[move.path.length - 1].location = move.hex.location;
        move.hex.location = initialLocation;
        move.hex.color = 0;

        this.random.Reseed(move.startSeed);
    }

    Moves()
    {
        var moves = [] as string[];

        for (let i = 0; i < this.moves.length; i++)
        {
            moves.push(this.moves[i].hex.name)
        }
        
        return moves
    }

}
