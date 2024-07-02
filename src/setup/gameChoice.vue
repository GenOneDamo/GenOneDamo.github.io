<script lang="ts">
import basicTracker from './../trackers/basicTracker'
import adjacentTracker from './../trackers/adjacentTracker'
import connect4Tracker from './../trackers/connect4Tracker'
import dominoTracker from './../trackers/dominoTracker'
import { defineComponent, inject, type PropType } from 'vue'
import type { Settings, InfoSettings } from './../Types'
import type { PlayStyle } from './../Types'
import Random from './../utils/randomNumbeGenerator'

export default defineComponent({
    data() {
        return {
            playStyle: inject('playStyle') as PlayStyle,
            settings: inject('settings') as Settings,
            seedValid: false
        };
    },
    props: {
        size: {
            type: Number,
            required: true
        }
    },
    methods: {

        setDefaultTracker(game: string) {
            if (game == "basic") {
                this.settings.graphics.colors = ['#ffffff', '#0000ff', '#ff0000', '#00ff00']
            }
            else if (game == "adjacent") {
                this.settings.trackerSettings = {
                    showStats: true,
                    statsLocation: "bottom,right",
                    statscolor: "#ffffff"
                } as InfoSettings
                this.settings.graphics.colors = ['#ffffff', '#00ffff', '#ff0000', '#0000ff', '#32cd32', '#ffff00', '#ffa500', '#808080', '#800080', '#8b3513', '#ff00ff', '#006400', '#191970']
            }
            else if (game == "connect4") {
                this.settings.graphics.colors = ['#ffffff', '#ff0000', '#0000ff']
                this.settings.trackerSettings = Random.NewSeedString();
            }
            else if (game == "domino") {
                this.settings.graphics.colors = ['#ffffff', '#ffff99', '#ff0000', '#0000ff', '#0030b7', '#ffff00']
                this.settings.trackerSettings = {
                    showStats: true,
                    statsLocation: "bottom,right",
                    statscolor: "#ffffff"
                } as InfoSettings
            }
            this.settings.trackerType = game;

        },
        SetGame() {
            if (this.settings.trackerType == "basic") {
                return this.setGameBasic();
            }
            if (this.settings.trackerType == "adjacent") {
                return this.setGameAdjacent();
            }
            if (this.settings.trackerType == "connect4") {
                return this.setGameConnect4();
            }
            if (this.settings.trackerType == "domino") {
                return this.setGameDomino();
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
            this.playStyle = new connect4Tracker(this.settings.trackerSettings);
            this.$emit('complete');
        },
        setGameDomino() {
            this.playStyle = new dominoTracker(this.settings.trackerSettings);
            this.$emit('complete');
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
            this.settings.trackerSettings = Random.NewSeedString();
        },
        SeedCheck() {
            this.seedValid = Random.CheckSeed(this.settings.trackerSettings);
        }
    }
})
</script>

<template>
    <div class="parent">
        <h1>Select tracking type</h1>
        <br>
        <span>
            <input type="radio" name="gameType" id="basic" value="basic" @change="setDefaultTracker('basic')"
                :checked="settings.trackerType == 'basic'" />
            <label for="basic">Basic</label>
        </span>
        <span>
            <input type="radio" name="gameType" id="adjacent" value="adjacent" @change="setDefaultTracker('adjacent')"
                :checked="settings.trackerType == 'adjacent'" />
            <label for="adjacent">Zombie</label>
        </span>
        <span>
            <input type="radio" name="gameType" id="connect4" value="connect4" @change="setDefaultTracker('connect4')"
                :checked="settings.trackerType == 'connect4'" />
            <label for="connect4">Connect 4</label>
        </span>
        <span>
            <input type="radio" name="gameType" id="domino" value="domino" @change="setDefaultTracker('domino')"
                :checked="settings.trackerType == 'domino'" />
            <label for="domino">Domino</label>
        </span>

        <div v-if="settings.trackerType != ''">
            <p>Click color to change it.</p>
        </div>

        <div v-if="settings.trackerType == 'basic'" class="basicOptions">

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
        <div v-if="settings.trackerType == 'adjacent'" class="adjacentOptions">

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
        <div v-if="settings.trackerType == 'connect4'" class="connect4Options">

            <div class="colorSelect">
                <input type="color" id="connectBace" @change="UpdateColor(0, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[0]>
                <label for="connectBace">Bace Color</label>
            </div>

            <div class="colorSelect">
                <input type="color" id="connectP1" @change="UpdateColor(1, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[1]>
                <label for="connectP1">Player 1 Color</label>
            </div>

            <div class="colorSelect">
                <input type="color" id="connectP2" @change="UpdateColor(2, ($event.target as HTMLInputElement).value)"
                    :value=settings.graphics.colors[2]>
                <label for="connectP2">Player 2 Color</label>
            </div>
            <br>
            <label for="connect4Seed">RNG seed: </label>
            <input id="connect4Seed" v-model="settings.trackerSettings" @change="SeedCheck()" size=40 />
            <br>
            <button @click="RefreshSeed()">New Seed</button>
            <p v-if="!seedValid">Bad seed</p>
            <br>
            <button @click="setGameConnect4()">Confirm</button>
        </div>
        <div v-if="settings.trackerType == 'domino'" class="dominosOptions">

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
