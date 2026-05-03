// LRPR · 戀愛實價登錄 · 閱讀器

const chapters = [
  { no: "01", title: "估價：歡迎登入戀愛實價系統", file: "ch01-估價-歡迎登入戀愛實價系統.md" },
  { no: "02", title: "帶看：物件有瑕疵，需配合議價", file: "ch02-帶看-物件有瑕疵-需配合議價.md" },
  { no: "03", title: "斡旋：情緒管理費的通膨", file: "ch03-斡旋-情緒管理費的通膨.md" },
  { no: "04", title: "凶宅：前任折舊與聯徵紀錄", file: "ch04-凶宅-前任折舊與聯徵紀錄.md" },
  { no: "05", title: "預售：無殼蝸牛的空頭支票", file: "ch05-預售-無殼蝸牛的空頭支票.md" },
  { no: "06", title: "聯貸：長輩的頭期款與股東大會", file: "ch06-聯貸-長輩的頭期款與股東大會.md" },
  { no: "07", title: "斷頭：直男狂跌與舔狗泡沫化", file: "ch07-斷頭-直男狂跌與舔狗泡沫化.md" },
  { no: "08", title: "都更：大齡女子的老屋翻新計畫", file: "ch08-都更-大齡女子的老屋翻新計畫.md" },
  { no: "09", title: "實登：條件的透明與靈魂的隱形", file: "ch09-實登-條件的透明與靈魂的隱形.md" },
  { no: "10", title: "法拍：被市場淘汰的次級品", file: "ch10-法拍-被市場淘汰的次級品.md" },
  { no: "11", title: "點交：這不是我要的成家", file: "ch11-點交-這不是我要的成家.md" },
  { no: "12", title: "退訂：毀約的勇氣與真正的入住", file: "ch12-退訂-毀約的勇氣與真正的入住.md" }
];

const state = {
  current: 0,
  fontSize: Number(localStorage.getItem("reader-font-size")) || 19,
  theme: localStorage.getItem("reader-theme") || "day"
};

