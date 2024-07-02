<script lang="ts">
import { defineComponent, inject, } from 'vue'
import { HexInfo } from './Types'
import type { Settings, PlayStyle } from './Types'
import Mapper from './utils/mapper'
import connect4Tracker from './trackers/connect4Tracker'
import dominoTracker from './trackers/dominoTracker'

export default defineComponent({
  data() {
    return {
      transformedMons: inject('transformedMons') as HexInfo[],
      settings: inject('settings') as Settings,
      playStyle: inject('playStyle') as PlayStyle,
      setupComplete: false
    };
  },
  methods: {
    SetupMons() {
      this.setupComplete = true;
    },
    monClicked(mon: HexInfo, direction: number) {
      var searcher = this.$refs.searcher;
      if (searcher != null) {
        (searcher as any).resetHidden();
      }
      this.playStyle.hexClicked(mon, direction, this.transformedMons)
    },
    searchSeed() {
      alert("RNG seed is: " + this.settings.seed);
    },
    refresh() {
      if (this.setupComplete) {
        Mapper.refresh(this.transformedMons, this.settings.graphics)
      }
    },
    returnSettingsFile() {
      let settingsString = JSON.stringify(this.settings, null, 2);
      navigator.clipboard.writeText(settingsString);
      alert("Settings copppied to clipboard.\n" + settingsString)
    },
    openHelp() {
      window.open('help.html', '_blank')!.focus();
    },
    backToSettings() {
      this.setupComplete = false;
    },
    Undo() {
      if (this.playStyle.name == 'connect4') {
        (this.playStyle as connect4Tracker).Undo();
      }
      else if (this.playStyle.name == 'domino') {
        (this.playStyle as dominoTracker).Undo(this.transformedMons);
      }
    },
    Moves() {
      if (this.playStyle.name == 'connect4') {
        let moves = (this.playStyle as connect4Tracker).Moves();
        alert(moves);
      }
    },
    Cheat() {
      if (this.playStyle.name == 'domino') {
        (this.playStyle as dominoTracker).Cheat();
      }
    },
  },
  mounted() {
    window.addEventListener("resize", this.refresh);
  }
})
</script>

<template>
  <setup  v-if="!setupComplete" @setup-complete="SetupMons()">
  </setup>
  <searcher v-if="setupComplete" @search-seed="searchSeed" @refresh="refresh" @settings="returnSettingsFile"
    @help="openHelp" @back="backToSettings" @undo="Undo" @moves="Moves" @cheat="Cheat" ref="searcher">
  </searcher>
  <span v-if=setupComplete :style="'background-color:' + settings.graphics.background">
    <hex v-for="mon in transformedMons.sort((a, b) => { return a.location.index.y - b.location.index.y })"
      v-bind:hexInfo="mon"
      :graphicsInfo= settings.graphics
      @mon-clicked="monClicked(mon, 1)"
      @mon-right-clicked="monClicked(mon, -1)">
    </hex>
  </span>
  <adjacent v-if="setupComplete && playStyle.name == 'adjacent'" v-bind:playStyle="playStyle">
  </adjacent>
  <domino v-if="setupComplete && playStyle.name == 'domino'" v-bind:playStyle="playStyle">
  </domino>
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
