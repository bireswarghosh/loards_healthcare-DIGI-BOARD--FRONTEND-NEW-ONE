import React from "react";

const GradientLoader = ({ text = "" }) => {
  return (
    <>
      {/* Internal CSS */}
      <style>
        {`
        .loader-wrapper {
          height: 100vh;
          width: 100%;
          background: #0d1117;
          overflow: hidden;
          position: relative;
        }

        .gradient-bg {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .blob {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.7;
          animation: move 10s infinite alternate ease-in-out;
          mix-blend-mode: hard-light;
        }

        .blob1 {
          background: #ff00cc;
          top: 10%;
          left: 20%;
        }

        .blob2 {
          background: #3333ff;
          top: 50%;
          left: 60%;
          animation-duration: 14s;
        }

        .blob3 {
          background: #00ffcc;
          top: 70%;
          left: 30%;
          animation-duration: 18s;
        }

        @keyframes move {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(120px, -120px) scale(1.2);
          }
          100% {
            transform: translate(-120px, 120px) scale(1);
          }
        }

        .content-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          text-align: center;
        }
        `}
      </style>

      {/* Loader UI */}
      <div className="loader-wrapper d-flex justify-content-center align-items-center">
        <div className="gradient-bg">
          <div className="blob blob1"></div>
          <div className="blob blob2"></div>
          <div className="blob blob3"></div>

          <div className="content-center">
            <h4 className="fw-bold">{text}</h4>
          </div>
        </div>
      </div>
    </>
  );
};

export default GradientLoader;