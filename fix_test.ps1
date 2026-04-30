$f = 'c:\Users\LENOVO\Desktop\live  digiboard\digiboard-react-lordshealthcare-main\src\templates\DiagnosisMaster\Test.jsx'
$c = [System.IO.File]::ReadAllText($f)

# 1. Replace RTE import with DocumentEditor import
$old1 = "import { RichTextEditorComponent, Toolbar as RteToolbar, Link, Image, HtmlEditor, Table, QuickToolbar, PasteCleanup, FormatPainter, Count } from '@syncfusion/ej2-react-richtexteditor';" + "`r`n" + "import { Inject as RteInject } from '@syncfusion/ej2-react-richtexteditor';"
$new1 = "import { DocumentEditorContainerComponent, Toolbar as DocToolbar } from '@syncfusion/ej2-react-documenteditor';" + "`r`n" + "import { Inject as DocInject } from '@syncfusion/ej2-react-documenteditor';" + "`r`n" + "import '@syncfusion/ej2-documenteditor/styles/material.css';"
$c = $c.Replace($old1, $new1)

# 2. Replace rteRef with docEditorRef
$c = $c.Replace("  const rteRef = useRef(null);", "  const docEditorRef = useRef(null);`r`n  const fileInputRef = useRef(null);`r`n  const docServiceUrl = 'https://services.syncfusion.com/react/production/api/documenteditor/';")

# 3. Replace rteToolbarSettings
$c = $c.Replace("  const rteToolbarSettings = {", "  const _unused = {")

# 4. Replace save logic
$c = $c.Replace("      const exportedHtml = rteRef.current ? rteRef.current.value : htmlContent;", "      let exportedHtml = htmlContent;`r`n      const editor = docEditorRef.current?.documentEditor;`r`n      if (editor) { const sfdtContent = editor.serialize(); const res = await fetch(docServiceUrl + 'ExportHtml', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: sfdtContent }) }); const data = await res.text(); if (data) exportedHtml = data; }")

# 5. Add useEffect before handleViewHtml
$c = $c.Replace("  const handleViewHtml = async (test) => {", "  useEffect(() => { if (showHtmlEditor && docEditorRef.current && htmlContent) { const editor = docEditorRef.current.documentEditor; fetch(docServiceUrl + 'SystemClipboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: htmlContent, type: '.html' }) }).then(r => r.json()).then(d => { if (d) editor.open(JSON.stringify(d)); }).catch(err => console.error('Error loading HTML:', err)); } }, [showHtmlEditor, htmlContent]);`r`n`r`n  const handleViewHtml = async (test) => {")

# 6. Replace RichTextEditorComponent with DocumentEditorContainerComponent in modal
$oldEditor = @"
                    <div style={{ height: "100%" }}>
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
                    </div>
"@
$newEditor = @"
                    <DocumentEditorContainerComponent ref={docEditorRef} id="docEditor" height="100%" serviceUrl={docServiceUrl} enableToolbar={true} showPropertiesPane={false}>
                      <DocInject services={[DocToolbar]} />
                    </DocumentEditorContainerComponent>
                    <input type="file" ref={fileInputRef} accept=".doc,.docx" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files[0]; if (!file) return; const fd = new FormData(); fd.append('files', file); fetch(docServiceUrl + 'Import', { method: 'POST', body: fd }).then(r => r.json()).then(d => { if (docEditorRef.current && d) { docEditorRef.current.documentEditor.open(JSON.stringify(d)); toast.success('Imported: ' + file.name); } }).catch(() => toast.error('Import failed')); e.target.value = ''; }} />
"@
$c = $c.Replace($oldEditor.Trim(), $newEditor.Trim())

# 7. Add Import DOCX button
$c = $c.Replace('{loading ? "Converting..." : "Re-convert DOCX"}', '{loading ? "Converting..." : "Re-convert from R2"}')

# 8. Add Export DOCX and Import buttons in footer
$oldFooterLeft = @"
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={handleReconvert}
                        disabled={loading}
                        title="Re-download DOCX from R2 and convert again"
                      >
                        <i className="fa-light fa-rotate me-1"></i>
                        {loading ? "Converting..." : "Re-convert from R2"}
                      </button>
                    </div>
"@
$newFooterLeft = @"
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-info" onClick={() => fileInputRef.current?.click()} title="Import .doc/.docx from computer">
                        <i className="fa-light fa-file-import me-1"></i>Import DOCX
                      </button>
                      <button className="btn btn-sm btn-warning" onClick={handleReconvert} disabled={loading} title="Re-download DOCX from R2 and convert again">
                        <i className="fa-light fa-rotate me-1"></i>{loading ? "Converting..." : "Re-convert from R2"}
                      </button>
                    </div>
"@
$c = $c.Replace($oldFooterLeft.Trim(), $newFooterLeft.Trim())

# 9. Add Export DOCX button before Save
$oldSaveBtn = @"
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={handleSaveHtmlContent}
                        disabled={loading}
                      >
                        <i className="fa-light fa-save me-1"></i>
                        {loading ? "Saving..." : "Save HTML"}
                      </button>
"@
$newSaveBtn = @"
                      <button className="btn btn-sm btn-success" onClick={() => { if (docEditorRef.current?.documentEditor) docEditorRef.current.documentEditor.save(currentTestForHtml?.Test || 'document', 'Docx'); }}>
                        <i className="fa-light fa-file-export me-1"></i>Export DOCX
                      </button>
                      <button className="btn btn-sm btn-primary" onClick={handleSaveHtmlContent} disabled={loading}>
                        <i className="fa-light fa-save me-1"></i>{loading ? "Saving..." : "Save to DB"}
                      </button>
"@
$c = $c.Replace($oldSaveBtn.Trim(), $newSaveBtn.Trim())

[System.IO.File]::WriteAllText($f, $c)
Write-Host "ALL REPLACEMENTS DONE"
