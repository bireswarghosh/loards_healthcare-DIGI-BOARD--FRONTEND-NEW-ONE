import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus2, FileUp, Clock3, FileText, Search } from "lucide-react";
import {
  DEFAULT_DOCUMENT_TITLE,
  loadDraftFromStorage,
} from "@/components/editor-v2/utils";
import {
  fetchCategories,
  fetchTemplateById,
  fetchTemplates,
  type Category,
  type TemplateItem,
} from "@/lib/templateApi";
import { saveTemplateContext } from "@/components/editor-v2/submissionStorage";

const staticTemplates = [
  {
    id: "blank",
    title: "Blank document",
    description: "Start from an empty page with Word-style layout.",
  },
];

const templateHtml: Record<string, string> = {
  blank: "<p></p>",
};

const PENDING_DOCX_KEY = "word_exact_pending_docx_v1";
const PENDING_HTML_KEY = "word_exact_pending_html_v1";

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(reader.error || new Error("File read failed"));
    reader.readAsDataURL(file);
  });

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [error, setError] = useState("");
  const draft = useMemo(() => loadDraftFromStorage(), []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoryRes, templateRes] = await Promise.all([
        fetchCategories(),
        fetchTemplates({ search, categoryId: activeCategory }),
      ]);
      setCategories(categoryRes.categories);
      setTemplates(templateRes.templates);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Templates load nahi ho paaye",
      );
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openEditor = useCallback(
    (title?: string, html?: string, templateId: number | null = null) => {
      if (html) {
        localStorage.setItem(
          PENDING_HTML_KEY,
          JSON.stringify({
            title: title || DEFAULT_DOCUMENT_TITLE,
            html,
          }),
        );
      } else {
        localStorage.setItem(
          PENDING_HTML_KEY,
          JSON.stringify({
            title: title || DEFAULT_DOCUMENT_TITLE,
            html: templateHtml.blank,
          }),
        );
      }

      saveTemplateContext({
        templateId,
        templateTitle: title || DEFAULT_DOCUMENT_TITLE,
      });
      navigate("/word-editor-v2");
    },
    [navigate],
  );

  const openTemplateFromApi = useCallback(
    async (templateId: number) => {
      try {
        const response = await fetchTemplateById(templateId);
        openEditor(
          response.template.title,
          response.template.documentHtml,
          response.template.id,
        );
      } catch (err) {
        alert(
          err instanceof Error ? err.message : "Template open nahi ho paaya.",
        );
      }
    },
    [openEditor],
  );

  const handleImportDocx = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const dataUrl = await fileToDataUrl(file);
        localStorage.setItem(
          PENDING_DOCX_KEY,
          JSON.stringify({
            title: file.name,
            dataUrl,
            mimeType:
              file.type ||
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          }),
        );
        saveTemplateContext({
          templateId: null,
          templateTitle:
            file.name.replace(/\.docx$/i, "") || DEFAULT_DOCUMENT_TITLE,
        });
        navigate("/word-editor-v2");
      } catch (error) {
        console.error("DOCX import failed", error);
        alert("DOCX file open nahi ho paayi. Dusri file try karo.");
      } finally {
        setIsImporting(false);
        e.target.value = "";
      }
    },
    [navigate],
  );

  const combinedTemplates = [...staticTemplates, ...templates];

  return (
    // <div className="min-h-screen bg-[#F5F7FB] text-[#1F2937]">
    <div className="h-screen overflow-y-auto bg-[#F5F7FB] text-[#1F2937]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#185ABD] to-[#2A74E6] px-8 py-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.18em] text-white/75">
            T60 Workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Gallery</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/85">
            Yahan se blank document, admin uploaded template, ya DOCX file khol
            sakte ho.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() =>
                openEditor(DEFAULT_DOCUMENT_TITLE, templateHtml.blank)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#185ABD] shadow-sm hover:bg-blue-50"
            >
              <FilePlus2 size={16} /> New document
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              <FileUp size={16} /> Open DOCX
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={handleImportDocx}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <FileText size={18} /> Start with a template
            </div>
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search template"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-[#185ABD]"
                  />
                </div>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#185ABD]"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCategory("")}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${activeCategory === "" ? "bg-[#185ABD] text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(String(category.id))}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${activeCategory === String(category.id) ? "bg-[#185ABD] text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {loading ? (
              <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
                Templates loading...
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {combinedTemplates.map((template) => {
                  const isStatic = typeof template.id === "string";
                  return (
                    <button
                      key={template.id}
                      onClick={() =>
                        isStatic
                          ? openEditor(
                              template.title,
                              templateHtml[String(template.id)],
                            )
                          : openTemplateFromApi(Number(template.id))
                      }
                      className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="mb-4 h-40 rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                        <div className="mx-auto h-full w-[72%] rounded-md border border-slate-200 bg-white p-3 shadow-sm overflow-hidden">
                          <div className="mb-2 h-2 w-2/3 rounded bg-slate-300" />
                          <div className="mb-1 h-1.5 w-full rounded bg-slate-200" />
                          <div className="mb-1 h-1.5 w-5/6 rounded bg-slate-200" />
                          <div className="mb-3 h-1.5 w-4/6 rounded bg-slate-200" />
                          <div className="grid grid-cols-2 gap-1">
                            <div className="h-10 rounded bg-slate-100" />
                            <div className="h-10 rounded bg-slate-100" />
                          </div>
                        </div>
                      </div>
                      <div className="font-medium text-slate-900 group-hover:text-[#185ABD]">
                        {template.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {template.description || "Template ready to edit"}
                      </div>
                      {!isStatic && (
                        <div className="mt-2 text-xs text-slate-400">
                          {template.categoryName || "Uncategorized"}
                        </div>
                      )}
                    </button>
                  );
                })}
                {!combinedTemplates.length && (
                  <div className="text-sm text-slate-500">
                    Koi template nahi mila.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Clock3 size={18} /> Recent draft
              </div>
              {draft ? (
                <>
                  <div className="text-sm font-medium text-slate-900">
                    {draft.title || DEFAULT_DOCUMENT_TITLE}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Last saved: {new Date(draft.savedAt).toLocaleString()}
                  </div>
                  <button
                    onClick={() => navigate("/word-editor-v2")}
                    className="mt-4 rounded-xl bg-[#185ABD] px-4 py-2 text-sm font-medium text-white hover:bg-[#144c9d]"
                  >
                    Continue editing
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Abhi koi saved draft nahi mila.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-lg font-semibold">Quick actions</div>
              <div className="mt-4 grid gap-3">
                <button
                  onClick={() =>
                    openEditor(DEFAULT_DOCUMENT_TITLE, templateHtml.blank)
                  }
                  className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm hover:border-blue-300 hover:bg-blue-50"
                >
                  Blank page kholna
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm hover:border-blue-300 hover:bg-blue-50"
                  disabled={isImporting}
                >
                  {isImporting
                    ? "DOCX import ho rahi hai..."
                    : "Apni DOCX file import karna"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
