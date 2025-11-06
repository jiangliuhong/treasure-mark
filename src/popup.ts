import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'

import PopupApp from './PopupApp.vue'

const app = createApp(PopupApp)
app.use(createPinia())
app.use(naive)
app.mount('#app')