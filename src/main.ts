import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

const app = createApp(App)
const pinia = createPinia();

app.use(ToastService);
app.use(ConfirmationService);
app.use(pinia)
app.use(router)
app.use(PrimeVue, {
	theme: {
        preset: Aura,
		options: {
			darkModeSelector: 'light',
		}
    }
})
app.mount('#app');