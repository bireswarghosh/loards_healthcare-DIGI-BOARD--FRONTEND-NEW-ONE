import React, { useState } from "react";
import Footer from "../components/footer/Footer";
import AdminBookingConversationList from "../components/ai-bookings/AdminBookingConversationList";
import AdminBookingConversationViewer from "../components/ai-bookings/AdminBookingConversationViewer";

const AdminAiBookings = () => {
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <h5>
                <i className="fa-light fa-calendar-check me-2"></i>
                AI Booking Conversations
              </h5>
              <p className="text-muted mb-0">
                Manage AI-assisted appointment booking conversations
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="chatting-panel">
        <div className="d-flex">
          {/* Conversation List Sidebar */}
          <div className="panel border-end rounded-0">
            <AdminBookingConversationList
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
              <AdminBookingConversationViewer
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

export default AdminAiBookings;
