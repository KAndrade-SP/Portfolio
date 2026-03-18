(() => {
  const data = window.portfolioData || {};

  const resolvePath = (object, path) => {
    if (!path) return "";
    return path
      .split(".")
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""), object);
  };

  const clearElement = (element) => {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  const createElement = (tag, className) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  };

  const setText = (element, value) => {
    element.textContent = typeof value === "string" ? value : "";
  };

  const sanitizeIconName = (value, fallback = "ellipse") => {
    if (typeof value !== "string") return fallback;
    const icon = value.trim().toLowerCase();
    return /^[a-z0-9-]+$/.test(icon) ? icon : fallback;
  };

  const sanitizeHref = (value) => {
    if (typeof value !== "string") return "#";
    const href = value.trim();
    if (!href) return "#";

    if (href.startsWith("#")) return href;
    if (href.startsWith("mailto:")) return href;
    if (href.startsWith("tel:")) return href;

    try {
      const parsed = new URL(href, window.location.origin);
      const allowedProtocols = new Set(["http:", "https:"]);
      if (!allowedProtocols.has(parsed.protocol)) return "#";
      return href.startsWith("/") ? `${parsed.pathname}${parsed.search}${parsed.hash}` : parsed.href;
    } catch {
      return "#";
    }
  };

  const sanitizeImageSrc = (value) => {
    if (typeof value !== "string") return "";
    const src = value.trim();
    if (!src) return "";

    try {
      const parsed = new URL(src, window.location.origin);
      if (parsed.protocol !== "https:") return "";

      if (parsed.hostname === "imgur.com" || parsed.hostname === "www.imgur.com") {
        const rawId = parsed.pathname.replaceAll("/", "").split(".")[0];
        if (!rawId) return "";
        return `https://i.imgur.com/${rawId}.jpg`;
      }

      return parsed.href;
    } catch {
      return "";
    }
  };

  const createIcon = (name, fallback) => {
    const icon = createElement("ion-icon");
    icon.setAttribute("name", sanitizeIconName(name, fallback));
    return icon;
  };

  const createProjectActionLink = ({ href, className, label, iconName }) => {
    const link = createElement("a", className);
    link.setAttribute("href", sanitizeHref(href || "#"));
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.setAttribute("aria-label", label);
    link.setAttribute("title", label);

    const icon = createIcon(iconName, "open-outline");
    icon.className = "project-link-icon";

    const text = createElement("span", "project-link-label");
    setText(text, label);

    link.appendChild(icon);
    link.appendChild(text);

    return link;
  };

  const prepareRevealItems = (elements, { variant = "motion-reveal-soft", baseDelay = 0, step = 55 } = {}) => {
    elements
      .filter((element) => element instanceof Element)
      .forEach((element, index) => {
        element.classList.add("motion-reveal", variant);
        element.style.setProperty("--reveal-delay", `${baseDelay + index * step}ms`);
      });
  };

  const logoMap = {
    React: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    "React Native": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    TypeScript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    JavaScript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    HTML: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    CSS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
    Tailwind: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
    "Styled Components": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/styledcomponents/styledcomponents-original.svg",
    Bootstrap: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
    "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    Jest: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg",
    Git: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
    Scrum: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg",
  };

  const initialsFromText = (text) =>
    String(text || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const textNodes = document.querySelectorAll("[data-bind]");
  textNodes.forEach((node) => {
    const value = resolvePath(data, node.dataset.bind || "");
    if (typeof value === "string" && value.length > 0) {
      node.textContent = value;
    }
  });

  const hrefNodes = document.querySelectorAll("[data-bind-href]");
  hrefNodes.forEach((node) => {
    const value = resolvePath(data, node.dataset.bindHref || "");
    if (typeof value === "string" && value.length > 0) {
      node.setAttribute("href", sanitizeHref(value));
    }
  });

  const renderHighlights = () => {
    const container = document.querySelector('[data-render="highlights"]');
    const items = data.profile?.highlights || [];
    if (!container || !Array.isArray(items)) return;

    clearElement(container);
    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
      const card = createElement("article", "insight-chip");
      card.appendChild(createIcon(item.icon, "star"));

      const content = createElement("div");
      const value = createElement("strong");
      setText(value, item.value || "");
      const label = createElement("span");
      setText(label, item.label || "");

      content.appendChild(value);
      content.appendChild(label);
      card.appendChild(content);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  };

  const renderTimeline = (selector, items, isAcademic = false) => {
    const container = document.querySelector(selector);
    if (!container || !Array.isArray(items)) return;

    clearElement(container);
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const role = isAcademic ? item.title : item.role;
      const company = isAcademic ? item.school : item.company;

      const article = createElement("article", "timeline-item");
      article.classList.add("motion-reveal", "motion-reveal-side");
      article.style.setProperty("--reveal-delay", `${index * 70}ms`);
      const marker = createElement("span", "timeline-marker");
      marker.appendChild(createIcon(item.icon, "ellipse"));

      const card = createElement("div", "timeline-card");
      const top = createElement("div", "timeline-top");

      const topLeft = createElement("div");
      const roleNode = createElement("h4", "timeline-role");
      setText(roleNode, role || "");
      const companyNode = createElement("p", "timeline-company");
      setText(companyNode, company || "");
      topLeft.appendChild(roleNode);
      topLeft.appendChild(companyNode);

      const period = createElement("span", "timeline-period");
      setText(period, item.period || "");

      top.appendChild(topLeft);
      top.appendChild(period);

      const meta = createElement("div", "timeline-meta");
      if (item.duration) {
        const duration = createElement("span");
        setText(duration, item.duration);
        meta.appendChild(duration);
      }
      if (item.location) {
        const location = createElement("span");
        setText(location, item.location);
        meta.appendChild(location);
      }

      card.appendChild(top);
      card.appendChild(meta);

      if (Array.isArray(item.bullets) && item.bullets.length > 0) {
        const list = createElement("ul", "timeline-list");
        item.bullets.forEach((bullet) => {
          const listItem = createElement("li");
          setText(listItem, bullet);
          list.appendChild(listItem);
        });
        card.appendChild(list);
      }

      if (Array.isArray(item.tags) && item.tags.length > 0) {
        const tags = createElement("div", "timeline-tags");
        item.tags.forEach((tag) => {
          const chip = createElement("span");
          setText(chip, tag);
          tags.appendChild(chip);
        });
        card.appendChild(tags);
      }

      article.appendChild(marker);
      article.appendChild(card);
      fragment.appendChild(article);
    });

    container.appendChild(fragment);
  };

  const renderProjects = () => {
    const container = document.querySelector('[data-render="projects"]');
    const items = data.projects?.list || [];
    if (!container || !Array.isArray(items)) return;

    clearElement(container);
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const card = createElement("article", "project-card");
      card.classList.add("motion-reveal", "motion-reveal-pop");
      card.style.setProperty("--reveal-delay", `${index * 75}ms`);

      const isFeatured = String(item.type || "").toLowerCase() === "featured";
      if (isFeatured) {
        card.classList.add("is-featured");
      }

      const preview = createElement("figure", "project-preview");
      const previewImage = createElement("img", "project-preview-image");
      const imageSrc = sanitizeImageSrc(item.previewImage || "");
      if (imageSrc) {
        previewImage.src = imageSrc;
        if (imageSrc.includes("i.imgur.com/") && imageSrc.endsWith(".jpg")) {
          previewImage.dataset.fallbackStep = "0";
          previewImage.addEventListener("error", () => {
            const currentStep = Number(previewImage.dataset.fallbackStep || "0");
            const fallbackExt = [".png", ".jpeg", ".webp"][currentStep];
            if (!fallbackExt) return;
            previewImage.dataset.fallbackStep = String(currentStep + 1);
            previewImage.src = imageSrc.replace(".jpg", fallbackExt);
          });
        }
      }

      previewImage.alt = typeof item.previewAlt === "string" && item.previewAlt.length > 0 ? item.previewAlt : `${item.name || "Project"} preview`;
      previewImage.loading = "lazy";
      previewImage.decoding = "async";
      preview.appendChild(previewImage);

      const overlay = createElement("div", "project-overlay");

      const head = createElement("div", "project-head");
      const iconWrap = createElement("span", "project-icon");
      iconWrap.appendChild(createIcon(item.icon, "layers"));

      const info = createElement("div", "project-title-wrap");
      const title = createElement("h4", "project-title");
      setText(title, item.name || "");
      const meta = createElement("p", "project-meta");
      setText(meta, `${item.type || "Project"} - ${item.ownership || "Solo"}`);
      info.appendChild(title);
      info.appendChild(meta);

      const status = createElement("span", "project-status");
      setText(status, item.status || "");
      head.appendChild(iconWrap);
      head.appendChild(info);
      head.appendChild(status);

      const description = createElement("p", "project-description");
      setText(description, item.description || "");

      const body = createElement("div", "project-body");
      body.appendChild(description);

      const stack = createElement("div", "project-stack");
      (item.stack || []).forEach((tech) => {
        const chip = createElement("span");
        setText(chip, tech);
        stack.appendChild(chip);
      });

      const actions = createElement("div", "project-actions");
      const repoLink = createProjectActionLink({
        href: item.repoUrl || "#",
        className: "project-link",
        label: "Repository",
        iconName: "logo-github",
      });
      actions.appendChild(repoLink);

      if (item.demoUrl) {
        const demoLink = createProjectActionLink({
          href: item.demoUrl,
          className: "project-link project-link-demo",
          label: "Live Demo",
          iconName: "open-outline",
        });
        actions.appendChild(demoLink);
      }

      const foot = createElement("div", "project-foot");
      foot.appendChild(stack);
      foot.appendChild(actions);

      overlay.appendChild(head);
      overlay.appendChild(body);
      overlay.appendChild(foot);
      preview.appendChild(overlay);
      card.appendChild(preview);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  };

  const renderCertifications = () => {
    const container = document.querySelector('[data-render="certifications"]');
    const items = data.certifications?.list || [];
    if (!container || !Array.isArray(items)) return;

    clearElement(container);
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const card = createElement("article", "cert-card");
      card.classList.add("motion-reveal", "motion-reveal-soft");
      card.style.setProperty("--reveal-delay", `${index * 55}ms`);
      card.appendChild(createIcon(item.icon, "ribbon"));

      const content = createElement("div");
      const title = createElement("h4");
      setText(title, item.title || "");
      const issuer = createElement("p");
      setText(issuer, item.issuer || "");
      const period = createElement("span");
      setText(period, item.period || "");

      content.appendChild(title);
      content.appendChild(issuer);
      content.appendChild(period);
      card.appendChild(content);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  };

  const renderSkills = () => {
    const container = document.querySelector('[data-render="skills"]');
    const items = data.skills?.categories || [];
    if (!container || !Array.isArray(items)) return;

    clearElement(container);
    const fragment = document.createDocumentFragment();

    items.forEach((category, index) => {
      const card = createElement("article", "skill-card");
      card.classList.add("motion-reveal", "motion-reveal-soft");
      card.style.setProperty("--reveal-delay", `${index * 50}ms`);
      const title = createElement("h4");
      setText(title, category.title || "");

      const grid = createElement("div", "skill-tech-grid");
      (category.items || []).forEach((skill) => {
        const techItem = createElement("div", "tech-item");
        const logoWrap = createElement("span", "tech-logo");
        logoWrap.setAttribute("aria-hidden", "true");

        const logo = logoMap[skill];
        if (typeof logo === "string" && logo.startsWith("https://")) {
          const image = createElement("img");
          image.src = logo;
          image.alt = "";
          image.loading = "lazy";
          image.decoding = "async";
          logoWrap.appendChild(image);
        } else {
          const fallback = createElement("em");
          setText(fallback, initialsFromText(skill));
          logoWrap.appendChild(fallback);
        }

        const name = createElement("span", "tech-name");
        setText(name, skill);

        techItem.appendChild(logoWrap);
        techItem.appendChild(name);
        grid.appendChild(techItem);
      });

      card.appendChild(title);
      card.appendChild(grid);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  };

  const renderLanguages = () => {
    const container = document.querySelector('[data-render="languages"]');
    const items = data.languages?.list || [];
    if (!container || !Array.isArray(items)) return;

    clearElement(container);
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const article = createElement("article", "language-item");
      article.classList.add("motion-reveal", "motion-reveal-soft");
      article.style.setProperty("--reveal-delay", `${index * 50}ms`);
      const top = createElement("div", "language-top");
      const name = createElement("strong");
      setText(name, item.name || "");
      const level = createElement("span");
      setText(level, item.level || "");

      top.appendChild(name);
      top.appendChild(level);

      const bar = createElement("div", "language-bar");
      const fill = createElement("span", "language-fill");
      const percent = Math.max(0, Math.min(100, Number(item.percent) || 0));
      fill.style.width = `${percent}%`;

      bar.appendChild(fill);
      article.appendChild(top);
      article.appendChild(bar);
      fragment.appendChild(article);
    });

    container.appendChild(fragment);
  };

  renderHighlights();
  renderTimeline('[data-render="experience"]', data.experience?.timeline || []);
  renderTimeline('[data-render="education"]', data.education?.timeline || [], true);
  renderProjects();
  renderCertifications();
  renderSkills();
  renderLanguages();

  prepareRevealItems(
    [
      document.querySelector(".profile-card"),
      document.querySelector(".social-links"),
      document.querySelector(".stat-list"),
      document.querySelector(".lang-block"),
      document.querySelector(".resume-btn"),
    ],
    { variant: "motion-reveal-soft", step: 65 }
  );

  prepareRevealItems(
    [
      document.querySelector(".hero-copy .eyebrow"),
      document.querySelector(".hero-copy h2"),
      document.querySelector(".hero-copy p"),
      document.querySelector(".hero-cta"),
      document.querySelector(".hero-visual"),
      ...document.querySelectorAll(".insight-chip"),
    ],
    { variant: "motion-reveal-soft", baseDelay: 40, step: 75 }
  );

  document.querySelectorAll(".section-head").forEach((head, index) => {
    head.classList.add("motion-reveal", "motion-reveal-soft");
    head.style.setProperty("--reveal-delay", `${index * 35}ms`);
  });

  prepareRevealItems(Array.from(document.querySelectorAll(".contact-card")), {
    variant: "motion-reveal-soft",
    step: 55,
  });

  const projectCarousel = document.querySelector('[data-render="projects-carousel"]');
  const projectTrack = document.querySelector('[data-render="projects"]');
  const projectDots = document.querySelector('[data-render="project-dots"]');
  const projectMobilePanel = document.querySelector('[data-render="project-mobile-panel"]');
  const projectPrev = projectCarousel?.querySelector('[data-action="projects-prev"]');
  const projectNext = projectCarousel?.querySelector('[data-action="projects-next"]');

  if (projectCarousel && projectTrack && projectPrev && projectNext && projectDots) {
    const cards = Array.from(projectTrack.querySelectorAll(".project-card"));
    const dots = [];
    let activeIndex = 0;
    let renderedMobileIndex = -1;
    const projectItems = Array.isArray(data.projects?.list) ? data.projects.list : [];
    const mobileMedia = window.matchMedia("(max-width: 1023px)");
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    let mobilePanelTimer = 0;
    let scrollFrame = 0;
    let scrollEndTimer = 0;
    let autoplayTimer = 0;
    let autoplayResumeTimer = 0;
    let hoverLocked = false;
    let focusLocked = false;
    let touchLocked = false;

    if (cards.length <= 1) {
      projectPrev.setAttribute("hidden", "hidden");
      projectNext.setAttribute("hidden", "hidden");
    }

    const getSlideWidth = () => projectTrack.getBoundingClientRect().width || 0;

    const getNearestIndex = () => {
      const slideWidth = getSlideWidth();
      if (slideWidth <= 0) return 0;
      return Math.max(0, Math.min(cards.length - 1, Math.round(projectTrack.scrollLeft / slideWidth)));
    };

    const setActiveDot = (index) => {
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    const clearAutoplay = () => {
      if (autoplayTimer) {
        window.clearTimeout(autoplayTimer);
        autoplayTimer = 0;
      }
      if (autoplayResumeTimer) {
        window.clearTimeout(autoplayResumeTimer);
        autoplayResumeTimer = 0;
      }
    };

    const canAutoplay = () =>
      cards.length > 1 &&
      !reducedMotionMedia.matches &&
      !hoverLocked &&
      !focusLocked &&
      !touchLocked &&
      !document.hidden;

    const scheduleAutoplay = (delay = 4800) => {
      clearAutoplay();
      if (!canAutoplay()) return;
      autoplayTimer = window.setTimeout(() => {
        scrollToIndex((activeIndex + 1) % cards.length, { fromAutoplay: true });
      }, delay);
    };

    const resumeAutoplay = (delay = 5200) => {
      clearAutoplay();
      if (!canAutoplay()) return;
      autoplayResumeTimer = window.setTimeout(() => {
        scheduleAutoplay();
      }, delay);
    };

    const renderMobilePanelContent = (index) => {
      if (!projectMobilePanel) return;
      const item = projectItems[index];
      clearElement(projectMobilePanel);
      if (!item) return;

      const panel = createElement("article", "project-mobile-content");
      const head = createElement("div", "project-head");
      const iconWrap = createElement("span", "project-icon");
      iconWrap.appendChild(createIcon(item.icon, "layers"));

      const info = createElement("div", "project-title-wrap");
      const title = createElement("h4", "project-title");
      setText(title, item.name || "");
      const meta = createElement("p", "project-meta");
      setText(meta, `${item.type || "Project"} - ${item.ownership || "Solo"}`);
      info.appendChild(title);
      info.appendChild(meta);

      const status = createElement("span", "project-status");
      setText(status, item.status || "");

      head.appendChild(iconWrap);
      head.appendChild(info);
      head.appendChild(status);

      const description = createElement("p", "project-description");
      setText(description, item.description || "");

      const body = createElement("div", "project-body");
      body.appendChild(description);

      const stack = createElement("div", "project-stack");
      (item.stack || []).forEach((tech) => {
        const chip = createElement("span");
        setText(chip, tech);
        stack.appendChild(chip);
      });

      const actions = createElement("div", "project-actions");
      const repoLink = createProjectActionLink({
        href: item.repoUrl || "#",
        className: "project-link",
        label: "Repository",
        iconName: "logo-github",
      });
      actions.appendChild(repoLink);

      if (item.demoUrl) {
        const demoLink = createProjectActionLink({
          href: item.demoUrl,
          className: "project-link project-link-demo",
          label: "Live Demo",
          iconName: "open-outline",
        });
        actions.appendChild(demoLink);
      }

      const toolbar = createElement("div", "project-mobile-toolbar");
      toolbar.appendChild(status);
      toolbar.appendChild(actions);

      const foot = createElement("div", "project-foot");
      foot.appendChild(stack);

      panel.appendChild(head);
      panel.appendChild(toolbar);
      panel.appendChild(body);
      panel.appendChild(foot);
      projectMobilePanel.appendChild(panel);
    };

    const renderMobilePanel = (index, { animate = false } = {}) => {
      if (!projectMobilePanel) return;
      if (index === renderedMobileIndex && !animate) return;

      if (mobilePanelTimer) {
        window.clearTimeout(mobilePanelTimer);
        mobilePanelTimer = 0;
      }

      if (!animate || !mobileMedia.matches || !projectMobilePanel.childElementCount) {
        projectMobilePanel.classList.remove("is-swapping");
        renderMobilePanelContent(index);
        renderedMobileIndex = index;
        return;
      }

      projectMobilePanel.classList.add("is-swapping");
      mobilePanelTimer = window.setTimeout(() => {
        renderMobilePanelContent(index);
        projectMobilePanel.classList.remove("is-swapping");
        renderedMobileIndex = index;
        mobilePanelTimer = 0;
      }, 130);
    };

    const scrollToIndex = (index, { fromAutoplay = false } = {}) => {
      const bounded = Math.max(0, Math.min(cards.length - 1, index));
      const slideWidth = getSlideWidth();
      if (slideWidth <= 0) return;
      activeIndex = bounded;
      projectTrack.scrollTo({
        left: slideWidth * bounded,
        behavior: "smooth",
      });
      setActiveDot(bounded);
      renderMobilePanel(bounded, { animate: true });
      if (fromAutoplay) {
        scheduleAutoplay();
      }
    };

    cards.forEach((_, index) => {
      const dot = createElement("button", "project-dot");
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to project ${index + 1}`);
      dot.addEventListener("click", () => {
        scrollToIndex(index);
        resumeAutoplay(6200);
      });
      projectDots.appendChild(dot);
      dots.push(dot);
    });

    setActiveDot(0);
    renderMobilePanel(0);
    scheduleAutoplay(4200);

    projectTrack.addEventListener("scroll", () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        const current = getNearestIndex();
        activeIndex = current;
        setActiveDot(current);
        if (scrollEndTimer) {
          window.clearTimeout(scrollEndTimer);
        }
        scrollEndTimer = window.setTimeout(() => {
          if (current === renderedMobileIndex) return;
          renderMobilePanel(current, { animate: true });
          resumeAutoplay();
        }, 110);
        scrollFrame = 0;
      });
    });

    projectPrev.addEventListener("click", () => {
      scrollToIndex(getNearestIndex() - 1);
      resumeAutoplay(6200);
    });

    projectNext.addEventListener("click", () => {
      scrollToIndex(getNearestIndex() + 1);
      resumeAutoplay(6200);
    });

    projectCarousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToIndex(getNearestIndex() - 1);
        resumeAutoplay(6200);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollToIndex(getNearestIndex() + 1);
        resumeAutoplay(6200);
      }
    });

    window.addEventListener("resize", () => {
      const slideWidth = getSlideWidth();
      if (slideWidth <= 0) return;
      projectTrack.scrollTo({
        left: slideWidth * activeIndex,
        behavior: "auto",
      });
      setActiveDot(activeIndex);
      renderMobilePanel(activeIndex);
      resumeAutoplay(3400);
    });

    projectCarousel.addEventListener("mouseenter", () => {
      hoverLocked = true;
      clearAutoplay();
    });

    projectCarousel.addEventListener("mouseleave", () => {
      hoverLocked = false;
      resumeAutoplay(2600);
    });

    projectCarousel.addEventListener("focusin", () => {
      focusLocked = true;
      clearAutoplay();
    });

    projectCarousel.addEventListener("focusout", (event) => {
      if (event.relatedTarget instanceof Node && projectCarousel.contains(event.relatedTarget)) return;
      focusLocked = false;
      resumeAutoplay(3200);
    });

    projectCarousel.addEventListener(
      "touchstart",
      () => {
        touchLocked = true;
        clearAutoplay();
      },
      { passive: true }
    );

    const releaseTouchLock = () => {
      touchLocked = false;
      resumeAutoplay(5200);
    };

    projectCarousel.addEventListener("touchend", releaseTouchLock, { passive: true });
    projectCarousel.addEventListener("touchcancel", releaseTouchLock, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearAutoplay();
        return;
      }
      resumeAutoplay(2800);
    });

    reducedMotionMedia.addEventListener("change", () => {
      if (reducedMotionMedia.matches) clearAutoplay();
      else resumeAutoplay(3200);
    });

    if (projectMobilePanel) {
      let touchStartX = 0;
      let touchStartY = 0;

      projectMobilePanel.addEventListener(
        "touchstart",
        (event) => {
          touchLocked = true;
          clearAutoplay();
          const target = event.target;
          if (target instanceof Element && target.closest("a")) {
            touchStartX = 0;
            touchStartY = 0;
            return;
          }

          const touch = event.touches[0];
          if (!touch) return;
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;
        },
        { passive: true }
      );

      projectMobilePanel.addEventListener(
        "touchend",
        (event) => {
          if (!touchStartX && !touchStartY) return;
          const touch = event.changedTouches[0];
          if (!touch) return;

          const deltaX = touch.clientX - touchStartX;
          const deltaY = touch.clientY - touchStartY;

          touchStartX = 0;
          touchStartY = 0;
          touchLocked = false;

          if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) {
            resumeAutoplay(4200);
            return;
          }
          scrollToIndex(getNearestIndex() + (deltaX < 0 ? 1 : -1));
          resumeAutoplay(5600);
        },
        { passive: true }
      );

      projectMobilePanel.addEventListener(
        "touchcancel",
        () => {
          touchLocked = false;
          resumeAutoplay(4200);
        },
        { passive: true }
      );
    }
  }

  const revealTargets = Array.from(document.querySelectorAll(".motion-reveal"));
  if (revealTargets.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.14,
      },
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
  }

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
    setOpenState(!quickRail.classList.contains("is-open"));
  });

  quickLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!quickRail.classList.contains("is-open")) return;
    if (quickRail.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  desktopMedia.addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });

  const sections = Array.from(document.querySelectorAll("main section[id]"));
  if (sections.length > 0) {
    const sectionById = new Map(sections.map((section) => [section.id, section]));

    const activateLink = (id) => {
      quickLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";
        const active = href === `#${id}`;
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) activateLink(visible.target.id);
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7],
      },
    );

    sections.forEach((section) => observer.observe(section));

    const initial = window.location.hash.replace("#", "");
    if (initial && sectionById.has(initial)) activateLink(initial);
  }
})();
