import { Tooltip } from "bootstrap";

export default {
  mounted(el, binding) {
    new Tooltip(el, {
      title: binding.value.text,
      placement: binding.value.placement || "top",
    });
  },
};
