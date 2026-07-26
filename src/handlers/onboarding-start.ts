import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";
import { begin, finish, textOf } from "../shared.js";

// SCAFFOLD — generated from the bot blueprint BEFORE the agent runs.
// Keep a LIVE registration (.command / .callbackQuery / …) so this feature is
// never an empty stub. Replace the reply body with real logic + copy; if you
// change the user-facing text, update tests/specs to match EXACTLY.
// Do NOT rewrite src/bot.ts — buildBot() already auto-loads this module.
// Menu: wire this into /start via registerMainMenuItem({ label: "Start Onboarding", data: "onboarding:start" }) if the toolkit exposes it.

registerMainMenuItem({ label: "Start your plan", data: "onboarding:start", order: 10 });
const composer = new Composer<Ctx>();

composer.callbackQuery("onboarding:start", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.draft = {};
  begin(ctx, "onboarding:name");
  await ctx.reply("Let’s build your study plan. What should I call you?", { reply_markup: { force_reply: true, input_field_placeholder: "Type your name" } });
});

composer.on("message:text", async (ctx, next) => {
  const value = textOf(ctx);
  if (!value || !ctx.session.step?.startsWith("onboarding:")) return next();
  if (value === "/start" || value === "/help") return next();
  if (ctx.session.step === "onboarding:name") {
    if (value.length < 2 || value.length > 60) return void (await ctx.reply("Share a name between 2 and 60 letters so I can personalise your plan."));
    ctx.session.draft = { ...ctx.session.draft, name: value };
    begin(ctx, "onboarding:date");
    return void (await ctx.reply("When is your NEET exam? Send it as DD-MM-YYYY.", { reply_markup: { force_reply: true, input_field_placeholder: "For example: 05-05-2027" } }));
  }
  if (ctx.session.step === "onboarding:date") {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(value) || Number.isNaN(Date.parse(value.split("-").reverse().join("-")))) return void (await ctx.reply("Use DD-MM-YYYY, for example 05-05-2027."));
    ctx.session.draft = { ...ctx.session.draft, examDate: value };
    begin(ctx, "onboarding:score");
    return void (await ctx.reply("What was your latest NEET-style score? Send a number from 0 to 720.", { reply_markup: { force_reply: true, input_field_placeholder: "For example: 420" } }));
  }
  if (ctx.session.step === "onboarding:score") {
    const score = Number(value);
    if (!Number.isInteger(score) || score < 0 || score > 720) return void (await ctx.reply("Send a whole number from 0 to 720."));
    ctx.session.draft = { ...ctx.session.draft, baselineScore: score };
    begin(ctx, "onboarding:window");
    return void (await ctx.reply("How much time can you study daily?", { reply_markup: inlineKeyboard([[inlineButton("1–2 hours", "plan:window:1-2")], [inlineButton("3–4 hours", "plan:window:3-4")], [inlineButton("5+ hours", "plan:window:5+")]]) }));
  }
  return next();
});

composer.callbackQuery(/^plan:window:(1-2|3-4|5\+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.draft = { ...ctx.session.draft, studyWindow: ctx.match[1] };
  begin(ctx, "onboarding:subjects");
  await ctx.editMessageText("Pick the subject you want to prioritise first.", { reply_markup: inlineKeyboard([[inlineButton("Biology", "plan:subject:Biology")], [inlineButton("Chemistry", "plan:subject:Chemistry")], [inlineButton("Physics", "plan:subject:Physics")]]) });
});

composer.callbackQuery(/^plan:subject:(Biology|Chemistry|Physics)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const draft = ctx.session.draft;
  if (!draft?.name || !draft.examDate || draft.baselineScore === undefined || !draft.studyWindow) {
    finish(ctx);
    return void (await ctx.editMessageText("Your setup expired before it was saved. Tap Start your plan to begin again."));
  }
  ctx.session.profile = { name: draft.name, examDate: draft.examDate, baselineScore: draft.baselineScore, studyWindow: draft.studyWindow, prioritySubjects: [ctx.match[1]], createdAt: new Date().toISOString() };
  finish(ctx);
  await ctx.editMessageText(`Your plan is ready, ${ctx.session.profile.name}. Start with ${ctx.match[1]} for ${ctx.session.profile.studyWindow} each day.`, { reply_markup: inlineKeyboard([[inlineButton("Practice MCQs", "practice:mcq")], [inlineButton("Back to menu", "menu:main")]]) });
});

export default composer;
