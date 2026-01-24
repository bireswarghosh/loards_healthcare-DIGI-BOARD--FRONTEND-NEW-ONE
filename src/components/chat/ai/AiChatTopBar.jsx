const AiChatTopBar = ({ onBackToSelection, activeMode, isNurseBooking, isHealthPackageBooking, isDiagnosticBooking }) => {
  const getTitle = () => {
    switch (activeMode) {
      case "general":
        return "AI Chatbot - General Query";
      case "booking":
        return "AI Chatbot - Appointment Booking";
      case "nurse":
        return "Nurse Booking Assistant";
      case "healthpackage":
        return "Health Package Assistant";
      case "diagnostic":
        return "Diagnostic Test Booking Assistant";
      case "doctor":
        return "AI Chatbot - Medical Consultation";
      default:
        return "AI Chatbot";
    }
  };

  const getIcon = () => {
    switch (activeMode) {
      case "general":
        return "fa-comments";
      case "booking":
        return "fa-calendar-check";
      case "nurse":
        return "fa-user-nurse";
      case "healthpackage":
        return "fa-heartbeat";
      case "diagnostic":
        return "fa-syringe";
      case "doctor":
        return "fa-user-md";
      default:
        return "fa-robot";
    }
  };

  const getIconColor = () => {
    switch (activeMode) {
      case "general":
        return "#2196f3"; // Blue for general chat
      case "booking":
        return "#4caf50"; // Green for booking
      case "nurse":
        return "#e91e63"; // Pink for nurse
      case "healthpackage":
        return "#f44336"; // Red for health/heartbeat
      case "diagnostic":
        return "#8a2be2"; // Purple for diagnostic
      case "doctor":
        return "#3f51b5"; // Indigo for doctor
      default:
        return "#9e9e9e"; // Gray for AI robot
    }
  };

  const getSubtitle = () => {
    switch (activeMode) {
      case "general":
        return "Ask me anything";
      case "booking":
        return "Book your appointment";
      case "nurse":
        return "Book a nurse";
      case "healthpackage":
        return "Find the right health package";
      case "diagnostic":
        return "Book your diagnostic tests";
      case "doctor":
        return "Discuss medical cases";
      default:
        return "Active Now";
    }
  };

  return (
    <div className="panel-body">
      <div className="chat-top-bar">
        <div className="user">
          {onBackToSelection && activeMode !== "doctor" && (
            <button
              className="back-to-all-chat btn-flush fs-14"
              onClick={onBackToSelection}
              title="Back to mode selection"
            >
              <i className="fa-light fa-arrow-left"></i>
            </button>
          )}
          <div className="avatar">
            <i
              className={`fa-light ${getIcon()} fs-24`}
              style={{ color: getIconColor() }}
            ></i>
          </div>
          <div className="part-txt">
            <span className="user-name">{getTitle()}</span>
            <span className="active-status active">{getSubtitle()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatTopBar;
