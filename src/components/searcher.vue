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
            if (event.shiftKey)
            {
                this.$emit('undo');
                return;
            }

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
        else if (this.searchString == "refresh")
        {
            this.$emit('refresh');
        }
        else if (this.searchString == "settings")
        {
            this.$emit('settings');
        }
        else if (this.searchString == "help")
        {
            this.$emit('help');
        }
        else if (this.searchString == "back")
        {
            this.$emit('back');
        }
        else if (this.searchString == "moves")
        {
            this.$emit('moves');
        }
        else if (this.searchString == "cheat")
        {
            this.$emit('cheat');
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
