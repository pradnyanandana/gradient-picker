<script>
import Prism from "prismjs";
import Color from "color";
import { computed } from "vue";
import { useMainStore } from "./stores/gradient";

import "prismjs/themes/prism.css";

export default {
  mounted() {
    window.Prism = window.Prism || {};
    window.Prism.manual = true;

    Prism.highlightAll();
    Prism.hooks.add("before-sanity-check", (env) => {
      env.element.innerHTML = env.element.innerHTML.replace(/<br>/g, "\n");
      env.code = env.element.textContent;
    });
  },
  setup() {
    const main = useMainStore();
    const gradients = JSON.parse(
      JSON.stringify(computed(() => main.getAllGradients).value)
    );

    const gradient = gradients[0] || {};
    const color = gradient.colors?.[0]?.hex || "#40c9ff";
    const addGradient = () => {};

    return {
      color,
      gradient,
      gradients,
      addGradient,
      removeGradient: main.removeGradient,
    };
  },
  methods: {
    hexToRgb(hex) {
      const color = Color(hex);
      const rgb = color.object();

      return rgb;
    },
    rgbToHex(r, g, b, alpha = 1) {
      const color = Color({ r, g, b }).alpha(alpha);
      const hex = alpha < 1 ? color.hexa() : color.hex();

      return hex;
    },
    gradientBarBackground({ colors }) {
      let colorObj = [];

      colors
        .sort((a, b) => a.stop - b.stop)
        .forEach((color) => {
          colorObj.push(`${color.hex} ${color.stop}%`);
        });

      return `linear-gradient(90deg, ${colorObj.join()})`;
    },
    buildCode({ type, colors, lineardegree, radialposition }) {
      let output;
      let colorObj = [];

      if (colors) {
        colors.forEach((color) => {
          colorObj.push(`${color.hex} ${color.stop}%`);
        });
      }

      if (type === "linear") {
        output = `linear-gradient(${
          lineardegree || 90
        }deg, ${colorObj.join()})`;
      } else {
        output = `radial-gradient(at ${radialposition}, ${colorObj.join()})`;
      }

      return output;
    },
  },
};
</script>

<template>
  <main>
    <h1 class="site-title">Gradient Picker</h1>
    <div class="gradient-picker">
      <div class="gpi-type-options"></div>
      <div class="gpi-gradient">
        <div class="gpi-gradient-bar">
          <div
            class="gpi-gradient-bar-background"
            :style="`background: ${gradientBarBackground(gradient)}`"
          ></div>
          <div class="gpi-gradient-bar-pointer">
            <div
              v-for="(color, index) in gradient.colors"
              :key="index"
              class="pointer"
              :style="`left: calc(${color.stop}%  - 10px)`"
            >
              <div class="pointer-color">
                <div class="pointer-color-transparent"></div>
                <div
                  class="pointer-color-inner"
                  :style="`background: ${color.hex};`"
                ></div>
              </div>
              <div class="pointer-arrow"></div>
              <div class="pointer-arrow-inner"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="gpi-picker" :style="`background: ${color}`">
        <div class="pointer"></div>
        <div class="bg1"></div>
        <div class="bg2"></div>
      </div>
      <div class="gpi-preview-area">
        <div class="gpi-preview">
          <div class="gpi-preview-transparent"></div>
          <div
            class="gpi-preview-background"
            :style="`background: ${color}`"
          ></div>
        </div>
        <div class="gpi-hue-alpha">
          <div class="gpi-hue">
            <div class="pointer"></div>
          </div>
          <div class="gpi-alpha">
            <div class="pointer"></div>
            <div
              class="bg"
              :style="`background-image: linear-gradient(
                to left,
                ${color} 0%,
                rgba(9, 9, 121, 0) 100%
              );`"
            ></div>
          </div>
        </div>
      </div>
      <div class="gpi-hex">
        <span class="gpi-hex-title">{{ color }}</span>
        <div class="gpi-hex-input">
          <input
            type="text"
            class="gpi-hex-input-value"
            :value="`${(hexToRgb(color).alpha || 1) * 100}`"
          />
          <span class="gpi-hex-input-percent">%</span>
        </div>
      </div>
      <div class="gpi-saved-button">
        <button>Save Gradient</button>
      </div>
      <div class="gpi-saved-gradients">
        <p>Saved Gradients</p>
        <div class="saved-items">
          <div
            v-for="(gradient, index) in gradients"
            :key="index"
            class="saved-item"
            :style="`background: ${buildCode(gradient)};`"
          ></div>
        </div>
      </div>
      <div class="gpi-generated-code">
        <p>Generated Code</p>
        <pre><code class="language-css">background: {{ buildCode(gradient) }};</code></pre>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
