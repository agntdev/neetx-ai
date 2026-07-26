import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";
import { begin, now, textOf } from "../shared.js";

// SCAFFOLD — generated from the bot blueprint BEFORE the agent runs.
// Keep a LIVE registration (.command / .callbackQuery / …) so this feature is
// never an empty stub. Replace the reply body with real logic + copy; if you
// change the user-facing text, update tests/specs to match EXACTLY.
// Do NOT rewrite src/bot.ts — buildBot() already auto-loads this module.
// Menu: wire this into /start via registerMainMenuItem({ label: "Submit Doubt", data: "doubt:submit" }) if the toolkit exposes it.

registerMainMenuItem({ label: "Submit doubt", data: "doubt:submit", order: 30 });
const composer = new Composer<Ctx>();

composer.callbackQuery("doubt:submit", async (ctx) => {
  await ctx.answerCallbackQuery();
  begin(ctx, "doubt:question");
  await ctx.reply("Send your NEET doubt in one message. Include the chapter and what feels unclear.", { reply_markup: { force_reply: true, input_field_placeholder: "For example: Why does this reaction shift?" } });
});

function answerFor(question: string): string {
  const topic = question.replace(/\s+/g, " ").slice(0, 140);
  return `Let’s solve it step by step.\n\n1. Identify the NCERT concept behind: ${topic}.\n2. Write the known values, definition, or diagram labels.\n3. Apply one rule at a time and check units or signs.\n4. Compare your final line with the NCERT statement.\n\nIf you share the exact options or image text, I can check your final step too.`;
}
composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "doubt:question") return next();
  const question = textOf(ctx);
  if (!question || question.startsWith("/")) return next();
  if (question.length < 12) return void (await ctx.reply("Add a little more detail so I can guide you properly — chapter, question, and where you got stuck."));
  const flagged = question.length > 1200 || /urgent|teacher|wrong answer|complex/i.test(question);
  const answer = answerFor(question);
  ctx.session.doubts = [...(ctx.session.doubts ?? []), { questionText: question, stepByStepAnswer: answer, flaggedStatus: flagged, createdAt: new Date(now()).toISOString() }];
  ctx.session.step = "idle";
  ctx.session.flowExpiresAt = undefined;
  await ctx.reply(flagged ? `${answer}\n\nI’ve also marked this for a human tutor to review.` : answer, { reply_markup: inlineKeyboard([[inlineButton("Ask another doubt", "doubt:submit")], [inlineButton("Back to menu", "menu:main")]]) });
});

export default composer;
