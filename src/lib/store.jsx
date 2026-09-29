// The app's state, as a React Context + hook. No real backend: this is an
// in-memory + localStorage "mock API" so the whole product can be exercised
// on one device. Swap the bodies of these functions for real `fetch` calls
// when you have a server — see docs/ARCHITECTURE.md.
//
// A demo partner, @sam, is seeded in so linking, passkeys, cycle sharing and
// thought prompts can all be tried end to end without a second device.

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import {
  todayKey,
  addDays,
  computeCycleStats,
  periodAt,
} from "./cycleEngine";
import { emailOk, passwordOk, usernameOk, passkeyFormatOk, suggestUsernames } from "./validators";
import { buildPromptPool, pickPrompt } from "./thoughtPool";

const STORAGE_KEY = "dj-app-state-v1";
const TAKEN_USERNAMES = ["sam", "riya", "asha", "kabir", "moon", "admin", "journal", "mira"];

function genWord() {
  const WORDS = ["MAPLE", "RIVER", "LANTERN", "COMET", "PEBBLE", "SAFFRON", "WILLOW", "EMBER", "HARBOR", "CLOVER"];
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}
function genPasskey() {
  return `${genWord()}-${Math.floor(1000 + Math.random() * 9000)}-${genWord()}`;
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function seedState() {
  const today = todayKey();
  const s1 = addDays(today, -27);
  const s0 = addDays(s1, -30);
  const sm = addDays(s0, -28);
  const periods = [
    { id: uid(), start: sm, end: addDays(sm, 3) },
    { id: uid(), start: s0, end: addDays(s0, 4) },
    { id: uid(), start: s1, end: addDays(s1, 4) },
  ];
  return {
    auth: { user: null, step: 0, mode: "signin", email: "", pendingCode: "123456" },
    link: { partner: null, outgoingRequest: null, incomingRequest: null, confirmUnlink: false },
    passkeys: { mine: null, revoked: [], viewers: [], confirm: false, partnerDemoCode: null },
    dayNotes: { [addDays(today, -2)]: "Long walk after work. Felt lighter." },
    periods,
    cycleShare: false,
    entries: {}, // { [date]: { done: bool, answers: [{tag,question,answer}] } }
    partnerNotes: {
      hobby: ["Sketching", "Long walks"],
      favourite: ["Mango lassi", "Rainy evenings"],
      trigger: ["Being interrupted mid-story"],
      other: [],
    },
    thoughts: [
      { id: uid(), question: "What's something that made @sam laugh recently?", answer: "The cat knocking the pen off the desk, again.", date: addDays(today, -3), direction: "received" },
    ],
    currentPrompt: null,
    layout: { order: ["today", "calendar", "cycle", "thought", "notes"], hidden: [] },
    arranging: false,
    comfort: { theme: "auto", textSize: "regular", ruledLines: true, thoughtFrequency: "occasional" },
    takenUsernames: [...TAKEN_USERNAMES],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seedState(), ...JSON.parse(raw) };
  } catch (e) {
    /* ignore corrupt storage */
  }
  return seedState();
}

