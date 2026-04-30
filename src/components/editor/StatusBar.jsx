import React from "react";
import { Minus, Plus, ZoomIn } from "lucide-react";

const StatusBar = ({ editor, zoom, onZoomChange }) => {
  const text = editor?.getText() || "";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const lines = text.split("\n").length;

  return (
    <div style={{ height: "26px", background: "#185ABD", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: "11px", userSelect: "none", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", overflow: "hidden", whiteSpace: "nowrap" }}>
        <span>{words} words</span>
        <span>{chars} characters</span>
        <span>{lines} lines</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <button onClick={() => onZoomChange(Math.max(25, zoom - 10))} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: "2px", borderRadius: "4px" }} title="Zoom Out"><Minus size={14} /></button>
        <input type="range" min={25} max={300} value={zoom} onChange={(e) => onZoomChange(Number(e.target.value))} style={{ width: "100px", height: "4px", cursor: "pointer" }} />
        <button onClick={() => onZoomChange(Math.min(300, zoom + 10))} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: "2px", borderRadius: "4px" }} title="Zoom In"><Plus size={14} /></button>
        <span style={{ width: "40px", textAlign: "center" }}>{zoom}%</span>
        <button onClick={() => onZoomChange(100)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: "2px", borderRadius: "4px" }} title="Reset"><ZoomIn size={14} /></button>
      </div>
    </div>
  );
};

export default StatusBar;
