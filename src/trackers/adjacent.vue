<script lang="ts">
import {defineComponent, inject} from 'vue'
import type {PropType} from 'vue'
import adjacentTracker from './../trackers/adjacentTracker'
import { HexInfo } from './../Types'

export default defineComponent({
  data() {
    return {
      transformedMons: inject('transformedMons') as HexInfo[],
    };
  },
  props: {
    playStyle: {
        type : Object as PropType<adjacentTracker>,
        required: true}
  },
  methods:{
    Top()
    {
        return this.playStyle.zombieSettings.statsLocation.split(',')[0] == 'top' ? '0' : '100'
    }
  },
  mounted() {
    this.playStyle.hexes = this.transformedMons;
  }
})
</script>

<template>
    <p v-if="playStyle.zombieSettings.showStats"
        :style="'color:' + playStyle.zombieSettings.statscolor + '; top:' + Top() + 'vh; transform: translate(0, -'+Top()+'%); text-align: ' + playStyle.zombieSettings.statsLocation.split(',')[1] ">
        Infected: {{ playStyle.zombieStats.infected }}
        Susceptible: {{ playStyle.zombieStats.susceptible }}
        Safe: {{ playStyle.zombieStats.safe }}
    </p>
</template>

<style scoped>
    p {
        position: fixed; 
        z-index: 2;
        pointer-events: none;
        display: block;
        margin: 0;
        left: 0;
        padding: 1vh;
        width: calc(100vw - 2vh);
    }
</style>
