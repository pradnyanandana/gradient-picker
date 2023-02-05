import { computed } from "vue";
import Color from "color";

export const setupGradient = (gradients) => {
  if (gradients[0]) {
    return JSON.parse(JSON.stringify(computed(() => gradients[0]).value));
  }

  return [
    { rgb: { r: 64, g: 201, b: 255, alpha: 1 }, stop: 0 },
    { rgb: { r: 232, g: 28, b: 255, alpha: 1 }, stop: 100 },
  ];
};

export const setupColor = (gradient) => {
  if (gradient.colors?.[0]?.rgb) {
    return { ...gradient.colors[0].rgb };
  }

  return { r: 64, g: 201, b: 255, alpha: 1 };
};

export const hexToRgb = (hex) => {
  const color = Color(hex);
  const rgb = color.object();

  return rgb;
};

export const rgbToHex = ({ r, g, b, alpha = 1 }) => {
  const color = Color({ r, g, b }).alpha(alpha);
  const hex = alpha < 1 ? color.hexa() : color.hex();

  return hex;
};

export const gradientBarBackground = ({ colors }) => {
  let colorObj = [];

  [...colors]
    .sort((a, b) => a.stop - b.stop)
    .forEach((color) => {
      colorObj.push(`${rgbToHex(color.rgb)} ${color.stop}%`);
    });

  return `linear-gradient(90deg, ${colorObj.join()})`;
};

export const buildCode = ({ type, colors, lineardegree, radialposition }) => {
  let output;
  let colorObj = [];

  if (colors) {
    [...colors]
      .sort((a, b) => a.stop - b.stop)
      .forEach((color) => {
        colorObj.push(`${rgbToHex(color.rgb)} ${color.stop}%`);
      });
  }

  if (type === "linear") {
    output = `linear-gradient(${lineardegree || 90}deg, ${colorObj.join()})`;
  } else {
    output = `radial-gradient(at ${radialposition}, ${colorObj.join()})`;
  }

  return output;
};
