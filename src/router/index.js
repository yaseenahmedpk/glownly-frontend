import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import NumberVerificationView from "../views/NumberVerificationView.vue";
import ForgetPasswordView from "../views/ForgetPasswordView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { useAuthStore } from "../stores/authStore";

const routes = [
  { path: "/login", component: LoginView },
  { path: "/signup", component: SignupView },
  { path: "/number-verification", component: NumberVerificationView },
  { path: "/forget-password", component: ForgetPasswordView },
  { path: "/reset-password", component: ResetPasswordView },
  {
    path: "/dashboard",
    meta: { requiresAuth: true },
    component: DashboardLayout,
    children: [
      {
        path: "",
        name: "DashboardHome",
        component: () => import("../views/dashboard/HomeView.vue"),
      },
      {
        path: "/permissions",
        name: "Permissions",
        component: () => import("../views/dashboard/PermissionsView.vue"),
      },
    ],
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return "/login";
  }

  if (to.path === "/login" && isAuthenticated) {
    return "/dashboard";
  }

  return true;
});

export default router;
