export const TEMPLATE_CONTEXT_STORAGE_KEY = "template-context-v1";

export function saveTemplateContext(payload) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(TEMPLATE_CONTEXT_STORAGE_KEY, JSON.stringify(payload));
}

export function loadTemplateContext() {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(TEMPLATE_CONTEXT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearTemplateContext() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(TEMPLATE_CONTEXT_STORAGE_KEY);
}
