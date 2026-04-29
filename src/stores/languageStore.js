import { defineStore } from "pinia";

export const useLanguageStore = defineStore("language", {
  state: () => ({
    locale: localStorage.getItem("lang") || "en",
  }),

  actions: {
    setLanguage(lang) {
      this.locale = lang;
      localStorage.setItem("lang", lang);
    },
  },
});
