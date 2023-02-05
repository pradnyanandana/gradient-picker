import { hexToRgb } from "../src/app";

test("hex null", () => {
    expect(hexToRgb()).toMatchObject({ r: 0, g: 0, b: 0 });
  });

test("hex white", () => {
  expect(hexToRgb("#fff")).toMatchObject({ r: 255, g: 255, b: 255 });
});

test("hex magenta", () => {
    expect(hexToRgb("#ff00ff")).toMatchObject({ r: 255, g: 0, b: 255 });
  });
