import './assets/main.css'
import './assets/high-contrast.css'

import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

createApp(App).use(store).mount('#app')
