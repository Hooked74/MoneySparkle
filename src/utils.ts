interface ISize {
  width: number;
  height: number;
}

export const getPagePosition = (e: MouseEvent | TouchEvent) => {
  let target;

  switch (e.type) {
    case "touchmove":
      target = (e as TouchEvent).touches[0];
      break;
    case "touchend":
    case "touchstart":
      target = (e as TouchEvent).changedTouches[0];
      break;
    default:
      target = e;
      break;
  }

  return {
    x: target.pageX,
    y: target.pageY
  };
};

export const getRenderedElementSize = (node: HTMLElement): ISize => {
  document.body.appendChild(node);
  const width: number = node.offsetWidth;
  const height: number = node.offsetHeight;
  document.body.removeChild(node);

  return { width, height };
};


export const getFontSize = (text: string, font: string): ISize => {
  const parent: HTMLSpanElement = document.createElement("span");

  parent.style.cssText = "font: " + font + "; white-space: nowrap; display: inline;";
  parent.innerHTML = text;

  return getRenderedElementSize(parent);
};

export const getRandomFloat = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

export const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];