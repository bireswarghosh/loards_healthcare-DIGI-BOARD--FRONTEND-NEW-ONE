export const DEFAULT_PAGE_LAYOUT = {
  marginTopMm: 20,
  marginRightMm: 20,
  marginBottomMm: 20,
  marginLeftMm: 20,
  orientation: "portrait",
  size: "A4",
  columns: 1,
  columnGapPx: 24,
};

const STYLE_ID = "editor-page-layout-style";
const ROOT_CLASS = "editor-page-layout-root";
const PAGE_CLASS = "editor-page-layout-page";
const CONTENT_CLASS = "editor-page-layout-content";

function getPageDimensions(size, orientation) {
  let widthMm = 210;
  let heightMm = 297;

  if (size === "Letter") { widthMm = 216; heightMm = 279; }
  else if (size === "Legal") { widthMm = 216; heightMm = 356; }

  if (orientation === "landscape") {
    return { widthMm: heightMm, heightMm: widthMm };
  }
  return { widthMm, heightMm };
}

function ensureStyleTag() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${ROOT_CLASS} { width:100%; min-height:100%; overflow:auto; padding:24px; background:#e8e8e8; box-sizing:border-box; }
    .${PAGE_CLASS} { margin:0 auto; background:#fff; box-shadow:0 0 8px rgba(0,0,0,0.12); position:relative; overflow:hidden; box-sizing:border-box; }
    .${CONTENT_CLASS} { min-height:100%; box-sizing:border-box; white-space:normal; word-break:normal; overflow-wrap:break-word; }
    .${CONTENT_CLASS}.ProseMirror { outline:none !important; max-width:none !important; }
    .${CONTENT_CLASS} table { width:100%; border-collapse:collapse; table-layout:auto; }
    .${CONTENT_CLASS} td, .${CONTENT_CLASS} th { vertical-align:top; white-space:normal; word-break:normal; overflow-wrap:break-word; }
  `;
  document.head.appendChild(style);
}

function getEditorElement() {
  return document.querySelector(".ProseMirror");
}

function getOrCreateRootWrapper(editorEl) {
  const parent = editorEl.parentElement;
  if (!parent) return editorEl;

  if (parent.classList.contains(CONTENT_CLASS)) {
    const maybePage = parent.parentElement;
    const maybeRoot = maybePage?.parentElement;
    if (maybeRoot && maybeRoot.classList.contains(ROOT_CLASS)) return maybeRoot;
  }

  const root = document.createElement("div");
  root.className = ROOT_CLASS;
  const page = document.createElement("div");
  page.className = PAGE_CLASS;
  const content = document.createElement("div");
  content.className = CONTENT_CLASS;

  parent.insertBefore(root, editorEl);
  root.appendChild(page);
  page.appendChild(content);
  content.appendChild(editorEl);
  return root;
}

export function applyEditorPageLayout(settings = {}) {
  const editorEl = getEditorElement();
  if (!editorEl) return;

  ensureStyleTag();
  const finalSettings = { ...DEFAULT_PAGE_LAYOUT, ...settings };
  const root = getOrCreateRootWrapper(editorEl);
  const page = root.querySelector(`.${PAGE_CLASS}`);
  const content = root.querySelector(`.${CONTENT_CLASS}`);
  if (!page || !content) return;

  const dims = getPageDimensions(finalSettings.size, finalSettings.orientation);

  root.style.background = "#e8e8e8";
  root.style.padding = "24px";
  root.style.overflow = "auto";

  page.style.width = `${dims.widthMm}mm`;
  page.style.minHeight = `${dims.heightMm}mm`;
  page.style.height = "auto";

  content.style.padding = `${finalSettings.marginTopMm}mm ${finalSettings.marginRightMm}mm ${finalSettings.marginBottomMm}mm ${finalSettings.marginLeftMm}mm`;
  content.style.columnCount = String(Math.max(1, finalSettings.columns));
  content.style.columnGap = `${Math.max(0, finalSettings.columnGapPx)}px`;

  editorEl.classList.add(CONTENT_CLASS);
  editorEl.style.minHeight = `calc(${dims.heightMm}mm - ${finalSettings.marginTopMm + finalSettings.marginBottomMm}mm)`;
  editorEl.style.width = "100%";
  editorEl.style.maxWidth = "100%";
  editorEl.style.margin = "0";
  editorEl.style.padding = "0";
  editorEl.style.background = "transparent";
  editorEl.style.boxShadow = "none";
  editorEl.style.border = "0";
}

export function resetEditorPageLayout() {
  const editorEl = getEditorElement();
  if (!editorEl) return;
  const content = editorEl.parentElement;
  const page = content?.parentElement;
  const root = page?.parentElement;

  if (
    content?.classList.contains(CONTENT_CLASS) &&
    page?.classList.contains(PAGE_CLASS) &&
    root?.classList.contains(ROOT_CLASS)
  ) {
    const originalParent = root.parentElement;
    if (!originalParent) return;
    originalParent.insertBefore(editorEl, root);
    root.remove();
    editorEl.classList.remove(CONTENT_CLASS);
    editorEl.removeAttribute("style");
  }
}
