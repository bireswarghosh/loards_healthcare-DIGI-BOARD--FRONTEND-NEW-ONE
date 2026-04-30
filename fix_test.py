import re

f = r'c:\Users\LENOVO\Desktop\live  digiboard\digiboard-react-lordshealthcare-main\src\templates\DiagnosisMaster\Test.jsx'
with open(f, 'r', encoding='utf-8') as fh:
    c = fh.read()

# 1. Replace RTE import with DocumentEditor import (active code only - last occurrence)
old_import = "import { RichTextEditorComponent, Toolbar as RteToolbar, Link, Image, HtmlEditor, Table, QuickToolbar, PasteCleanup, FormatPainter, Count } from '@syncfusion/ej2-react-richtexteditor';\r\nimport { Inject as RteInject } from '@syncfusion/ej2-react-richtexteditor';"
new_import = "import { DocumentEditorContainerComponent, Toolbar as DocToolbar } from '@syncfusion/ej2-react-documenteditor';\r\nimport { Inject as DocInject } from '@syncfusion/ej2-react-documenteditor';\r\nimport '@syncfusion/ej2-documenteditor/styles/material.css';"

# Replace only the LAST occurrence (active code)
idx = c.rfind(old_import)
if idx >= 0:
    c = c[:idx] + new_import + c[idx+len(old_import):]
    print(f"1. Import replaced at index {idx}")

# 2. Replace rteRef with docEditorRef (last occurrence)
old_ref = "  const rteRef = useRef(null);"
new_ref = "  const docEditorRef = useRef(null);\r\n  const fileInputRef = useRef(null);\r\n  const docServiceUrl = 'https://services.syncfusion.com/react/production/api/documenteditor/';"
idx = c.rfind(old_ref)
if idx >= 0:
    c = c[:idx] + new_ref + c[idx+len(old_ref):]
    print(f"2. Ref replaced at index {idx}")

# 3. Replace rteToolbarSettings (last occurrence)
old_toolbar = "  const rteToolbarSettings = {"
new_toolbar = "  const _unused_toolbar = {"
idx = c.rfind(old_toolbar)
if idx >= 0:
    c = c[:idx] + new_toolbar + c[idx+len(old_toolbar):]
    print(f"3. Toolbar replaced at index {idx}")

# 4. Add useEffect before handleViewHtml (last occurrence)
old_view = "  const handleViewHtml = async (test) => {"
useeffect_code = """  useEffect(() => {
    if (showHtmlEditor && docEditorRef.current && htmlContent) {
      const editor = docEditorRef.current.documentEditor;
      fetch(docServiceUrl + 'SystemClipboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: htmlContent, type: '.html' }),
      }).then(r => r.json()).then(d => { if (d) editor.open(JSON.stringify(d)); })
        .catch(err => console.error('Error loading HTML:', err));
    }
  }, [showHtmlEditor, htmlContent]);

  const handleViewHtml = async (test) => {"""
idx = c.rfind(old_view)
if idx >= 0:
    c = c[:idx] + useeffect_code + c[idx+len(old_view):]
    print(f"4. useEffect added at index {idx}")

# 5. Replace save logic (last occurrence)
old_save = "      const exportedHtml = rteRef.current ? rteRef.current.value : htmlContent;"
new_save = """      let exportedHtml = htmlContent;
      const editor = docEditorRef.current?.documentEditor;
      if (editor) {
        const sfdtContent = editor.serialize();
        const res = await fetch(docServiceUrl + 'ExportHtml', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: sfdtContent }),
        });
        const data = await res.text();
        if (data) exportedHtml = data;
      }"""
idx = c.rfind(old_save)
if idx >= 0:
    c = c[:idx] + new_save + c[idx+len(old_save):]
    print(f"5. Save logic replaced at index {idx}")

# 6. Replace handlePrint (last occurrence)
old_print = """    const handlePrint = () => {
  if (docEditorRef.current?.documentEditor) {
    docEditorRef.current.documentEditor.print();
    return;
  }
  const printContent = htmlContent;

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid #000;
          }
          th, td {
            padding: 6px;
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};"""
new_print = """    const handlePrint = () => {
  if (docEditorRef.current?.documentEditor) {
    docEditorRef.current.documentEditor.print();
  }
};

  const handleExportDocx = () => {
    if (docEditorRef.current?.documentEditor) {
      docEditorRef.current.documentEditor.save(currentTestForHtml?.Test || 'document', 'Docx');
    }
  };

  const handleImportDocx = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('files', file);
    fetch(docServiceUrl + 'Import', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(d => { if (docEditorRef.current && d) { docEditorRef.current.documentEditor.open(JSON.stringify(d)); toast.success('Imported: ' + file.name); } })
      .catch(() => toast.error('Import failed'));
    e.target.value = '';
  };"""
