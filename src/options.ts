import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'

import OptionsApp from './OptionsApp.vue'

const app = createApp(OptionsApp)
app.use(createPinia())
app.use(naive)
app.mount('#app')