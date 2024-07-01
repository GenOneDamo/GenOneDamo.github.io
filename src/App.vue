<script lang="ts">
import { defineComponent, inject, } from 'vue'
import {HexInfo} from './Types'
import type {GraphicsInfo, PlayStyle} from './Types'

export default defineComponent({
  data() {
    return {
      transformedMons: inject('transformedMons') as HexInfo[],
      graphicsInfo: inject('graphicsInfo') as GraphicsInfo,
      playStyle: inject('playStyle') as PlayStyle,
      setupComplete: false
    };
  },
  methods:{
    SetupMons(){    
      this.setupComplete = true;
    },
    monClicked(mon: HexInfo, direction: number){
      (this.$refs.searcher as any).resetHidden();
      this.playStyle.hexClicked(mon,direction,this.transformedMons)
    },
    searchSeed()
    {
      alert("RNG seed is: " + (this.$refs.setup as any).GetSeed());
    },
    refresh()
    {
      if (this.setupComplete)
      {
        (this.$refs.setup as any).refresh();
      }
    },
    returnSettingsFile()
    {
      let settingsString = (JSON.stringify((this.$refs.setup as any).MakeSettingString(),null,2))
      navigator.clipboard.writeText(settingsString);
      alert("Settings copppied to clipboard.\n" + settingsString)
    },
    openHelp()
    {
      window.open('help.html', '_blank')!.focus();
    },
    backToSettings()
    {
      this.setupComplete = false;
      (this.$refs.setup as any).frame = 'finalize';
    }
  },
  mounted() {
    window.addEventListener("resize", this.refresh);
  }
})
</script>

<template>
  <setup
    @setup-complete="SetupMons()"
    ref="setup">
  </setup>
  <searcher
    v-if=setupComplete
    @search-seed="searchSeed"
    @refresh="refresh"
    @settings="returnSettingsFile"
    @help="openHelp"
    @back="backToSettings"
    ref="searcher" >
  </searcher>
  <span
    v-if=setupComplete
    :style="'background-color:' + graphicsInfo.background">
    <hex 
      v-for="mon in transformedMons.sort((a,b) => {return a.location.index.y - b.location.index.y})"
      v-bind:hexInfo="mon"
      @mon-clicked="monClicked(mon,1)"
      @mon-right-clicked="monClicked(mon,-1)">
    </hex>
  </span>
  <adjacent 
    v-if="setupComplete && playStyle.name == 'adjacent'"
    v-bind:playStyle="playStyle">
  </adjacent>
</template>

<style scoped>
  span {
    position: fixed;
    display: block;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: -1;
    pointer-events: none;
  }
</style>
