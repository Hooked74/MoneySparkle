import { getFontSize, getRandomFloat, getRandomInt, randomFromArray } from "./utils";

interface IParticleOptions {
  x: number;
  y: number;
  generation: number;
  baseAngle: number;
}

interface ICoords {
  x: number;
  y: number;
}

interface IParticleVelocity extends ICoords {}
interface IParticlePosition extends ICoords {}

interface IParticle {
  generation: number;

  position: IParticlePosition;
  velocity: IParticleVelocity;

  scale: number;
  angle: number;
  alpha: number;

  alphaReducer: number;
  imageIndex: number;
  spin: number;
}

interface ISize {
  width: number;
  height: number;
}

export default class Particle {
  public static readonly COLORS: string[] = ["#00aa00", "#ff0000", "#3366ff", "#cccc00"];

  public static readonly TEXT: string = "$";
  public static readonly FONT_FAMILY: string = "Verdana";
  public static readonly FONT_WEIGHT: string = "400";
  public static readonly FONT_SIZE: number = 35;

  public static prerender(resolution: number): HTMLCanvasElement[] {
    const fontSizeOfFirstGeneration: number = Particle.FONT_SIZE * resolution;
    const fontSizeOfOtherGenerations: number = fontSizeOfFirstGeneration / 2;
    const fontOfFirstGeneration: string = `${Particle.FONT_WEIGHT} ${fontSizeOfFirstGeneration}px ${
      Particle.FONT_FAMILY
    }`;
    const fontOfOtherGenerations: string = `${
      Particle.FONT_WEIGHT
    } ${fontSizeOfOtherGenerations}px ${Particle.FONT_FAMILY}`;
    const sizeOfFirstGeneration: ISize = getFontSize(Particle.TEXT, fontOfFirstGeneration);
    const sizeOfOtherGenerations: ISize = getFontSize(Particle.TEXT, fontOfOtherGenerations);

    return Particle.COLORS.map((color: string, i: number) => {
      let font: string;
      let canvasSize: ISize;

      if (i === 0) {
        font = fontOfFirstGeneration;
        canvasSize = sizeOfFirstGeneration;
      } else {
        font = fontOfOtherGenerations;
        canvasSize = sizeOfOtherGenerations;
      }

      const canvas: HTMLCanvasElement = document.createElement("canvas");
      const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      ctx.font = font;
      ctx.fillStyle = color;
      ctx.fillText(Particle.TEXT, 0, canvasSize.height / 1.3);

      return canvas;
    });
  }

  public generation: number;
  public imageIndex: number = 0;

  public position: IParticlePosition;
  public velocity: IParticleVelocity;

  private readonly gravity: number = 0.08;
  private readonly friction: number = 0.99;
  private readonly alphaReducer: number = 0.95;

  private scale: number = 0;
  private angle: number = 20 - getRandomInt(0, 40);
  private alpha: number = 1;

  private spin: number;

  constructor(private ctx: CanvasRenderingContext2D, options: IParticleOptions) {
    this.generation = options.generation;

    this.position = {
      x: options.x,
      y: options.y
    };

    if (this.generation > 0) {
      this.imageIndex = getRandomInt(1, Particle.COLORS.length - 1);
      this.alphaReducer += 0.02;
      this.velocity = {
        x: randomFromArray([getRandomFloat(-3, -1), getRandomFloat(1, 3)]),
        y: getRandomFloat(-6, -3)
      };
    } else {
      this.velocity = {
        x: randomFromArray([getRandomFloat(-5, -3), getRandomFloat(3, 5)]),
        y: getRandomFloat(-8, -4)
      };
    }

    this.spin = this.velocity.x < 0 ? getRandomFloat(-0.05, 0) : getRandomFloat(0, 0.05);
  }

  public move() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.friction;
    this.velocity.y += this.gravity;
    this.angle += this.spin;
    if (this.velocity.y > 0) {
      this.alpha = this.alpha * this.alphaReducer;
    }

    this.scale = this.scale < 1 ? this.scale + 0.1 : 1;
  }

  public draw(image: HTMLCanvasElement) {
    this.ctx.save();

    this.ctx.globalAlpha = this.alpha;
    this.ctx.translate(this.position.x, this.position.y);
    this.ctx.rotate(this.angle);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(image, 0, 0, image.width, image.height);

    this.ctx.restore();
  }

  public checkDestroy() {
    return this.alpha < 0.2;
  }
}
