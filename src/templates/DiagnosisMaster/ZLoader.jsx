import React from 'react'

export default function ZLoader() {
    const letters = [
      { char: "L", color: "text-primary" },
      { char: "O", color: "text-secondary" },
      { char: "R", color: "text-success" },
      { char: "D", color: "text-danger" },
      { char: "S", color: "text-warning" },
    ];
  return (
    <div className="d-flex gap-3 ">
      {letters.map((item, index) => (
        <div
          key={index}
          className={`spinner-grow ${item.color} position-relative`}
          style={{ width: "3rem", height: "3rem" }}
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontWeight: "bold",
              fontSize: "15px",
              color: "#000",
              pointerEvents: "none",
            }}
          >
            {item.char}
          </span>
        </div>
      ))}
    </div>
  );
}