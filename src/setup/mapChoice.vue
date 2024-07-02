<script lang="ts">
import { defineComponent, inject, type PropType } from 'vue'
import type { GraphicsInfo, Settings, Point } from './../Types'
import { HexInfo } from './../Types'
import Mapper from './../utils/mapper'
import Random from './../utils/randomNumbeGenerator'

export default defineComponent({
    data() {
        return {
            settings: inject('settings') as Settings,
            shuffle: true,
            mapGraphicsInfo: {
                border: 10,
                hexBorder: 'rgb(0,0,0)',
                background: 'rgb(10,10,10)',
                colors: ['white'],
                imageType: "",
                borderExpand: false,
                toolTip: false
            } as GraphicsInfo,
            hexes: [] as HexInfo[],
            validSeed: false
        };
    },
    props: {
        size: {
            type: Number,
            required: true
        }
    },
    methods: {
        DrawMap() {
            let mons = this.makeMap();
            let { locations, radius } = Mapper.GetLocations(mons, window.innerWidth / 2, window.innerWidth - 2 * this.mapGraphicsInfo.border, 2 * this.mapGraphicsInfo.border, window.innerHeight / 2)
            this.mapGraphicsInfo.hexRadius = radius

            this.hexes = locations.map(mon =>
                new HexInfo(mon, 0, '')
            );

        },
        setMap() {
            if (this.shuffle && !Random.CheckSeed(this.settings.seed!)) {
                alert("Bad seed")
                return;
            }

            let map = this.makeMap();

            if (map.length != this.size) {
                alert('Edge length not large enough')
                return;
            }

            this.$emit('complete', map);

        },
        makeMap() {
            let map = [] as Point[];
            if (this.settings.map.type == 'hexCutEdge') {
                map = Mapper.GetHexCutEdgeMap(this.size);
            }
            else if (this.settings.map.type == 'maxDonut') {
                map = Mapper.GetMaxDonutMap(this.size);
            }
            else if (this.settings.map.type == 'maxHexCutBottom') {
                map = Mapper.GetMaxHexCutBottomMap(this.size);
            }
            else if (this.settings.map.type == 'random1') {
                if (this.settings.map.seed == null) {
                    this.settings.map.seed = Random.NewSeedString();
                }
                map = Mapper.GetRandomMap(1, this.settings.map.seed, this.size);
            }
            else if (this.settings.map.type == 'random2') {
                if (this.settings.map.seed == null) {
                    this.settings.map.seed = Random.NewSeedString();
                }
                map = Mapper.GetRandomMap(2, this.settings.map.seed!, this.size);
            }
            else if (this.settings.map.size == null) {
                return map;
            }
            else if (this.settings.map.type == 'donut') {
                map = Mapper.GetDonutMap(this.settings.map.size, this.size);
            }
            else if (this.settings.map.type == 'rectangle') {
                map = Mapper.GetRectangleMap(this.settings.map.size, this.size);
            }
            else if (this.settings.map.type == 'hexCutBottom') {
                map = Mapper.GetHexCutBottomMap(this.settings.map.size, this.size);
            }
            else if (this.settings.map.type == 'longHex') {
                map = Mapper.GetLongHexMap(this.settings.map.size, this.size);
            }

            if (this.settings.map.horizontalFlip || this.settings.map.verticalFlip) {
                map.forEach(entry => {
                    if (this.settings.map.horizontalFlip) {
                        entry.x = - entry.y - entry.x
                    }
                    if (this.settings.map.verticalFlip) {
                        entry.x += entry.y
                        entry.y = - entry.y
                    }
                })
            }

            return map;
        },
        ReseedRandomMap() {
            this.settings.map.seed = Random.NewSeedString();
            this.DrawMap();
        },
        ReseedLayout() {
            this.settings.seed = Random.NewSeedString();
            this.SeedCheck();
        },
        SeedCheck() {
            this.validSeed = Random.CheckSeed(this.settings.seed)
        },
        Width() {
            return window.innerWidth;
        },
        Height() {
            return window.innerHeight;
        }
    },
    mounted() {
        this.DrawMap();
        this.SeedCheck();
    },
})
</script>

