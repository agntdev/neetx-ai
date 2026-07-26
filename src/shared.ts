import type { Ctx } from "./bot.js";

export const FLOW_TTL_MS = 20 * 60 * 1000;

/** One clock seam for flow expiry and mock timestamps. Tests can override it. */
export let now = (): number => Date.now();
export function setNowForTests(clock: () => number): void { now = clock; }

export function begin(ctx: Ctx, step: NonNullable<Ctx["session"]["step"]>): void {
  ctx.session.step = step;
  ctx.session.flowExpiresAt = now() + FLOW_TTL_MS;
}

export function finish(ctx: Ctx): void {
  ctx.session.step = "idle";
  ctx.session.flowExpiresAt = undefined;
  ctx.session.draft = undefined;
}

export function expired(ctx: Ctx): boolean {
  if (!ctx.session.flowExpiresAt || now() <= ctx.session.flowExpiresAt) return false;
  finish(ctx);
  return true;
}

export function textOf(ctx: Ctx): string | undefined {
  return ctx.message?.text?.trim();
}
