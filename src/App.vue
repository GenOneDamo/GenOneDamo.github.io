<script lang="ts">
import { defineComponent, inject, } from 'vue'
import { HexInfo, TrackerType } from './Types'
import type { Settings, PlayStyle } from './Types'
import Mapper from './utils/mapper'
import connect4TrackerBase from './trackers/connect4TrackerBase'
import dominoTracker from './trackers/dominoTracker'
import adjacentTracker from './trackers/adjacentTracker'

export default defineComponent({
  data() {
    return {
      transformedMons: inject('transformedMons') as HexInfo[],
      settings: inject('settings') as Settings,
      playStyle: inject('playStyle') as PlayStyle,
      setupComplete: false,
      refreshHexes: false,
      TrackerType
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
    Infect()
    {
      if (this.playStyle.name == TrackerType.Adjacent) {
        (this.playStyle as adjacentTracker).Infect();
      }
    },
    Undo() {
      if (this.playStyle.name == TrackerType.Connect4) {
        (this.playStyle as connect4TrackerBase).Undo();
      }
      else if (this.playStyle.name == TrackerType.Domino) {
        (this.playStyle as dominoTracker).Undo(this.transformedMons);
      }
    },
    Moves() {
      if (this.playStyle.name == TrackerType.Connect4) {
        let moves = (this.playStyle as connect4TrackerBase).Moves();
        alert(moves);
      }
    },
    Cheat() {
      if (this.playStyle.name == TrackerType.Domino) {
        (this.playStyle as dominoTracker).Cheat();
      }
    },
  },
  mounted() {
    window.addEventListener("resize", this.refresh);
    setInterval(() => {this.refreshHexes = ! this.refreshHexes}, 100);
  }
})
</script>

<template>
  <setup  v-if="!setupComplete" @setup-complete="SetupMons()">
  </setup>
  <searcher v-if="setupComplete" @search-seed="searchSeed" @refresh="refresh" @settings="returnSettingsFile"
    @help="openHelp" @back="backToSettings" @undo="Undo" @moves="Moves" @cheat="Cheat" @infect="Infect" ref="searcher">
  </searcher>
  <span v-if=setupComplete :style="'background-color:' + settings.graphics.background" :class="{hexes: true, refresh: refreshHexes }">
    <hex v-for="mon in transformedMons.sort((a, b) => { return a.location.index.y - b.location.index.y })"
      :hexInfo="mon"
      :graphicsInfo= settings.graphics
      @mon-clicked="monClicked(mon, 1)"
      @mon-right-clicked="monClicked(mon, -1)">
    </hex>
  </span>
  <span :class="{ refresh: refreshHexes }">
    <adjacent v-if="setupComplete && playStyle.name == TrackerType.Adjacent" v-bind:playStyle="playStyle">
    </adjacent>
    <domino v-if="setupComplete && playStyle.name == TrackerType.Domino" v-bind:playStyle="playStyle">
    </domino>
    <connect4Online v-if="setupComplete && playStyle.name == TrackerType.Connect4" v-bind:playStyle="playStyle"/>
    <battleShips v-if="setupComplete && playStyle.name == TrackerType.BattleShips" v-bind:playStyle="playStyle" @refresh="refresh"/>
  </span>
</template>

<style scoped>
span.hexes {
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
