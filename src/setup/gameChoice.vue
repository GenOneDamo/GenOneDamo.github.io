<script lang="ts">
import basicTracker from './../trackers/basicTracker'
import adjacentTracker from './../trackers/adjacentTracker'
import connect4TrackerOnline from './../trackers/connect4TrackerOnline'
import connect4TrackerOffline from './../trackers/connect4TrackerOffline'
import dominoTracker from './../trackers/dominoTracker'
import battleShipsTracker from './../trackers/battleShipsTracker'
import { defineComponent, inject } from 'vue'
import type { Settings, PlayStyle, InfoSettings } from './../Types'
import { TrackerType } from './../Types'
import Random from './../utils/randomNumbeGenerator'

export default defineComponent({
    emits: ["complete"],
    data() {
        return {
            playStyle: inject('playStyle') as PlayStyle,
            settings: inject('settings') as Settings,
            seedValid: false,
            loading: false,
            TrackerType
        };
    },
    props: {
        size: {
            type: Number,
            required: true
        }
    },
    methods: {

        setDefaultTracker(game: TrackerType) {
            if (game == TrackerType.Basic) {
                this.settings.graphics.colors = ['#ffffff', '#0000ff', '#ff0000', '#00ff00']
            }
            else if (game == TrackerType.Adjacent) {
                this.settings.trackerSettings = {
                    showStats: true,
                    statsLocation: "bottom,right",
                    statscolor: "#ffffff"
                } as InfoSettings
                this.settings.graphics.colors = ['#ffffff', '#00ffff', '#ff0000', '#0000ff', '#32cd32', '#ffff00', '#ffa500', '#808080', '#800080', '#8b3513', '#ff00ff', '#006400', '#191970']
            }
            else if (game == TrackerType.Connect4) {
                this.settings.graphics.colors = ['#ffffff', '#ff0000', '#0000ff']
                this.settings.trackerSettings = {
                    online: false,
                    seed: Random.NewSeedString(),
                    newGame: true,
                    code: null};
                this.SeedCheck();
            }
            else if (game == TrackerType.Domino) {
                this.settings.graphics.colors = ['#ffffff', '#ffff99', '#ff0000', '#0000ff', '#0030b7', '#ffff00']
                this.settings.trackerSettings = {
                    showStats: true,
                    statsLocation: "bottom,right",
                    statscolor: "#ffffff"
                } as InfoSettings
            }
            else if (game == TrackerType.BattleShips) {
                this.settings.graphics.colors = ['#3385ff', '#ffff00', '#ff5050', '#ff0000','#00ff00','#3385ff', '#ff5050', '#ff0000','#00ff00','#000000']
                this.settings.trackerSettings = {
                    newGame: true,
                    code: null};
                this.SeedCheck();
            }
            this.settings.trackerType = game;

        },
        SetGame() {
            if (this.settings.trackerType == TrackerType.Basic) {
                return this.setGameBasic();
            }
            if (this.settings.trackerType == TrackerType.Adjacent) {
                return this.setGameAdjacent();
            }
            if (this.settings.trackerType == TrackerType.Connect4) {
                return this.setGameConnect4();
            }
            if (this.settings.trackerType == TrackerType.Domino) {
                return this.setGameDomino();
            }
            if (this.settings.trackerType == TrackerType.BattleShips) {
                return this.setGameBattleShips();
            }

        },
        setGameBasic() {
            this.playStyle = new basicTracker(this.settings.graphics.colors.length);
            this.$emit('complete');
        },
        setGameAdjacent() {
            this.playStyle = new adjacentTracker(this.settings.graphics.colors.length - 3, this.size, this.settings.trackerSettings);
            this.$emit('complete');
        },
        setGameConnect4() {
            if (this.settings.trackerSettings.online)
            {
                this.playStyle = new connect4TrackerOnline(this.settings.trackerSettings.seed, this.settings.trackerSettings.newGame, this.settings.trackerSettings.code);    
              
                setTimeout( () => {
                    this.setConnect4OnlineDetails();
                }, 1000);
                this.loading = true;
                return;
                
            }
            else
            {
                this.playStyle = new connect4TrackerOffline(this.settings.trackerSettings.seed);    
            }

            this.$emit('complete');
        },

        setConnect4OnlineDetails(){
            let code = (this.playStyle as connect4TrackerOnline).communicator.code;
            if (code == null || code == "")
            {
                setTimeout( () => {
                        this.setConnect4OnlineDetails();
                        }, 200);
            }
            else {
                if (this.settings.trackerSettings.newGame)
                {
                    this.settings.trackerSettings.newGame = false
                    this.settings.trackerSettings.code = code
                }
                this.loading = false;
                this.$emit('complete');
            }
        },

        setGameDomino() {
            this.playStyle = new dominoTracker(this.settings.trackerSettings);
            this.$emit('complete');
        },

        setGameBattleShips()
        {
            this.playStyle = new battleShipsTracker(this.settings.trackerSettings.newGame, this.settings.trackerSettings.code, this.size);    
              
              setTimeout( () => {
                  this.SetBattleShip();
              }, 1000);
              this.loading = true;
              return;
        
        },
        SetBattleShip()
        {
            let code = (this.playStyle as battleShipsTracker).communicator.code;
            if (code == null || code == "")
            {
                setTimeout( () => {
                        this.SetBattleShip();
                        }, 200);
            }
            else {
                if (this.settings.trackerSettings.newGame)
                {
                    this.settings.trackerSettings.newGame = false
                    this.settings.trackerSettings.code = code
                }
                this.loading = false;
                this.$emit('complete');
            }
        },
        UpdateColor(position: number, color: string) {
            this.settings.graphics.colors[position] = color
        },
        RemoveColor(position: number) {
            this.settings.graphics.colors.splice(position, 1)
        },
        AddColor() {
            const hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
            let color = "#"
            for (let i = 0; i < 6; i++) {
                color += hex[Math.floor(Math.random() * 16)]
            }

            this.settings.graphics.colors.push(color)
        },
        RefreshSeed() {
            this.settings.trackerSettings.seed = Random.NewSeedString();
            this.SeedCheck();
        },
        SeedCheck() {
            this.seedValid = Random.CheckSeed(this.settings.trackerSettings.seed);
        }
    }
})
</script>

