import { defineStore } from "pinia";
import router from "../router";
import { logout as logoutApi } from "../services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    user: null,
    company: null,
  }),

  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem("token", token);
    },

    setUser(user) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    setCompany(company) {
      this.company = company;
      localStorage.setItem("copmany", JSON.stringify(company));
    },

    async logout() {
      try {
        await logoutApi();
      } catch (e) {}

      this.token = null;
      this.user = null;
      this.company = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("company");
      router.push("/login");
    },
    loadFromStorage() {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const company = localStorage.getItem("company");

      if (user && token) {
        this.user = JSON.parse(user);
        this.company = JSON.parse(company);
        this.token = token;
      }
    },
  },
});
