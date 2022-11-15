<script>
import Prism from "prismjs";
import Color from "color";
import { computed } from "vue";
import { useMainStore } from "./stores/gradient";

import "prismjs/themes/prism.css";

export default {
  data: () => {
    return {
      alphaLeft: 100,
      hueLeft: 100,
      pickerTop: 100,
      pickerLeft: 0,
    };
  },
  setup() {
    const main = useMainStore();
    const gradients = JSON.parse(
      JSON.stringify(computed(() => main.getAllGradients).value)
    );

    const gradient = gradients[0] || {
      type: "linear",
      lineardegree: 90,
      radialposition: "center center",
      colors: [
        { hex: "#40c9ff", stop: 0 },
        { hex: "#e81cff", stop: 100 },
      ],
    };

    const color = gradient.colors?.[0]?.hex || "#40c9ff";
    const addGradient = () => {};

    return {
      color,
      gradient,
      gradients,
      addGradient,
      removeGradient: main.removeGradient,
      isEmpty: computed(() => main.isEmpty),
    };
  },
  mounted() {
    window.Prism = window.Prism || {};
    window.Prism.manual = true;

    Prism.highlightAll();
    Prism.hooks.add("before-sanity-check", (env) => {
      env.element.innerHTML = env.element.innerHTML.replace(/<br>/g, "\n");
      env.code = env.element.textContent;
    });

    try {
      const area = 100 / 6;
      const obj = this.hexToRgb(this.color);
      const alpha = obj.alpha !== undefined ? obj.alpha * 100 : 100;
      const rgb = Object.keys(obj)
        .filter((key) => ["r", "g", "b"].includes(key))
        .reduce((fil, key) => {
          fil[key] = obj[key];
          return fil;
        }, {});

      const maxI = Object.keys(rgb).reduce((a, b) =>
        rgb[a] >= rgb[b] ? a : b
      );
      const minI = Object.keys(rgb).reduce((a, b) =>
        rgb[a] <= rgb[b] ? a : b
      );

      this.red = rgb.r;
      this.green = rgb.g;
      this.blue = rgb.b;
      this.alpha = alpha;

      if (rgb.r === rgb.g && rgb.r === rgb.b) {
        // minI = minG, r, g, b has same value 255
        this.hueArea = 6;
        this.pickerBackgroundRed = 255;
        this.pickerBackgroundGreen = 0;
        this.pickerBackgroundBlue = 0;
      } else {
        if (maxI === "r") {
          this.pickerTop = 100 - (rgb.r / 255) * 100;

          if (minI === "g") {
            this.hueArea = 6;

            this.hueLeft =
              5 * (100 / 6) +
              (100 / 6 -
                ((rgb.b - rgb[minI]) / (rgb[maxI] - rgb[minI])) * (100 / 6));
            this.pickerLeft = 100 - (rgb.g / rgb.r) * 100;

            this.pickerBackgroundRed = 255;
            this.pickerBackgroundGreen = 0;
            this.pickerBackgroundBlue = Math.round(
              255 - ((this.hueLeft - 5 * area) / area) * 255
            );
          } else if (minI === "b") {
            this.hueArea = 1;

            this.hueLeft =
              ((rgb.g - rgb[minI]) / (rgb[maxI] - rgb[minI])) * (100 / 6);
            this.pickerLeft = 100 - (rgb.b / rgb.r) * 100;

            this.pickerBackgroundRed = 255;
            this.pickerBackgroundGreen = Math.round(
              (this.hueLeft / area) * 255
            );
            this.pickerBackgroundBlue = 0;
          }
        } else if (maxI === "g") {
          this.pickerTop = 100 - (rgb.g / 255) * 100;

          if (minI === "r") {
            this.hueArea = 3;

            this.hueLeft =
              2 * (100 / 6) +
              ((rgb.b - rgb[minI]) / (rgb[maxI] - rgb[minI])) * (100 / 6);
            this.pickerLeft = 100 - (rgb.r / rgb.g) * 100;

            this.pickerBackgroundRed = 0;
            this.pickerBackgroundGreen = 255;
            this.pickerBackgroundBlue = Math.round(
              ((this.hueLeft - 2 * area) / area) * 255
            );
          } else if (minI === "b") {
            this.hueArea = 2;

            this.hueLeft =
              100 / 6 +
              (100 / 6 -
                ((rgb.r - rgb[minI]) / (rgb[maxI] - rgb[minI])) * (100 / 6));
            this.pickerLeft = 100 - (rgb.b / rgb.g) * 100;

            this.pickerBackgroundRed = Math.round(
              255 - ((this.hueLeft - area) / area) * 255
            );
            this.pickerBackgroundGreen = 255;
            this.pickerBackgroundBlue = 0;
          }
        } else if (maxI === "b") {
          this.pickerTop = 100 - (rgb.b / 255) * 100;

          if (minI === "r") {
            this.hueArea = 4;

            this.hueLeft =
              3 * (100 / 6) +
              (100 / 6 -
                ((rgb.g - rgb[minI]) / (rgb[maxI] - rgb[minI])) * (100 / 6));
            this.pickerLeft = 100 - (rgb.r / rgb.b) * 100;

            this.pickerBackgroundRed = 0;
            this.pickerBackgroundGreen = Math.round(
              255 - ((this.hueLeft - 3 * area) / area) * 255
            );
            this.pickerBackgroundBlue = 255;
          } else if (minI === "g") {
            this.hueArea = 5;

            this.hueLeft =
              4 * (100 / 6) +
              ((rgb.r - rgb[minI]) / (rgb[maxI] - rgb[minI])) * (100 / 6);
            this.pickerLeft = 100 - (rgb.g / rgb.b) * 100;

            this.pickerBackgroundRed = Math.round(
              ((this.hueLeft - 4 * area) / area) * 255
            );
            this.pickerBackgroundGreen = 0;
            this.pickerBackgroundBlue = 255;
          }
        }
      }
    } catch (err) {
      console.log(err.message);
    }
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
        <div
          class="pointer"
          :style="`top: calc(${pickerTop}% - 5px); left: calc(${pickerLeft}% - 5px)`"
        ></div>
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
            <div class="pointer" :style="`left: calc(${hueLeft}% - 7px)`"></div>
          </div>
          <div class="gpi-alpha">
            <div
              class="pointer"
              :style="`left: calc(${alphaLeft}% - 7px)`"
            ></div>
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
        <div v-if="!isEmpty" class="saved-items">
          <div
            v-for="(gradient, index) in gradients"
            :key="index"
            class="saved-item"
            :style="`background: ${buildCode(gradient)};`"
          ></div>
        </div>
        <p v-else class="saved-items not-found">No gradient found</p>
      </div>
      <div class="gpi-generated-code">
        <p>Generated Code</p>
        <pre><code class="language-css">background: {{ buildCode(gradient) }};</code></pre>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
