import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";

// SCAFFOLD — generated from the bot blueprint BEFORE the agent runs.
// Keep a LIVE registration (.command / .callbackQuery / …) so this feature is
// never an empty stub. Replace the reply body with real logic + copy; if you
// change the user-facing text, update tests/specs to match EXACTLY.
// Do NOT rewrite src/bot.ts — buildBot() already auto-loads this module.
// Menu: wire this into /start via registerMainMenuItem({ label: "Access Lessons", data: "lesson:menu" }) if the toolkit exposes it.

registerMainMenuItem({ label: "Access lessons", data: "lesson:menu", order: 20 });
const composer = new Composer<Ctx>();

composer.callbackQuery("lesson:menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Choose an NCERT unit to begin your revision.", { reply_markup: inlineKeyboard([[inlineButton("Biology: Cell", "lesson:cell")], [inlineButton("Chemistry: Mole concept", "lesson:mole")], [inlineButton("Physics: Kinematics", "lesson:motion")], [inlineButton("Back to menu", "menu:main")]]) });
});

const lessons: Record<string, { title: string; summary: string; deep: string }> = {
  cell: { title: "Cell: the unit of life", summary: "Start with membrane transport, organelles, and the difference between prokaryotic and eukaryotic cells.", deep: "Deep revision: link each organelle to one function. Compare plant and animal cells, then practise NCERT diagram labels." },
  mole: { title: "Mole concept", summary: "Connect molar mass, Avogadro number, and balanced equations before solving conversions.", deep: "Deep revision: write units at every step. Convert mass → moles → particles, and check the limiting reagent last." },
  motion: { title: "Kinematics", summary: "Read displacement from graphs and keep velocity, speed, and acceleration separate.", deep: "Deep revision: draw a sign convention first. Use graph slope for velocity and area for displacement." },
};
composer.callbackQuery(/^lesson:(cell|mole|motion)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const lesson = lessons[ctx.match[1]];
  await ctx.editMessageText(`${lesson.title}\n\n${lesson.summary}`, { reply_markup: inlineKeyboard([[inlineButton("Go deeper", `lesson:deep:${ctx.match[1]}`)], [inlineButton("Back to lessons", "lesson:menu")]]) });
});
composer.callbackQuery(/^lesson:deep:(cell|mole|motion)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const id = ctx.match[1];
  const progress = new Set(ctx.session.lessonProgress ?? []);
  progress.add(id);
  ctx.session.lessonProgress = [...progress];
  await ctx.editMessageText(`${lessons[id].deep}\n\nMarked as revised.`, { reply_markup: inlineKeyboard([[inlineButton("Practice MCQs", "practice:mcq")], [inlineButton("Back to lessons", "lesson:menu")]]) });
});

export default composer;
