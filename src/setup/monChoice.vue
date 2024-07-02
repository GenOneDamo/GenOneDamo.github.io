<script lang="ts">
import { defineComponent, inject } from 'vue'
import { names } from './../utils/monData'
import type { Settings } from './../Types'

export default defineComponent({
    data() {
        return {
            settings: inject('settings') as Settings,
        };
    },
    props: {
    },
    methods: {
        NamesFromMonString() {
            let splitString = this.settings.includedPokemon.split(',')
            let monNames = [] as string[]


            for (let i = 0; i < splitString.length; i++) {
                if (splitString[i].includes('-')) {
                    let range = splitString[i].split('-');
                    let start = parseInt(range[0]);
                    let stop = parseInt(range[1]);
                    if (isNaN(start) || start > names.length || isNaN(stop) || stop > names.length || start > stop || range.length != 2) {
                        return null
                    }
                    monNames.push(names[start - 1] + ' - ' + names[stop - 1])

                }
                else {
                    var int = parseInt(splitString[i])
                    if (isNaN(int) || int > names.length) {
                        return null
                    }
                    monNames.push(names[int - 1])
                }
            }

            return monNames.join(', ')
        },

        StringToMons() {

            let mons = [] as number[];

            this.settings.includedPokemon.split(',').forEach(bit => {
                if (bit.includes('-')) {
                    let range = bit.split('-');
                    let start = parseInt(range[0]);
                    let stop = parseInt(range[1]);
                    if (isNaN(start) || start > names.length || isNaN(stop) || stop > names.length || start > stop || range.length != 2) {
                        return [] as number[]
                    }
                    for (let i = start; i <= stop; i++) {
                        mons.push(i);
                    }
                }
                else {
                    var int = parseInt(bit)
                    if (isNaN(int) || int > names.length) {
                        return [] as number[]
                    }
                    mons.push(int)
                }
            })

            return mons
        },

        DefineMons() {
            let mons = this.StringToMons();

            if (mons.length > 0) {
                this.$emit('complete', mons);
            }
        },
    }
})
</script>

<template>
    <div class="parent">
        <h1>Choose which pokemon to track</h1>
        <div class="nameDiv">
            <p>{{ NamesFromMonString() }}</p>
        </div>
        <input v-model="settings.includedPokemon" />
        <p>
            Type the national dex numbers of the Pokémon you would like to track. You can list ranges and individual
            Pokémon
            seperated by commas. e.g. "1-3, 5, 7-12, 15".
        </p>
        <br>
        <button v-if="NamesFromMonString() != null" @click="DefineMons()">Confirm</button>
    </div>
</template>

<style scoped>
div.parent {
    width: 100vw;
    min-height: 85vh;
    text-align: center;
    padding-top: 5vh;

    .nameDiv {
        min-height: 5vh;
        margin: auto;

        p {
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

    p {
        display: inline-block;
        max-width: 50vw;
    }

    br {
        height: 5vh;
    }
}
</style>
