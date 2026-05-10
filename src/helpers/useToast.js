import { useToastStore } from "../stores/toastStore";

export function useToast() {
  const toastStore = useToastStore();

  const toast = (message, type = "success", duration = 3000) => {
    toastStore.show(message, type, duration);
  };

  return { toast };
}
