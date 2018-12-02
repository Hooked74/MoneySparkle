import classNames from "class-names";
import React, { PureComponent } from "react";
import { getPagePosition } from "./utils";

import Particle from "./Particle";

interface ISize {
  width: number;
  height: number;
}

interface IProps {
  size?: ISize;
}

interface IState {
  visibility: boolean;
}

interface IOptions {
  x?: number; // mouseX
  y?: number; // mouseY
  generation?: number; // max generation of particles
  count?: number; // count particles
}

const start: symbol = Symbol("@@start");

export default class MoneySparkle extends PureComponent<IProps, IState> {
  public static defaultProps: IProps = {
    size: {
      width: 800,
      height: 600
    }
  };

  public state: IState = {
    visibility: false
  };

  public resolution: number = 2;
  public animationQueue: Promise<void> = Promise.resolve();

  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particleImages: HTMLCanvasElement[];
  private particles: Particle[] = [];
  private defaultOptions: IOptions = {
    x: 0,
    y: 0,
    generation: 1,
    count: 50
  };

  get size() {
    const { width, height } = this.props.size;

    return {
      width: width * this.resolution,
      height: height * this.resolution,
      style: {
        width: `${width}px`,
        height: `${height}px`
      }
    };
  }

  get className() {
    return classNames('.canvas', { "h-hidden": !this.state.visibility });
  }

  public render() {
    return <canvas {...this.size} ref={this.setContext} className={this.className} />;
  }

  public show(): Promise<void> {
    return new Promise(resolve => this.setState({ visibility: true }, resolve));
  }

  public hide(): Promise<void> {
    return new Promise(resolve => this.setState({ visibility: false }, resolve));
  }

  public onClick = (e: MouseEvent) => {
    const { x: pageX, y: pageY } = getPagePosition(e);
    const x: number = (pageX - this.canvas.offsetLeft) * this.resolution;
    const y: number = (pageY - this.canvas.offsetTop) * this.resolution;

    this.start({ x, y });
  };

  public start(options: IOptions = {}): Promise<void> {
    options = { ...this.defaultOptions, ...options };
    this.animationQueue = this.animationQueue.then(() => this[start](options));

    return this.animationQueue;
  }

  private async [start](options: IOptions): Promise<void> {
    await this.show();

    const { generation, ...otherOptions } = options;
    this.particles = this.initParticles({ ...otherOptions, generation: 0 });
    await this.draw(options.count, generation);

    await this.hide();
  }

  private initParticles({ x, y, count, generation }: IOptions): Particle[] {
    const particles: Particle[] = [];
    const angleRange: number = Math.PI / 4;

    for (let i = 0; i < count; i++) {
      const baseAngle: number = -angleRange + 2 * angleRange * i / (count - 1);
      const particleOptions = { x, y, generation, baseAngle };
      const particle: Particle = new Particle(this.ctx, particleOptions);

      particles.push(particle);
    }

    return particles;
  }

  private async draw(count: number, maxGeneration: number): Promise<void> {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const particlesAfterDraw: Particle[] = [];
    let newParticles: Particle[] = [];

    for (const particle of this.particles) {
      if (particle.checkDestroy()) {
        if (particle.generation < maxGeneration) {
          newParticles = newParticles.concat(
            this.initParticles({
              x: particle.position.x,
              y: particle.position.y,
              count: Math.ceil(count / 2),
              generation: particle.generation + 1
            })
          );
        }
      } else {
        particle.move();
        particle.draw(this.particleImages[particle.imageIndex]);
        particlesAfterDraw.push(particle);
      }
    }

    this.particles = particlesAfterDraw.concat(newParticles);

    if (this.particles.length) {
      await new Promise(resolve => requestAnimationFrame(resolve));
      await this.draw(count, maxGeneration);
    }
  }

  private setContext = (ref: HTMLCanvasElement) => {
    this.canvas = ref;
    this.ctx = ref.getContext("2d") as CanvasRenderingContext2D;
    this.particleImages = Particle.prerender(this.resolution);
  };
}
