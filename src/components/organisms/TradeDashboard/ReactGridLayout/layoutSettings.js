import { rowHeight } from "./utils";

function max(a, b) {
  return  a>b?a:b;
}

export const initialLayouts = () => {
  let unitHeight = rowHeight;
  let upperHeight;
  if(window.innerWidth < 992 || window.innerHeight < 875) {
    upperHeight= Math.ceil(470 / unitHeight);
  } else {
    upperHeight= Math.ceil(570 / unitHeight);
  }

  return {
    xl: [
      {
        w: 157,
        h: upperHeight,
        x: 0,
        y: 0,
        i: "a",
      },
      {
        w: 579,
        h: upperHeight,
        x: 421,
        y: 0,
        i: "c",
      },
      {
        w: 1000,
        h: max(10, 30-upperHeight),
        x: 0,
        y: upperHeight,
        i: "d",
      },
      {
        w: 132,
        h: upperHeight,
        x: 157,
        y: 0,
        i: "g",
      },
      {
        w: 132,
        h: upperHeight,
        x: 289,
        y: 0,
        i: "h",
      },
    ],
    lg: [
      {
        w: 9,
        h: upperHeight,
        x: 0,
        y: 0,
        i: "a",
      },
      {
        w: 15,
        h: upperHeight,
        x: 25,
        y: 0,
        i: "c",
      },
      {
        w: 40,
        h: max(10, 30-upperHeight),
        x: 0,
        y: upperHeight,
        i: "d",
      },
      {
        w: 8,
        h: upperHeight,
        x: 9,
        y: 0,
        i: "g",
      },
      {
        w: 8,
        h: upperHeight,
        x: 17,
        y: 0,
        i: "h",
      },
    ],
    md: [
      {
        w: 11,
        h: upperHeight,
        x: 0,
        y: 0,
        i: "a",
      },
      {
        w: 11,
        h: upperHeight,
        x: 29,
        y: 0,
        i: "c",
      },
      {
        w: 40,
        h: max(10, 30-upperHeight),
        x: 0,
        y: upperHeight,
        i: "d",
      },
      {
        w: 9,
        h: upperHeight,
        x: 11,
        y: 0,
        i: "g",
      },
      {
        w: 9,
        h: upperHeight,
        x: 20,
        y: 0,
        i: "h",
      },
    ],
    xxs: [
      {
        w: 20,
        h: upperHeight,
        x: 0,
        y: 20,
        i: "a",
      },
      {
        w: 40,
        h: 20,
        x: 0,
        y: 0,
        i: "c",
      },
      {
        w: 40,
        h: 15,
        x: 0,
        y: 60,
        i: "d",
      },
      {
        w: 20,
        h: upperHeight,
        x: 20,
        y: 20,
        i: "g",
      },
      {
        w: 40,
        h: 20,
        x: 0,
        y: 30,
        i: "h",
      },
    ],
  };
};

export const stackedLayouts = () => {
  let unitHeight = rowHeight;
  let upperHeight;
  if(window.innerWidth < 992 || window.innerHeight < 875) {
    upperHeight= Math.ceil(470 / unitHeight);
  } else {
    upperHeight= Math.ceil(570 / unitHeight);
  }

  return {
    xl: [
      {
        w: 157,
        h: upperHeight,
        x: 0,
        y: 0,
        i: "a",
      },
      {
        w: 579,
        h: upperHeight,
        x: 421,
        y: 0,
        i: "c",
      },
      {
        w: 1000,
        h: max(10, 30-upperHeight),
        x: 0,
        y: upperHeight,
        i: "d",
      },
      {
        w: 262,
        h: upperHeight / 2,
        x: 157,
        y: 0,
        i: "g",
      },
      {
        w: 262,
        h: upperHeight / 2,
        x: 157,
        y: 0,
        i: "h",
      },
    ],
    lg: [
      {
        w: 9,
        h: upperHeight,
        x: 0,
        y: 0,
        i: "a",
      },
      {
        w: 17,
        h: upperHeight,
        x: 23,
        y: 0,
        i: "c",
      },
      {
        w: 40,
        h: max(10, 30-upperHeight),
        x: 0,
        y: upperHeight,
        i: "d",
      },
      {
        w: 14,
        h: upperHeight / 2,
        x: 9,
        y: 0,
        i: "g",
      },
      {
        w: 14,
        h: upperHeight / 2,
        x: 9,
        y: 0,
        i: "h",
      },
    ],
    md: [
      {
        w: 11,
        h: upperHeight,
        x: 0,
        y: 0,
        i: "a",
      },
      {
        w: 11,
        h: upperHeight,
        x: 29,
        y: 0,
        i: "c",
      },
      {
        w: 40,
        h: max(10, 30-upperHeight),
        x: 0,
        y: upperHeight,
        i: "d",
      },
      {
        w: 18,
        h: upperHeight / 2,
        x: 11,
        y: 0,
        i: "g",
      },
      {
        w: 18,
        h: upperHeight / 2,
        x: 11,
        y: 0,
        i: "h",
      },
    ],
    xxs: [
      {
        w: 40,
        h: upperHeight,
        x: 0,
        y: 20,
        i: "a",
      },
      {
        w: 40,
        h: 20,
        x: 0,
        y: 0,
        i: "c",
      },
      {
        w: 40,
        h: 15,
        x: 0,
        y: 60,
        i: "d",
      },
      {
        w: 40,
        h: upperHeight,
        x: 20,
        y: 20,
        i: "g",
      },
      {
        w: 40,
        h: upperHeight,
        x: 20,
        y: 30,
        i: "h",
      },
    ],
  };
};
