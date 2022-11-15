import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const useMainStore = defineStore({
  id: "main",
  state: () => ({
    gradients: useStorage("jMHY4CBfilGradients", []),
  }),
  getters: {
    isEmpty() {
      return this.gradients.length <= 0;
    },
    getAllGradients() {
      return this.gradients;
    },
  },
  actions: {
    addGradient(gradient) {
      this.gradients.push(gradient);
    },
    removeGradient(index) {
      this.gradients.splice(index, 1);
    },
  },
});
