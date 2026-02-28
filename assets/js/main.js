(() => {
  const quickRail = document.querySelector(".quick-rail");
  const quickToggle = document.querySelector(".quick-toggle");

  if (!quickRail || !quickToggle) {
    return;
  }

  const quickLinks = Array.from(quickRail.querySelectorAll(".quick-item"));
  const desktopMedia = window.matchMedia("(min-width: 1024px)");
  const toggleIcon = quickToggle.querySelector("ion-icon");

  const setOpenState = (isOpen) => {
    quickRail.classList.toggle("is-open", isOpen);
    quickToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    quickToggle.setAttribute("aria-label", isOpen ? "Close quick menu" : "Open quick menu");

    if (toggleIcon) {
      toggleIcon.setAttribute("name", isOpen ? "close" : "grid");
    }
  };

  const closeMenu = () => setOpenState(false);

  quickToggle.addEventListener("click", () => {
    const isOpen = quickRail.classList.contains("is-open");
    setOpenState(!isOpen);
  });

  quickLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!quickRail.classList.contains("is-open")) {
      return;
    }

    if (quickRail.contains(event.target)) {
      return;
    }

    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  desktopMedia.addEventListener("change", (event) => {
    if (event.matches) {
      closeMenu();
    }
  });
})();
