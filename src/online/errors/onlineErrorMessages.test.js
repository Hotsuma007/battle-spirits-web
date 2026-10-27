import test from "node:test";
import assert from "node:assert/strict";
import { onlineErrorMessage } from "./onlineErrorMessages.js";

test("known Online error codes use stable user-facing copy", () => {
  assert.equal(onlineErrorMessage({ code: "READY_CHECK_EXPIRED", error: "internal" }), "A confirmação da partida expirou.");
});

test("unsafe technical messages are hidden", () => {
  assert.equal(onlineErrorMessage({ error: "Supabase RPC database exception" }, { fallback: "Falha segura." }), "Falha segura.");
});

test("Japanese online errors include unclassified server messages and fallbacks", () => {
  assert.equal(onlineErrorMessage({ error: "Senha da sala incorreta." }, { language: "ja" }), "ルームのパスワードが違います。");
  assert.equal(onlineErrorMessage({ code: "CHALLENGE_DECLINED", error: "O desafio foi recusado." }, { language: "ja" }), "対戦の申し込みが拒否されました。");
  assert.equal(onlineErrorMessage({}, { language: "ja", fallback: "Não foi possível criar a sala." }), "ルームを作成できませんでした。");
  assert.equal(onlineErrorMessage({ error: "Senha da sala incorreta." }), "Senha da sala incorreta.");
});
