import React, { useEffect, useRef } from "react";

const GlobeLoader = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dots = [];
    const radius = 120;
    const centerX = width / 2;
    const centerY = height / 2;

    // create dots on sphere
    for (let i = 0; i < 300; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      dots.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
      });
    }

    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      dots.forEach((dot) => {
        // rotate Y axis
        const x = dot.x * Math.cos(angle) - dot.z * Math.sin(angle);
        const z = dot.x * Math.sin(angle) + dot.z * Math.cos(angle);

        const scale = 300 / (300 + z);
        const x2d = x * scale + centerX;
        const y2d = dot.y * scale + centerY;

        ctx.beginPath();
        ctx.arc(x2d, y2d, 2 * scale, 0, Math.PI * 2);
        ctx.fillStyle = "#00d4ff";
        ctx.fill();
      });

      angle += 0.01;
      requestAnimationFrame(draw);
    };

    draw();
  }, []);

  return (
    <div style={styles.wrapper}>
      <canvas ref={canvasRef} />
      <div style={styles.text}></div>
    </div>
  );
};

const styles = {
  wrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    background: "#0d1117",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  text: {
    position: "absolute",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
  },
};

export default GlobeLoader;