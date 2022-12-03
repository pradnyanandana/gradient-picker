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
      barPointerIndex: 0,
      pickerBackgroundRed: 255,
      pickerBackgroundGreen: 0,
      pickerBackgroundBlue: 0,
      color: { r: 64, g: 201, b: 255, alpha: 1 },
      gradient: {
        type: "linear",
        lineardegree: 90,
        radialposition: "center center",
        colors: [
          { rgb: { r: 64, g: 201, b: 255, alpha: 1 }, stop: 0 },
          { rgb: { r: 232, g: 28, b: 255, alpha: 1 }, stop: 100 },
        ],
      },
      gradients: [],
    };
  },
  setup() {
    const main = useMainStore();

    return {
      addGradient: main.addGradient,
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

    const main = useMainStore();

    this.gradients = JSON.parse(
      JSON.stringify(computed(() => main.getAllGradients).value)
    );

    if (this.gradients[0]) {
      this.gradient = { ...this.gradients[0] };
    }

    this.color = this.gradient.colors?.[this.barPointerIndex]?.rgb || {
      r: 64,
      g: 201,
      b: 255,
      alpha: 1,
    };
    this.pointerPosition();
  },
  methods: {
    hexToRgb(hex) {
      const color = Color(hex);
      const rgb = color.object();

      return rgb;
    },
    rgbToHex({ r, g, b, alpha = 1 }) {
      const color = Color({ r, g, b }).alpha(alpha);
      const hex = alpha < 1 ? color.hexa() : color.hex();

      return hex;
    },
    changeType(type) {
      this.gradient.type = type;
    },
    changeRadial(e) {
      this.gradient.radialposition = e.target.value;
    },
    changeLinearDegree(e) {
      this.gradient.lineardegree = e.target.value;
    },
    saveGradient() {
      const gradient = JSON.parse(
        JSON.stringify(computed(() => this.gradient).value)
      );

      this.addGradient(gradient);
      this.gradients.unshift(gradient);
    },
    gradientBarBackground({ colors }) {
      let colorObj = [];

      [...colors]
        .sort((a, b) => a.stop - b.stop)
        .forEach((color) => {
          colorObj.push(`${this.rgbToHex(color.rgb)} ${color.stop}%`);
        });

      return `linear-gradient(90deg, ${colorObj.join()})`;
    },
    buildCode({ type, colors, lineardegree, radialposition }) {
      let output;
      let colorObj = [];

      if (colors) {
        [...colors]
          .sort((a, b) => a.stop - b.stop)
          .forEach((color) => {
            colorObj.push(`${this.rgbToHex(color.rgb)} ${color.stop}%`);
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
    clickBarPointer(index) {
      this.barPointerIndex = index;
      this.color = this.gradient.colors?.[this.barPointerIndex]?.rgb || {
        rgb: { r: 64, g: 201, b: 255, alpha: 1 },
        stop: 0,
      };
      this.pointerPosition();
    },
    pointerPosition() {
      try {
        const area = 100 / 6;
        const obj = this.color;
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

        this.alphaLeft = alpha;
        this.$refs.alphaPointer.style.left = `calc(${alpha}% - 7px)`;
      } catch (err) {
        console.log(err.message);
      }
    },
    removeGradientPointer(index) {
      this.gradient.colors.splice(index, 1);
    },
    onHueStart() {
      const hue = this.$refs.hue.getBoundingClientRect();

      this.hueX = hue.x;
      this.hueWidth = hue.width;

      // Find max and min value of rgb
      this.rgbMax = Math.max(this.red, this.green, this.blue);
      this.rgbMin = Math.min(this.red, this.green, this.blue);
      this.$refs.hue.classList.add("grabbing");
    },
    onMouseDownHue(e) {
      e.preventDefault();
      e.stopPropagation();

      this.onHueStart();

      this.mouseMoveHue(e);
      this.bindMoveHue();
    },
    onTouchStartHue(e) {
      e.preventDefault();
      e.stopPropagation();

      this.onHueStart();

      this.touchMoveHue(e);
      this.bindTouchMoveHue();
    },
    onHueMove(positionX) {
      const area = 100 / 6;

      let hueLeft =
        ((positionX - this.hueX) / this.hueWidth) * 100 +
        (positionX - this.hueX) / this.hueWidth;

      if (hueLeft > 100) {
        hueLeft = 100;
      }

      if (hueLeft < 0) {
        hueLeft = 0;
      }

      this.hueArea = Math.ceil(hueLeft / (100 / 6));

      switch (this.hueArea) {
        case 1:
          this.pickerBackgroundRed = 255;
          this.pickerBackgroundGreen = Math.round((hueLeft / area) * 255);
          this.pickerBackgroundBlue = 0;
          this.red = this.rgbMax;
          this.green = Math.round(
            (hueLeft / area) * (this.rgbMax - this.rgbMin) + this.rgbMin
          );
          this.blue = this.rgbMin;
          break;
        case 2:
          this.pickerBackgroundRed = Math.round(
            255 - ((hueLeft - area) / area) * 255
          );
          this.pickerBackgroundGreen = 255;
          this.pickerBackgroundBlue = 0;
          this.red = Math.round(
            this.rgbMax -
              ((hueLeft - area) / area) * (this.rgbMax - this.rgbMin)
          );
          this.green = this.rgbMax;
          this.blue = this.rgbMin;
          break;
        case 3:
          this.pickerBackgroundRed = 0;
          this.pickerBackgroundGreen = 255;
          this.pickerBackgroundBlue = Math.round(
            ((hueLeft - 2 * area) / area) * 255
          );
          this.red = this.rgbMin;
          this.green = this.rgbMax;
          this.blue = Math.round(
            ((hueLeft - 2 * area) / area) * (this.rgbMax - this.rgbMin) +
              this.rgbMin
          );
          break;
        case 4:
          this.pickerBackgroundRed = 0;
          this.pickerBackgroundGreen = Math.round(
            255 - ((hueLeft - 3 * area) / area) * 255
          );
          this.pickerBackgroundBlue = 255;
          this.red = this.rgbMin;
          this.green = Math.round(
            this.rgbMax -
              ((hueLeft - 3 * area) / area) * (this.rgbMax - this.rgbMin)
          );
          this.blue = this.rgbMax;
          break;
        case 5:
          this.pickerBackgroundRed = Math.round(
            ((hueLeft - 4 * area) / area) * 255
          );
          this.pickerBackgroundGreen = 0;
          this.pickerBackgroundBlue = 255;
          this.red = Math.round(
            ((hueLeft - 4 * area) / area) * (this.rgbMax - this.rgbMin) +
              this.rgbMin
          );
          this.green = this.rgbMin;
          this.blue = this.rgbMax;
          break;
        case 6:
          this.pickerBackgroundRed = 255;
          this.pickerBackgroundGreen = 0;
          this.pickerBackgroundBlue = Math.round(
            255 - ((hueLeft - 5 * area) / area) * 255
          );
          this.red = this.rgbMax;
          this.green = this.rgbMin;
          this.blue = Math.round(
            this.rgbMax -
              ((hueLeft - 5 * area) / area) * (this.rgbMax - this.rgbMin)
          );
          break;
      }

      this.$refs.huePointer.style.left = `calc(${hueLeft}% - 7px)`;

      this.color = {
        r: this.red,
        g: this.green,
        b: this.blue,
        alpha: this.alpha / 100,
      };

      this.gradient.colors[this.barPointerIndex].rgb = this.color;
    },
    mouseMoveHue(e) {
      this.onHueMove(e.clientX);
    },
    touchMoveHue(e) {
      this.onHueMove(e.touches[0].clientX);
    },
    mouseUpHue() {
      this.$refs.hue.classList.remove("grabbing");
      window.removeEventListener("mousemove", this.mouseMoveHue);
    },
    touchEndHue() {
      this.$refs.hue.classList.remove("grabbing");
      window.removeEventListener("touchmove", this.touchMoveHue);
    },
    bindMoveHue() {
      window.addEventListener("mousemove", this.mouseMoveHue);
      window.addEventListener("mouseup", () => this.mouseUpHue());
    },
    bindTouchMoveHue() {
      window.addEventListener("touchmove", this.touchMoveHue);
      window.addEventListener("touchend", () => this.touchEndHue());
    },
    onAlphaStart() {
      const alpha = this.$refs.alpha.getBoundingClientRect();

      this.alphaX = alpha.x;
      this.alphaWidth = alpha.width;
      this.$refs.alpha.classList.add("grabbing");
    },
    onMouseDownAlpha(e) {
      e.preventDefault();
      e.stopPropagation();

      this.onAlphaStart();

      this.mouseMoveAlpha(e);
      this.bindMoveAlpha();
    },
    onTouchStartAlpha(e) {
      e.preventDefault();
      e.stopPropagation();

      this.onAlphaStart();

      this.touchMoveAlpha(e);
      this.bindTouchAlpha();
    },
    onMoveAlpha(positionX) {
      let alphaLeft =
        ((positionX - this.alphaX) / this.alphaWidth) * 100 +
        (positionX - this.alphaX) / this.alphaWidth;

      if (alphaLeft > 100) {
        alphaLeft = 100;
      }

      if (alphaLeft < 0) {
        alphaLeft = 0;
      }

      this.alpha = Math.round(alphaLeft);
      this.$refs.alphaPointer.style.left = `calc(${alphaLeft}% - 7px)`;

      this.color = {
        r: this.red,
        g: this.green,
        b: this.blue,
        alpha: this.alpha / 100,
      };

      this.gradient.colors[this.barPointerIndex].rgb = this.color;
    },
    mouseMoveAlpha(e) {
      this.onMoveAlpha(e.clientX);
    },
    touchMoveAlpha(e) {
      this.onMoveAlpha(e.touches[0].clientX);
    },
    mouseUpAlpha() {
      this.$refs.alpha.classList.remove("grabbing");
      window.removeEventListener("mousemove", this.mouseMoveAlpha);
    },
    touchEndAlpha() {
      this.$refs.alpha.classList.remove("grabbing");
      window.removeEventListener("touchmove", this.touchMoveAlpha);
    },
    bindMoveAlpha() {
      window.addEventListener("mousemove", this.mouseMoveAlpha);
      window.addEventListener("mouseup", () => this.mouseUpAlpha());
    },
    bindTouchAlpha() {
      window.addEventListener("touchmove", this.touchMoveAlpha);
      window.addEventListener("touchend", () => this.touchEndAlpha());
    },
    onChangeAlpha(e) {
      let value = e.target.value;

      if (value > 100) {
        value = 100;
      }

      if (value < 0) {
        value = 0;
      }

      this.color = {
        r: this.red,
        g: this.green,
        b: this.blue,
        alpha: value / 100,
      };
      this.gradient.colors[this.barPointerIndex].rgb = this.color;
      this.$refs.alphaPointer.style.left = `calc(${value}% - 7px)`;
    },
    onPickerStart() {
      const picker = this.$refs.picker.getBoundingClientRect();

      this.pickerX = picker.x;
      this.pickerY = picker.y;
      this.pickerWidth = picker.width;
      this.pickerHeight = picker.height;

      this.$refs.picker.classList.add("grabbing");
    },
    onMouseDownPicker(e) {
      e.preventDefault();
      e.stopPropagation();

      this.onPickerStart();

      this.mouseMovePicker(e);
      this.bindMovePicker();
    },
    onTouchStartPicker(e) {
      e.preventDefault();
      e.stopPropagation();

      this.onPickerStart();

      this.touchMovePicker(e);
      this.bindTouchPicker();
    },
    onMovePicker(positionX, positionY) {
      let pickerLeft =
        ((positionX - this.pickerX) / this.pickerWidth) * 100 +
        (positionX - this.pickerX) / this.pickerWidth;
      let pickerTop =
        ((positionY - this.pickerY) / this.pickerHeight) * 100 +
        (positionY - this.pickerY) / this.pickerHeight;

      if (pickerLeft > 100) {
        pickerLeft = 100;
      }

      if (pickerLeft < 0) {
        pickerLeft = 0;
      }

      if (pickerTop > 100) {
        pickerTop = 100;
      }

      if (pickerTop < 0) {
        pickerTop = 0;
      }

      switch (this.hueArea) {
        case 1:
          this.red = Math.round(((100 - pickerTop) * 255) / 100);
          this.green = Math.round(
            ((100 - pickerTop) *
              (((100 - pickerLeft) * (255 - this.pickerBackgroundGreen)) / 100 +
                this.pickerBackgroundGreen)) /
              100
          );
          this.blue = Math.round(((100 - pickerLeft) * this.red) / 100);
          break;
        case 2:
          this.green = Math.round(((100 - pickerTop) * 255) / 100);
          this.red = Math.round(
            ((100 - pickerTop) *
              (((100 - pickerLeft) * (255 - this.pickerBackgroundRed)) / 100 +
                this.pickerBackgroundRed)) /
              100
          );
          this.blue = Math.round(((100 - pickerLeft) * this.green) / 100);
          break;
        case 3:
          this.green = Math.round(((100 - pickerTop) * 255) / 100);
          this.blue = Math.round(
            ((100 - pickerTop) *
              (((100 - pickerLeft) * (255 - this.pickerBackgroundBlue)) / 100 +
                this.pickerBackgroundBlue)) /
              100
          );
          this.red = Math.round(((100 - pickerLeft) * this.green) / 100);
          break;
        case 4:
          this.blue = Math.round(((100 - pickerTop) * 255) / 100);
          this.green = Math.round(
            ((100 - pickerTop) *
              (((100 - pickerLeft) * (255 - this.pickerBackgroundGreen)) / 100 +
                this.pickerBackgroundGreen)) /
              100
          );
          this.red = Math.round(((100 - pickerLeft) * this.blue) / 100);
          break;
        case 5:
          this.blue = Math.round(((100 - pickerTop) * 255) / 100);
          this.red = Math.round(
            ((100 - pickerTop) *
              (((100 - pickerLeft) * (255 - this.pickerBackgroundRed)) / 100 +
                this.pickerBackgroundRed)) /
              100
          );
          this.green = Math.round(((100 - pickerLeft) * this.blue) / 100);
          break;
        case 0:
        case 6:
          this.red = Math.round(((100 - pickerTop) * 255) / 100);
          this.blue = Math.round(
            ((100 - pickerTop) *
              (((100 - pickerLeft) * (255 - this.pickerBackgroundBlue)) / 100 +
                this.pickerBackgroundBlue)) /
              100
          );
          this.green = Math.round(((100 - pickerLeft) * this.red) / 100);
          break;
      }

      this.$refs.pickerPointer.style.left = `calc(${pickerLeft}% - 5px)`;
      this.$refs.pickerPointer.style.top = `calc(${pickerTop}% - 5px)`;

      this.color = {
        r: this.red,
        g: this.green,
        b: this.blue,
        alpha: this.alpha / 100,
      };

      this.gradient.colors[this.barPointerIndex].rgb = this.color;
    },
    mouseMovePicker(e) {
      this.onMovePicker(e.clientX, e.clientY);
    },
    touchMovePicker(e) {
      this.onMovePicker(e.touches[0].clientX, e.touches[0].clientY);
    },
    mouseUpPicker() {
      this.$refs.picker.classList.remove("grabbing");
      this.$refs.picker.removeEventListener("mousemove", this.mouseMovePicker);
    },
    touchEndPicker() {
      this.$refs.picker.classList.remove("grabbing");
      this.$refs.picker.removeEventListener("touchmove", this.touchMovePicker);
    },
    bindMovePicker() {
      this.$refs.picker.addEventListener("mousemove", this.mouseMovePicker);
      this.$refs.picker.addEventListener("mouseup", () => this.mouseUpPicker());
    },
    bindTouchPicker() {
      this.$refs.picker.addEventListener("touchmove", this.touchMovePicker);
      this.$refs.picker.addEventListener("touchend", () =>
        this.touchEndPicker()
      );
    },
    onGradientStart() {
      this.$refs.picker.classList.add("grabbing");

      const gradient =
        this.$refs[
          `gradient${this.barPointerIndex}`
        ][0].parentElement.getBoundingClientRect();

      this.gradientX = gradient.x;
      this.gradientWidth = gradient.width;
      this.$refs[`gradient${this.barPointerIndex}`][0].classList.add(
        "grabbing"
      );
    },
    onMouseDownGradient(e, index) {
      e.preventDefault();
      e.stopPropagation();

      this.barPointerIndex = index;
      this.onGradientStart();

      this.mouseMoveGradient(e);
      this.bindMoveGradient();
    },
    onTouchStartGradient(e, index) {
      e.preventDefault();
      e.stopPropagation();

      this.barPointerIndex = index;
      this.onGradientStart();

      this.touchMoveGradient(e);
      this.bindTouchGradient();
    },
    onMoveGradient(positionX) {
      let gradeintLeft =
        ((positionX - this.gradientX) / this.gradientWidth) * 100 +
        (positionX - this.gradientX) / this.gradientWidth;

      if (gradeintLeft > 100) {
        gradeintLeft = 100;
      }

      if (gradeintLeft < 0) {
        gradeintLeft = 0;
      }

      this.gradient.colors[this.barPointerIndex].stop = gradeintLeft;
    },
    mouseMoveGradient(e) {
      this.onMoveGradient(e.clientX);
    },
    touchMoveGradient(e) {
      this.onMoveGradient(e.touches[0].clientX);
    },
    mouseUpGradient() {
      this.$refs[`gradient${this.barPointerIndex}`][0].classList.remove(
        "grabbing"
      );
      window.removeEventListener("mousemove", this.mouseMoveGradient);
    },
    touchEndGradient() {
      this.$refs[`gradient${this.barPointerIndex}`][0].classList.remove(
        "grabbing"
      );
      window.removeEventListener("touchmove", this.touchMoveGradient);
    },
    bindMoveGradient() {
      window.addEventListener("mousemove", this.mouseMoveGradient);
      window.addEventListener("mouseup", () => this.mouseUpGradient());
    },
    bindTouchGradient() {
      window.addEventListener("touchmove", this.touchMoveGradient);
      window.addEventListener("touchend", () => this.touchEndGradient());
    },
    onAddGradient(e) {
      // Click on bar, not pointer
      if (e.target.innerHTML === this.$refs.gradientBar.innerHTML) {
        // Find position
        const positionX = e.clientX;
        const gradient = this.$refs.gradientBar.getBoundingClientRect();

        const gradientX = gradient.x;
        const gradientWidth = gradient.width;

        let gradientLeft =
          ((positionX - gradientX) / gradientWidth) * 100 +
          (positionX - gradientX) / gradientWidth;

        if (gradientLeft > 100) {
          gradientLeft = 100;
        }

        if (gradientLeft < 0) {
          gradientLeft = 0;
        }

        // Find color
        let minColorPos = 0,
          minPointerPos = 100,
          maxColorPos = 100,
          maxPointerPos = 0;
        let minColor, maxColor, minPointer, maxPointer;

        this.gradient.colors.forEach((pointer) => {
          const stopColor = pointer.stop;

          if (stopColor >= minColorPos && stopColor < gradientLeft) {
            minColorPos = stopColor;
            minColor = pointer;
          }

          if (stopColor <= maxColorPos && stopColor > gradientLeft) {
            maxColorPos = stopColor;
            maxColor = pointer;
          }

          if (stopColor < minPointerPos) {
            minPointer = pointer;
            minPointerPos = stopColor;
          }

          if (stopColor > maxPointerPos) {
            maxPointer = pointer;
            maxPointerPos = stopColor;
          }
        });

        if (minPointer && maxPointer) {
          if (!minColor) {
            this.color = minPointer.rgb;
          } else if (!maxColor) {
            this.color = maxPointer.rgb;
          } else {
            try {
              const minRGB = minColor.rgb;
              const maxRGB = maxColor.rgb;

              const minStop = minColor.stop;
              const maxStop = maxColor.stop;

              const minAlpha = minRGB.alpha !== undefined ? minRGB.alpha : 1;
              const maxAlpha = maxRGB.alpha !== undefined ? maxRGB.alpha : 1;

              const colorRange = maxStop - minStop;
              const colorRangeStart = gradientLeft - minStop;

              // Pre define value, avoid divide by 0
              let colorRed = minRGB.r;
              let colorGreen = minRGB.g;
              let colorBlue = minRGB.b;
              let colorAlpha = minAlpha;

              if (minRGB.r != maxRGB.r) {
                colorRed =
                  minRGB.r < maxRGB.r
                    ? minRGB.r +
                      (colorRangeStart / colorRange) * (maxRGB.r - minRGB.r)
                    : minRGB.r -
                      (colorRangeStart / colorRange) * (minRGB.r - maxRGB.r);
              }

              if (minRGB.g != maxRGB.g) {
                colorGreen =
                  minRGB.g < maxRGB.g
                    ? minRGB.g +
                      (colorRangeStart / colorRange) * (maxRGB.g - minRGB.g)
                    : minRGB.g -
                      (colorRangeStart / colorRange) * (minRGB.g - maxRGB.g);
              }

              if (minRGB.b != maxRGB.b) {
                colorBlue =
                  minRGB.b < maxRGB.b
                    ? minRGB.b +
                      (colorRangeStart / colorRange) * (maxRGB.b - minRGB.b)
                    : minRGB.b -
                      (colorRangeStart / colorRange) * (minRGB.b - maxRGB.b);
              }

              if (minAlpha != maxAlpha) {
                colorAlpha =
                  minAlpha < maxAlpha
                    ? minAlpha +
                      (colorRangeStart / colorRange) * (maxAlpha - minAlpha)
                    : minAlpha -
                      (colorRangeStart / colorRange) * (minAlpha - maxAlpha);
              }

              this.color = {
                r: colorRed,
                g: colorGreen,
                b: colorBlue,
                alpha: colorAlpha,
              };
            } catch (e) {}
          }
        }

        this.gradient.colors.push({
          rgb: this.color,
          stop: Math.round(gradientLeft),
        });
      }
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
          <div
            class="gpi-gradient-bar-pointer"
            @click="onAddGradient"
            ref="gradientBar"
          >
            <div
              v-for="(color, index) in gradient.colors"
              :key="index"
              :class="`pointer ${index === barPointerIndex ? 'active' : ''}`"
              :style="`left: calc(${color.stop}%  - 10px)`"
              :ref="`gradient${index}`"
              @click="clickBarPointer(index)"
              @mousedown="(e) => onMouseDownGradient(e, index)"
              @touchstart="
                (e) => {
                  clickBarPointer(index);
                  onTouchStartGradient(e, index);
                }
              "
            >
              <div class="pointer-color">
                <div class="pointer-color-transparent"></div>
                <div
                  class="pointer-color-inner"
                  :style="`background: ${this.rgbToHex(color.rgb)};`"
                ></div>
                <div
                  v-if="gradient.colors.length > 2"
                  class="remove"
                  @click="removeGradientPointer(index)"
                >
                  <vue-feather type="trash" size="15"></vue-feather>
                </div>
              </div>
              <div class="pointer-arrow"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="gpi-type">
        <div class="options">
          <div
            :class="`option-linear ${
              gradient.type === 'linear' ? 'active' : ''
            }`"
            @click="changeType('linear')"
          >
            <div></div>
          </div>
          <div
            :class="`option-radial ${
              gradient.type === 'radial' ? 'active' : ''
            }`"
            @click="changeType('radial')"
          >
            <div></div>
          </div>
        </div>
        <div class="input">
          <span v-if="gradient.type === 'radial'">Radial Position:</span>
          <span v-if="gradient.type === 'linear'">Linear Degree:</span>

          <select
            @change="changeRadial"
            :value="gradient.radialposition"
            v-if="gradient.type === 'radial'"
          >
            <option value="center center">Center Center</option>
            <option value="center left">Center Left</option>
            <option value="center right">Center Right</option>
            <option value="top center">Top Center</option>
            <option value="top left">Top Left</option>
            <option value="top right">Top Right</option>
            <option value="bottom center">Bottom Center</option>
            <option value="bottom left">Bottom Left</option>
            <option value="bottom right">Bottom Right</option>
          </select>
          <input
            v-if="gradient.type === 'linear'"
            type="number"
            min="0"
            max="360"
            step="1"
            :value="`${gradient.lineardegree}`"
            @change="changeLinearDegree"
          />
        </div>
      </div>
      <div
        class="gpi-picker"
        @mousedown="onMouseDownPicker"
        @touchstart="onTouchStartPicker"
        :style="`background: rgb(${pickerBackgroundRed}, ${pickerBackgroundGreen}, ${pickerBackgroundBlue})`"
        ref="picker"
      >
        <div
          class="pointer"
          :style="`top: calc(${pickerTop}% - 5px); left: calc(${pickerLeft}% - 5px)`"
          ref="pickerPointer"
        ></div>
        <div class="bg1"></div>
        <div class="bg2"></div>
      </div>
      <div class="gpi-preview-area">
        <div class="gpi-preview">
          <div class="gpi-preview-transparent"></div>
          <div
            class="gpi-preview-background"
            :style="`background: ${rgbToHex(color)}`"
          ></div>
        </div>
        <div class="gpi-hue-alpha">
          <div
            class="gpi-hue"
            @mousedown="onMouseDownHue"
            @touchstart="onTouchStartHue"
            ref="hue"
          >
            <div
              class="pointer"
              :style="`left: calc(${hueLeft}% - 7px)`"
              ref="huePointer"
            ></div>
          </div>
          <div
            class="gpi-alpha"
            @mousedown="onMouseDownAlpha"
            @touchstart="onTouchStartAlpha"
            ref="alpha"
          >
            <div
              class="pointer"
              :style="`left: calc(${alphaLeft}% - 7px)`"
              ref="alphaPointer"
            ></div>
            <div
              class="bg"
              :style="`background-image: linear-gradient(
                          to left,
                          ${rgbToHex({
                            r: color.r,
                            g: color.g,
                            b: color.b,
                          })} 0%,
                          rgba(9, 9, 121, 0) 100%
                        );`"
            ></div>
          </div>
        </div>
      </div>
      <div class="gpi-hex">
        <span class="gpi-hex-title">{{ rgbToHex(color) }}</span>
        <div class="gpi-hex-input">
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            class="gpi-hex-input-value"
            :value="`${color.alpha * 100}`"
            @change="onChangeAlpha"
          />
          <span class="gpi-hex-input-percent">%</span>
        </div>
      </div>
      <div class="gpi-saved-button">
        <button @click="saveGradient">Save Gradient</button>
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
