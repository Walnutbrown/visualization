(() => {
  "use strict";
  const I = window.Illustrate;
  I.register("focus", root => {
    const buttons = [...root.querySelectorAll("[data-focus]")];
    if (!buttons.length || buttons.some(button => button.tagName !== "BUTTON")) throw new Error("선택 강조에는 data-focus를 가진 button이 필요합니다.");
    let selected = "";
    const apply = () => {
      root.querySelectorAll("[data-key]").forEach(mark => {
        mark.classList.toggle("iv-muted", Boolean(selected) && mark.dataset.key !== selected);
        mark.classList.toggle("iv-selected", Boolean(selected) && mark.dataset.key === selected);
      });
    };
    root.addEventListener("illustrate:render", apply);
    buttons.forEach(button => {
      button.type = "button"; button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        selected = button.getAttribute("aria-pressed") === "true" ? "" : button.dataset.focus;
        buttons.forEach(item => item.setAttribute("aria-pressed", String(Boolean(selected) && item.dataset.focus === selected)));
        apply();
      });
    });
    root.classList.add("iv-ready");
  });
})();
