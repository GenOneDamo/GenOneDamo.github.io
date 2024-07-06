<script lang="ts">
import {defineComponent, inject} from 'vue'
import type {PropType} from 'vue'
import { HexInfo } from './../Types'
import connect4Online from './../trackers/connect4TrackerOnline'

export default defineComponent({
  data() {
    return {
      transformedMons: inject('transformedMons') as HexInfo[],
    };
  },  
  props: {
    playStyle: {
        type : Object as PropType<connect4Online>,
        required: true}
  },
  methods:{
  },
  mounted() {
    this.playStyle.hexes = this.transformedMons;
  }
})
</script>

<template>
   
</template>

<style scoped>
   
</style>
