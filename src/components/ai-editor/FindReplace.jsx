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
    setCurrentMatchIndex((prev) => { if (prev < 0) return 0; return Math.min(prev, matchPositions.length - 1); });
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
      let charCount = 0;
      let range = null;
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

  const resultLabel = matchPositions.length > 0 && currentMatchIndex >= 0 ? `${currentMatchIndex + 1}/${matchPositions.length}` : `${matchPositions.length} results`;

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-4 z-50 bg-white border border-gray-300 shadow-lg rounded-b-lg w-[380px] print:hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{mode === "find" ? "Find" : "Find and Replace"}</span>
          {mode === "find" && <button onClick={() => setMode("replace")} className="text-xs text-blue-600 hover:underline">Replace</button>}
          {mode === "replace" && <button onClick={() => setMode("find")} className="text-xs text-blue-600 hover:underline">Find only</button>}
        </div>
        <button onClick={onClose} className="hover:bg-gray-200 rounded p-1"><X size={14} /></button>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Find..." className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500" autoFocus onKeyDown={(e) => { if (e.key === "Enter" && e.shiftKey) findPrev(); if (e.key === "Enter" && !e.shiftKey) findNext(); if (e.key === "Escape") onClose(); }} />
          <span className="text-xs text-gray-500 min-w-[60px] text-center">{resultLabel}</span>
          <button onClick={findPrev} className="hover:bg-gray-100 rounded p-1" title="Previous"><ChevronUp size={16} /></button>
          <button onClick={findNext} className="hover:bg-gray-100 rounded p-1" title="Next"><ChevronDown size={16} /></button>
        </div>
        {mode === "replace" && (
          <div className="flex items-center gap-2">
            <input type="text" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Replace with..." className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500" onKeyDown={(e) => { if (e.key === "Escape") onClose(); }} />
            <button onClick={replaceCurrent} className="text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1.5 border" title="Replace"><Replace size={14} /></button>
            <button onClick={replaceAll} className="text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1.5 border whitespace-nowrap" title="Replace All">All</button>
          </div>
        )}
        <div className="flex items-center gap-4 pt-1">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} className="rounded" />Match case</label>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} className="rounded" />Whole word</label>
        </div>
      </div>
    </div>
  );
};

export default FindReplace;
