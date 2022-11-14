import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const useMainStore = defineStore({
  id: "main",
  state: () => ({
    gradients: useStorage("jMHY4CBfilGradients", [
      {
        type: "linear",
        lineardegree: 90,
        radialposition: "center center",
        colors: [
          { hex: "#40c9ff", stop: 0 },
          { hex: "#e81cff", stop: 100 },
        ],
      },
    ]),
  }),
  getters: {
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
