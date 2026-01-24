import React, { useState } from "react";
import Footer from "../components/footer/Footer";
import UserBookingConversationList from "../components/ai-bookings/UserBookingConversationList";
import UserBookingConversationViewer from "../components/ai-bookings/UserBookingConversationViewer";

const UserAiBookings = () => {
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <h5>
                <i className="fa-light fa-calendar-check me-2"></i>
                My Appointments
              </h5>
              <p className="text-muted mb-0">
                Manage your AI-assisted appointment bookings and chat history
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="chatting-panel">
        <div className="d-flex">
          {/* Conversation List Sidebar */}
          <div className="panel border-end rounded-0">
            
            <UserBookingConversationList
              onSelectConversation={setSelectedConversationId}
              selectedId={selectedConversationId}
            />
          </div>

          {/* Conversation Viewer */}
          <div
            className="panel rounded-0 position-relative"
            style={{ flex: 1 }}
          >
            <div className="chatting-area">
              <UserBookingConversationViewer
                conversationId={selectedConversationId}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserAiBookings;
