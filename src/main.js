import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import { createApp } from 'vue'
import App from './App.vue'
import { library } from '@fortawesome/fontawesome-svg-core';
import { faIcon1, faIcon2, } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Vue from 'vue';

createApp(App).mount('#app')

library.add(faIcon1, faIcon2);
Vue.component('font-awesome-icon', FontAwesomeIcon);
