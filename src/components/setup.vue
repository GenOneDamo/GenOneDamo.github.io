<script lang="ts">
import basicTracker from './../utils/basicTracker'
import adjacentTracker from './../utils/adjacentTracker' 
import RandomNumbeGenerator from './../utils/randomNumbeGenerator' 
import {names} from './../utils/monData' 
import Mapper from './../utils/mapper'
import {defineComponent, inject} from 'vue'
import {HexInfo} from './../Types'
import type {GraphicsInfo, PlayStyle, Point, SharableSetttings, ZombieSettings} from './../Types'

export default defineComponent({
  data() {
    return {
      transformedMons: inject('transformedMons') as HexInfo[],
      graphicsInfo: inject('graphicsInfo') as GraphicsInfo,
      playStyle: inject('playStyle') as PlayStyle,
      frame: "initalFrame",
      rng: null as RandomNumbeGenerator | null,
      settingsString: "",
      includedMons: [] as number[],
      includedMonString: "1-151",
      mapType: "",
      edgeLength: 10,
      shuffle: true,
      randomSeed: RandomNumbeGenerator.NewSeedString(),
      tempMap: [] as HexInfo[],
      tempGraphicsInfo: {
        border: 10,
        hexBorder: 'rgb(0,0,0)',
        background: 'rgb(10,10,10)',
        colors: ['white'],
        imageType: "",
        borderExpand: false,
        toolTip: false
      } as GraphicsInfo,
      gameType: "",
      trackerSettings: null as any
    };
  },
  methods:{
    FinishSetup(){
        let mons = this.makeMapFromPage()

        let locations = this.getLocations(mons)

        if (this.shuffle)
        {
            this.rng = new RandomNumbeGenerator(this.randomSeed);
            let orders = this.rng.Shuffle(this.includedMons.length);
            var counter = 0;
            this.transformedMons = locations.map(mon => 
                new HexInfo(
                    mon,
                    this.includedMons[orders[counter]],
                    names[this.includedMons[orders[counter++]]-1]
                )
            );
        }
        else{
            var counter = 0;
            this.transformedMons = locations.map(mon => 
            new HexInfo(
                mon,
                this.includedMons[counter],
                names[this.includedMons[counter++]-1]
            ))
        }

      this.frame = ""
      this.$emit('setup-complete')
    },
    LoadSettings(){
        try{
            var settings = JSON.parse(this.settingsString) as SharableSetttings
        }
        catch{
            alert("Bad settings")
            return;
        }

        this.includedMonString = settings.includedPokemon
        this.includedMons = this.StringToMons(settings.includedPokemon)

        if (this.includedMons.length == 0)
        {
            alert("Bad settings")
            return;
        }

        this.mapType = settings.map.type;
        this.edgeLength = settings.map.size == null ? 10 : settings.map.size;

        let map = this.makeMap(this.mapType, this.edgeLength, this.includedMons.length)

        if (this.includedMons.length != map.length)
        {
            alert("Bad settings")
            return;
        }

        this.shuffle = (settings.seed != null);
        if (this.shuffle){
            this.randomSeed = settings.seed!;
            if (!RandomNumbeGenerator.CheckSeed(this.randomSeed))
            {
                alert("Bad settings")
                return;
            }
        }

        this.graphicsInfo = settings.graphics
        
        this.trackerSettings = settings.trackerSettings;
        this.gameType = settings.trackerType;
        if (this.gameType == "basic")
        {
            this.playStyle = new basicTracker(this.graphicsInfo.colors.length);

        }
        else if (this.gameType == "adjacent")
        {
            this.playStyle = new adjacentTracker(this.graphicsInfo.colors.length-3, this.includedMons.length, this.trackerSettings);
        }
        else
        {
            alert("Bad settings")
            return;
        }
        
        this.frame = 'finalize'
    },
    getLocations(mons: Point[]){
      let {locations,radius} = Mapper.GetLocations(mons,this.graphicsInfo.border,window.innerWidth - 2 * this.graphicsInfo.border,this.graphicsInfo.border,window.innerHeight - 2 * this.graphicsInfo.border)
      this.graphicsInfo.hexRadius = radius
      return locations;
    },
    refresh()
    {
      let mons = this.transformedMons.map(m => m.location.index)
      let locations = this.getLocations(mons)

      locations.forEach( newLoc  => {
        let mon = this.transformedMons.find(mon => mon.location.index == newLoc.index)
        if (mon == null)
        {
          return;
        }
        mon.location.coordinates = newLoc.coordinates;
      })
    },
    startMons(){

        this.frame = 'monsSelect'
    },
    defineMons()
    {
        this.includedMons = this.StringToMons(this.includedMonString);
        let graphicsInfo = this.tempGraphicsInfo;
        this.tempGraphicsInfo = this.graphicsInfo;
        this.graphicsInfo = graphicsInfo;

        if (this.mapType != "")
        {
            this.CheckMap();
        }
        this.frame = "mapSelect"
    },
    StringToMons(monString: string)
    {
        let mons = [] as number[]
        monString.split(',').forEach(bit => {
            if (bit.includes('-'))
            {
                let range = bit.split('-');
                let start = parseInt(range[0]);
                let stop = parseInt(range[1]);
                if (isNaN(start) || start > names.length || isNaN(stop) || stop > names.length || start > stop || range.length != 2)
                {
                    return [] as number[]
                } 
                for (let i = start; i <= stop; i++)
                {
                    mons.push(i);
                }
            }
            else{
                var int = parseInt(bit)
                if (isNaN(int) || int > names.length)
                {
                    return [] as number[]
                }
                mons.push(int)
            }
        })
        return mons;
    },
    NamesFromMonString()
    {
        let monNames = this.includedMonString.split(',').map((bit) => {
            if (bit.includes('-'))
            {
                let range = bit.split('-');
                let start = parseInt(range[0]);
                let stop = parseInt(range[1]);
                if (isNaN(start) || start > names.length || isNaN(stop) || stop > names.length || start > stop || range.length != 2)
                {
                    return ""
                } 
                return names[start-1] + ' - ' + names[stop-1]

            }
            else{
                var int = parseInt(bit)
                if (isNaN(int) || int > names.length)
                {
                    return ""
                } 
                return names[int-1]
            }
        }) as string[]

        if (monNames.includes(""))
        {
            return "Bad Format"
        }
        return monNames.join(', ')
    },
    BackFromMap()
    {

        let graphicsInfo = this.tempGraphicsInfo;
        this.tempGraphicsInfo = this.graphicsInfo;
        this.graphicsInfo = graphicsInfo;
        this.frame='monsSelect';
    },
    CheckMap(){     
        let mons = this.makeMapFromPage();
        let {locations,radius} = Mapper.GetLocations(mons,window.innerWidth / 2,window.innerWidth - 2 * this.graphicsInfo.border, 2 * this.graphicsInfo.border,window.innerHeight / 2)
        this.graphicsInfo.hexRadius = radius

        this.tempMap = locations.map(mon => 
            new HexInfo(mon,  0, '' )
        );

    },
    setMap(){
        if (this.shuffle && !RandomNumbeGenerator.CheckSeed(this.randomSeed) )
        {
            alert ("Bad seed")
            return;
        }

        let mons = this.makeMapFromPage()
        if (mons.length != this.includedMons.length)
        {
            alert ('Edge length not large enough')
            return;
        }

        let graphicsInfo = this.tempGraphicsInfo;
        this.tempGraphicsInfo = this.graphicsInfo;
        this.graphicsInfo = graphicsInfo;

        this.frame = "gameSelect"
    },
    makeMapFromPage()
    {
        return this.makeMap(this.mapType, this.edgeLength, this.includedMons.length)
    },
    makeMap(type: string, edgeLength: number | null, mapSize: number){    
        if (type == 'hexCutEdge')
        {
            return Mapper.GetHexCutEdgeMap(mapSize);
        }
        if (type == 'maxDonut')
        {
            return Mapper.GetMaxDonutMap(mapSize);
        }
        if (type == 'maxHexCutBottom')
        {
            return Mapper.GetMaxHexCutBottomMap(mapSize);
        }
        if (edgeLength == null)
        {
            return [] as Point[]
        }
        if (type == 'donut')
        {
            return Mapper.GetDonutMap(edgeLength, mapSize);
        }
        if (type == 'rectangle')
        {
            return Mapper.GetRectangleMap(edgeLength, mapSize);
        }
        if (type == 'hexCutBottom')
        {
            return Mapper.GetHexCutBottomMap(edgeLength, mapSize);
        }
        if (type == 'longHex')
        {
            return Mapper.GetLongHexMap(edgeLength, mapSize);
        }
    
        return [] as Point[]
    },
    RevisitMap()
    {
        let graphicsInfo = this.tempGraphicsInfo;
        this.tempGraphicsInfo = this.graphicsInfo;
        this.graphicsInfo = graphicsInfo;
        this.CheckMap();
        this.frame = 'mapSelect'
    },
    seedCheck()
    {
        return RandomNumbeGenerator.CheckSeed(this.randomSeed);
    },
    RefreshSeed(){
        this.randomSeed = RandomNumbeGenerator.NewSeedString()
    },
    setDefaultTracker(game: string)
    {
        if (game=="basic")
        {
            this.graphicsInfo.colors = ['#ffffff','#0000ff','#ff0000','#00ff00']

        }
        else if (game=="adjacent")
        {
            this.trackerSettings = {
                showStats: true,
                statsLocation: "bottom,right",
                statscolor: "#ffffff"
            } as ZombieSettings
            this.graphicsInfo.colors = ['#ffffff','#00ffff','#ff0000','#0000ff','#32cd32','#ffff00','#ffa500','#808080','#800080','#8b3513','#ff00ff','#006400','#191970']
        }
        this.gameType = game;

    },
    setGameBasic()
    {
          this.playStyle = new basicTracker(this.graphicsInfo.colors.length);
          this.frame = 'graphicsSelect'
    },
    setGameAdjacent()
    {
          this.playStyle = new adjacentTracker(this.graphicsInfo.colors.length-3, this.includedMons.length, this.trackerSettings);
          this.frame = 'graphicsSelect'
    },
    UpdateColor(position: number, color: string){
        this.graphicsInfo.colors[position] = color
    },
    RemoveColor(position: number){
        this.graphicsInfo.colors.splice(position, 1)
    },
    AddColor()
    {
        const hex = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f']
        let color="#"    
        for (let i=0; i<6; i++)
        {
            color += hex[Math.floor(Math.random() * 16 )]
        } 

        this.graphicsInfo.colors.push(color)
    },
    setGraphics(){
        this.frame = 'finalize';
    },
    CopySettings(){
        navigator.clipboard.writeText(JSON.stringify(this.MakeSettingString()));
    },
    DownloadSettings(){

        const settings = JSON.stringify(this.MakeSettingString())
        const blob = new Blob([settings], {type: 'application/json'})
        const objUrl = window.URL.createObjectURL(blob);      
        const link = document.createElement("a");      
        link.href = objUrl;      
        link.download = "settings.json";      
        link.click();      
        setTimeout(() => {        
            window.URL.revokeObjectURL(objUrl);      
        }, 250);    

    },
    MakeSettingString()
    {
        let settings = 
        {
            includedPokemon: this.includedMonString,
            graphics: this.graphicsInfo,
            map: {type: this.mapType, size: this.edgeLength},
            seed: this.shuffle ? this.randomSeed : null,
            trackerType: this.gameType,
            trackerSettings: this.trackerSettings
        } as SharableSetttings

        return settings;
    },
    GetSeed()
    {
        if (this.rng == null)
        {
            return "Non existant"
        }
        return this.rng.seed;
    },
    OpenHelp()
    {
        window.open('help.html', '_blank')!.focus()
    },
    Width()
    {
        return window.innerWidth;
    },
    Height()
    {
        return window.innerHeight;
    }
  },
  mounted() {
    this.graphicsInfo.border = 10;
    this.graphicsInfo.hexBorder = '#000000';
    this.graphicsInfo.background = '#000000';
    this.graphicsInfo.borderExpand = true;
    this.graphicsInfo.toolTip = true;
    this.graphicsInfo.fudge = 1.4;
    this.graphicsInfo.imageType = "gen5";
  }
})
</script>

