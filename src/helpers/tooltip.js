import { Tooltip } from "bootstrap";

export default {
  mounted(el, binding) {
    const tooltip = new Tooltip(el, {
      title: binding.value.text,
      placement: binding.value.placement || "top",
      trigger: "hover focus",
    });

    el._tooltip = tooltip; // ✅ STORE IT
  },

  unmounted(el) {
    if (el._tooltip) {
      el._tooltip.dispose();
      el._tooltip = null;
    }
  },
};