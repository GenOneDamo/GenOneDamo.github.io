<script lang="ts">
import { names } from './../utils/monData'
import RandomNumbeGenerator from './../utils/randomNumbeGenerator'
import Mapper from './../utils/mapper'
import { defineComponent, inject } from 'vue'
import { HexInfo, SettingsFrames } from './../Types'
import type { Point, Settings, LocationInfo } from './../Types'

export default defineComponent({
    data() {
        return {
            transformedMons: inject('transformedMons') as HexInfo[],
            settings: inject('settings') as Settings,
            frame: SettingsFrames.Inital,
            SettingsFrames,
            includedMons: [] as number[],
            map: [] as Point[],
            settingsLoad: ""
        };
    },
    methods: {
        FinishSetup() {

            let { locations, radius } = Mapper.GetLocations(this.map, this.settings.graphics.border, window.innerWidth - 2 * this.settings.graphics.border, this.settings.graphics.border, window.innerHeight - 2 * this.settings.graphics.border)
            this.settings.graphics.hexRadius = radius

            let monMap = [] as {dex: number, location: LocationInfo}[]

            if (this.settings.map.seed != null) {
                let random = new RandomNumbeGenerator(this.settings.map.seed);
                let orders = random.Shuffle(this.includedMons.length);
                var counter = 0;
                for (let i=0; i< this.includedMons.length; i++)
                {
                    monMap.push({
                        dex: this.includedMons[orders[counter++]],
                        location: locations[i]
                    })
                }
            }
            else {
                var counter = 0;
                for (let i=0; i< this.includedMons.length; i++)
                {
                    monMap.push({
                        dex: this.includedMons[counter++],
                        location: locations[i]
                    })
                }
            }

            if (this.transformedMons.length > 0)
            {
                if (this.transformedMons.length != monMap.length){
                    alert("Overriding previous tracker")
                    this.transformedMons.length = 0
                }
                else{
                    let misMatch = false;

                    monMap.forEach(mon => {
                        let matches = this.transformedMons.find( potential => potential.location.index.x == mon.location.index.x && potential.location.index.y == mon.location.index.y)
                            if (matches == null || matches.dexNumber != mon.dex)
                            {
                                misMatch = true;
                            }
                    })

                    if (misMatch)
                    {
                        alert("Overriding previous tracker")
                        this.transformedMons.length = 0;
                    }
                    else{
                        Mapper.refresh(this.transformedMons, this.settings.graphics)
                    }
                }
            }

                this.transformedMons = monMap.map(mon =>
                    new HexInfo(
                        mon.location,
                        mon.dex,
                        names[mon.dex - 1]
                    )
                );

                this.$emit('setup-complete')
             
        },

        async LoadSettings() {
            try {
                this.settings = JSON.parse(this.settingsLoad) as Settings
            }
            catch {
                alert("Bad settings")
                return;
            }

            this.frame = SettingsFrames.Mons

            await this.EnsureLoaded("monChoice")

            while (this.$refs.monChoice == null) {

                console.log(this.$refs.monChoice)
            }

            this.includedMons = (this.$refs.monChoice as any).StringToMons()

            if (this.includedMons.length == 0) {
                alert("Bad settings")
                return;
            }

            this.frame = SettingsFrames.Map

            await this.EnsureLoaded("mapChoice");

            this.map = (this.$refs.mapChoice as any).makeMap();

            if (this.includedMons.length != this.map.length) {
                this.frame = SettingsFrames.Settings
                alert("Bad settings")
                return;
            }

            if (this.settings.seed != null) {
                if (!RandomNumbeGenerator.CheckSeed(this.settings.seed)) {
                    this.frame = SettingsFrames.Settings
                    alert("Bad settings")
                    return;
                }
            }

            this.frame = SettingsFrames.Game

            await this.EnsureLoaded("gameChoice");

            (this.$refs.gameChoice as any).SetGame()

            this.frame = SettingsFrames.Finalize
        },

        async EnsureLoaded(ref: string) {
            await new Promise(function (resolve) {
                setTimeout(function () { resolve(null); }, 25);
            });
            if (this.$refs[ref] == null) {
                this.EnsureLoaded(ref);
            }

        },

        MonsComplete(mons: number[]) {
            this.includedMons = mons;
            this.frame = SettingsFrames.Map
        },
        MapComplete(map: Point[]) {
            this.map = map;
            this.frame = SettingsFrames.Game
        },
        CopySettings() {
            navigator.clipboard.writeText(JSON.stringify(this.settings));
        },
        DownloadSettings() {

            const settings = JSON.stringify(this.settings)
            const blob = new Blob([settings], { type: 'application/json' })
            const objUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objUrl;
            link.download = "settings.json";
            link.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(objUrl);
            }, 250);

        },
        OpenHelp() {
            window.open('help.html', '_blank')!.focus()
        }
    },
    mounted() {
        
        if (this.transformedMons.length>0)
        {
            this.frame == SettingsFrames.Finalize;
            return;
        }

        this.settings = {
            includedPokemon: "1 - 151",
            graphics: {
                border: 10,
                hexBorder: '#000000',
                background: '#000000',
                borderExpand: true,
                toolTip: true,
                fudge: 1.4,
                imageType: "gen5",
                hexRadius: 1,
                colors: []
            },
            map: {
                type: "hexCutEdge",
                size: 10,
                verticalFlip: false,
                horizontalFlip: false,
                seed: null
            },
            seed: RandomNumbeGenerator.NewSeedString(),
            trackerType: "",
            trackerSettings: null
        }
    }
})
</script>

