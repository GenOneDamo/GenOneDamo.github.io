<script lang="ts">
import {defineComponent, inject} from 'vue'
import type {PropType} from 'vue'
import { HexInfo } from '../Types'
import battleShipsTracker from './../trackers/battleShipsTracker'

export default defineComponent({
  emits: ["refresh"],
  data() {
    return {
      transformedMons: inject('transformedMons') as HexInfo[],
      refreshNow: false
    };
  }, 
  props: {
    playStyle: {
        type : Object as PropType<battleShipsTracker>,
        required: true}
  },
  methods:{
    FinishSetup(){

      this.playStyle.SetUpComplete();
      this.$emit('refresh');
    }
  },
  mounted() {
    this.playStyle.hexes = this.transformedMons;
  
      setInterval(() => {
        this.refreshNow = ! this.refreshNow
      }, 100);
    
    }
    })

</script>

<template>
  <span v-if="playStyle.communicator.setup" :class="{refresh: refreshNow}">
    <div v-if="!playStyle.shipsSubmitted" @click="FinishSetup()" class="clickable">
      Set Ships
    </div>
    <div v-if="playStyle.communicator.playersComplete[0] && !playStyle.communicator.playersComplete[1]">
      Player 1 complete
    </div>
    <div v-if="playStyle.communicator.playersComplete[1] && !playStyle.communicator.playersComplete[0]">
      Player 2 complete
    </div>
    <div v-if="playStyle.communicator.playersComplete[0] && playStyle.communicator.playersComplete[1]">
      Both Players Complete
      <br>
      Start
    </div>
    <div v-if="playStyle.communicator.playersComplete[0] && playStyle.communicator.playersComplete[1]" @click="playStyle.Start()" class="clickable">
      Both Players Complete
      <br>
      Start
    </div>
  </span>
</template>

<style scoped>
     div {
      color: white;
      background-color: black;
      border: solid white 1px;
      margin: 10px;
      padding: 10px;
      z-index: 4;
      position: static;
      text-align: center;
      }

      div.clickable:hover{
        border: solid red 1px;
        background-color: #555555;
      }
</style>
