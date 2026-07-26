import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";
import { begin, expired, now, textOf } from "../shared.js";
import { answerDoubt, type GeminiEnv } from "../gemini.js";

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

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "doubt:question") return next();
  if (expired(ctx)) {
    await ctx.reply("That unfinished doubt expired. Tap Submit doubt and send it again when you’re ready.");
    return;
  }
  const question = textOf(ctx);
  if (!question || question.startsWith("/")) return next();
  if (question.length < 12) return void (await ctx.reply("Add a little more detail so I can guide you properly — chapter, question, and where you got stuck."));
  const flagged = question.length > 1200 || /urgent|teacher|wrong answer|complex/i.test(question);
  const workerEnv = (ctx as unknown as { env?: GeminiEnv }).env;
  const answer = await answerDoubt(question, workerEnv);
  ctx.session.step = "idle";
  ctx.session.flowExpiresAt = undefined;
  if (!answer) {
    await ctx.reply("The AI tutor isn’t set up yet or couldn’t answer just now. Try again shortly, or ask your NEETX teacher for help.", { reply_markup: inlineKeyboard([[inlineButton("Ask another doubt", "doubt:submit")], [inlineButton("Back to menu", "menu:main")]]) });
    return;
  }
  ctx.session.doubts = [...(ctx.session.doubts ?? []), { questionText: question, stepByStepAnswer: answer, flaggedStatus: flagged, createdAt: new Date(now()).toISOString() }];
  await ctx.reply(flagged ? `${answer}\n\nI’ve also marked this for a human tutor to review.` : answer, { reply_markup: inlineKeyboard([[inlineButton("Ask another doubt", "doubt:submit")], [inlineButton("Back to menu", "menu:main")]]) });
});

export default composer;
