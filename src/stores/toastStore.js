import { defineStore } from "pinia";

export const useToastStore = defineStore("toast", {
  state: () => ({
    toasts: []
  }),

  actions: {
    show(message, type = "success", duration = 3000) {
      const id = Date.now();

      this.toasts.push({
        id,
        message,
        type,
        duration
      });

      // auto remove
      setTimeout(() => {
        this.remove(id);
      }, duration);
    },

    remove(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }
  }
});