<template>
    <div class="setup">
        <div v-if="frame == SettingsFrames.Inital" class="firstFrame">
            <div>
                <button @click="frame = SettingsFrames.Mons">{{transformedMons.length>0 ? "Edit Tracker" : "New Tracker"}}</button>
                <button @click="frame = SettingsFrames.Settings">Load from settings</button>
            </div>
        </div>
        <div v-if="frame == SettingsFrames.Settings" class="settingsLoad">
            <textarea v-model="settingsLoad" placeholder="Paste settings here"></textarea>
            <br>
            <button @click="LoadSettings()">Load</button>
        </div>
        <monChoice v-if="frame == SettingsFrames.Mons" @complete="MonsComplete" ref="monChoice">
        </monChoice>
        <mapChoice v-if="frame == SettingsFrames.Map" ref="mapChoice" :size=includedMons.length @complete="MapComplete">
        </mapChoice>
        <gameChoice v-if="frame == SettingsFrames.Game" ref="gameChoice" :size=includedMons.length @complete="frame = SettingsFrames.Graphics">
        </gameChoice>
        <graphicsChoice v-if="frame == SettingsFrames.Graphics" @complete="frame = SettingsFrames.Finalize">
        </graphicsChoice>
        <div v-if="frame == SettingsFrames.Finalize" class="finalize">
            <h1>Settings</h1>
            <pre>{{ JSON.stringify(settings, null, 2) }}</pre>
            <div class="buttons">
                <button @click="CopySettings()">Copy settings to clipboard</button>
                <button @click="DownloadSettings()">Download settings</button>
                <br>
                <button @click="FinishSetup">Start</button>
            </div>
        </div>
        <div class="help">
            <div class="backButton">
                <button v-if="frame == SettingsFrames.Settings" @click="frame = SettingsFrames.Inital">Back</button>
                <button v-if="frame == SettingsFrames.Mons" @click="frame = SettingsFrames.Inital">Back</button>
                <button v-if="frame == SettingsFrames.Map" @click="frame = SettingsFrames.Mons">Back</button>
                <button v-if="frame == SettingsFrames.Game" @click="frame = SettingsFrames.Map">Back</button>
                <button v-if="frame == SettingsFrames.Graphics" @click="frame = SettingsFrames.Game">Back</button>
                <button v-if="frame == SettingsFrames.Finalize" @click="frame = SettingsFrames.Graphics">Back</button>
            </div>
            <div class="helpButton">
                <button @click="OpenHelp()">View Help Page</button>
            </div>
        </div>
    </div>
</template>

<style>
.setup {

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


    .firstFrame {
        min-height: 50vh;
        text-align: center;
        padding-top: 40vh;

        div {
            display: inline-block;
        }
    }

    .settingsLoad {
        width: 100%;
        min-height: 85vh;
        text-align: center;
        padding-top: 5vh;

        textarea {
            display: inline-block;
            padding: 20px;
            width: 80%;
            height: 60vh;
        }

        button {
            display: inline-block;
        }
    }

    .finalize {
        padding-top: 5vw;
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
        text-align: center;

        div {
            display: inline-block;
            width: 45vw;

            button {
                margin: 0;
            }
        }

        .backButton {
            text-align: left;
        }

        .helpButton {
            text-align: right;
        }
    }
}
</style>
