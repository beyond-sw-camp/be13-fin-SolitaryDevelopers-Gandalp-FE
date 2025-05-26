import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import WaveUI from 'wave-ui'
import 'wave-ui/dist/wave-ui.css'
import SshPre from 'simple-syntax-highlighter'
import 'simple-syntax-highlighter/dist/sshpre.css'
import App from './App.vue'
import TitleLink from '@/documentation/components/title-link.vue'
import Example from '@/documentation/components/example.vue'
import Alert from '@/documentation/components/alert.vue'
import vuetify from './plugins/vuetify';
import SvgIcon from '@jamescoyle/vue-icon'
import './scss/index.scss' 

import '@mdi/font/css/materialdesignicons.min.css'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(vuetify)
app.use(WaveUI, {
  colors: {
    light: {
      primary: '#3f73a6',
      secondary: '#2c3e50',
      lightgrey: '#eee'
    },
    dark: {
      primary: '#82afc9',
      secondary: '#fff',
      lightgrey: '#444'
    }
  },
  theme: 'auto'
})

app.component('TitleLink', TitleLink)
app.component('Example', Example)
app.component('SshPre', SshPre)
app.component('Alert', Alert)
app.component('svg-icon', SvgIcon)

app.mount('#app')
