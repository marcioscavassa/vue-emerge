export type AnimationDirection = 'vertical' | 'horizontal';

export const ANIMATION_NAME = 'vue-emerge-animation';

export interface AnimationOptions {
  direction: AnimationDirection;
  moveAmount: string;
  finalMoveAmount: string;
  animationDuration: number;
  animationDelay: number;
  timingFunction: string;
  blockHoverOnEnter: boolean;
}

export const ANIMATION_DEFAULTS: AnimationOptions = {
  direction: 'vertical',
  moveAmount: '3rem',
  finalMoveAmount: '0',
  animationDuration: 1000,
  animationDelay: 0,
  timingFunction: 'ease',
  blockHoverOnEnter: true,
};

const axis = (direction: AnimationDirection) => (direction === 'horizontal' ? 'X' : 'Y');

export function initialTransform(o: AnimationOptions): string {
  return `translate${axis(o.direction)}(${o.moveAmount})`;
}

/** True when the animation ends at the element's natural position (no residual offset). */
export function endsAtRest(o: AnimationOptions): boolean {
  return !o.finalMoveAmount || o.finalMoveAmount === '0';
}

export function finalTransform(o: AnimationOptions): string {
  return endsAtRest(o) ? 'translate(0, 0)' : `translate${axis(o.direction)}(${o.finalMoveAmount})`;
}

/** CSS custom properties consumed by the stylesheet. */
export function animationVariables(o: AnimationOptions): Record<string, string> {
  return {
    '--vue-emerge-initial-transform': initialTransform(o),
    '--vue-emerge-final-transform': finalTransform(o),
    '--vue-emerge-animation-name': ANIMATION_NAME,
    '--vue-emerge-animation-duration': `${o.animationDuration}ms`,
    '--vue-emerge-animation-delay': `${o.animationDelay}ms`,
    '--vue-emerge-timing-function': o.timingFunction,
    '--vue-emerge-pointer-events': o.blockHoverOnEnter ? 'none' : 'auto',
  };
}

/** Upper bound for the animation, used as a safety net when `animationend` never fires. */
export function animationTimeout(o: AnimationOptions): number {
  return Math.max(0, o.animationDuration) + Math.max(0, o.animationDelay) + 250;
}
