const gallery = document.getElementById("gallery");

load();

async function load() {
  try {
    const indexResponse = await fetch("../data/shared/index.json", { cache: "no-store" });
    const indexData = await indexResponse.json();
    const files = Array.isArray(indexData.items) ? indexData.items : [];

    const requests = files.map((fileName) =>
      fetch(`../data/shared/${fileName}`, { cache: "no-store" })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => ({ fileName, data }))
    );

    const settled = await Promise.allSettled(requests);
    const items = [];
    const warnings = [];

    settled.forEach((result, index) => {
      const fileName = files[index];
      if (result.status === "rejected") {
        warnings.push({ fileName, reason: `Could not load file (${result.reason?.message || "unknown error"})` });
        return;
      }

      const { data } = result.value;
      const errors = validateSharedItem(data);
      if (errors.length) {
        warnings.push({ fileName, reason: errors.join("; ") });
        return;
      }

      items.push(data);
    });

    renderList(items, warnings);
  } catch {
    gallery.innerHTML = '<article class="card"><h3>Could not load gallery</h3><p class="muted">Try again after deployment.</p></article>';
  }
}

function renderList(items, warnings = []) {
  if (!items.length && !warnings.length) {
    gallery.innerHTML = '<article class="card"><h3>No shared configs yet</h3><p class="muted">Open a PR to add one.</p></article>';
    return;
  }

  gallery.innerHTML = "";
  warnings.forEach((warning) => {
    const card = document.createElement("article");
    card.className = "card card-warning";
    card.innerHTML = `
      <h3>Invalid shared entry</h3>
      <p><strong>File:</strong> <code>${escapeHtml(warning.fileName)}</code></p>
      <p class="muted">${escapeHtml(warning.reason)}</p>
    `;
    gallery.append(card);
  });

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    const tags = Array.isArray(item.tags)
      ? item.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")
      : "";

    card.innerHTML = `
      <h3>${escapeHtml(item.title || "Untitled")}</h3>
      <p class="muted">${escapeHtml(item.description || "")}</p>
      <p><strong>Type:</strong> ${escapeHtml(item.timerType || "unknown")}</p>
      <p><strong>By:</strong> ${escapeHtml(item.author || "anonymous")}</p>
      <div class="tag-row">${tags}</div>
      <div class="actions" style="margin-top:0.75rem;">
        <a href="${escapeAttr(item.url || "#")}" target="_blank" rel="noopener">Open Timer URL</a>
      </div>
    `;

    gallery.append(card);
  });
}

function validateSharedItem(item) {
  const errors = [];
  if (!item || typeof item !== "object") {
    return ["Entry is not an object"];
  }

  if (!isNonEmptyString(item.id)) {
    errors.push("Missing id");
  }
  if (!isNonEmptyString(item.title)) {
    errors.push("Missing title");
  }
  if (!isNonEmptyString(item.author)) {
    errors.push("Missing author");
  }
  if (!isNonEmptyString(item.description)) {
    errors.push("Missing description");
  }
  if (!isNonEmptyString(item.url)) {
    errors.push("Missing url");
  } else if (!isValidTimerUrl(item.url)) {
    errors.push("url must point to timers/*.html");
  }

  const timerType = String(item.timerType || "").trim();
  if (!["countdown", "stopwatch", "countup", "interval"].includes(timerType)) {
    errors.push("Invalid timerType");
  }

  if (!Array.isArray(item.tags)) {
    errors.push("tags must be an array");
  }

  return errors;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTimerUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) {
    return false;
  }

  const directRelative = /^\.\.\/timers\/[a-z0-9-]+\.html(\?.*)?$/i.test(value) || /^timers\/[a-z0-9-]+\.html(\?.*)?$/i.test(value);
  if (directRelative) {
    return true;
  }

  try {
    const parsed = value.startsWith("http://") || value.startsWith("https://") ? new URL(value) : new URL(value, window.location.origin);
    return /\/timers\/[a-z0-9-]+\.html$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

function escapeHtml(input) {
  return String(input || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(input) {
  return escapeHtml(input).replaceAll("`", "&#96;");
}
