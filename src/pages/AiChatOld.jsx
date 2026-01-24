import React, { useState } from "react";
import Footer from "../components/footer/Footer";
import AiChatingArea from "../components/chat/ai/AiChatingArea";

const AiChatOld = () => {
  const [activeMode, setActiveMode] = useState(null); // null, 'general', 'booking'

  const handleModeSelect = (mode) => {
    setActiveMode(mode);
  };

  const handleBackToSelection = () => {
    setActiveMode(null);
  };

  if (!activeMode) {
    return (
      <div className="main-content">
        <div className="chatting-panel">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "70vh" }}
          >
            <div className="text-center">
              <h4 className="mb-4">How can I help you today?</h4>
              <div className="d-flex gap-3 justify-content-center">
                <button
                  className="btn btn-primary btn-lg px-4 py-3"
                  onClick={() => handleModeSelect("general")}
                  style={{ minWidth: "200px" }}
                >
                  <i className="fa-light fa-robot me-2"></i>
                  <div>
                    <strong>General Query</strong>
                    <br />
                    <small>Ask me anything</small>
                  </div>
                </button>
                <button
                  className="btn btn-success btn-lg px-4 py-3"
                  onClick={() => handleModeSelect("booking")}
                  style={{ minWidth: "200px" }}
                >
                  <i className="fa-light fa-calendar-check me-2"></i>
                  <div>
                    <strong>AI Booking</strong>
                    <br />
                    <small>Book an appointment</small>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="chatting-panel">
        <div className="d-flex">
          <AiChatingArea
            conversationType={
              activeMode === "general" ? "user_ai" : "booking_ai"
            }
            isAppointmentChat={activeMode === "booking"}
            onBackToSelection={handleBackToSelection}
            activeMode={activeMode}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AiChatOld;
