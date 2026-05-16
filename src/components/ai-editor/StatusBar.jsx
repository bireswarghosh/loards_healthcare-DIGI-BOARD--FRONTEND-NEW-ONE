import React from "react";
import { Minus, Plus, ZoomIn } from "lucide-react";

const StatusBar = ({ editor, zoom, onZoomChange, saveStatusLabel }) => {
  const text = editor?.getText() || "";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const lines = text.split("\n").length;
  const pages = Math.max(1, Math.ceil(lines / 47));

  return (
    <div className="h-[26px] bg-[#185ABD] text-white flex items-center justify-between px-3 text-[11px] select-none flex-shrink-0 print:hidden gap-3">
      <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
        <span className="font-medium">{saveStatusLabel}</span>
        <span>Page {pages} of {pages}</span>
        <span>{words} words</span>
        <span>{chars} characters</span>
        <span>{charsNoSpaces} characters (no spaces)</span>
        <span>{lines} lines</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onZoomChange(Math.max(25, zoom - 10))} className="hover:bg-white/20 rounded p-0.5" title="Zoom Out"><Minus size={14} /></button>
        <input type="range" min={25} max={300} value={zoom} onChange={(e) => onZoomChange(Number(e.target.value))} className="w-[100px] h-1 accent-white cursor-pointer" />
        <button onClick={() => onZoomChange(Math.min(300, zoom + 10))} className="hover:bg-white/20 rounded p-0.5" title="Zoom In"><Plus size={14} /></button>
        <span className="w-[40px] text-center">{zoom}%</span>
        <button className="hover:bg-white/20 rounded p-0.5" title="Reset Zoom" onClick={() => onZoomChange(100)}><ZoomIn size={14} /></button>
      </div>
    </div>
  );
};

export default StatusBar;