<template>
    <div v-if="frame=='initalFrame'" class="firstFrame">
        <div>
            <button @click="startMons()">New Tracker</button>
            <button @click="frame = 'settingsLoad'">Load from settings</button>
        </div>
    </div>
    <div v-if="frame=='settingsLoad'" class="settingsLoad">
        <textarea v-model="settingsString" placeholder="Paste settings here"></textarea>
        <br>
        <button @click="LoadSettings()">Load</button>    
    </div>
    <div v-if="frame=='monsSelect'" class="monNames">
        <h1>Choose which pokemon to track</h1>
        <div class="nameDiv">
            <p>{{NamesFromMonString()}}</p>
        </div>
        <input v-model="includedMonString"/>
        <p>
            Type the national dex numbers of the Pokémon you would like to track. You can list ranges and individual Pokémon seperated by commas. e.g. "1-3, 5, 7-12, 15".
        </p>
        <br>
        <button v-if="NamesFromMonString() != 'Bad Format'" @click="defineMons">Confirm</button>
    </div>
    <div v-if="frame=='mapSelect'" class="mapSelect">
        <h1>Choose layout</h1>

        <p>Simple Maps</p>
        <div>
            <input type="radio" id="hexCutEdge" value="hexCutEdge" v-model="mapType" @change="CheckMap"/>
            <label for="hexCutEdge">Hexagon built with a spiral</label>
        </div>
        <div>
            <input type="radio" id="maxDonut" value="maxDonut" v-model="mapType" @change="CheckMap"/>
            <label for="maxDonut">Heagon with a hole in the middle</label>
        </div>
        <div>
            <input type="radio" id="maxHexCutBottom" value="maxHexCutBottom" v-model="mapType" @change="CheckMap"/>
            <label for="maxHexCutBottom">Hexagon built layer by layer</label>
        </div>

        <p>Size Controlled Maps</p>
        <div>
            <input type="radio" id="donut" value="donut" v-model="mapType" @change="CheckMap"/>
            <label for="donut">Donut</label>
        </div>
        <div>
            <input type="radio" id="rectangle" value="rectangle" v-model="mapType" @change="CheckMap"/>
            <label for="rectangle">Rectangle</label>
        </div>
        <div>
            <input type="radio" id="hexCutBottom" value="hexCutBottom" v-model="mapType" @change="CheckMap"/>
            <label for="hexCutBottom">Hexagon (missing bottom)</label>
        </div>
        <div>
            <input type="radio" id="longHex" value="longHex" v-model="mapType" @change="CheckMap"/>
            <label for="longHex">Stretched Hexagon</label>
        </div>
        
        <div v-if="mapType == 'donut' || mapType == 'rectangle' || mapType == 'hexCutBottom' || mapType == 'longHex'" class="sizeBox">
            <lable for="edgeLength">Size: </lable>
            <input type="number" id="edgeLength" v-model="edgeLength" @change="CheckMap"/>
        </div>

        <div class="shuffleBox">
            <input type="checkbox" id="shuffle" v-model="shuffle"/>
            <label for="shuffle">Shuffle</label>
        
            <div v-if="shuffle">
                <label for="randomSeed">RNG seed: </label>
                <input id="randomSeed" v-model="randomSeed" size=40/>
                <br>
                <button @click="RefreshSeed()">New Seed</button>
                <p v-if="!seedCheck()">Bad seed</p>
            </div>
        </div>

        <div>
            <hex 
                v-for="mon in tempMap"
                v-bind:hexInfo="mon">
            </hex>
        </div>

        <div class="mapBox" :style="
            'left:' + (Width() / 2 - graphicsInfo.border ) + 'px;' +
            'width: ' +  (Width() / 2) + 'px;' +
            'top: ' + (graphicsInfo.border) + 'px;' +
            'height: '+ (Height() / 2) + 'px;'">
        </div>

        <div class="confirmButton">
            <button v-if="tempMap.length == includedMons.length && (!shuffle || seedCheck())" @click="setMap">Confirm</button>
        </div>
    </div>
    <div v-if="frame=='gameSelect'" class="gameSelect">
        <h1>Select tracking type</h1>
        <br>
        <span>
            <input type="radio" name="gameType" id="basic" value="basic" @change="setDefaultTracker('basic')"/>
            <label for="basic">Basic</label>
        </span>
        <span>
            <input type="radio" name="gameType" id="adjacent" value="adjacent" @change="setDefaultTracker('adjacent')"/>
            <label for="adjacent">Zombie</label>
        </span>

        <div v-if="gameType!=''">
            <p>Click color to change it.</p>
        </div>

        <div v-if="gameType == 'basic'" class="basicOptions">

            <div class="colorSelect">     
                <input type="color" id="basicBace"  @change="UpdateColor(0, ($event.target as HTMLInputElement).value)" :value=graphicsInfo.colors[0]>
                <label for="basicBace">Bace Color</label> 
            </div>

            <div class="multiSelect">
                <h1>Marking Colors</h1>
                <div class="colorSelect" v-for="(colorChoice, index) in graphicsInfo.colors.slice(1)">
                    <input :id="'basicColor' + index" type="color" @change="UpdateColor(index + 1, ($event.target as HTMLInputElement).value)" :value=colorChoice>
                    <label :for="'basicColor' + index">Color {{ index + 1 }}</label>
                    <button @click="RemoveColor(index + 1)">Delete</button>
                </div>
                <button class="add" @click="AddColor()">Add</button>
            </div>

            <button @click="setGameBasic()">Confirm</button>
        </div>
        <div v-if="gameType == 'adjacent'" class="adjacentOptions">

            <div class="colorSelect">     
                <input type="color" id="adjacentBace"  @change="UpdateColor(0, ($event.target as HTMLInputElement).value)" :value=graphicsInfo.colors[0]>
                <label for="basicBace">Bace Color</label> 
            </div>
            <div class="colorSelect">     
                <input type="color" id="adjacentInfectable"  @change="UpdateColor(0, ($event.target as HTMLInputElement).value)" :value=graphicsInfo.colors[1]>
                <label for="adjacentInfectable">Infectable Color</label> 
            </div>
            <div class="colorSelect">     
                <input type="color" id="adjacentRight"  @change="UpdateColor(0, ($event.target as HTMLInputElement).value)" :value=graphicsInfo.colors[2]>
                <label for="adjacentRight">Right Click Color</label> 
            </div>
            <br>


            <input type="checkbox" id="showStats" v-model="trackerSettings.showStats">
            <label for="showStats">Show Statistics</label>

            <div v-if="trackerSettings.showStats" class="statsOptions">
                <div>
                    <p>Location</p>
                    <div>
                        <input type=radio id="topleft" value="top,left" v-model="trackerSettings.statsLocation">
                        <label for="topleft">Top, Left</label>
                    </div>
                    <div>
                        <input type=radio id="topright" value="top,right" v-model="trackerSettings.statsLocation">
                        <label for="topright">Top, Right</label>
                    </div>
                    <div>
                        <input type=radio id="bottomleft" value="bottom,left" v-model="trackerSettings.statsLocation">
                        <label for="bottomleft">Bottom, Left</label>
                    </div>
                    <div>
                        <input type=radio id="bottomright" value="bottom,right" v-model="trackerSettings.statsLocation">
                        <label for="bottomright">Bottom, Right</label>
                    </div>
                </div>
                <div>    
                    <div class="colorSelect">     
                        <input type="color" id="statsColor" :value=trackerSettings.statscolor>
                        <label for="statsColor">Font Color</label> 
                    </div>
                </div>
            </div>

            <br>
            <div class="multiSelect">
                <h1>Breakouts</h1>
                <div class="colorSelect" v-for="(colorChoice, index) in graphicsInfo.colors.slice(3)">
                    <input :id="'adjacentColor' + index" type="color" @change="UpdateColor(index + 3, ($event.target as HTMLInputElement).value)" :value=colorChoice>
                    <label :for="'adjacentColor' + index">Color {{ index + 1 }}</label>
                    <button @click="RemoveColor(index + 1)">Delete</button>
                </div>
                <button class="add" @click="AddColor()">Add</button>
            </div>

            <button @click="setGameAdjacent">Confirm</button>
        </div>

    </div>
    <div v-if="frame=='graphicsSelect'" class="graphicsSelect">
        <h1>Graphics settings</h1>
        <div class="colorSelect">     
            <input type="color" id="background"  v-model="graphicsInfo.background">
            <label for="background">Background color</label> 
        </div>
        <div class="colorSelect">     
            <input type="color" id="hexBorder"  v-model="graphicsInfo.hexBorder">
            <label for="hexBorder">Border around each hexagon</label> 
        </div>
        <div>
            <input type="number" id="border" v-model="graphicsInfo.border" />
            <label for="border">border width (around entire tracker)</label>
        </div>
        <div>
            <p>Sprite Style</p>
            <div>
                <input type="radio" id="gen5" value="gen5" v-model="graphicsInfo.imageType"/>
                <label for="gen5">Gen 5 + Smogen sprite project (limit gen 8)</label>
            </div>
            <div>
                <input type="radio" id="home" value="home" v-model="graphicsInfo.imageType"/>
                <label for="home">Home sprites</label>
            </div>
        </div>
        <div>
            <input type="number" id="fudge" v-model="graphicsInfo.fudge" />
            <label for="fudge">Fudge factor</label>
            <p>A factor of 1 will ensure that no image goes outside the hexagon. Increasing this will increase the size of the image relative to the hexagon. It is recommeded to have this a little bit larger than 1.</p>
        </div>
        <div>
            <input type="checkbox" id="borderExpand" v-model="graphicsInfo.borderExpand" />
            <label for="borderExpand">Mouse over effects</label>
            <div v-if="graphicsInfo.borderExpand">
                <input type="checkbox" id="toolTip" v-model="graphicsInfo.toolTip" />
                <label for="toolTip">Show Pokémon names on mouse</label>
            </div>
        </div>
        <span class="confirmBox">
            <button @click="setGraphics">Confirm</button>  
        </span>
    </div>
    <div v-if="frame=='finalize'" class="finalize">
        <h1>Settings</h1>
        <pre>{{ JSON.stringify(MakeSettingString(),null,2) }}</pre>
        <div class="buttons">
            <button @click="CopySettings()">Copy settings to clipboard</button>
            <button @click="DownloadSettings()">Download settings</button>
            <br>
            <button @click="FinishSetup">Start</button>
        </div>
    </div>
    <div v-if="frame!=''" class="help">
        <div class="backButton">
            <button  v-if="frame=='settingsLoad'" @click="frame='initalFrame'">Back</button>
            <button v-if="frame=='monsSelect'" @click="frame='initalFrame'">Back</button>
            <button v-if="frame=='mapSelect'" @click="BackFromMap()">Back</button>           
            <button v-if="frame=='gameSelect'" @click="RevisitMap()">Back</button> 
            <button v-if="frame=='graphicsSelect'" @click="frame='gameSelect'">Back</button>
            <button v-if="frame=='finalize'" @click="frame='graphicsSelect'">Back</button>
        </div>
        <div class="helpButton">
            <button @click="OpenHelp()">View Help Page</button>
        </div>
    </div>
