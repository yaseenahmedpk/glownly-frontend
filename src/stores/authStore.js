import { defineStore } from "pinia";
import router from "../router";
import { logout as logoutApi } from "../services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    user: null,
    allPermissions: null,
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
    setPermissions(permissions) {
      this.allPermissions = permissions;
      localStorage.setItem("allPermissions", JSON.stringify(permissions));
    },
    setCompany(company) {
      this.company = company;
      localStorage.setItem("company", JSON.stringify(company));
    },

    async logout() {
      try {
        await logoutApi();
      } catch (e) {
        console.log("error", e);
      }

      this.token = null;
      this.user = null;
      this.company = null;
      this.allPermissions = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("company");
      localStorage.removeItem("allPermissions");
      router.push("/login");
    },
    loadFromStorage() {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const company = localStorage.getItem("company");
      const allPermissions = localStorage.getItem("allPermissions");

      if (user && token) {
        this.user = JSON.parse(user);
        this.company = company ? JSON.parse(company) : null;
        this.token = token;
        this.allPermissions = allPermissions ? JSON.parse(allPermissions) : null;
      }
    },
  },
});
