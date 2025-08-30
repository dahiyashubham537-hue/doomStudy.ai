import { create } from "zustand";

// -------------------
// Helpers
// -------------------
const STORAGE_KEY = "cards-store";

const loadState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? JSON.parse(stored)
      : { cards: [], topic: "", chunks: [], currentChunk: 0, mode: "topic" };
  } catch (err) {
    console.error("Error loading from localStorage:", err);
    return { cards: [], topic: "", chunks: [], currentChunk: 0, mode: "topic" };
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
};

// -------------------
// Store
// -------------------
const useCardsStore = create((set, get) => ({
  ...loadState(),
   reset: () => {
    const cleared = { cards: [], topic: "", chunks: [], currentChunk: 0, mode: get().mode };
    set(cleared);
    saveState(cleared);
  },
  setMode: (mode) => {
    const newState = { ...get(), mode };
    set({ mode });
    saveState(newState);
  },

  setTopic: (topic) => {
    const newState = { ...get(), topic };
    set({ topic });
    saveState(newState);
  },

  setCards: (cards) => {
    const newState = { ...get(), cards };
    set({ cards });
    saveState(newState);
  },

  appendCards: (newCards) => {
    const updatedCards = [...get().cards, ...newCards];
    const newState = { ...get(), cards: updatedCards };
    set({ cards: updatedCards });
    saveState(newState);
  },

  setChunks: (chunks) => {
    const newState = { ...get(), chunks, currentChunk: 0 };
    set({ chunks, currentChunk: 0 });
    saveState(newState);
  },

  nextChunk: () => {
    const updated = get().currentChunk + 1;
    const newState = { ...get(), currentChunk: updated };
    set({ currentChunk: updated });
    saveState(newState);
  },
}));

export default useCardsStore;
