(() => {
  const resolvePath = (object, path) => {
    if (!path) return "";
    return path
      .split(".")
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""), object);
  };

  const config = window.portfolioData || {};
  const localeStorageKey = "portfolio-locale";
  const locales = config.locales || {};
  const supportedLocales = Object.keys(locales);
  const defaultLocale =
    typeof config.defaultLocale === "string" && supportedLocales.includes(config.defaultLocale)
      ? config.defaultLocale
      : supportedLocales[0] || "pt-BR";

  const readStoredLocale = () => {
    try {
      return window.localStorage.getItem(localeStorageKey) || "";
    } catch {
      return "";
    }
  };

  const activeLocale = supportedLocales.includes(readStoredLocale()) ? readStoredLocale() : defaultLocale;
  const data = locales[activeLocale] || {};
  const ui = config.ui?.[activeLocale] || config.ui?.[defaultLocale] || {};

  const formatTemplate = (value, replacements = {}) =>
    String(value || "").replace(/\{\{(\w+)\}\}/g, (_, key) => String(replacements[key] ?? ""));

  const t = (path, replacements = {}) => {
    const value = resolvePath(ui, path);
    return typeof value === "string" ? formatTemplate(value, replacements) : "";
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
    React: "https://cdn.simpleicons.org/react/61DAFB",
    "React Native": "https://cdn.simpleicons.org/react/61DAFB",
    TypeScript: "https://skillicons.dev/icons?i=ts&theme=light",
    JavaScript: "https://skillicons.dev/icons?i=javascript&theme=light",
    HTML: "https://skillicons.dev/icons?i=html&theme=light",
    CSS: "https://skillicons.dev/icons?i=css&theme=light",
    "Tailwind CSS": "https://cdn.simpleicons.org/tailwindcss/06B6D4",
    Tailwind: "https://cdn.simpleicons.org/tailwindcss/06B6D4",
    "Styled Components": "https://cdn.simpleicons.org/styledcomponents/DB7093",
    Bootstrap: "https://skillicons.dev/icons?i=bootstrap&theme=light",
    "Node.js": "https://cdn.simpleicons.org/nodedotjs/339933",
    "Next.js": "https://cdn.simpleicons.org/nextdotjs/111111",
    Firebase: "https://cdn.simpleicons.org/firebase/DD2C00",
    MySQL: "https://cdn.simpleicons.org/mysql/4479A1",
    Docker: "https://cdn.simpleicons.org/docker/2496ED",
    "SQL Server": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-plain.svg",
    ".NET": "https://cdn.simpleicons.org/dotnet/512BD4",
    Python: "https://cdn.simpleicons.org/python/3776AB",
    RabbitMQ: "https://cdn.simpleicons.org/rabbitmq/FF6600",
    GraphQL: "https://cdn.simpleicons.org/graphql/E10098",
    GitHub: "https://cdn.simpleicons.org/github/181717",
    Git: "https://cdn.simpleicons.org/git/F05032",
    Jira: "https://cdn.simpleicons.org/jira/0052CC",
    Figma: "https://cdn.simpleicons.org/figma/F24E1E",
    "VS Code": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg",
    Postman: "https://cdn.simpleicons.org/postman/FF6C37",
    "Redux Toolkit": "https://cdn.simpleicons.org/redux/764ABC",
    "Spotify API": "https://cdn.simpleicons.org/spotify/1DB954",
    "Imgur API": "https://cdn.simpleicons.org/imgur/1BB76E",
    Keycloak: "https://cdn.simpleicons.org/keycloak/4D4D4D",
    Jest: "https://cdn.simpleicons.org/jest/C21325",
  };

  const initialsFromText = (text) =>
    String(text || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const createTechToken = (label, className = "skill-inline-item") => {
    const token = createElement("span", className);
    const logoWrap = createElement("span", `${className}-logo`);
    logoWrap.setAttribute("aria-hidden", "true");
    const mountFallback = () => {
      clearElement(logoWrap);
      logoWrap.classList.add("is-fallback");
      const fallback = createElement("em");
      setText(fallback, initialsFromText(label));
      logoWrap.appendChild(fallback);
    };

    const logo = logoMap[label];
    if (typeof logo === "string" && logo.startsWith("https://")) {
      const image = createElement("img");
      image.src = logo;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", mountFallback, { once: true });
      logoWrap.appendChild(image);
    } else {
      mountFallback();
    }

    const text = createElement("span", `${className}-label`);
    setText(text, label);

    token.appendChild(logoWrap);
    token.appendChild(text);
    return token;
  };

  const createProjectTechBadge = (label) => {
    const badge = createElement("span", "project-tech-badge");
    badge.setAttribute("role", "img");
    badge.setAttribute("aria-label", label);
    badge.setAttribute("title", label);

    const logoWrap = createElement("span", "project-tech-badge-logo");
    logoWrap.setAttribute("aria-hidden", "true");

    const mountFallback = () => {
      clearElement(logoWrap);
      logoWrap.classList.add("is-fallback");
      const fallback = createElement("em");
      setText(fallback, initialsFromText(label));
      logoWrap.appendChild(fallback);
    };

    const logo = logoMap[label];
    if (typeof logo === "string" && logo.startsWith("https://")) {
      const image = createElement("img");
      image.src = logo;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", mountFallback, { once: true });
      logoWrap.appendChild(image);
    } else {
      mountFallback();
    }

    badge.appendChild(logoWrap);
    return badge;
  };

  const applyBoundContent = () => {
    document.querySelectorAll("[data-bind]").forEach((node) => {
      const value = resolvePath(data, node.dataset.bind || "");
      if (typeof value === "string" && value.length > 0) {
        node.textContent = value;
      }
    });

    document.querySelectorAll("[data-bind-href]").forEach((node) => {
      const value = resolvePath(data, node.dataset.bindHref || "");
      if (typeof value === "string" && value.length > 0) {
        node.setAttribute("href", sanitizeHref(value));
      }
    });
  };

  const applyStaticTranslations = () => {
    document.documentElement.lang = activeLocale;

    const titleNode = document.getElementById("page-title");
    if (titleNode) {
      const title = t("meta.title");
      if (title) titleNode.textContent = title;
    }

    const descriptionNode = document.getElementById("page-description");
    if (descriptionNode) {
      const description = t("meta.description");
      if (description) descriptionNode.setAttribute("content", description);
    }

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const value = t(node.dataset.i18n || "");
      if (value) node.textContent = value;
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      const value = t(node.dataset.i18nAriaLabel || "");
      if (value) node.setAttribute("aria-label", value);
    });

    document.querySelectorAll("[data-i18n-data-label]").forEach((node) => {
      const value = t(node.dataset.i18nDataLabel || "");
      if (value) node.setAttribute("data-label", value);
    });
  };

  applyBoundContent();
  applyStaticTranslations();

  const localeButtons = Array.from(document.querySelectorAll(".locale-btn"));
  localeButtons.forEach((button) => {
    const isActive = button.dataset.locale === activeLocale;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");

    button.addEventListener("click", () => {
      const nextLocale = button.dataset.locale || defaultLocale;
      if (!supportedLocales.includes(nextLocale) || nextLocale === activeLocale) return;

      try {
        window.localStorage.setItem(localeStorageKey, nextLocale);
      } catch {
        return;
      }

      window.location.reload();
    });
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

      const preview = createElement("figure", "project-preview");
      preview.dataset.projectTitle = item.name || t("project.itemFallback");
      preview.dataset.projectMeta = `${item.type || t("project.itemFallback")} - ${item.ownership || t("project.solo")}`;
      const previewImage = createElement("img", "project-preview-image");
      const imageSrc = sanitizeImageSrc(item.previewImage || "");
      const applyPreviewFallback = () => {
        preview.classList.add("is-media-fallback");
        previewImage.classList.add("is-hidden");
      };
      if (imageSrc) {
        previewImage.src = imageSrc;
        previewImage.addEventListener("error", applyPreviewFallback, { once: true });
        previewImage.addEventListener("load", () => preview.classList.remove("is-media-fallback"), { once: true });
      } else {
        applyPreviewFallback();
      }

      previewImage.alt =
        typeof item.previewAlt === "string" && item.previewAlt.length > 0
          ? item.previewAlt
          : `${item.name || t("project.itemFallback")} preview`;
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
      setText(meta, `${item.type || t("project.itemFallback")} - ${item.ownership || t("project.solo")}`);
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
        stack.appendChild(createProjectTechBadge(tech));
      });

      const actions = createElement("div", "project-actions");
      const repoLink = createProjectActionLink({
        href: item.repoUrl || "#",
        className: "project-link",
        label: t("actions.repository") || "Repository",
        iconName: "logo-github",
      });
      actions.appendChild(repoLink);

      if (item.demoUrl) {
        const demoLink = createProjectActionLink({
          href: item.demoUrl,
          className: "project-link project-link-demo",
          label: t("actions.liveDemo") || "Live Demo",
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

  const renderServices = () => {
    const container = document.querySelector('[data-render="services"]');
    const items = data.services?.list || [];
    if (!container || !Array.isArray(items)) return;

    clearElement(container);
    const [featured, ...rest] = items;
    const shell = createElement("div", "services-shell");
    const lead = createElement("article", "services-feature");
    lead.classList.add("motion-reveal", "motion-reveal-pop");

    const leadEyebrow = createElement("span", "services-feature-eyebrow");
    setText(leadEyebrow, t("services.featuredEyebrow") || "Core Delivery");
    const leadTitle = createElement("h4", "services-feature-title");
    setText(leadTitle, featured?.title || "");
    const leadDescription = createElement("p", "services-feature-description");
    setText(leadDescription, featured?.description || "");

    const leadMeta = createElement("div", "services-feature-meta");
    [
      t("services.lanes", { count: items.length }) || `${items.length} service lanes`,
      t("services.quality") || "UI quality focused",
      t("services.scope") || "Front-end + integration",
    ].forEach((value) => {
      const itemNode = createElement("span");
      setText(itemNode, value);
      leadMeta.appendChild(itemNode);
    });

    const leadIcon = createElement("span", "services-feature-icon");
    leadIcon.appendChild(createIcon(featured?.icon, "sparkles"));

    lead.appendChild(leadEyebrow);
    lead.appendChild(leadTitle);
    lead.appendChild(leadDescription);
    lead.appendChild(leadMeta);
    lead.appendChild(leadIcon);

    const list = createElement("div", "services-list");
    rest.forEach((item, index) => {
      const row = createElement("article", "service-line");
      row.classList.add("motion-reveal", "motion-reveal-soft");
      row.style.setProperty("--reveal-delay", `${(index + 1) * 55}ms`);

      const number = createElement("span", "service-line-index");
      setText(number, String(index + 2).padStart(2, "0"));

      const copy = createElement("div", "service-line-copy");
      const title = createElement("h4");
      setText(title, item.title || "");
      const description = createElement("p");
      setText(description, item.description || "");
      copy.appendChild(title);
      copy.appendChild(description);

      const iconWrap = createElement("span", "service-line-icon");
      iconWrap.appendChild(createIcon(item.icon, "sparkles"));

      row.appendChild(number);
      row.appendChild(copy);
      row.appendChild(iconWrap);
      list.appendChild(row);
    });

    shell.appendChild(lead);
    shell.appendChild(list);
    container.appendChild(shell);
  };

  const renderWorkflow = () => {
    const container = document.querySelector('[data-render="workflow"]');
    const items = data.workflow?.steps || [];
    if (!container || !Array.isArray(items)) return;

    clearElement(container);
    const shell = createElement("div", "workflow-shell");
    const rail = createElement("div", "workflow-rail");

    items.forEach((item, index) => {
      const node = createElement("article", "workflow-node");
      node.classList.add(index % 2 === 0 ? "is-left" : "is-right", "motion-reveal", "motion-reveal-side");
      node.style.setProperty("--reveal-delay", `${index * 70}ms`);

      const marker = createElement("div", "workflow-node-marker");
      const number = createElement("span", "workflow-node-index");
      setText(number, String(index + 1).padStart(2, "0"));
      marker.appendChild(number);

      const body = createElement("div", "workflow-node-body");
      const head = createElement("div", "workflow-node-head");
      const iconWrap = createElement("span", "workflow-node-icon");
      iconWrap.appendChild(createIcon(item.icon, "trail-sign"));
      const title = createElement("h4");
      setText(title, item.title || "");
      head.appendChild(iconWrap);
      head.appendChild(title);

      const description = createElement("p");
      setText(description, item.description || "");

      body.appendChild(head);
      body.appendChild(description);
      node.appendChild(marker);
      node.appendChild(body);
      rail.appendChild(node);
    });

    shell.appendChild(rail);
    container.appendChild(shell);
  };

  const renderCaseStudy = () => {
    const container = document.querySelector('[data-render="case-study"]');
    const item = data.caseStudy || null;
    if (!container || !item) return;

    clearElement(container);
    const linkedProject = (data.projects?.list || []).find((project) => project.name === item.project);

    const card = createElement("article", "case-study-shell");
    card.classList.add("motion-reveal", "motion-reveal-pop");

    const hero = createElement("div", "case-study-hero");
    const intro = createElement("div", "case-study-intro");
    const eyebrow = createElement("p", "case-study-eyebrow");
    setText(eyebrow, `${item.type || "Case Study"} - ${item.status || ""}`);

    const title = createElement("h4", "case-study-title");
    setText(title, item.project || "");

    const summary = createElement("p", "case-study-summary");
    setText(summary, item.summaryText || "");

    const facts = createElement("div", "case-study-facts");
    [
      { label: t("caseStudy.factRole") || "Role", value: item.role },
      { label: t("caseStudy.factScope") || "Scope", value: item.ownership },
      { label: t("caseStudy.factStage") || "Stage", value: item.status },
    ].forEach((entry) => {
      if (!entry.value) return;
      const fact = createElement("div", "case-study-fact");
      const label = createElement("span");
      setText(label, entry.label);
      const value = createElement("strong");
      setText(value, entry.value);
      fact.appendChild(label);
      fact.appendChild(value);
      facts.appendChild(fact);
    });

    const actions = createElement("div", "case-study-actions");
    const primary = createElement("a", "case-study-link");
    primary.setAttribute("href", sanitizeHref(item.repoUrl || "#"));
    primary.setAttribute("target", "_blank");
    primary.setAttribute("rel", "noopener noreferrer");
    setText(primary, item.primaryLabel || t("actions.repository") || "Repository");

    const secondary = createElement("a", "case-study-link case-study-link-secondary");
    secondary.setAttribute("href", sanitizeHref(item.secondaryHref || "#"));
    setText(secondary, item.secondaryLabel || "See More");

    actions.appendChild(primary);
    actions.appendChild(secondary);

    intro.appendChild(eyebrow);
    intro.appendChild(title);
    intro.appendChild(summary);
    intro.appendChild(facts);
    intro.appendChild(actions);

    const visual = createElement("div", "case-study-visual");
    const visualFrame = createElement("div", "case-study-screen");
    visualFrame.dataset.projectTitle = item.project || "Case Study";
    visualFrame.dataset.projectMeta = item.status || item.type || t("caseStudy.featuredFallback") || "Featured Project";
    if (linkedProject?.previewImage) {
      const media = createElement("img", "case-study-image");
      const mediaSrc = sanitizeImageSrc(linkedProject.previewImage);
      const applyCaseStudyFallback = () => {
        visualFrame.classList.add("is-media-fallback");
        media.classList.add("is-hidden");
      };
      media.src = mediaSrc;
      media.alt = linkedProject.previewAlt || `${item.project} preview`;
      media.loading = "lazy";
      media.decoding = "async";
      media.addEventListener("error", applyCaseStudyFallback, { once: true });
      media.addEventListener("load", () => visualFrame.classList.remove("is-media-fallback"), { once: true });
      visualFrame.appendChild(media);
    } else {
      visualFrame.classList.add("is-media-fallback");
    }

    const visualBadge = createElement("div", "case-study-visual-meta");
    const visualType = createElement("span");
    setText(visualType, item.type || t("caseStudy.featuredFallback") || "Featured Project");
    const visualStatus = createElement("strong");
    setText(visualStatus, item.status || "");
    visualBadge.appendChild(visualType);
    visualBadge.appendChild(visualStatus);
    visualFrame.appendChild(visualBadge);
    visual.appendChild(visualFrame);

    hero.appendChild(intro);
    hero.appendChild(visual);

    const stack = createElement("div", "case-study-stack-strip");
    const stackLabel = createElement("span", "case-study-stack-label");
    setText(stackLabel, t("caseStudy.stackLabel") || "Main stack");
    const stackRow = createElement("div", "case-study-stack-row");
    (item.stack || []).forEach((tech) => stackRow.appendChild(createTechToken(tech, "stack-inline-item")));
    stack.appendChild(stackLabel);
    stack.appendChild(stackRow);

    const insightGrid = createElement("div", "case-study-story-grid");
    [
      { title: t("caseStudy.problem") || "Problem", text: item.problem },
      { title: t("caseStudy.goal") || "Goal", text: item.goal },
      { title: t("caseStudy.currentState") || "Current State", text: item.currentState },
      { title: t("caseStudy.importance") || "Why It Matters", text: item.importance },
    ].forEach((panel) => {
      const box = createElement("article", "case-study-story-item");
      const boxTitle = createElement("h5");
      setText(boxTitle, panel.title);
      const boxText = createElement("p");
      setText(boxText, panel.text || "");
      box.appendChild(boxTitle);
      box.appendChild(boxText);
      insightGrid.appendChild(box);
    });

    const bottom = createElement("div", "case-study-bottom");
    const highlights = createElement("div", "case-study-highlights");
    const highlightsTitle = createElement("h5");
    setText(highlightsTitle, t("caseStudy.implemented") || "Implemented So Far");
    const list = createElement("ul", "case-study-list");
    (item.highlights || []).forEach((highlight) => {
      const li = createElement("li");
      setText(li, highlight);
      list.appendChild(li);
    });
    highlights.appendChild(highlightsTitle);
    highlights.appendChild(list);

    const metrics = createElement("div", "case-study-metrics-rail");
    (item.metrics || []).forEach((metric) => {
      const chip = createElement("article", "case-study-metric-item");
      const value = createElement("strong");
      setText(value, metric.value || "");
      const label = createElement("span");
      setText(label, metric.label || "");
      chip.appendChild(value);
      chip.appendChild(label);
      metrics.appendChild(chip);
    });

    bottom.appendChild(highlights);
    bottom.appendChild(metrics);

    card.appendChild(hero);
    card.appendChild(stack);
    card.appendChild(insightGrid);
    card.appendChild(bottom);
    container.appendChild(card);
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
    const skills = data.skills || null;
    if (!container || !skills) return;

    clearElement(container);
    const layout = createElement("div", "skills-shell");

    const spotlight = createElement("article", "skills-intro-panel");
    spotlight.classList.add("motion-reveal", "motion-reveal-pop");

    const spotlightHead = createElement("div", "skills-intro-head");
    const spotlightEyebrow = createElement("span", "skills-intro-eyebrow");
    setText(spotlightEyebrow, t("skills.capabilityMap") || "Capability Map");
    const spotlightCount = createElement("strong", "skills-intro-count");
    setText(spotlightCount, `${(skills.domains || []).length} ${t("skills.domainsLabel") || "domains"}`);
    spotlightHead.appendChild(spotlightEyebrow);
    spotlightHead.appendChild(spotlightCount);

    const spotlightTitle = createElement("h4", "skills-intro-title");
    setText(spotlightTitle, t("skills.spotlightTitle") || "Front-end depth with practical full-stack range.");

    const spotlightDescription = createElement("p", "skills-intro-description");
    setText(
      spotlightDescription,
      t("skills.spotlightDescription") ||
        "The stack is organized by real delivery areas, not by disconnected logo lists. The focus is interface quality, integration flow, maintainability, and collaboration."
    );

    const spotlightMetrics = createElement("div", "skills-intro-metrics");
    [
      { value: String((skills.strongest || []).length), label: t("skills.metricStrongest") || "strongest tools" },
      { value: String((skills.comfortable || []).length), label: t("skills.metricComfortable") || "comfortable range" },
      { value: String((skills.tools || []).length), label: t("skills.metricTools") || "workflow tools" },
    ].forEach((metric) => {
      const chip = createElement("article", "skills-intro-metric");
      const value = createElement("strong");
      setText(value, metric.value);
      const label = createElement("span");
      setText(label, metric.label);
      chip.appendChild(value);
      chip.appendChild(label);
      spotlightMetrics.appendChild(chip);
    });

    const strongestRow = createElement("div", "skills-stream");
    const strongestLabel = createElement("span", "skills-stream-label");
    setText(strongestLabel, t("skills.coreStack") || "Core stack");
    const strongestTokens = createElement("div", "skills-stream-list");
    (skills.strongest || []).forEach((item) => strongestTokens.appendChild(createTechToken(item, "skill-inline-item")));
    strongestRow.appendChild(strongestLabel);
    strongestRow.appendChild(strongestTokens);

    const learningRow = createElement("div", "skills-stream");
    const learningLabel = createElement("span", "skills-stream-label");
    setText(learningLabel, t("skills.currentlyExpanding") || "Currently expanding");
    const learningTokens = createElement("div", "skills-stream-list");
    (skills.learning || []).forEach((item) => learningTokens.appendChild(createTechToken(item, "skill-inline-item")));
    learningRow.appendChild(learningLabel);
    learningRow.appendChild(learningTokens);

    spotlight.appendChild(spotlightHead);
    spotlight.appendChild(spotlightTitle);
    spotlight.appendChild(spotlightDescription);
    spotlight.appendChild(spotlightMetrics);
    spotlight.appendChild(strongestRow);
    spotlight.appendChild(learningRow);

    const domainsGrid = createElement("div", "skills-domain-list");
    (skills.domains || []).forEach((domain, index) => {
      const card = createElement("article", "skills-domain-row");
      card.classList.add("motion-reveal", "motion-reveal-soft");
      card.style.setProperty("--reveal-delay", `${index * 55}ms`);

      const indexNode = createElement("span", "skills-domain-index");
      setText(indexNode, String(index + 1).padStart(2, "0"));

      const copy = createElement("div", "skills-domain-copy");
      const title = createElement("h4");
      setText(title, domain.title || "");
      const description = createElement("p");
      setText(description, domain.description || "");
      const related = createElement("p", "skills-domain-related");
      setText(related, (domain.related || []).join(", "));
      copy.appendChild(title);
      copy.appendChild(description);
      copy.appendChild(related);

      const iconWrap = createElement("span", "skills-domain-icon");
      iconWrap.appendChild(createIcon(domain.icon, "sparkles"));

      card.appendChild(indexNode);
      card.appendChild(copy);
      card.appendChild(iconWrap);
      domainsGrid.appendChild(card);
    });

    const capabilityGrid = createElement("div", "skills-ledger");
    [
      {
        title: t("skills.groupStrongest") || "Strongest",
        description: t("skills.groupStrongestDescription") || "Technologies and areas where I currently deliver with the most confidence.",
        items: skills.strongest || [],
      },
      {
        title: t("skills.groupComfortable") || "Comfortable",
        description: t("skills.groupComfortableDescription") || "Technologies I use well and can integrate into real project delivery.",
        items: skills.comfortable || [],
      },
      {
        title: t("skills.groupLearning") || "Currently Learning",
        description: t("skills.groupLearningDescription") || "Areas I am actively improving to expand system quality and delivery depth.",
        items: skills.learning || [],
      },
      {
        title: t("skills.groupTools") || "Workflow Tools",
        description: t("skills.groupToolsDescription") || "Tools and practices that shape my day-to-day implementation and collaboration flow.",
        items: skills.tools || [],
      },
    ].forEach((group, index) => {
      const card = createElement("article", "skills-ledger-row");
      card.classList.add("motion-reveal", "motion-reveal-soft");
      card.style.setProperty("--reveal-delay", `${index * 45}ms`);

      const copy = createElement("div", "skills-ledger-copy");
      const title = createElement("h4");
      setText(title, group.title);
      const description = createElement("p");
      setText(description, group.description);
      copy.appendChild(title);
      copy.appendChild(description);

      const row = createElement("div", "skills-stream-list");
      group.items.forEach((item) => row.appendChild(createTechToken(item, "skill-inline-item")));

      card.appendChild(copy);
      card.appendChild(row);
      capabilityGrid.appendChild(card);
    });

    layout.appendChild(spotlight);
    layout.appendChild(domainsGrid);
    layout.appendChild(capabilityGrid);
    container.appendChild(layout);
  };

  const renderFaq = () => {
    const container = document.querySelector('[data-render="faq"]');
    const items = data.faq?.list || [];
    if (!container || !Array.isArray(items)) return;

    clearElement(container);
    const shell = createElement("div", "faq-shell");
    const intro = createElement("article", "faq-intro");
    const sidebarEyebrow = createElement("span", "faq-intro-eyebrow");
    setText(sidebarEyebrow, t("faq.eyebrow") || "Working Style");
    const sidebarTitle = createElement("h4", "faq-intro-title");
    setText(sidebarTitle, t("faq.title") || "Answers around scope, delivery rhythm, and collaboration.");
    const sidebarText = createElement("p", "faq-intro-text");
    setText(
      sidebarText,
      t("faq.text") ||
        "These are the points that usually matter most before starting a project or moving forward in a hiring process."
    );
    const sidebarMeta = createElement("div", "faq-intro-meta");
    [data.finalCta?.availability, data.finalCta?.workModel, data.finalCta?.region]
      .filter(Boolean)
      .forEach((value) => {
        const chip = createElement("span");
        setText(chip, value);
        sidebarMeta.appendChild(chip);
      });
    intro.appendChild(sidebarEyebrow);
    intro.appendChild(sidebarTitle);
    intro.appendChild(sidebarText);
    intro.appendChild(sidebarMeta);

    const list = createElement("div", "faq-list");

    const setFaqState = (faq, shouldOpen) => {
      const trigger = faq.querySelector(".faq-question");
      const answer = faq.querySelector(".faq-answer");
      if (!(trigger instanceof HTMLElement) || !(answer instanceof HTMLElement)) return;

      if (shouldOpen) {
        faq.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        answer.hidden = false;
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        answer.style.opacity = "1";
        return;
      }

      trigger.setAttribute("aria-expanded", "false");
      answer.style.maxHeight = `${answer.scrollHeight}px`;
      window.requestAnimationFrame(() => {
        faq.classList.remove("is-open");
        answer.style.maxHeight = "0px";
        answer.style.opacity = "0";
      });
    };

    items.forEach((item, index) => {
      const faq = createElement("article", "faq-item");
      faq.classList.add("motion-reveal", "motion-reveal-soft");
      faq.style.setProperty("--reveal-delay", `${index * 45}ms`);

      const summary = createElement("button", "faq-question");
      summary.setAttribute("type", "button");
      summary.setAttribute("aria-expanded", "false");

      const question = createElement("span");
      setText(question, item.question || "");
      const icon = createIcon("add", "add");
      summary.appendChild(question);
      summary.appendChild(icon);

      const answer = createElement("div", "faq-answer");
      answer.hidden = true;
      answer.style.maxHeight = "0px";
      answer.style.opacity = "0";

      const answerInner = createElement("div", "faq-answer-inner");
      const paragraph = createElement("p");
      setText(paragraph, item.answer || "");
      answerInner.appendChild(paragraph);
      answer.appendChild(answerInner);

      summary.addEventListener("click", () => {
        const shouldOpen = !faq.classList.contains("is-open");
        Array.from(list.querySelectorAll(".faq-item")).forEach((other) => {
          if (other === faq) return;
          setFaqState(other, false);
        });
        setFaqState(faq, shouldOpen);
      });

      answer.addEventListener("transitionend", (event) => {
        if (event.propertyName !== "max-height") return;
        if (faq.classList.contains("is-open")) {
          answer.style.maxHeight = `${answer.scrollHeight}px`;
          return;
        }
        answer.hidden = true;
      });

      faq.appendChild(summary);
      faq.appendChild(answer);
      list.appendChild(faq);

      if (index === 0) {
        window.requestAnimationFrame(() => {
          setFaqState(faq, true);
        });
      }
    });

    shell.appendChild(intro);
    shell.appendChild(list);
    container.appendChild(shell);
  };

  const renderFinalCta = () => {
    const container = document.querySelector('[data-render="final-cta"]');
    const item = data.finalCta || null;
    if (!container || !item) return;

    clearElement(container);

    const createCtaAction = ({ href, className, label }) => {
      const link = createElement("a", className);
      link.setAttribute("href", sanitizeHref(href || "#"));
      const textWrap = createElement("span", "final-cta-action-label");
      setText(textWrap, label);

      const arrowWrap = createElement("span", "final-cta-action-arrow");
      arrowWrap.appendChild(createIcon("arrow-forward", "arrow-forward"));

      link.appendChild(textWrap);
      link.appendChild(arrowWrap);
      return link;
    };

    const card = createElement("article", "final-cta-shell");
    card.classList.add("motion-reveal", "motion-reveal-pop");

    const copy = createElement("div", "final-cta-copy");
    const eyebrow = createElement("span", "final-cta-eyebrow");
    setText(eyebrow, t("finalCta.nextStep") || "Next Step");

    const title = createElement("h3");
    setText(title, item.title || "");

    const statusLine = createElement("p", "final-cta-status-line");
    setText(
      statusLine,
      [item.availability, item.workModel, item.region].filter(Boolean).join(" • ")
    );

    const actions = createElement("div", "final-cta-actions");
    const primary = createCtaAction({
      href: item.primaryHref || "#contact",
      className: "final-cta-action final-cta-action-primary",
      label: item.primaryLabel || "Get In Touch",
    });
    const secondary = createCtaAction({
      href: item.secondaryHref || "#projects",
      className: "final-cta-action final-cta-action-secondary",
      label: item.secondaryLabel || t("actions.viewProjects") || "View Projects",
    });
    actions.appendChild(primary);
    actions.appendChild(secondary);

    copy.appendChild(eyebrow);
    copy.appendChild(title);
    copy.appendChild(statusLine);
    copy.appendChild(actions);

    const board = createElement("aside", "final-cta-board");
    const boardEyebrow = createElement("span", "final-cta-board-eyebrow");
    setText(boardEyebrow, t("finalCta.snapshot") || "Portfolio Snapshot");

    const metrics = createElement("div", "final-cta-metrics-rail");
    (item.metrics || []).forEach((metric) => {
      const stat = createElement("article", "final-cta-metric-row");
      const value = createElement("strong");
      setText(value, metric.value || "");
      const label = createElement("span");
      setText(label, metric.label || "");
      stat.appendChild(value);
      stat.appendChild(label);
      metrics.appendChild(stat);
    });

    const boardFoot = createElement("div", "final-cta-board-focus");
    const boardFocusLabel = createElement("span", "final-cta-board-focus-label");
    setText(boardFocusLabel, t("finalCta.primaryFocus") || "Primary focus");
    const boardFocusValue = createElement("strong", "final-cta-board-focus-value");
    setText(boardFocusValue, item.focus || "");
    boardFoot.appendChild(boardFocusLabel);
    boardFoot.appendChild(boardFocusValue);

    board.appendChild(boardEyebrow);
    board.appendChild(metrics);
    board.appendChild(boardFoot);

    card.appendChild(copy);
    card.appendChild(board);
    container.appendChild(card);
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
  renderCaseStudy();
  renderServices();
  renderWorkflow();
  renderCertifications();
  renderSkills();
  renderFaq();
  renderLanguages();
  renderFinalCta();

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
      document.querySelector(".hero-title"),
      document.querySelector(".hero-copy p"),
      ...document.querySelectorAll(".insight-chip"),
    ],
    { variant: "motion-reveal-soft", baseDelay: 40, step: 75 }
  );

  const heroTypeNode = document.querySelector('[data-render="hero-type"]');
  const heroRoleWords = Array.isArray(data.profile?.heroRoles) ? data.profile.heroRoles.filter((item) => typeof item === "string" && item.trim().length > 0) : [];

  if (heroTypeNode && heroRoleWords.length > 0) {
    const heroTypeWrap = heroTypeNode.parentElement;
    let wordIndex = 0;
    let charIndex = heroRoleWords[0].length;
    let deleting = false;

    const syncHeroTypeWidth = () => {
      if (!heroTypeWrap) return;

      const computed = window.getComputedStyle(heroTypeNode);
      const measure = document.createElement("span");
      measure.style.position = "absolute";
      measure.style.visibility = "hidden";
      measure.style.pointerEvents = "none";
      measure.style.whiteSpace = "nowrap";
      measure.style.fontFamily = computed.fontFamily;
      measure.style.fontSize = computed.fontSize;
      measure.style.fontWeight = computed.fontWeight;
      measure.style.letterSpacing = computed.letterSpacing;
      measure.style.textTransform = computed.textTransform;
      document.body.appendChild(measure);

      const widest = heroRoleWords.reduce((max, word) => {
        measure.textContent = word;
        return Math.max(max, measure.getBoundingClientRect().width);
      }, 0);

      measure.remove();
      heroTypeWrap.style.setProperty("--hero-type-width", `${Math.ceil(widest + 8)}px`);
    };

    const tickHeroType = () => {
      const word = heroRoleWords[wordIndex] || "";
      heroTypeNode.textContent = deleting ? word.slice(0, charIndex) : word.slice(0, charIndex);

      const typingDelay = deleting ? 55 : 95;
      const pauseAtFull = 1200;
      const pauseAtEmpty = 260;

      if (!deleting && charIndex < word.length) {
        charIndex += 1;
        window.setTimeout(tickHeroType, typingDelay);
        return;
      }

      if (!deleting && charIndex >= word.length) {
        deleting = true;
        window.setTimeout(tickHeroType, pauseAtFull);
        return;
      }

      if (deleting && charIndex > 0) {
        charIndex -= 1;
        window.setTimeout(tickHeroType, 48);
        return;
      }

      deleting = false;
      wordIndex = (wordIndex + 1) % heroRoleWords.length;
      charIndex = 0;
      window.setTimeout(tickHeroType, pauseAtEmpty);
    };

    heroTypeNode.textContent = heroRoleWords[0];
    syncHeroTypeWidth();
    window.addEventListener("resize", syncHeroTypeWidth);
    window.setTimeout(() => {
      deleting = true;
      tickHeroType();
    }, 1150);
  }

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
      setText(meta, `${item.type || t("project.itemFallback")} - ${item.ownership || t("project.solo")}`);
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
        stack.appendChild(createProjectTechBadge(tech));
      });

      const actions = createElement("div", "project-actions");
      const repoLink = createProjectActionLink({
        href: item.repoUrl || "#",
        className: "project-link",
        label: t("actions.repository") || "Repository",
        iconName: "logo-github",
      });
      actions.appendChild(repoLink);

      if (item.demoUrl) {
        const demoLink = createProjectActionLink({
          href: item.demoUrl,
          className: "project-link project-link-demo",
          label: t("actions.liveDemo") || "Live Demo",
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
      dot.setAttribute("aria-label", t("project.goTo", { index: index + 1 }) || `Go to project ${index + 1}`);
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
    quickToggle.setAttribute("aria-label", isOpen ? t("quickNav.close") || "Close quick menu" : t("quickNav.open") || "Open quick menu");

    if (toggleIcon) {
      toggleIcon.setAttribute("name", isOpen ? "close" : "grid");
    }
  };

  const closeMenu = () => setOpenState(false);

  setOpenState(false);

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
      const hasMatchingLink = quickLinks.some((link) => (link.getAttribute("href") || "") === `#${id}`);
      if (!hasMatchingLink) return;

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

