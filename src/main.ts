import { createApp, ref } from 'vue'
import type { HexInfo, PlayStyle, Settings } from './Types'

import App from './App.vue'
import Hex from './components/hex.vue'
import Searcher from './components/searcher.vue'

import Adjacent from './trackers/adjacent.vue'
import Domino from './trackers/domino.vue'

import Setup from './setup/setup.vue'
import MonChoice from './setup/monChoice.vue'
import MapChoice from './setup/mapChoice.vue'
import GameChoice from './setup/gameChoice.vue'
import GraphicsChoice from './setup/graphicsChoice.vue'

const app = createApp(App)
app.component('hex', Hex)
app.component('searcher', Searcher)
app.component('setup', Setup)
app.component('adjacent', Adjacent)
app.component('domino', Domino)
app.component('monChoice', MonChoice)
app.component('gameChoice', GameChoice)
app.component('mapChoice', MapChoice)
app.component('graphicsChoice', GraphicsChoice)

const transformedMons = ref()
transformedMons.value = [] as HexInfo[]
app.provide("transformedMons", transformedMons)

const settings = ref()
settings.value = {} as Settings
app.provide("settings", settings)

const playStyle = ref()
playStyle.value = {} as PlayStyle
app.provide("playStyle", playStyle)

app.mount('#app')
