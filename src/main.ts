import { createApp, ref } from 'vue'
import type { HexInfo, GraphicsInfo, PlayStyle} from './Types'

import App from './App.vue'
import Hex from './components/hex.vue'
import Searcher from './components/searcher.vue'
import Setup from './components/setup.vue'
import Adjacent from './components/adjacent.vue'

const app = createApp(App)
app.component('hex', Hex)
app.component('searcher', Searcher)
app.component('setup', Setup)
app.component('adjacent', Adjacent)

const transformedMons = ref()
transformedMons.value = [] as HexInfo[]
app.provide("transformedMons", transformedMons)

const graphicsInfo = ref()
graphicsInfo.value = {} as GraphicsInfo
app.provide("graphicsInfo", graphicsInfo)

const playStyle = ref()
playStyle.value = {} as PlayStyle
app.provide("playStyle", playStyle)

app.mount('#app')