</template>

<style scoped>

    button {
        padding: 15px 30px;
        margin: 20px;
    }

    
    input {
        vertical-align: middle;
    }

    label {
        vertical-align: middle;
    }

    input[type="checkbox"] {
        width: 2em;
        height: 2rem;
        padding-right: 1em
    }


    div.colorSelect {
        display: inline-block;
        padding: 0 3vw;

        input {
            width: 10vw;
            height: 10vh;
            padding: 0;
            border: 0;
            margin: 1vw 1vh;
        }

        label {
            font-size: 2em;
        }

    }

    .multiSelect {
        padding-left: 5vw;
        text-align: left;

        div.colorSelect {
            padding: 2vw 0;
            display: block;

            button {
                padding: 10px;
            }
        }

        button.add {
            margin-left: 0;
        }
    }


    .firstFrame{
        min-height: 50vh;
        text-align:center;
        padding-top: 40vh;

        div {
            display: inline-block;
        }
    }

    .settingsLoad{
        width: 100%;
        min-height: 85vh;
        text-align:center;
        padding-top: 5vh;

        textarea {
            display: inline-block;
            padding: 20px;
            width: 80%;
            height: 60vh;
        }

        button
        {
            display: inline-block;
        }
    }

    .monNames{
        width: 100vw;
        min-height: 85vh;
        text-align:center;
        padding-top: 5vh;

        .nameDiv{
            min-height: 5vh;
            margin: auto;

            p{
                display: inline-block;
                width: 80vw;
                font-size: 1.5em;
            }
        }

        input {
            width: 50vw;
            padding: 3vh 3vw;
            margin: 5vh;
        }

        p{
            display: inline-block;
            max-width: 50vw;
        }

        br {
            height: 5vh;
        }
    }

    .mapSelect{
        min-height: 85vh;
        padding-top: 5vh;
        padding-left: 5vw;

        div input[type="radio"]{
            margin: 1vh 2ch;
        }

        .sizeBox{
            padding-top: 3vh;
        }

        .shuffleBox{
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
        .confirmButton{
            text-align: center;

            button {
                display: inline-block;
            }
        }

        .mapBox
        {
            border: solid black 1px;
            position: fixed; 
        }
    }

    .gameSelect{
        width: 100vw;
        min-height: 85vh;
        text-align:center;
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

            .statsOptions{
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

    .graphicsSelect{
        padding-top : 5vw;
        min-height: 85vh;

        h1 {
            margin-top: 0;
            text-align: center;
            width: 100%;
        }

        >div {
            padding: 3vh 2vw;
        }

        label {
            padding-left: 2vw;
        }

        .confirmBox
        {
            text-align: center;
            display: block;

            button {
                display: inline-block;
            }
        }
    }

    .finalize{
        padding-top : 5vw;
        min-height: 85vh;
        width: 100%;

        text-align: center;

        h1 {
            margin-top: 0;
        }

        pre {
            width: 80%;
            border: solid black 1px;
            display: inline-block;
            text-align: left;
            padding: 10px;
        }

        div {
            text-align: center;



            button {
                display: inline-block;
            }
        }

    }

    .help {
        display: block;
        height: 10vh;
        text-align:center;
    
        div {
            display: inline-block;
            width: 45vw;

            button {
                margin: 0;
            }
        }
                
        .backButton{
            text-align:left;
        }

        .helpButton{
            text-align:right;
        }
    }
 
</style>
