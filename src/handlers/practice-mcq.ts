import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";

// SCAFFOLD — generated from the bot blueprint BEFORE the agent runs.
// Keep a LIVE registration (.command / .callbackQuery / …) so this feature is
// never an empty stub. Replace the reply body with real logic + copy; if you
// change the user-facing text, update tests/specs to match EXACTLY.
// Do NOT rewrite src/bot.ts — buildBot() already auto-loads this module.
// Menu: wire this into /start via registerMainMenuItem({ label: "Practice MCQs", data: "practice:mcq" }) if the toolkit exposes it.

registerMainMenuItem({ label: "Practice MCQs", data: "practice:mcq", order: 40 });
const composer = new Composer<Ctx>();

composer.callbackQuery("practice:mcq", async (ctx) => {
  await ctx.answerCallbackQuery();
  const index = (ctx.session.mcqSeen ?? 0) % 3;
  ctx.session.mcqSeen = (ctx.session.mcqSeen ?? 0) + 1;
  const questions = [
    { text: "Which organelle is the main site of ATP production in eukaryotic cells?", correct: "Mitochondrion", options: ["Ribosome", "Mitochondrion", "Golgi body", "Lysosome"] },
    { text: "One mole of a substance contains which number of particles?", correct: "6.022 × 10²³", options: ["3.011 × 10²³", "6.022 × 10²³", "9.8", "22.4"] },
    { text: "The slope of a velocity-time graph gives:", correct: "Acceleration", options: ["Distance", "Speed", "Acceleration", "Displacement"] },
  ][index];
  await ctx.reply(questions.text, { reply_markup: inlineKeyboard(questions.options.map((option) => [inlineButton(option, `mcq:${index}:${option === questions.correct ? "yes" : "no"}`)])) });
});
composer.callbackQuery(/^mcq:(\d):(yes|no)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const correct = ctx.match[2] === "yes";
  await ctx.editMessageText(correct ? "Correct. Keep connecting the answer to the NCERT line behind it." : "Not quite. Revisit the NCERT concept, then try another question.", { reply_markup: inlineKeyboard([[inlineButton("Next MCQ", "practice:mcq")], [inlineButton("Back to menu", "menu:main")]]) });
});

export default composer;
