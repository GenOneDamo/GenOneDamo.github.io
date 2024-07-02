<script lang="ts">
import { defineComponent, inject } from 'vue'
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
        Complete() {
            this.$emit('complete');
        }
    }
})
</script>

<template>
    <div class="parent">
        <h1>Graphics settings</h1>
        <div class="colorSelect">
            <input type="color" id="background" v-model="settings.graphics.background">
            <label for="background">Background color</label>
        </div>
        <div class="colorSelect">
            <input type="color" id="hexBorder" v-model="settings.graphics.hexBorder">
            <label for="hexBorder">Border around each hexagon</label>
        </div>
        <div>
            <input type="number" id="border" v-model="settings.graphics.border" />
            <label for="border">border width (around entire tracker)</label>
        </div>
        <div>
            <p>Sprite Style</p>
            <div>
                <input type="radio" id="gen5" value="gen5" v-model="settings.graphics.imageType" />
                <label for="gen5">Gen 5 + Smogen sprite project (limit gen 8)</label>
            </div>
            <div>
                <input type="radio" id="home" value="home" v-model="settings.graphics.imageType" />
                <label for="home">Home sprites</label>
            </div>
        </div>
        <div>
            <input type="number" id="fudge" v-model="settings.graphics.fudge" />
            <label for="fudge">Fudge factor</label>
            <p>A factor of 1 will ensure that no image goes outside the hexagon. Increasing this will increase the size
                of the image relative to the hexagon. It is recommeded to have this a little bit larger than 1.</p>
        </div>
        <div>
            <input type="checkbox" id="borderExpand" v-model="settings.graphics.borderExpand" />
            <label for="borderExpand">Mouse over effects</label>
            <div v-if="settings.graphics.borderExpand">
                <input type="checkbox" id="toolTip" v-model="settings.graphics.toolTip" />
                <label for="toolTip">Show Pokémon names on mouse</label>
            </div>
        </div>
        <span class="confirmBox">
            <button @click="Complete()">Confirm</button>
        </span>
    </div>

</template>

<style scoped>
div.parent {
    width: 100%;
    padding-top: 5vw;
    min-height: 85vh;

    h1 {
        margin-top: 0;
        text-align: center;
        width: 100%;
    }

    >div {
        padding: 3vh 2vw;
    }

    label {
        padding-left: 2vw;
    }

    .confirmBox {
        text-align: center;
        display: block;

        button {
            display: inline-block;
        }
    }
}
</style>