<template>
    <div class="parent" v-if="!loading">
        <h1>Select tracking type</h1>
        <br>
        <span>
            <input type="radio" name="gameType" id="basic" value="basic" @change="setDefaultTracker(TrackerType.Basic)"
                :checked="settings.trackerType == TrackerType.Basic" />
            <label for="basic">Basic</label>
        </span>
        <span>
            <input type="radio" name="gameType" id="adjacent" value="adjacent" @change="setDefaultTracker(TrackerType.Adjacent)"
                :checked="settings.trackerType == TrackerType.Adjacent" />
            <label for="adjacent">Zombie</label>
        </span>
        <span>
            <input type="radio" name="gameType" id="connect4" value="connect4" @change="setDefaultTracker(TrackerType.Connect4)"
                :checked="settings.trackerType == TrackerType.Connect4" />
            <label for="connect4">Connect 4</label>
        </span>
        <span>
            <input type="radio" name="gameType" id="domino" value="domino" @change="setDefaultTracker(TrackerType.Domino)"
                :checked="settings.trackerType == TrackerType.Domino" />
            <label for="domino">Domino</label>
        </span>
        <span>
            <input type="radio" name="gameType" id="battleships" value="domino" @change="setDefaultTracker(TrackerType.BattleShips)"
                :checked="settings.trackerType == TrackerType.BattleShips" />
            <label for="battleships">Battle Ships</label>
        </span>

        <div>
            <p>Click color to change it.</p>
        </div>

        <div v-if="settings.trackerType == TrackerType.Basic" class="basicOptions">

            <div class="colorSelect">
                <input type="color" id="basicBace" @change="UpdateColor(0, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[0]>
                <label for="basicBace">Bace Color</label>
            </div>

            <div class="multiSelect">
                <h1>Marking Colors</h1>
                <div class="colorSelect" v-for="(colorChoice, index) in settings.graphics.colors.slice(1)">
                    <input :id="'basicColor' + index" type="color"
                        @change="UpdateColor(index + 1, ($event.target as HTMLInputElement).value)" :value=colorChoice>
                    <label :for="'basicColor' + index">Color {{ index + 1 }}</label>
                    <button @click="RemoveColor(index + 1)">Delete</button>
                </div>
                <button class="add" @click="AddColor()">Add</button>
            </div>

            <button @click="setGameBasic()">Confirm</button>
        </div>
        <div v-if="settings.trackerType == TrackerType.Adjacent" class="adjacentOptions">

            <div class="colorSelect">
                <input type="color" id="adjacentBace"
                    @change="UpdateColor(0, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[0]>
                <label for="basicBace">Bace Color</label>
            </div>
            <div class="colorSelect">
                <input type="color" id="adjacentInfectable"
                    @change="UpdateColor(1, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[1]>
                <label for="adjacentInfectable">Infectable Color</label>
            </div>
            <div class="colorSelect">
                <input type="color" id="adjacentRight"
                    @change="UpdateColor(2, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[2]>
                <label for="adjacentRight">Right Click Color</label>
            </div>
            <br>

            <input type="checkbox" id="showStats" v-model="settings.trackerSettings.showStats">
            <label for="showStats">Show Statistics</label>

            <div v-if="settings.trackerSettings.showStats" class="statsOptions">
                <div>
                    <p>Location</p>
                    <div>
                        <input type=radio id="topleft" value="top,left"
                            v-model="settings.trackerSettings.statsLocation">
                        <label for="topleft">Top, Left</label>
                    </div>
                    <div>
                        <input type=radio id="topright" value="top,right"
                            v-model="settings.trackerSettings.statsLocation">
                        <label for="topright">Top, Right</label>
                    </div>
                    <div>
                        <input type=radio id="bottomleft" value="bottom,left"
                            v-model="settings.trackerSettings.statsLocation">
                        <label for="bottomleft">Bottom, Left</label>
                    </div>
                    <div>
                        <input type=radio id="bottomright" value="bottom,right"
                            v-model="settings.trackerSettings.statsLocation">
                        <label for="bottomright">Bottom, Right</label>
                    </div>
                </div>
                <div>
                    <div class="colorSelect">
                        <input type="color" id="statsColor" :value=settings.trackerSettings.statscolor>
                        <label for="statsColor">Font Color</label>
                    </div>
                </div>
            </div>

            <br>
            <div class="multiSelect">
                <h1>Breakouts</h1>
                <div class="colorSelect" v-for="(colorChoice, index) in settings.graphics.colors.slice(3)">
                    <input :id="'adjacentColor' + index" type="color"
                        @change="UpdateColor(index + 3, ($event.target as HTMLInputElement).value)" :value=colorChoice>
                    <label :for="'adjacentColor' + index">Color {{ index + 1 }}</label>
                    <button @click="RemoveColor(index + 3)">Delete</button>
                </div>
                <button class="add" @click="AddColor()">Add</button>
            </div>

            <button @click="setGameAdjacent">Confirm</button>
        </div>
        <div v-if="settings.trackerType == TrackerType.Connect4" class="connect4Options">

            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(0, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[0]>
                <label for="connectBace">Bace Color</label>
            </div>

            <br>
            <label for="connect4Seed">RNG seed: </label>
            <input id="connect4Seed" v-model="settings.trackerSettings.seed" @change="SeedCheck()" size=40 />
            <br>
            <button @click="RefreshSeed()">New Seed</button>
            <p v-if="!seedValid">Bad seed</p>
            <br>
            <input type="checkbox" id="connectOnline" v-model="settings.trackerSettings.online">
            <label for="connectOnline">Use online server</label>
            <div v-if="settings.trackerSettings.online">
                <br>
                <input type="checkbox" id="connectNewGame" v-model="settings.trackerSettings.newGame">
                <label for="connectNewGame">New Game</label>
                <div v-if="!settings.trackerSettings.newGame">
                    <input id="connectGameCode" v-model="settings.trackerSettings.code">
                    <label for="connectGameCode">Room Code</label>
                </div>
            </div>
            <br>

            <div class="colorSelect" v-if="!settings.trackerSettings.online">
                <input type="color" id="connectP1" @change="UpdateColor(1, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[1]>
                <label for="connectP1">Player 1 Color</label>
            </div>

            <div class="colorSelect" v-if="!settings.trackerSettings.online">
                <input type="color" id="connectP2" @change="UpdateColor(2, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[2]>
                <label for="connectP2">Player 2 Color</label>
            </div>

            <div class="multiSelect"  v-if="settings.trackerSettings.online">
                <h1>Players</h1>
                <div class="colorSelect" v-for="(colorChoice, index) in settings.graphics.colors.slice(1)">
                    <input :id="'adjacentColor' + index" type="color"
                        @change="UpdateColor(index + 1, ($event.target as HTMLInputElement).value)" :value=colorChoice>
                    <label :for="'adjacentColor' + index">Player {{ index + 1 }}</label>
                    <button @click="RemoveColor(index + 1)">Delete</button>
                </div>
                <button class="add" @click="AddColor()">Add</button>
            </div>
            <br>
            <button @click="setGameConnect4()">Confirm</button>
        </div>
        <div v-if="settings.trackerType == TrackerType.Domino" class="dominosOptions">

            <div class="colorSelect">
                <input type="color" id="dominoBace" @change="UpdateColor(0, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[0]>
                <label for="dominoBace">Bace Color</label>
            </div>

            <div class="colorSelect">
                <input type="color" id="dominoAvilable"
                    @change="UpdateColor(1, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[1]>
                <label for="dominoAvilable">Available Color</label>
            </div>

            <div class="colorSelect">
                <input type="color" id="dominoRight" @change="UpdateColor(2, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[2]>
                <label for="dominoRight">Right Click Color</label>
            </div>

            <div class="colorSelect">
                <input type="color" id="dominoSelected"
                    @change="UpdateColor(3, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[3]>
                <label for="dominoSelected">Selected Color</label>
            </div>

            <div class="colorSelect">
                <input type="color" id="dominoLast" @change="UpdateColor(4, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[4]>
                <label for="dominoLast">Selected and Available Color</label>
            </div>

            <div class="colorSelect">
                <input type="color" id="dominoLast" @change="UpdateColor(5, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[5]>
                <label for="dominoLast">Last Color</label>
            </div>
            <br>
            <input type="checkbox" id="showStatsDomino" v-model="settings.trackerSettings.showStats">
            <label for="showStatsDomino">Show Last Tagged</label>

            <div v-if="settings.trackerSettings.showStats" class="statsOptions">
                <div>
                    <p>Location</p>
                    <div>
                        <input type=radio id="topleftDomino" value="top,left"
                            v-model="settings.trackerSettings.statsLocation">
                        <label for="topleftDomino">Top, Left</label>
                    </div>
                    <div>
                        <input type=radio id="toprightDomino" value="top,right"
                            v-model="settings.trackerSettings.statsLocation">
                        <label for="toprightDomino">Top, Right</label>
                    </div>
                    <div>
                        <input type=radio id="bottomleftDomino" value="bottom,left"
                            v-model="settings.trackerSettings.statsLocation">
                        <label for="bottomleftDomino">Bottom, Left</label>
                    </div>
                    <div>
                        <input type=radio id="bottomrightDomino" value="bottom,right"
                            v-model="settings.trackerSettings.statsLocation">
                        <label for="bottomrightDomino">Bottom, Right</label>
                    </div>
                </div>
                <div>
                    <div class="colorSelect">
                        <input type="color" id="statsColorDomino" :value=settings.trackerSettings.statscolor>
                        <label for="statsColorDomino">Font Color</label>
                    </div>
                </div>
            </div>

            <button @click="setGameDomino()">Confirm</button>
        </div>
        <div v-if="settings.trackerType == TrackerType.BattleShips" class="battleShipsOptions">

            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(0, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[0]>
                <label for="connectBace">Top Background Color</label>
            </div>
            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(1, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[1]>
                <label for="connectBace">Top Ship Color</label>
            </div>
            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(2, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[2]>
                <label for="connectBace">Top Hit Color</label>
            </div>
            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(3, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[3]>
                <label for="connectBace">Top Sunk Color</label>
            </div>
            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(4, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[4]>
                <label for="connectBace">Top Miss Color</label>
            </div>
            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(5, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[5]>
                <label for="connectBace">Bottom Background Color</label>
            </div>
            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(6, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[6]>
                <label for="connectBace">Bottom Hit Color</label>
            </div>
            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(7, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[7]>
                <label for="connectBace">Bottom Sink Color</label>
            </div>
            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(8, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[8]>
                <label for="connectBace">Bottom Miss Color</label>
            </div>
            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(9, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[9]>
                <label for="connectBace">Right Click Color</label>
            </div>

            <br>
            <input type="checkbox" id="connectNewGame" v-model="settings.trackerSettings.newGame">
            <label for="connectNewGame">New Game</label>
            <div v-if="!settings.trackerSettings.newGame">
                <input id="connectGameCode" v-model="settings.trackerSettings.code">
                <label for="connectGameCode">Room Code</label>
            </div>
        
            <br>
            <button @click="setGameBattleShips()">Confirm</button>
        </div>
    </div>
    <div class="parent" v-if="loading">
        <h1>Connecting to online server</h1>
        <p>Be aware that using the server may result in crashes. I make no promises about how well it will work.</p>
    </div>
</template>

<style scoped>
div.parent {
    width: 100%;
    min-height: 85vh;
    text-align: center;
    padding-top: 5vh;

    h1 {
        display: inline-block;
    }

    span {
        font-size: 1.5em;
        padding: 3vh;
    }

    .basicOptions {
        padding-top: 5vh;
    }

    .adjacentOptions {
        padding-top: 5vh;

        .statsOptions {
            padding: 2vw 0;

            div {
                display: inline-block;
                vertical-align: middle;

                div {
                    display: block;
                    padding: 1vh 2vh;
                }
            }
        }
    }
}
</style>