idx = c.rfind(old_print)
if idx >= 0:
    c = c[:idx] + new_print + c[idx+len(old_print):]
    print(f"6. Print replaced at index {idx}")

# 7. Replace RichTextEditorComponent in modal (last occurrence)
old_editor = """                    <div style={{ height: "100%" }}>
                      <RichTextEditorComponent
                        ref={rteRef}
                        value={htmlContent}
                        change={() => {
                          if (rteRef.current) {
                            setHtmlContent(rteRef.current.value);
                          }
                        }}
                        toolbarSettings={rteToolbarSettings}
                        height="100%"
                        enableResize={false}
                      >
                        <RteInject services={[RteToolbar, Link, Image, HtmlEditor, Table, QuickToolbar, PasteCleanup, FormatPainter, Count]} />
                      </RichTextEditorComponent>
                    </div>"""
new_editor = """                    <DocumentEditorContainerComponent ref={docEditorRef} id="docEditor" height="100%" serviceUrl={docServiceUrl} enableToolbar={true} showPropertiesPane={false}>
                      <DocInject services={[DocToolbar]} />
                    </DocumentEditorContainerComponent>
                    <input type="file" ref={fileInputRef} accept=".doc,.docx" style={{ display: 'none' }} onChange={handleImportDocx} />"""
idx = c.rfind(old_editor)
if idx >= 0:
    c = c[:idx] + new_editor + c[idx+len(old_editor):]
    print(f"7. Editor component replaced at index {idx}")

# 8. Replace footer buttons (last occurrence) - add Import DOCX button
old_reconvert = '                        {loading ? "Converting..." : "Re-convert DOCX"}'
new_reconvert = '                        {loading ? "Converting..." : "Re-convert from R2"}'
idx = c.rfind(old_reconvert)
if idx >= 0:
    c = c[:idx] + new_reconvert + c[idx+len(old_reconvert):]
    print(f"8. Reconvert text replaced at index {idx}")

# 9. Add Import button before Re-convert
old_footer_left = """                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={handleReconvert}
                        disabled={loading}
                        title="Re-download DOCX from R2 and convert again"
                      >
                        <i className="fa-light fa-rotate me-1"></i>
                        {loading ? "Converting..." : "Re-convert from R2"}
                      </button>
                    </div>"""
new_footer_left = """                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-info" onClick={() => fileInputRef.current?.click()} title="Import .doc/.docx from computer">
                        <i className="fa-light fa-file-import me-1"></i>Import DOCX
                      </button>
                      <button className="btn btn-sm btn-warning" onClick={handleReconvert} disabled={loading} title="Re-download DOCX from R2">
                        <i className="fa-light fa-rotate me-1"></i>{loading ? "Converting..." : "Re-convert from R2"}
                      </button>
                    </div>"""
idx = c.rfind(old_footer_left)
if idx >= 0:
    c = c[:idx] + new_footer_left + c[idx+len(old_footer_left):]
    print(f"9. Footer left replaced at index {idx}")

# 10. Replace Save HTML button with Export DOCX + Save to DB
old_save_btn = """                      <button
                        className="btn btn-sm btn-primary"
                        onClick={handleSaveHtmlContent}
                        disabled={loading}
                      >
                        <i className="fa-light fa-save me-1"></i>
                        {loading ? "Saving..." : "Save HTML"}
                      </button>"""
new_save_btn = """                      <button className="btn btn-sm btn-success" onClick={handleExportDocx}>
                        <i className="fa-light fa-file-export me-1"></i>Export DOCX
                      </button>
                      <button className="btn btn-sm btn-primary" onClick={handleSaveHtmlContent} disabled={loading}>
                        <i className="fa-light fa-save me-1"></i>{loading ? "Saving..." : "Save to DB"}
                      </button>"""
idx = c.rfind(old_save_btn)
if idx >= 0:
    c = c[:idx] + new_save_btn + c[idx+len(old_save_btn):]
    print(f"10. Save button replaced at index {idx}")

with open(f, 'w', encoding='utf-8') as fh:
    fh.write(c)

print("\nALL DONE!")
