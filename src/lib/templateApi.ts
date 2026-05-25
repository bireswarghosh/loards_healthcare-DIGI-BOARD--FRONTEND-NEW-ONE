import { config } from "./config";

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
}

export interface TemplateItem {
  id: number;
  title: string;
  description?: string | null;
  categoryId: number | null;
  categoryName?: string | null;
  previewHtml?: string | null;
  fileName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmissionPayload {
  templateId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  documentTitle: string;
  documentHtml: string;
}

export interface SubmissionItem {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string | null;
  templateId: number | null;
  templateTitle?: string | null;
  documentTitle: string;
  createdAt: string;
}

const ADMIN_TOKEN_KEY = 'template-admin-token';

function buildUrl(path: string) {
  const base = config.API_BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request<T>(path: string, init?: RequestInit, requireAdmin = false): Promise<T> {
  const headers = new Headers(init?.headers || {});
  if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (requireAdmin) {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(buildUrl(path), { ...init, headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function fetchCategories() {
  return request<{ categories: Category[] }>(`/categories`);
}

export async function createCategory(payload: { name: string; description?: string }) {
  return request<{ category: Category }>(`/admin/categories`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function fetchTemplates(params?: { search?: string; categoryId?: string | number }) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.categoryId) query.set('categoryId', String(params.categoryId));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<{ templates: TemplateItem[] }>(`/templates${suffix}`);
}

export async function fetchTemplateById(id: number) {
  return request<{ template: TemplateItem & { documentHtml: string } }>(`/templates/${id}`);
}

export async function uploadTemplate(formData: FormData) {
  return request<{ template: TemplateItem }>(`/admin/templates`, {
    method: 'POST',
    body: formData,
  }, true);
}

export async function deleteTemplate(id: number) {
  return request<{ success: boolean }>(`/admin/templates/${id}`, {
    method: 'DELETE',
  }, true);
}

export async function loginAdmin(payload: { email: string; password: string }) {
  return request<{ token: string; admin: { id: number; email: string; name: string } }>(`/admin/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminDashboard() {
  return request<{
    stats: {
      totalTemplates: number;
      totalCategories: number;
      totalSubmissions: number;
    };
    templates: TemplateItem[];
    submissions: SubmissionItem[];
    categories: Category[];
  }>(`/admin/dashboard`, undefined, true);
}

export async function submitDocument(payload: SubmissionPayload | FormData) {
  if (payload instanceof FormData) {
    return request<{ submissionId: number; message: string }>(`/submissions`, {
      method: "POST",
      body: payload,
    });
  }

  return request<{ submissionId: number; message: string }>(`/submissions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSubmissionOpenDocxUrl(id: number | string) {
  return buildUrl(`/submissions/admin/${id}/open-docx`);
}

export function getSubmissionDownloadDocxUrl(id: number | string) {
  return buildUrl(`/submissions/admin/${id}/download-docx`);
}
