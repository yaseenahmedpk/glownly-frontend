import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import NumberVerificationView from "../views/NumberVerificationView.vue";
import ForgetPasswordView from "../views/ForgetPasswordView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";

const routes = [
  { path: "/login", component: LoginView },
  { path: "/signup", component: SignupView },
  { path: "/number-verification", component: NumberVerificationView },
  { path: "/forget-password", component: ForgetPasswordView },
  { path: "/reset-password", component: ResetPasswordView },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
