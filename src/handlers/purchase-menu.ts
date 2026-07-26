import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";

// SCAFFOLD — generated from the bot blueprint BEFORE the agent runs.
// Keep a LIVE registration (.command / .callbackQuery / …) so this feature is
// never an empty stub. Replace the reply body with real logic + copy; if you
// change the user-facing text, update tests/specs to match EXACTLY.
// Do NOT rewrite src/bot.ts — buildBot() already auto-loads this module.
// Menu: wire this into /start via registerMainMenuItem({ label: "Purchase Premium", data: "purchase:menu" }) if the toolkit exposes it.

registerMainMenuItem({ label: "Purchase premium", data: "purchase:menu", order: 60 });
const composer = new Composer<Ctx>();

composer.callbackQuery("purchase:menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  if (ctx.session.entitlement) {
    await ctx.reply(`Your ${ctx.session.entitlement === "foundation" ? "Foundation" : "Rank Booster"} pack is active. Premium lessons are unlocked in your study plan.`, { reply_markup: inlineKeyboard([[inlineButton("Access lessons", "lesson:menu")], [inlineButton("Back to menu", "menu:main")]]) });
    return;
  }
  await ctx.reply("Choose a premium pack. Payment is handled by Telegram’s configured UPI partner; NEETX never stores payment details.", { reply_markup: inlineKeyboard([[inlineButton("Foundation pack", "purchase:pack:foundation")], [inlineButton("Rank Booster pack", "purchase:pack:rank-booster")], [inlineButton("Back to menu", "menu:main")]]) });
});

composer.callbackQuery(/^purchase:pack:(foundation|rank-booster)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  // A Telegram payment provider token is deployment configuration, not student
  // data. This blueprint does not supply one, so never create a pretend charge.
  await ctx.editMessageText("Payments aren’t set up yet. Ask your NEETX teacher to enable the UPI payment partner, then try again.", { reply_markup: inlineKeyboard([[inlineButton("Back to premium", "purchase:menu")], [inlineButton("Back to menu", "menu:main")]]) });
});

// Entitlements are only written after Telegram confirms a successful payment.
// This keeps payment data out of the bot and makes duplicate delivery harmless.
composer.on("message:successful_payment", async (ctx) => {
  const payload = ctx.message.successful_payment.invoice_payload;
  if (payload !== "neetx:foundation" && payload !== "neetx:rank-booster") return;
  ctx.session.entitlement = payload === "neetx:foundation" ? "foundation" : "rank-booster";
  await ctx.reply("Your premium pack is active. You can now open the lessons and start studying.", { reply_markup: inlineKeyboard([[inlineButton("Access lessons", "lesson:menu")], [inlineButton("Back to menu", "menu:main")]]) });
});

export default composer;
