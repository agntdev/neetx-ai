import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";
import { now } from "../shared.js";

// SCAFFOLD — generated from the bot blueprint BEFORE the agent runs.
// Keep a LIVE registration (.command / .callbackQuery / …) so this feature is
// never an empty stub. Replace the reply body with real logic + copy; if you
// change the user-facing text, update tests/specs to match EXACTLY.
// Do NOT rewrite src/bot.ts — buildBot() already auto-loads this module.
// Menu: wire this into /start via registerMainMenuItem({ label: "Take Mock Test", data: "mock:start" }) if the toolkit exposes it.

registerMainMenuItem({ label: "Take mock test", data: "mock:start", order: 50 });
const composer = new Composer<Ctx>();

composer.callbackQuery("mock:start", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.mock = { startedAt: now(), answers: {} };
  ctx.session.step = "mock:biology";
  await ctx.reply("Your NEET mini-mock has started. Work section by section; your timer is running.", { reply_markup: inlineKeyboard([[inlineButton("Begin Biology", "mock:section:biology")], [inlineButton("Back to menu", "menu:main")]]) });
});

const sectionQuestion = {
  biology: "Biology: Which biomolecule stores hereditary information?",
  chemistry: "Chemistry: What is the pH of a neutral solution at 25°C?",
  physics: "Physics: Which SI unit measures force?",
} as const;
const correct: Record<keyof typeof sectionQuestion, string> = { biology: "DNA", chemistry: "7", physics: "newton" };
const options: Record<keyof typeof sectionQuestion, string[]> = { biology: ["DNA", "Lipid", "Starch", "ATP"], chemistry: ["0", "7", "14", "1"], physics: ["joule", "watt", "newton", "pascal"] };
composer.callbackQuery(/^mock:section:(biology|chemistry|physics)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const section = ctx.match[1] as keyof typeof sectionQuestion;
  if (!ctx.session.mock) return void (await ctx.editMessageText("This mock has expired. Tap Take mock test to start a fresh attempt."));
  ctx.session.step = `mock:${section}`;
  await ctx.editMessageText(sectionQuestion[section], { reply_markup: inlineKeyboard(options[section].map((option) => [inlineButton(option, `mock:answer:${section}:${option === correct[section] ? "yes" : "no"}`)])) });
});
composer.callbackQuery(/^mock:answer:(biology|chemistry|physics):(yes|no)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!ctx.session.mock) return void (await ctx.editMessageText("This mock has expired. Tap Take mock test to start a fresh attempt."));
  const section = ctx.match[1] as keyof typeof sectionQuestion;
  ctx.session.mock.answers[section] = ctx.match[2] === "yes";
  const next = section === "biology" ? "chemistry" : section === "chemistry" ? "physics" : undefined;
  if (next) return void (await ctx.editMessageText(`${section[0].toUpperCase() + section.slice(1)} saved. Continue when you’re ready.`, { reply_markup: inlineKeyboard([[inlineButton(`Open ${next[0].toUpperCase() + next.slice(1)}`, `mock:section:${next}`)]]) }));
  const answers = ctx.session.mock.answers;
  const breakdown = { biology: answers.biology ? 4 : 0, chemistry: answers.chemistry ? 4 : 0, physics: answers.physics ? 4 : 0 };
  const rawScore = breakdown.biology + breakdown.chemistry + breakdown.physics;
  const elapsedSeconds = Math.max(0, Math.floor((now() - ctx.session.mock.startedAt) / 1000));
  ctx.session.mockTests = [...(ctx.session.mockTests ?? []), { timestamp: new Date(now()).toISOString(), rawScore, sectionalBreakdown: breakdown }];
  ctx.session.mock = undefined;
  ctx.session.step = "idle";
  await ctx.editMessageText(`Mock complete in ${elapsedSeconds}s. Your score: ${rawScore}/12.\n\nBiology ${breakdown.biology}/4 · Chemistry ${breakdown.chemistry}/4 · Physics ${breakdown.physics}/4.\n\nRevise the sections below 4, then take another timed mock.`, { reply_markup: inlineKeyboard([[inlineButton("Take another mock", "mock:start")], [inlineButton("Back to menu", "menu:main")]]) });
});

export default composer;
