import * as signalR from '@aspnet/signalr'

export default class BattleShipsCommunicator{
  
    connection: signalR.HubConnection
    movesMade: {player: number, move: number, status: number}[]
    code: string;
    url: string;
    playersComplete: boolean[];
    setup: boolean;
    playerIndex: number;

    constructor(host: boolean, room: string){
        this.movesMade = [];
        this.code = "";
        this.playersComplete = [false, false];
        this.url = import.meta.env.VITE_SERVER_URL + "/battleShips";
        this.setup = true;
        this.connection = new signalR.HubConnectionBuilder().withUrl(this.url).build();
        this.playerIndex = host ? 0 : 1;

        this.connection.start().then( () => { 
            if (host){
                this.NewGame()
            }
            else{
                this.JoinGame(room);
            }
        })

        this.connection.on("MovesMade",  (message: {item1: number, item2: number, item3: number}[]) => {
            this.movesMade = message.map(x => {return {player: x.item1, move: x.item2, status: x.item3}});
        });
     
        this.connection.on("SetupDone",  (player: number) => {
            this.playersComplete[player] = true;
        });
     
        this.connection.on("Started",  () => {
            this.setup = false;
        });    
    }

    NewGame() {
        this.connection!.invoke("NewGame").then((code: string)=>{ this.code = code;})
    }

    JoinGame(code: string) {
        this.connection!.invoke("JoinGame", code).then(() => {this.code = code});
    }

    MakeMove(move: number) {
        this.connection!.invoke("MakeMove", this.code, move);
    }

    SetShips(ships: {Id: number, Location: {x: number, y:number}}[])
    {
        this.connection!.invoke("SetShips", this.code, ships);
    } 

    Start(){
        this.connection!.invoke("Start", this.code);
    }

}
