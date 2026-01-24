import React, { useState, useContext, useEffect } from "react";
import AiMessageArea from "./AiMessageArea";
import AiMessageInput from "./AiMessageInput";
import AiChatTopBar from "./AiChatTopBar";
import { chatResponse } from "../../../lib/ai";
import { DigiContext } from "../../../context/DigiContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AiChatingArea = ({
  conversationType = "user_ai",
  isAppointmentChat = false,
  isNurseBooking = false,
  nurseBookingState = null,
  onCategorySelect,
  onPackageSelect,
  onConfirmNurseBooking,
  isHealthPackageBooking = false,
  healthPackageState = null,
  onHealthPackageSelect,
  onConfirmHealthPackage,
  isDiagnosticBooking = false,
  diagnosticBookingState = null,
  onDiagnosticTestSelect,
  onConfirmDiagnosticBooking,
  onDateSelect,
  onTimeSelect,
  onBackToSelection,
  activeMode,
}) => {
  const { aiState } = useContext(DigiContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [currentDoctors, setCurrentDoctors] = useState([]);
  const PATIENT_ID = 95; // Patient ID from auth context, e.g., useContext(DigiContext).user?.id
  const currentUserId = PATIENT_ID;
  const currentDoctorId = 1; // TODO: get from auth context

  // Use nurse booking messages if in nurse booking mode
  useEffect(() => {
    if (isNurseBooking && nurseBookingState?.messages) {
      setMessages(nurseBookingState.messages);
    } else if (isHealthPackageBooking && healthPackageState?.messages) {
      setMessages(healthPackageState.messages);
    } else if (isDiagnosticBooking && diagnosticBookingState?.messages) {
      setMessages(diagnosticBookingState.messages);
    }
  }, [
    isNurseBooking,
    nurseBookingState,
    isHealthPackageBooking,
    healthPackageState,
    isDiagnosticBooking,
    diagnosticBookingState,
  ]);

  // Unified booking state management
  const [bookingData, setBookingData] = useState({
    doctor: null,
    doctorName: null,
    slot: null,
    type: null,
    problem: null,
    ambulance: null,
    appointmentId: null,
    conversationId: null, // Track conversation for persistence
  });

  // Load existing conversation and messages when mode changes
  useEffect(() => {
    // Clear messages when switching modes
    setMessages([]);
    setConversationId(null);

    // Only load existing conversations for general queries, not for booking or nurse booking or healthpackage modes
    if (
      activeMode === "booking" ||
      activeMode === "nurse" ||
      activeMode === "healthpackage" ||
      activeMode === "diagnostic"
    ) {
      return;
    }

    const loadExistingConversation = async () => {
      try {
        // Get existing conversations for the current user (patient or doctor)
        const userIdForLookup =
          conversationType === "doctor_ai" ? currentDoctorId : currentUserId;
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
          }/api/ai/conversations/${userIdForLookup}?conversationType=${conversationType}`
        );

        if (response.ok) {
          const conversations = await response.json();
          if (conversations.length > 0) {
            const existingConversation = conversations[0];
            setConversationId(existingConversation.id);

            // Load messages for this conversation
            const messagesResponse = await fetch(
              `${
                import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
              }/api/ai/conversations/${existingConversation.id}/messages`
            );

            if (messagesResponse.ok) {
              const existingMessages = await messagesResponse.json();
              // Convert backend messages to frontend format
              const formattedMessages = existingMessages.map((msg) => {
                let file = null;
                let cleanedContent = msg.content;

                if (
                  msg.attachments &&
                  Array.isArray(msg.attachments) &&
                  msg.attachments.length > 0
                ) {
                  // Use the first attachment
                  const attachment = msg.attachments[0];
                  file = {
                    name: attachment.original_name,
                    url: attachment.url,
                    type: attachment.mime_type,
                    size: attachment.size,
                  };

                  // Remove attachment text from content
                  cleanedContent = cleanedContent
                    .replace(/\[Attached:\s*[^\]]+\]/g, "")
                    .trim();
                }

                return {
                  text: cleanedContent,
                  sender: msg.role === "user" ? "user" : "ai",
                  time: new Date(msg.created_at).toLocaleTimeString(),
                  date: new Date(msg.created_at).toDateString(),
                  created_at: msg.created_at, // Keep full timestamp for grouping
                  file: file,
                };
              });
              setMessages(formattedMessages);
            }
          }
        }
      } catch (error) {
        console.error("Error loading existing conversation:", error);
        // Continue with empty messages if loading fails
      }
    };

    loadExistingConversation();
  }, [currentUserId, conversationType, activeMode]);

  const handleSendMessage = async (message, file) => {
    if (!message.trim() && !file) return;

    // Compute updated booking data inline (before API call)
    let updatedBookingData = { ...bookingData };

    // Store first user message as problem description if not already set
    if (!updatedBookingData.problem && message.trim()) {
      // Check if this looks like a medical problem (not a selection command)
      if (!message.startsWith("SELECTION:")) {
        updatedBookingData.problem = message;
        console.log("📝 Problem captured:", updatedBookingData.problem);
      }
    }

    // Handle structured selections from metadata (passed by buttons)
    // Format: "SELECTION:type:value:label"
    if (message.startsWith("SELECTION:")) {
      const [, selectionType, value, ...labelParts] = message.split(":");
      const label = labelParts.join(":"); // Rejoin in case label has colons

      console.log("🔍 Structured selection:", { selectionType, value, label });

      if (selectionType === "doctor") {
        const index = parseInt(value) - 1;
        console.log("🔍 Doctor selection debug:", {
          index,
          value,
          currentDoctorsLength: currentDoctors.length,
          currentDoctors: currentDoctors,
        });
        if (currentDoctors[index]) {
          // Store the complete doctor object, not just the ID
          updatedBookingData.doctor = {
            id: currentDoctors[index].id,
            name: currentDoctors[index].name,
            specialty: currentDoctors[index].specialty,
            qualification: currentDoctors[index].qualification,
            price: currentDoctors[index].price,
          };
          updatedBookingData.doctorName = currentDoctors[index].name;
          console.log("👨‍⚕️ Doctor selected:", updatedBookingData.doctor);
        } else {
          console.error(
            "Invalid doctor selection:",
            value,
            "currentDoctors:",
            currentDoctors
          );
        }
      } else if (selectionType === "slot") {
        updatedBookingData.slot = label;
        console.log("🕐 Slot selected:", updatedBookingData.slot);
      } else if (selectionType === "type") {
        updatedBookingData.type = parseInt(value);
        console.log(
          "📋 Type selected:",
          value === "1" ? "In-person" : "Online"
        );
        // If online appointment, set ambulance to 'no' by default
        if (value === "2") {
          updatedBookingData.ambulance = 2;
          console.log("💻 Online appointment - ambulance not needed");
        }
      } else if (selectionType === "ambulance") {
        updatedBookingData.ambulance = parseInt(value);
        console.log("🚑 Ambulance selected:", value === "1" ? "Yes" : "No");
      }
    }

    // Add patient_id to bookingData for external API
    updatedBookingData.patient_id = currentUserId;

    // Update state for UI (will take effect on next render)
    setBookingData(updatedBookingData);

    const userMessage = {
      text: message,
      sender: "user",
      time: new Date().toLocaleTimeString(),
      date: new Date().toDateString(),
      created_at: new Date().toISOString(), // Add full timestamp
      file: file,
    };
    setMessages((prev) => [...prev, userMessage]);
    setSelectedFile(null);
    setLoading(true);

    try {
      let aiResponse;
      if (isAppointmentChat) {
        // Use appointment booking API
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
          }/api/ai/appointment-chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: currentUserId,
              messages: [
                ...messages.map((msg) => ({
                  role: msg.sender === "user" ? "user" : "assistant",
                  content: msg.file
                    ? `${msg.text} [Attached: ${msg.file.name}]`
                    : msg.text,
                })),
                {
                  role: "user",
                  content: file
                    ? `${message} [Attached: ${file.name}]`
                    : message,
                },
              ],
              model: aiState.aiSettings.model,
              apiKey: aiState.aiSettings.apiKey,
              maxTokens: aiState.aiSettings.maxTokens,
              bookingData: Object.fromEntries(
                Object.entries(updatedBookingData).filter(
                  ([key, value]) => value != null && value !== "undefined"
                )
              ),
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Appointment chat failed");
        }

        const result = await response.json();
        aiResponse = result.response;

        // Store conversation ID for persistence
        if (result.conversationId) {
          setBookingData((prev) => ({
            ...prev,
            conversationId: result.conversationId,
          }));
        }

        // Store doctors list for selection mapping
        if (result.doctors && result.doctors.length > 0) {
          console.log("✅ Doctors received from backend:", result.doctors);
          setCurrentDoctors(result.doctors);
        } else {
          console.log("⚠️ No doctors received from backend");
        }

        if (result.bookingResult) {
          const booking = result.bookingResult;
          // Store appointment ID for future updates (like ambulance)
          setBookingData((prev) => ({
            ...prev,
            appointmentId: booking.appointmentId,
          }));
          let ambulanceInfo = "";
          if (booking.ambulance) {
            if (booking.ambulance.booked) {
              ambulanceInfo = `
                <p><strong>🚑 Ambulance:</strong> ${
                  booking.ambulance.name || "Assigned"
                }</p>
                <p style="color: green; font-size: 0.9em;">✓ Ambulance pickup confirmed</p>
              `;
            } else {
              ambulanceInfo = `
                <p style="color: orange; font-size: 0.9em;">⚠ ${
                  booking.ambulance.message || "Ambulance not available"
                }</p>
              `;
            }
          }

          Swal.fire({
            title: "✅ Appointment Confirmed!",
            html: `
              <div style="text-align: left; padding: 8px; font-size: 13px; line-height: 1.3;">
                <div style="background: #f8f9fa; padding: 6px 8px; border-radius: 4px; margin-bottom: 8px; font-size: 12px;">
                  <strong style="color: #2c3e50;">ID:</strong> #${
                    booking.appointmentId
                  }
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span><strong>Patient:</strong> ${
                    booking.patient?.name || "N/A"
                  }</span>
                  <span><strong>Doctor:</strong> ${
                    booking.doctor?.name ||
                    updatedBookingData.doctorName ||
                    "N/A"
                  }</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span><strong>Email:</strong> ${
                    booking.patient?.email || "N/A"
                  }</span>
                  <span><strong>Phone:</strong> ${
                    booking.patient?.phone || "N/A"
                  }</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span><strong>Time:</strong> ${
                    booking.slot || updatedBookingData.slot
                  }</span>
                  <span><strong>Type:</strong> ${
                    booking.appointmentType === "offline"
                      ? "🏥 In-Person"
                      : "💻 Online"
                  }</span>
                </div>
                <div style="margin-bottom: 6px;">
                  <strong>Problem:</strong> ${booking.problem || "N/A"}
                </div>
                ${ambulanceInfo}
                <div style="background: #d4edda; color: #155724; padding: 4px 6px; border-radius: 3px; font-size: 11px; margin-top: 8px;">
                  ✓ Confirmation sent to email & SMS to phone
                </div>
              </div>
            `,
            icon: "success",
            confirmButtonText: "OK",
            width: "500px",
            padding: "12px",
          });
          // Store complete appointment data for ambulance updates
          setBookingData((prev) => ({
            ...prev,
            appointmentId: booking.appointmentId,
            patient: booking.patient,
            doctor: booking.doctor,
            doctorName: booking.doctor?.name || updatedBookingData.doctorName,
            slot: booking.slot || updatedBookingData.slot,
            type: booking.appointmentType,
            problem: booking.problem,
          }));
        } else if (result.bookingResult?.ambulanceUpdate) {
          // Ambulance was added to existing appointment
          const ambulance = result.bookingResult.ambulance;
          const booking = result.bookingResult; // Use bookingResult data
          if (ambulance.booked) {
            Swal.fire({
              title: "🚑 Ambulance Confirmed!",
              html: `
                <div style="text-align: left; padding: 8px; font-size: 13px; line-height: 1.3;">
                  <div style="background: #f8f9fa; padding: 6px 8px; border-radius: 4px; margin-bottom: 8px; font-size: 12px;">
                    <strong style="color: #2c3e50;">ID:</strong> #${
                      booking.appointmentId
                    }
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span><strong>Patient:</strong> ${
                      booking.patient?.name || "N/A"
                    }</span>
                    <span><strong>Doctor:</strong> ${
                      booking.doctor?.name || "N/A"
                    }</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span><strong>Email:</strong> ${
                      booking.patient?.email || "N/A"
                    }</span>
                    <span><strong>Phone:</strong> ${
                      booking.patient?.phone || "N/A"
                    }</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span><strong>Time:</strong> ${booking.slot || "N/A"}</span>
                    <span><strong>Type:</strong> ${
                      booking.appointmentType === "offline"
                        ? "🏥 In-Person"
                        : "💻 Online"
                    }</span>
                  </div>
                  <div style="margin-bottom: 6px;">
                    <strong>Problem:</strong> ${booking.problem || "N/A"}
                  </div>
                  <div style="background: #e8f5e8; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px;">
                    <strong style="color: #2e7d32;">🚑 Ambulance:</strong> ${
                      ambulance.name
                    }
                  </div>
                  <div style="background: #d4edda; color: #155724; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                    ✓ Pickup assigned • Confirmation sent
                  </div>
                </div>
              `,
              icon: "success",
              confirmButtonText: "OK",
              width: "500px",
              padding: "12px",
            });
            // Update bookingData with the appointment details for future reference
            setBookingData((prev) => ({
              ...prev,
              patient: booking.patient,
              doctor: booking.doctor,
              slot: booking.slot,
              type: booking.appointmentType,
              problem: booking.problem,
            }));
          } else {
            Swal.fire({
              title: "⚠️ Ambulance Unavailable",
              text: ambulance.message || "No ambulances currently available",
              icon: "warning",
              confirmButtonText: "OK",
            });
          }
          // Reset booking state after ambulance selection
          setBookingData({
            doctor: null,
            doctorName: null,
            slot: null,
            type: null,
            problem: null,
            ambulance: null,
            appointmentId: null,
          });
        } else if (result.bookingResult?.bookingCompleted) {
          // Booking completed without ambulance (user selected "No")
          const booking = result.bookingResult;

          Swal.fire({
            title: "✅ Booking Completed!",
            html: `
              <div style="text-align: left; padding: 8px; font-size: 13px; line-height: 1.3;">
                <div style="background: #f8f9fa; padding: 6px 8px; border-radius: 4px; margin-bottom: 8px; font-size: 12px;">
                  <strong style="color: #2c3e50;">Appointment ID:</strong> #${
                    booking.appointmentId
                  }
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span><strong>Patient:</strong> ${
                    booking.patient?.name || "N/A"
                  }</span>
                  <span><strong>Doctor:</strong> ${
                    booking.doctor?.name || "N/A"
                  }</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span><strong>Email:</strong> ${
                    booking.patient?.email || "N/A"
                  }</span>
                  <span><strong>Phone:</strong> ${
                    booking.patient?.phone || "N/A"
                  }</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span><strong>Time:</strong> ${booking.slot || "N/A"}</span>
                  <span><strong>Type:</strong> ${
                    booking.appointmentType === "offline"
                      ? "🏥 In-Person"
                      : "💻 Online"
                  }</span>
                </div>
                <div style="margin-bottom: 6px;">
                  <strong>Problem:</strong> ${booking.problem || "N/A"}
                </div>
                <div style="background: #fff3cd; color: #856404; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; font-size: 12px;">
                  <strong>🚫 Ambulance:</strong> Not requested
                </div>
                <div style="background: #d4edda; color: #155724; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                  ✓ Appointment confirmed • Details sent to email & SMS
                </div>
              </div>
            `,
            icon: "success",
            confirmButtonText: "OK",
            width: "500px",
            padding: "12px",
          });

          // Reset booking state after completion
          setBookingData({
            doctor: null,
            doctorName: null,
            slot: null,
            type: null,
            problem: null,
            ambulance: null,
            appointmentId: null,
          });
        }
      } else {
        // Use regular chat via direct API call to get conversationId
        const formData = new FormData();

        // Send only the current user's ID (who is using the chat)
        const currentUserIdToSend =
          conversationType === "doctor_ai" ? currentDoctorId : currentUserId;
        formData.append("currentUserId", currentUserIdToSend.toString());
        formData.append("conversationType", conversationType);

        formData.append("model", aiState.aiSettings.model);
        formData.append("apiKey", aiState.aiSettings.apiKey);
        formData.append("maxTokens", aiState.aiSettings.maxTokens.toString());
        formData.append("systemPrompt", aiState.aiSettings.systemPrompt);

        // Prepare messages array
        const messagesArray = [
          ...messages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.file
              ? `${msg.text} [Attached: ${msg.file.name}]`
              : msg.text,
          })),
          {
            role: "user",
            content: file ? `${message} [Attached: ${file.name}]` : message,
          },
        ];

        formData.append("messages", JSON.stringify(messagesArray));

        // Add the file if present
        if (file) {
          formData.append("files", file);
        }

        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
          }/api/ai/chat`,
          {
            method: "POST",
            body: formData, // No Content-Type header needed for FormData
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Chat failed");
        }

        const result = await response.json();
        aiResponse = result.response;

        // Store conversation ID for persistence
        if (result.conversationId && !conversationId) {
          setConversationId(result.conversationId);
        }
      }

      const aiMessage = {
        text: aiResponse,
        sender: "ai",
        time: new Date().toLocaleTimeString(),
        date: new Date().toDateString(),
        created_at: new Date().toISOString(), // Add full timestamp
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      if (error.message.includes("API key not set")) {
        Swal.fire({
          title: "API Key Required",
          text: "Please set your OpenAI API key in AI Settings.",
          icon: "warning",
          confirmButtonText: "Go to Settings",
          confirmButtonClass: "btn btn-sm btn-primary",
        }).then(() => {
          navigate("/aisettings");
        });
      } else {
        const errorMessage = {
          text: "Sorry, I couldn't process your message. Please try again.",
          sender: "ai",
          time: new Date().toLocaleTimeString(),
          date: new Date().toDateString(),
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatting-area w-100 d-flex flex-column">
      <AiChatTopBar
        onBackToSelection={onBackToSelection}
        activeMode={activeMode}
        isNurseBooking={isNurseBooking}
        isHealthPackageBooking={isHealthPackageBooking}
        isDiagnosticBooking={isDiagnosticBooking}
      />
      <AiMessageArea
        messages={messages}
        loading={
          isNurseBooking
            ? nurseBookingState?.isLoading
            : isHealthPackageBooking
            ? healthPackageState?.isLoading
            : isDiagnosticBooking
            ? diagnosticBookingState?.isLoading
            : loading
        }
        isAppointmentChat={isAppointmentChat}
        isNurseBooking={isNurseBooking}
        nurseBookingState={nurseBookingState}
        onCategorySelect={onCategorySelect}
        onPackageSelect={onPackageSelect}
        onConfirmNurseBooking={onConfirmNurseBooking}
        isHealthPackageBooking={isHealthPackageBooking}
        healthPackageState={healthPackageState}
        onHealthPackageSelect={onHealthPackageSelect}
        onConfirmHealthPackage={onConfirmHealthPackage}
        isDiagnosticBooking={isDiagnosticBooking}
        diagnosticBookingState={diagnosticBookingState}
        onDiagnosticTestSelect={onDiagnosticTestSelect}
        onConfirmDiagnosticBooking={onConfirmDiagnosticBooking}
        onDateSelect={onDateSelect}
        onTimeSelect={onTimeSelect}
        onSendSelection={handleSendMessage}
        bookingData={bookingData}
      />
      {!isNurseBooking && !isHealthPackageBooking && !isDiagnosticBooking && (
        <AiMessageInput
          onSendMessage={handleSendMessage}
          loading={loading}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />
      )}
    </div>
  );
};

export default AiChatingArea;
