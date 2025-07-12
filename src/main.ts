import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createYmaps } from 'vue-yandex-maps';

import App from './App.vue'
import router from './router'

import './styles/tailwind.css'

const YMAPS_API_KEY = "d899cd38-7afa-4ec5-9005-38fa14ee058d";
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(
    createYmaps({
        apikey: YMAPS_API_KEY
    })
)

app.mount('#app')