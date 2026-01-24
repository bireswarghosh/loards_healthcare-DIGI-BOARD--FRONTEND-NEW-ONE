import React from "react";
import Footer from "../components/footer/Footer";
import AiChatingArea from "../components/chat/ai/AiChatingArea";

const AiChatDoctor = () => {
  return (
    <div className="main-content">
      <div className="chatting-panel">
        <div className="d-flex">
          <AiChatingArea
            conversationType="doctor_ai"
            isAppointmentChat={false}
            activeMode="doctor"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AiChatDoctor;
