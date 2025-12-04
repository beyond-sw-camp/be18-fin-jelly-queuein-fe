
import './assets/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// import "@fullcalendar/core/main.css"
// import "@fullcalendar/daygrid/main.css"
import { createApp } from 'vue'
import { createPinia } from 'pinia'


import App from './App.vue';
import router from './router';

// PrimeVue v4
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Chart from 'primevue/chart';



// Styles
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';


// Remixicon
import 'remixicon/fonts/remixicon.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(ElementPlus)
app.use(createPinia())
app.use(router)
// PrimeVue 설정
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false // 필요 없으면 그대로 두면 됨
    }
  }
});

app.component('Chart', Chart);
app.mount('#app');
