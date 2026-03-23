import { useEffect, useRef, useState } from "react";

export default function DodgeGameLoader({ loading = true }) {
  const canvasRef = useRef(null);

  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let player = { x: 140, y: 260, width: 20, height: 20 };
    let obstacles = [];
    let speed = 3;
    let animation;

    const keys = {};

    const handleKeyDown = (e) => (keys[e.key] = true);
    const handleKeyUp = (e) => (keys[e.key] = false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const spawnObstacle = () => {
      obstacles.push({
        x: Math.random() * 280,
        y: 0,
        width: 20,
        height: 20,
      });
    };

    const detectCollision = (a, b) => {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    };

    const drawRoundedRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
    };

    const update = () => {
      // 🔥 pause + game over handle
      if (gameOver || !isRunning) {
        animation = requestAnimationFrame(update);
        return;
      }

      ctx.clearRect(0, 0, 300, 300);

      // background
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, "#0f2027");
      gradient.addColorStop(1, "#2c5364");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 300, 300);

      // move player
      if (keys["ArrowLeft"] && player.x > 0) player.x -= 4;
      if (keys["ArrowRight"] && player.x < 280) player.x += 4;

      // player
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00f2ff";
      ctx.fillStyle = "#00f2ff";
      drawRoundedRect(player.x, player.y, player.width, player.height, 6);
      ctx.shadowBlur = 0;

      // obstacles
      obstacles.forEach((obs, index) => {
        obs.y += speed;

        ctx.fillStyle = "#ff4d4d";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff4d4d";
        drawRoundedRect(obs.x, obs.y, obs.width, obs.height, 6);
        ctx.shadowBlur = 0;

        if (detectCollision(player, obs)) {
          setGameOver(true);
        }

        if (obs.y > 300) {
          obstacles.splice(index, 1);
          setScore((prev) => prev + 1);
        }
      });

      if (Math.random() < 0.02) spawnObstacle();

      animation = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameOver, isRunning]);

  // 🔥 loading → pause/resume control
  useEffect(() => {
    if (loading) {
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [loading]);

  return (
    <div
      style={{
        textAlign: "center",
        background: "linear-gradient(135deg, #1d2671, #c33764)",
        padding: "30px",
        borderRadius: "16px",
        color: "#fff",
        width: "340px",
        margin: "auto",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        position: "relative",
      }}
    >
      <h3>🚀 Loading Game</h3>

      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        style={{
          borderRadius: "10px",
          border: "2px solid rgba(255,255,255,0.2)",
        }}
      />

      <div
        style={{
          marginTop: "10px",
          padding: "6px 12px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        🎯 Score: {score}
      </div>

      {/* ⏸ PAUSE UI */}
      {!isRunning && !gameOver && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <h3>⏸ Paused</h3>
          <button
            onClick={() => setIsRunning(true)}
            style={{
              marginTop: "10px",
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#00f2ff",
              color: "#000",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ▶ Resume
          </button>
        </div>
      )}

      {/* 💀 GAME OVER */}
      {gameOver && (
        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            background: "rgba(0,0,0,0.6)",
            borderRadius: "10px",
          }}
        >
          <h4 style={{ color: "#ff4d4d" }}>💀 Game Over</h4>
          <button
            onClick={() => {
              setGameOver(false);
              setScore(0);
              setIsRunning(true);
            }}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#00f2ff",
              color: "#000",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🔄 Restart
          </button>
        </div>
      )}
    </div>
  );
}
