import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import VueFeather from "vue-feather";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.component(VueFeather.name, VueFeather);

app.mount("#app");