const toc = document.getElementById("toc");
const reader = document.getElementById("reader");
const sidebar = document.getElementById("sidebar");
const progressBar = document.getElementById("progressBar");
const currentChapterEl = document.getElementById("currentChapter");
const mobileTitle = document.getElementById("mobileTitle");
const wordCount = document.getElementById("wordCount");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function parseTable(lines, start) {
  const rows = [];
  let index = start;

  while (index < lines.length && /^\s*\|.+\|\s*$/.test(lines[index])) {
    rows.push(lines[index]);
    index += 1;
  }

  if (rows.length < 2 || !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(rows[1])) {
    return null;
  }

  const cells = row => row.trim().replace(/^\||\|$/g, "").split("|").map(cell => inlineMarkdown(cell.trim()));
  const head = cells(rows[0]).map(cell => `<th>${cell}</th>`).join("");
  const body = rows.slice(2).map(row => `<tr>${cells(row).map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("");

  return {
    html: `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`,
    next: index
  };
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${paragraph.map(inlineMarkdown).join("<br>")}</p>`);
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const table = parseTable(lines, i);
    if (table) {
      flushParagraph();
      html.push(table.html);
      i = table.next - 1;
      continue;
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      flushParagraph();
      const level = trimmed.match(/^#+/)[0].length;
      const heading = trimmed.replace(/^#{1,3}\s+/, "");
      html.push(`<h${level}>${formatHeading(level, heading)}</h${level}>`);
      continue;
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushParagraph();
      html.push("<hr>");
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      html.push(`<blockquote>${inlineMarkdown(trimmed.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(`<li>${inlineMarkdown(lines[i].trim().replace(/^[-*]\s+/, ""))}</li>`);
        i += 1;
      }
      i -= 1;
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(`<li>${inlineMarkdown(lines[i].trim().replace(/^\d+\.\s+/, ""))}</li>`);
        i += 1;
      }
      i -= 1;
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  return html.join("\n");
}

function formatHeading(level, heading) {
  if (level !== 1) return inlineMarkdown(heading);

  const match = heading.match(/^(第\s*\d+\s*章)(.*)$/);
  if (!match) return inlineMarkdown(heading);

  return `<span class="chapter-mark">${inlineMarkdown(match[1])}</span><span class="chapter-name">${inlineMarkdown(match[2].trim())}</span>`;
}

function parseChapterTitle(title) {
  const idx = title.indexOf("：");
  return idx > 0
    ? { keyword: title.slice(0, idx), subtitle: title.slice(idx + 1) }
    : { keyword: "CH", subtitle: title };
}

function renderToc(filter = "") {
  const keyword = filter.trim().toLowerCase();
  toc.innerHTML = "";

  chapters
    .map((chapter, index) => ({ ...chapter, index }))
    .filter(ch => `${ch.no} ${ch.title}`.toLowerCase().includes(keyword))
    .forEach(ch => {
      const { keyword: kw, subtitle } = parseChapterTitle(ch.title);
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.className = `chapter-link${ch.index === state.current ? " active" : ""}`;
      button.type = "button";
      button.innerHTML =
        `<span class="chapter-kw">${escapeHtml(kw)}</span>` +
        `<div class="chapter-info">` +
          `<span class="chapter-case">CH·${ch.no}</span>` +
          `<span class="chapter-title">${escapeHtml(subtitle)}</span>` +
        `</div>`;
      button.addEventListener("click", () => loadChapter(ch.index));
      item.append(button);
      toc.append(item);
    });
}

async function loadChapter(index, pushHash = true) {
  state.current = Math.max(0, Math.min(chapters.length - 1, index));
  const chapter = chapters[state.current];
  const { keyword } = parseChapterTitle(chapter.title);

  reader.innerHTML = '<p class="empty">正在調閱本筆行情…</p>';
  currentChapterEl.textContent = `LRPR·${chapter.no}  ${keyword}`;
  mobileTitle.textContent = chapter.title;
  wordCount.textContent = "";
  renderToc(document.getElementById("searchInput").value);

  try {
    const response = await fetch(encodeURI(chapter.file));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const markdown = await response.text();
    reader.innerHTML = markdownToHtml(markdown);
    fitChapterTitle();
    wordCount.textContent = `${markdown.replace(/\s/g, "").length.toLocaleString()} 字`;
    if (pushHash) history.replaceState(null, "", `#${chapter.no}`);
    localStorage.setItem("reader-current", String(state.current));
    window.scrollTo({ top: 0, behavior: "smooth" });
    reader.focus({ preventScroll: true });
  } catch {
    reader.innerHTML = `<p class="empty">讀取失敗：${escapeHtml(chapter.file)}。請確認檔案已和 index.html 放在同一層。</p>`;
  }

  prevButton.disabled = state.current === 0;
  nextButton.disabled = state.current === chapters.length - 1;
  sidebar.classList.remove("open");
}

function fitChapterTitle() {
  const title = reader.querySelector("h1");
  if (!title) return;

  title.style.fontSize = "";
  const maxSize = Number.parseFloat(getComputedStyle(title).fontSize);
  let size = maxSize;

  while (title.scrollWidth > title.clientWidth && size > 20) {
    size -= 1;
    title.style.fontSize = `${size}px`;
  }
}

function applySettings() {
  document.documentElement.style.setProperty("--reader-size", `${state.fontSize}px`);
  document.documentElement.dataset.theme = state.theme === "night" ? "night" : "day";
  localStorage.setItem("reader-font-size", String(state.fontSize));
  localStorage.setItem("reader-theme", state.theme);
}

function updateProgress() {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const ratio = height > 0 ? Math.min(100, Math.max(0, scrollTop / height * 100)) : 0;
  progressBar.style.width = `${ratio}%`;
}

function toggleTheme() {
  state.theme = state.theme === "night" ? "day" : "night";
  applySettings();
}

document.getElementById("smallerButton").addEventListener("click", () => {
  state.fontSize = Math.max(16, state.fontSize - 1);
  applySettings();
});

document.getElementById("largerButton").addEventListener("click", () => {
  state.fontSize = Math.min(26, state.fontSize + 1);
  applySettings();
});

document.getElementById("themeButton").addEventListener("click", toggleTheme);
document.getElementById("themeMobileButton").addEventListener("click", toggleTheme);
document.getElementById("menuButton").addEventListener("click", () => sidebar.classList.toggle("open"));
document.getElementById("searchInput").addEventListener("input", event => renderToc(event.target.value));
prevButton.addEventListener("click", () => loadChapter(state.current - 1));
nextButton.addEventListener("click", () => loadChapter(state.current + 1));
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", fitChapterTitle);
window.addEventListener("hashchange", () => {
  const target = location.hash.replace("#", "");
  const index = chapters.findIndex(ch => ch.no === target);
  if (index >= 0) loadChapter(index, false);
});

applySettings();
renderToc();

const hashIndex = chapters.findIndex(ch => ch.no === location.hash.replace("#", ""));
const savedIndex = Number(localStorage.getItem("reader-current"));
const initialIndex = Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < chapters.length ? savedIndex : 0;
loadChapter(hashIndex >= 0 ? hashIndex : initialIndex, false);
