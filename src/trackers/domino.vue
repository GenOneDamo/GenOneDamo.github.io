<script lang="ts">
import {defineComponent} from 'vue'
import type {PropType} from 'vue'
    import dominoTracker from './../trackers/dominoTracker'

export default defineComponent({
  data() {
    return {
    };
  },
  props: {
    playStyle: {
        type : Object as PropType<dominoTracker>,
        required: true}
  },
  methods:{
    Top()
    {
        return this.playStyle.settings.statsLocation.split(',')[0] == 'top' ? '0' : '100'
    }
  }
})
</script>

<template>
    <p v-if="playStyle.settings.showStats"
        :style="'color:' + playStyle.settings.statscolor + '; top:' + Top() + 'vh; transform: translate(0, -'+Top()+'%); text-align: ' + playStyle.settings.statsLocation.split(',')[1] ">
      {{ playStyle.CurrentDetails() }}
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