const QUESTIONS = [
  { tag: "Morning", question: "How did your day start?", hint: "Waking up, the first thing you did, how it felt." },
  { tag: "Midday", question: "What took most of your energy today?", hint: "Work, a conversation, something you kept turning over." },
  { tag: "Evening", question: "Who or what stayed on your mind this evening?", hint: "A person, a moment, a worry." },
  { tag: "Right now", question: "In a few words, how do you feel right now?", hint: "Tired, light, restless. Anything honest." },
  { tag: "To remember", question: "What do you want to remember about today?", hint: "One line is enough." },
];

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage full or unavailable, ignore */
    }
  }, [state]);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 3200);
  }, []);

  const update = useCallback((fn) => setState((prev) => fn(prev)), []);

  // ---------- auth ----------
  const setAuthMode = (mode) => update((s) => ({ ...s, auth: { ...s.auth, mode } }));

  const signUp = ({ email, password }) => {
    if (!emailOk(email)) return "Enter a valid email address, like name@example.com.";
    if (!passwordOk(password)) return "Use at least 8 characters for your password.";
    update((s) => ({ ...s, auth: { ...s.auth, email, step: 1 } }));
    return null;
  };

  const signIn = ({ email, password }) => {
    if (!emailOk(email)) return "Enter a valid email address, like name@example.com.";
    if (!passwordOk(password)) return "That email and password don't match. Check them, or reset your password.";
    update((s) => ({
      ...s,
      auth: { ...s.auth, email, step: 3, user: { id: uid(), email, username: "mira" } },
    }));
    return null;
  };

  const verifyEmail = (code) => {
    if (code !== state.auth.pendingCode) {
      return code.length < 6 ? "Enter all 6 digits of the code." : "That code doesn't match. Check the latest email, or send a new code.";
    }
    update((s) => ({ ...s, auth: { ...s.auth, step: 2 } }));
    toast("Email confirmed");
    return null;
  };

  const resendCode = () => toast("New code sent");

  const claimUsername = (username) => {
    const v = username.trim().toLowerCase();
    if (!usernameOk(v)) return "3 to 20 characters. Lowercase letters, numbers and underscores, starting with a letter.";
    if (state.takenUsernames.includes(v)) return "TAKEN";
    update((s) => ({
      ...s,
      auth: { ...s.auth, step: 3, user: { id: uid(), email: s.auth.email, username: v } },
      takenUsernames: [...s.takenUsernames, v],
    }));
    toast(`Welcome, @${v}`);
    return null;
  };

  const usernameSuggestions = (base) => suggestUsernames(base, state.takenUsernames);

  const signOut = () => update(() => seedState());

  // ---------- linking ----------
  const sendLinkRequest = (username) => {
    const v = username.trim().toLowerCase().replace(/^@/, "");
    if (!v) return "Enter your partner's username.";
    if (v === state.auth.user?.username) return "That's your own username. Enter your partner's.";
    if (v !== "sam") return `We couldn't find @${v}. Check the spelling. Demo: try sam.`;
    update((s) => ({ ...s, link: { ...s.link, outgoingRequest: v } }));
    return null;
  };
  const cancelLinkRequest = () => update((s) => ({ ...s, link: { ...s.link, outgoingRequest: null } }));
  const showIncomingDemo = () => update((s) => ({ ...s, link: { ...s.link, incomingRequest: "riya" } }));
  const declineIncoming = () => update((s) => ({ ...s, link: { ...s.link, incomingRequest: null } }));

  const completeLink = (partner) =>
    update((s) => ({
      ...s,
      link: { partner, outgoingRequest: null, incomingRequest: null, confirmUnlink: false },
      auth: { ...s.auth, step: 4 },
      passkeys: { ...s.passkeys, partnerDemoCode: genPasskey() },
    }));
  const acceptIncoming = () => {
    completeLink(state.link.incomingRequest);
    toast(`Linked with @${state.link.incomingRequest}`);
  };
  const confirmDemoLink = () => {
    completeLink(state.link.outgoingRequest);
    toast(`Linked with @${state.link.outgoingRequest}`);
  };
  const askUnlink = () => update((s) => ({ ...s, link: { ...s.link, confirmUnlink: true } }));
  const stayLinked = () => update((s) => ({ ...s, link: { ...s.link, confirmUnlink: false } }));
  const unlink = () => {
    const partner = state.link.partner;
    update((s) => ({
      ...s,
      link: { partner: null, outgoingRequest: null, incomingRequest: null, confirmUnlink: false },
      auth: { ...s.auth, step: 3 },
      passkeys: { mine: null, revoked: s.passkeys.mine ? [...s.passkeys.revoked, s.passkeys.mine] : s.passkeys.revoked, viewers: [], confirm: false, partnerDemoCode: null },
    }));
    toast(`Unlinked from @${partner}`);
  };

  // ---------- passkeys ----------
  const createPasskey = () =>
    update((s) => ({ ...s, passkeys: { ...s.passkeys, mine: genPasskey(), viewers: [], confirm: false } }));
  const askRevoke = () => update((s) => ({ ...s, passkeys: { ...s.passkeys, confirm: true } }));
  const keepPasskey = () => update((s) => ({ ...s, passkeys: { ...s.passkeys, confirm: false } }));
  const revokePasskey = () =>
    update((s) => ({
      ...s,
      passkeys: { ...s.passkeys, revoked: [...s.passkeys.revoked, s.passkeys.mine], mine: null, viewers: [], confirm: false },
    }));
  const redeemPasskey = (code) => {
    const v = code.trim().toUpperCase();
    if (!v) return { ok: false, msg: "Enter the passkey your partner sent you." };
    if (!passkeyFormatOk(v)) return { ok: false, msg: "That doesn't look like a passkey. It has two words and four digits, like MAPLE-1234-RIVER." };
    if (v === state.passkeys.partnerDemoCode) {
      return { ok: true, msg: `Passkey accepted. @${state.link.partner}'s journal opens read-only.` };
    }
    return { ok: false, msg: "We couldn't find that passkey. Check for typos, or ask your partner to send it again." };
  };
  const markPasskeyUsed = () =>
    update((s) => ({
      ...s,
      passkeys: { ...s.passkeys, viewers: s.passkeys.viewers.includes(s.link.partner) ? s.passkeys.viewers : [...s.passkeys.viewers, "@" + s.link.partner] },
    }));

  // ---------- cycle ----------
  const today = todayKey();
  const stats = computeCycleStats(state.periods, today);

  const startPeriodToday = () => {
    if (periodAt(today, stats)) return "A period already covers today. Open that day to edit it.";
    update((s) => ({ ...s, periods: [...s.periods, { id: uid(), start: today, end: null }] }));
    toast("Period started");
    return null;
  };
  const endOngoingToday = () => {
    if (!stats.last || !stats.isOngoing) return "No period is currently open.";
    update((s) => ({
      ...s,
      periods: s.periods.map((p) => (p.id === stats.last.id ? { ...p, end: today } : p)),
    }));
    toast("Period ended");
    return null;
  };
  const savePeriod = (id, patch) =>
    update((s) => ({ ...s, periods: s.periods.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const addPeriod = (patch) => update((s) => ({ ...s, periods: [...s.periods, { id: uid(), ...patch }] }));
  const deletePeriod = (id) => update((s) => ({ ...s, periods: s.periods.filter((p) => p.id !== id) }));
  const toggleCycleShare = () => update((s) => ({ ...s, cycleShare: !s.cycleShare }));

  // ---------- day notes ----------
  const saveDayNote = (date, text) => {
    if (!text.trim()) return "Write something first, or close this sheet.";
    update((s) => ({ ...s, dayNotes: { ...s.dayNotes, [date]: text.trim() } }));
    toast("Note saved");
    return null;
  };
  const deleteDayNote = (date) => {
    update((s) => {
      const next = { ...s.dayNotes };
      delete next[date];
      return { ...s, dayNotes: next };
    });
    toast("Note deleted");
  };

  // ---------- journal entries ----------
  const saveEntry = (answers) => {
    if (!answers.some((a) => a.answer.trim())) return "Answer at least one question to save.";
    update((s) => ({ ...s, entries: { ...s.entries, [today]: { done: true, answers } } }));
    toast("Entry saved");
    return null;
  };
  const editEntry = () =>
    update((s) => ({ ...s, entries: { ...s.entries, [today]: { ...(s.entries[today] || {}), done: false } } }));
  const resetEntry = () =>
    update((s) => {
      const next = { ...s.entries };
      delete next[today];
      return { ...s, entries: next };
    });

  // ---------- private notes about partner ----------
  const addPartnerNote = (category, text) => {
    if (!text.trim()) return;
    update((s) => ({ ...s, partnerNotes: { ...s.partnerNotes, [category]: [...s.partnerNotes[category], text.trim()] } }));
    toast(`Added ${text.trim()}`);
  };
  const removePartnerNote = (category, index) =>
    update((s) => {
      const list = [...s.partnerNotes[category]];
      const [gone] = list.splice(index, 1);
      toast(`Removed ${gone}`);
      return { ...s, partnerNotes: { ...s.partnerNotes, [category]: list } };
    });

  // ---------- thought prompts ----------
  const rollPrompt = useCallback(() => {
    const pool = buildPromptPool({ hobby: state.partnerNotes.hobby[0], favourite: state.partnerNotes.favourite[0] });
    return pickPrompt(pool, state.link.partner);
  }, [state.partnerNotes, state.link.partner]);

  const skipThought = () => update((s) => ({ ...s, currentPrompt: null })); // regenerated on next render if null
  const shareThought = (answer, prompt) => {
    if (!answer.trim()) return "Write a few words, or skip this one.";
    update((s) => ({
      ...s,
      thoughts: [...s.thoughts, { id: uid(), question: prompt, answer: answer.trim(), date: today, direction: "sent" }],
      currentPrompt: null,
    }));
    toast(`Shared with @${state.link.partner}`);
    return null;
  };

  // ---------- dashboard layout ----------
  const setArranging = (v) => update((s) => ({ ...s, arranging: v }));
  const moveWidget = (id, dir) =>
    update((s) => {
      const visible = s.layout.order.filter((x) => !s.layout.hidden.includes(x));
      const i = visible.indexOf(id);
      const j = i + dir;
      if (j < 0 || j >= visible.length) return s;
      const a = s.layout.order.indexOf(id);
      const b = s.layout.order.indexOf(visible[j]);
      const order = [...s.layout.order];
      [order[a], order[b]] = [order[b], order[a]];
      return { ...s, layout: { ...s.layout, order } };
    });
  const hideWidget = (id) =>
    update((s) => ({ ...s, layout: { ...s.layout, hidden: [...s.layout.hidden, id] } }));
  const showWidget = (id) =>
    update((s) => ({ ...s, layout: { ...s.layout, hidden: s.layout.hidden.filter((x) => x !== id) } }));
  const resetLayout = () =>
    update((s) => ({ ...s, layout: { order: ["today", "calendar", "cycle", "thought", "notes"], hidden: [] } }));

  // ---------- comfort ----------
  const setComfort = (key, value) => update((s) => ({ ...s, comfort: { ...s.comfort, [key]: value } }));

  const value = {
    state,
    today,
    stats,
    questions: QUESTIONS,
    toast,
    toastMsg,
    actions: {
      setAuthMode, signUp, signIn, verifyEmail, resendCode, claimUsername, usernameSuggestions, signOut,
      sendLinkRequest, cancelLinkRequest, showIncomingDemo, declineIncoming, acceptIncoming, confirmDemoLink,
      askUnlink, stayLinked, unlink,
      createPasskey, askRevoke, keepPasskey, revokePasskey, redeemPasskey, markPasskeyUsed,
      startPeriodToday, endOngoingToday, savePeriod, addPeriod, deletePeriod, toggleCycleShare,
      saveDayNote, deleteDayNote,
      saveEntry, editEntry, resetEntry,
      addPartnerNote, removePartnerNote,
      rollPrompt, skipThought, shareThought,
      setArranging, moveWidget, hideWidget, showWidget, resetLayout,
      setComfort,
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
