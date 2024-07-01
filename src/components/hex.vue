<script lang="ts">
  import { defineComponent, inject } from 'vue'
  import {HexInfo} from './../Types'
  import type {GraphicsInfo} from './../Types'

  export default defineComponent({
    data() {
      return {
        hover: false,
        changed: false,
        graphicsInfo: inject('graphicsInfo') as GraphicsInfo,
      }
    },
    props: {
      hexInfo: {
        type: HexInfo,
        required: true
      }
    },
    methods:{
      points() {
          let points = ""
          for (var i = 0; i < 6; i++)
          {
            points += (this.hexInfo.location.coordinates.x + Math.sin(i * Math.PI/3) * this.graphicsInfo.hexRadius) + "," +  (this.hexInfo.location.coordinates.y + Math.cos(i * Math.PI/3) * this.graphicsInfo.hexRadius) + " "
          }
        return points
      },
      imageSize() {
        return (3-Math.sqrt(3)) * this.graphicsInfo.hexRadius * this.graphicsInfo.fudge
      },
      clickHex() {
        if (this.hexInfo.hidden)
        {
          return;
        }
        this.$emit('mon-clicked');
        this.changed = !this.changed
      },
      rightClickHex(event: Event) {
        event.preventDefault();
        if (this.hexInfo.hidden)
        {
          return;
        }
        this.$emit('mon-right-clicked');
        this.changed = !this.changed
      },
      imgURL(){
        if (this.graphicsInfo.imageType == "home")
        {
          return '/homeSprites/' + this.hexInfo.dexNumber + '.png'
        }
        if (this.graphicsInfo.imageType == "gen5")
        {
          return '/gen5Sprites/' + this.hexInfo.dexNumber + '.png'
        }

        return ''
      }
    }
  });
</script>

<template>
  <span :class="{ hover: hover, hidden: hexInfo.hidden }">
    <svg>
      <polygon
        @mouseover="hover = graphicsInfo.borderExpand"
        @mouseleave="hover = false"
        @click="clickHex"
        @contextmenu="rightClickHex"
        :class="{ changed: changed}"
        :points=points()
        :style="'fill: ' + graphicsInfo.colors[hexInfo.color] + '; stroke: ' + graphicsInfo.hexBorder"  />
    </svg>
    <p v-if="!hexInfo.hidden && graphicsInfo.toolTip" 
    :style="'top:' + (hexInfo.location.coordinates.y+graphicsInfo.hexRadius) + 'px; left:' + (hexInfo.location.coordinates.x) + 'px;'">
      {{ hexInfo.name }}
    </p>
    <img
      v-if="graphicsInfo.imageType.length>0"
      :src=imgURL()
      :style="'top:' + hexInfo.location.coordinates.y + 'px; left:' + hexInfo.location.coordinates.x + 'px;'">
  </span>
</template>
  
 <style scoped>

svg {
  position: fixed; 
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: 0;
  pointer-events: none;

  polygon {
    stroke-width: 1;
    pointer-events:all;
    z-index: 0;
  }
}

.hover svg {
  z-index: 1;

  polygon {
    stroke: white;
    stroke-width: 3;
    z-index: 1;
  }
}

.hidden polygon {
  opacity: 30%;
}

p {
  display: none;
  pointer-events: none;
}

.hover p {
  position: fixed;
  display: block;
  transform: translate(-50%, 0);
  z-index: 3;
  background-color: white;
  border: 1px;
  border-color: black;
  margin: 0;
  font-size: 12pt;
  padding: 5px;
}

img {
  position: fixed;
  z-index: 2;
  pointer-events: none;
  width: v-bind(imageSize() + 'px');
  height: v-bind(imageSize() + 'px');
  transform: translate(-50%, -50%);
}

.hover img {
  width: v-bind((imageSize()*1.3) + 'px');
  height: v-bind((imageSize()*1.3) + 'px');
}

.hidden img {
  opacity: 30%;
  width: v-bind((imageSize()*.75) + 'px');
  height: v-bind((imageSize()*.75) + 'px');
}

</style>