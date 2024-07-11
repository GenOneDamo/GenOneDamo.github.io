import * as signalR from '@aspnet/signalr'
import { inject } from 'vue'

export default class Connect4Communicator{
  
    connection: signalR.HubConnection
    movesMade: {player: number, move: number}[]
    code: string;
    url: string;

    constructor(host: boolean, room: string){
        this.movesMade = [];
        this.code = "";
        this.url = import.meta.env.VITE_SERVER_URL + "/connect4Hub";
        this.connection = new signalR.HubConnectionBuilder().withUrl(this.url).build();

        this.connection.start().then( () => { 
            if (host){
                this.NewGame()
            }
            else{
                this.JoinGame(room);
            }
        })

        this.connection.on("MovesMade",  (message: {item1: number, item2: number}[]) => {
            this.movesMade = message.map(x => {return {player: x.item1, move: x.item2}});
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

     Undo() {
        this.connection!.invoke("Undo", this.code);
     }

}
