import { Tooltip } from "bootstrap";

export default {
  mounted(el, binding) {
    const tooltip = new Tooltip(el, {
      title: binding.value.text,
      placement: binding.value.placement || "top",
      trigger: "hover focus",
      html: false,
      delay: { show: 0, hide: 150 },
    });

    el._tooltip = tooltip;
  },

  updated(el, binding) {
    if (el._tooltip && binding.value && binding.value.text !== undefined) {
      el._tooltip.setContent({ title: binding.value.text });
    }
  },

  beforeUnmount(el) {
    if (el._tooltip) {
      try {
        el._tooltip.hide();
      } catch (e) {}
    }
  },

  unmounted(el) {
    if (el._tooltip) {
      try {
        el._tooltip.dispose();
      } catch (e) {}
      el._tooltip = null;
    }
  },
};