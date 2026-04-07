export function resetAppScrollPosition() {
  if (typeof window === "undefined") return;

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  if (document?.documentElement) document.documentElement.scrollTop = 0;
  if (document?.body) document.body.scrollTop = 0;

  const containers = [
    document.querySelector(".pc-content-wrapper"),
    document.querySelector(".app-content"),
  ];

  containers.forEach((el) => {
    if (!el) return;
    if (typeof el.scrollTo === "function") {
      el.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } else {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    }
  });
}

