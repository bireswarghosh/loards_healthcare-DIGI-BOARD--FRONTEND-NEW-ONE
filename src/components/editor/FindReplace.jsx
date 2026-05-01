import React, { useState, useCallback, useEffect, useMemo } from "react";
import { X, ChevronDown, ChevronUp, Replace } from "lucide-react";

const FindReplace = ({ editor, isOpen, onClose, mode: initialMode }) => {
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [, setContentVersion] = useState(0);

  useEffect(() => { setMode(initialMode); }, [initialMode]);

  useEffect(() => {
    if (!editor) return;
    const rerender = () => setContentVersion((v) => v + 1);
    editor.on("update", rerender);
    editor.on("selectionUpdate", rerender);
    return () => { editor.off("update", rerender); editor.off("selectionUpdate", rerender); };
  }, [editor]);

  const editorText = editor?.getText() || "";

  const matchPositions = useMemo(() => {
    if (!searchText.trim()) return [];
    let haystack = editorText;
    let needle = searchText;
    if (!matchCase) { haystack = haystack.toLowerCase(); needle = needle.toLowerCase(); }
    const positions = [];
    let pos = 0;
    while (true) {
      const idx = haystack.indexOf(needle, pos);
      if (idx === -1) break;
      if (wholeWord) {
        const before = idx > 0 ? haystack[idx - 1] : " ";
        const after = idx + needle.length < haystack.length ? haystack[idx + needle.length] : " ";
        if (/\w/.test(before) || /\w/.test(after)) { pos = idx + 1; continue; }
      }
      positions.push(idx);
      pos = idx + 1;
    }
    return positions;
  }, [editorText, searchText, matchCase, wholeWord]);

  const selectMatch = useCallback((matchIndex) => {
    if (!editor || matchIndex < 0 || matchIndex >= matchPositions.length) return;
    const matchPos = matchPositions[matchIndex];
    let charCount = 0;
    let found = false;
    editor.state.doc.descendants((node, nodePos) => {
      if (found) return false;
      if (node.isText) {
        const nodeText = node.text || "";
        const relativePos = matchPos - charCount;
        if (relativePos >= 0 && relativePos <= nodeText.length) {
          editor.commands.setTextSelection({ from: nodePos + relativePos, to: nodePos + relativePos + searchText.length });
          editor.commands.scrollIntoView();
          found = true;
          return false;
        }
        charCount += nodeText.length;
      }
      return true;
    });
    if (found) setCurrentMatchIndex(matchIndex);
  }, [editor, matchPositions, searchText.length]);

  useEffect(() => {
    if (!searchText.trim() || matchPositions.length === 0) { setCurrentMatchIndex(-1); return; }
    setCurrentMatchIndex((prev) => prev < 0 ? 0 : Math.min(prev, matchPositions.length - 1));
  }, [searchText, matchPositions.length]);

  const findNext = useCallback(() => {
    if (!editor || matchPositions.length === 0) return;
    const nextIndex = currentMatchIndex < 0 ? 0 : (currentMatchIndex + 1) % matchPositions.length;
    selectMatch(nextIndex);
  }, [editor, matchPositions.length, currentMatchIndex, selectMatch]);

  const findPrev = useCallback(() => {
    if (!editor || matchPositions.length === 0) return;
    const prevIndex = currentMatchIndex < 0 ? matchPositions.length - 1 : (currentMatchIndex - 1 + matchPositions.length) % matchPositions.length;
    selectMatch(prevIndex);
  }, [editor, matchPositions.length, currentMatchIndex, selectMatch]);

  const replaceCurrent = useCallback(() => {
    if (!editor || !searchText.trim()) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const matches = matchCase ? selectedText === searchText : selectedText.toLowerCase() === searchText.toLowerCase();
    if (!matches) { if (matchPositions.length > 0) selectMatch(currentMatchIndex < 0 ? 0 : currentMatchIndex); return; }
    editor.chain().focus().deleteSelection().insertContent(replaceText).run();
    requestAnimationFrame(() => { if (matchPositions.length > 0) findNext(); });
  }, [editor, searchText, matchCase, replaceText, matchPositions.length, currentMatchIndex, selectMatch, findNext]);

  const replaceAll = useCallback(() => {
    if (!editor || !searchText.trim() || matchPositions.length === 0) return;
    const ranges = matchPositions.map((position) => {
      let charCount = 0; let range = null;
      editor.state.doc.descendants((node, nodePos) => {
        if (range) return false;
        if (!node.isText) return true;
        const nodeText = node.text || "";
        const relativePos = position - charCount;
        if (relativePos >= 0 && relativePos <= nodeText.length) { range = { from: nodePos + relativePos, to: nodePos + relativePos + searchText.length }; return false; }
        charCount += nodeText.length;
        return true;
      });
      return range;
    }).filter(Boolean);
    for (let i = ranges.length - 1; i >= 0; i--) {
      editor.chain().focus().insertContentAt(ranges[i], replaceText).run();
    }
    setCurrentMatchIndex(-1);
  }, [editor, searchText, replaceText, matchPositions]);

  useEffect(() => { if (!isOpen) setCurrentMatchIndex(-1); }, [isOpen]);

  const resultLabel = matchPositions.length > 0 && currentMatchIndex >= 0
    ? `${currentMatchIndex + 1}/${matchPositions.length}`
    : `${matchPositions.length} results`;

  if (!isOpen) return null;

  return (
    <div style={{ position: "absolute", top: 0, right: "16px", zIndex: 50, background: "#fff", border: "1px solid #d1d5db", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", borderRadius: "0 0 8px 8px", width: "380px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 500 }}>{mode === "find" ? "Find" : "Find and Replace"}</span>
          {mode === "find" && <button onClick={() => setMode("replace")} style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>Replace</button>}
          {mode === "replace" && <button onClick={() => setMode("find")} style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>Find only</button>}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px" }}><X size={14} /></button>
      </div>
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Find..."
            style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: "4px", padding: "6px 8px", fontSize: "13px", outline: "none" }}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && e.shiftKey) findPrev(); if (e.key === "Enter" && !e.shiftKey) findNext(); if (e.key === "Escape") onClose(); }}
          />
          <span style={{ fontSize: "11px", color: "#6b7280", minWidth: "60px", textAlign: "center" }}>{resultLabel}</span>
          <button onClick={findPrev} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }} title="Previous"><ChevronUp size={16} /></button>
          <button onClick={findNext} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }} title="Next"><ChevronDown size={16} /></button>
        </div>
        {mode === "replace" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="text" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Replace with..."
              style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: "4px", padding: "6px 8px", fontSize: "13px", outline: "none" }}
              onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
            />
            <button onClick={replaceCurrent} style={{ fontSize: "12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", padding: "6px 8px", cursor: "pointer" }} title="Replace"><Replace size={14} /></button>
            <button onClick={replaceAll} style={{ fontSize: "12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", padding: "6px 8px", cursor: "pointer", whiteSpace: "nowrap" }} title="Replace All">All</button>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "4px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
            <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} /> Match case
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
            <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} /> Whole word
          </label>
        </div>
      </div>
    </div>
  );
};

export default FindReplace;
