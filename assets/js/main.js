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

  const createIcon = (name, fallback) => {
    const icon = createElement("ion-icon");
    icon.setAttribute("name", sanitizeIconName(name, fallback));
    return icon;
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

    items.forEach((item) => {
      const role = isAcademic ? item.title : item.role;
      const company = isAcademic ? item.school : item.company;

      const article = createElement("article", "timeline-item");
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

  const renderFocusAreas = () => {
    const container = document.querySelector('[data-render="focus-areas"]');
    const items = data.projects?.focusAreas || [];
    if (!container || !Array.isArray(items)) return;

    clearElement(container);
    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
      const card = createElement("article", "service-card");
      const iconWrap = createElement("span", "service-icon");
      iconWrap.appendChild(createIcon(item.icon, "square"));

      const title = createElement("h4");
      setText(title, item.title || "");
      const description = createElement("p");
      setText(description, item.description || "");

      card.appendChild(iconWrap);
      card.appendChild(title);
      card.appendChild(description);
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

    items.forEach((item) => {
      const card = createElement("article", "cert-card");
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

    items.forEach((category) => {
      const card = createElement("article", "skill-card");
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

    items.forEach((item) => {
      const article = createElement("article", "language-item");
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
  renderFocusAreas();
  renderCertifications();
  renderSkills();
  renderLanguages();

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
