<script lang="ts">
import { defineComponent, inject } from 'vue'
import type {HexInfo} from './../Types'

export default defineComponent({
  data() {
    return {
      transformedMons: inject('transformedMons') as HexInfo[],
      searchString: inject('searchString') as string
    };
  },
  methods:{
    keypress (event: KeyboardEvent)
    {
        if (event.key == 'Enter')
        {
            this.runCommand();
            return this.resetHidden()
        }
        else if (event.key == 'Escape')
        {
            return this.resetHidden()
        }
        else if (event.key == 'Backspace' || event.key == 'Delete')
        {
            this.searchString = this.searchString.slice(0, -1);
            if ( this.searchString == ''){
                return this.resetHidden()
            }
        }
        else if (event.key.length == 1)
        {
            this.searchString += event.key.toLowerCase();
        }
        else
        {
            return;
        }
   
        this.transformedMons.forEach(hex => {
            hex.hidden = !hex.name.toLowerCase().startsWith(this.searchString);
        });
        
    },
    runCommand(){
        if (this.searchString == "seed")
        {
            this.$emit('search-seed');
        }
        if (this.searchString == "refresh")
        {
            this.$emit('refresh');
        }
        if (this.searchString == "settings")
        {
            this.$emit('settings');
        }
        if (this.searchString == "help")
        {
            this.$emit('help');
        }
        if (this.searchString == "back")
        {
            this.$emit('back');
        }
    },
    resetHidden()
    {
        this.searchString = ''
        
        this.transformedMons.forEach(hex => {
            hex.hidden = false;
        });
    }

  },
  mounted() {
    document.addEventListener( "keydown", this.keypress );
  }
})
</script>

<template>
</template>

<style scoped>
</style>