<template>
    <div class="parent">
        <h1>Choose layout</h1>

        <p>Simple Maps</p>
        <div>
            <input type="radio" id="hexCutEdge" value="hexCutEdge" v-model="settings.map.type" @change="DrawMap" />
            <label for="hexCutEdge">Hexagon built with a spiral</label>
        </div>
        <div>
            <input type="radio" id="maxDonut" value="maxDonut" v-model="settings.map.type" @change="DrawMap" />
            <label for="maxDonut">Heagon with a hole in the middle</label>
        </div>
        <div>
            <input type="radio" id="maxHexCutBottom" value="maxHexCutBottom" v-model="settings.map.type"
                @change="DrawMap" />
            <label for="maxHexCutBottom">Hexagon built layer by layer</label>
        </div>

        <p>Size Controlled Maps</p>
        <div>
            <input type="radio" id="donut" value="donut" v-model="settings.map.type" @change="DrawMap" />
            <label for="donut">Donut</label>
        </div>
        <div>
            <input type="radio" id="rectangle" value="rectangle" v-model="settings.map.type" @change="DrawMap" />
            <label for="rectangle">Rectangle</label>
        </div>
        <div>
            <input type="radio" id="hexCutBottom" value="hexCutBottom" v-model="settings.map.type" @change="DrawMap" />
            <label for="hexCutBottom">Hexagon (missing bottom)</label>
        </div>
        <div>
            <input type="radio" id="longHex" value="longHex" v-model="settings.map.type" @change="DrawMap" />
            <label for="longHex">Stretched Hexagon</label>
        </div>

        <div v-if="settings.map.type == 'donut' || settings.map.type == 'rectangle' || settings.map.type == 'hexCutBottom' || settings.map.type == 'longHex'"
            class="sizeBox">
            <lable for="edgeLength">Size: </lable>
            <input type="number" id="edgeLength" v-model="settings.map.size" @change="DrawMap" />
        </div>

        <p>Random Maps</p>
        <div>
            <input type="radio" id="random2Map" value="random2" v-model="settings.map.type" @change="DrawMap" />
            <label for="random2Map">Random Map</label>
        </div>
        <div>
            <input type="radio" id="random1Map" value="random1" v-model="settings.map.type" @change="DrawMap" />
            <label for="random1Map">Very Random Map</label>
        </div>
        <div v-if="settings.map.type == 'random1' || settings.map.type == 'random2'">
            <button @click="ReseedRandomMap()">Change Map</button>
        </div>

        <div class="shuffleBox">
            <input type="checkbox" id="shuffle" v-model="shuffle" />
            <label for="shuffle">Shuffle Board</label>

            <div v-if="shuffle">
                <label for="randomSeed">RNG seed: </label>
                <input id="randomSeed" v-model="settings.seed" size=40 @change="SeedCheck()" />
                <br>
                <button @click="ReseedLayout()">New Seed</button>
                <p v-if="!validSeed">Bad seed</p>
            </div>
        </div>

        <input type="checkbox" id="mapflipHorizontal" v-model="settings.map.horizontalFlip" @change="DrawMap">
        <lable for="mapflipHorizontal">Flip map horizontally</lable>
        <br>
        <input type="checkbox" id="mapflipVertical" v-model="settings.map.verticalFlip" @change="DrawMap">
        <lable for="mapflipVertical">Flip map vertically</lable>

        <div>
            <hex v-for="mon in hexes" :hexInfo="mon" :graphicsInfo=mapGraphicsInfo>
            </hex>
        </div>

        <div class="mapBox" :style="'left:' + (Width() / 2 - mapGraphicsInfo.border) + 'px;' +
            'width: ' + (Width() / 2) + 'px;' +
            'top: ' + (mapGraphicsInfo.border) + 'px;' +
            'height: ' + (Height() / 2) + 'px;'">
        </div>

        <div class="confirmButton">
            <button v-if="hexes.length == size && (!shuffle || validSeed)" @click="setMap()">Confirm</button>
        </div>
    </div>
</template>

<style scoped>
div.parent {
    min-height: 85vh;
    padding-top: 5vh;
    padding-left: 5vw;

    div input[type="radio"] {
        margin: 1vh 2ch;
    }

    .sizeBox {
        padding-top: 3vh;
    }

    .shuffleBox {
        padding-top: 3vh;

        #randomSeed {
            width: 40ch;
            margin: 1vw 0;
        }

        button {
            font-size: .8em;
            padding: 5px;
        }

        p {
            color: red;
            font-size: 1.5em;
        }
    }

    .confirmButton {
        text-align: center;

        button {
            display: inline-block;
        }
    }

    .mapBox {
        border: solid black 1px;
        position: fixed;
    }
}
</style>
