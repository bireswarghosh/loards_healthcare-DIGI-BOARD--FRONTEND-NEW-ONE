import React, { useState, useEffect, useRef } from "react";
import Footer from "../components/footer/Footer";
import AiChatingArea from "../components/chat/ai/AiChatingArea";
import Swal from "sweetalert2";

const AiChat = () => {
  const [activeMode, setActiveMode] = useState(null); // null, 'general', 'booking', 'nurse', 'healthpackage'

  // Conversation flow states for nurse booking
  const [step, setStep] = useState("greeting");
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Health Package Booking states
  const [healthPackages, setHealthPackages] = useState([]);
  const [selectedHealthPackage, setSelectedHealthPackage] = useState(null);
  const [healthPackageDetails, setHealthPackageDetails] = useState(null);
  const [healthStep, setHealthStep] = useState("greeting");
  const [healthMessages, setHealthMessages] = useState([]);
  const [healthIsLoading, setHealthIsLoading] = useState(false);

  // Diagnostic Booking states
  const [diagnosticTests, setDiagnosticTests] = useState([]);
  const [selectedDiagnosticTest, setSelectedDiagnosticTest] = useState(null);
  const [diagnosticTestDetails, setDiagnosticTestDetails] = useState(null);
  const [diagnosticStep, setDiagnosticStep] = useState("greeting");
  const [diagnosticMessages, setDiagnosticMessages] = useState([]);
  const [diagnosticIsLoading, setDiagnosticIsLoading] = useState(false);
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState("");
  const [selectedAppointmentTime, setSelectedAppointmentTime] = useState("");

  const chatEndRef = useRef(null);

  // Bearer Token for API calls
  const API_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlzQWRtaW4iOnRydWUsImlhdCI6MTc1NDg5ODg1MywiZXhwIjoyNTEyMjgxMjUzfQ.QeHkKyameExcGYkUlP7MwoQIPDplAjNGF3NZCSRMqIw";

  const handleModeSelect = (mode) => {
    setActiveMode(mode);
  };

  const handleBackToSelection = () => {
    setActiveMode(null);
    // Reset nurse booking state
    setMessages([]);
    setSelectedCategory(null);
    setSelectedPackage(null);
    setPackages([]);
    setStep("greeting");
    // Reset health package booking state
    setHealthMessages([]);
    setHealthPackages([]);
    setSelectedHealthPackage(null);
    setHealthPackageDetails(null);
    setHealthStep("greeting");
    // Reset diagnostic booking state
    setDiagnosticMessages([]);
    setDiagnosticTests([]);
    setSelectedDiagnosticTest(null);
    setDiagnosticTestDetails(null);
    setDiagnosticStep("greeting");
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when nurse mode is selected
  useEffect(() => {
    if (activeMode === "nurse") {
      startConversation();
    } else if (activeMode === "healthpackage") {
      startHealthPackageConversation();
    } else if (activeMode === "diagnostic") {
      startDiagnosticConversation();
    }
  }, [activeMode]);

  const addMessage = (content, type = "bot", options = null) => {
    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: content, // Use 'text' instead of 'content'
        sender: type === "bot" ? "ai" : "user", // Use 'sender' with 'ai'/'user' instead of 'type' with 'bot'/'user'
        time: now.toLocaleTimeString(),
        date: now.toDateString(),
        created_at: now.toISOString(),
        timestamp: now,
        options,
      },
    ]);
  };

  const startConversation = async () => {
    addMessage(
      "Hi 👋, I'll help you book a nurse. Please choose a nursing category."
    );
    await fetchCategories();
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_LOARDS_URL}/api/v1/nursing`
      );
      const data = await response.json();

      if (data.success && data.categories) {
        setCategories(data.categories);
        setStep("selectCategory");
      } else {
        throw new Error("Failed to fetch categories");
      }
    } catch (err) {
      setError("Unable to load categories. Please try again.");
      addMessage(
        "❌ Sorry, I couldn't load the nursing categories. Please refresh the page.",
        "bot"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    addMessage(category.name, "user");
    addMessage("Great choice! Please select a package.", "bot");

    await fetchPackages(category.id);
  };

  const fetchPackages = async (categoryId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_LOARDS_URL
        }/api/v1/nursing/packages/${categoryId}`
      );
      const data = await response.json();

      if (data.success && data.packages) {
        setPackages(data.packages);
        setStep("selectPackage");
      } else {
        throw new Error("Failed to fetch packages");
      }
    } catch (err) {
      setError("Unable to load packages. Please try again.");
      addMessage(
        "❌ Sorry, I couldn't load the packages. Please try selecting a category again.",
        "bot"
      );
      setStep("selectCategory");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    addMessage(`${pkg.package_name} - ₹${pkg.price}`, "user");
    addMessage(
      `You selected **${pkg.package_name}** for ₹${pkg.price}. Please review and confirm to proceed.`,
      "bot"
    );
    setStep("summary");
  };

  const handleConfirmBooking = async () => {
    setIsLoading(true);

    try {
      // Static patient details as per requirement
      const bookingData = {
        admition_id: `ADM_${Date.now()}`,
        patient_id: 95, // TODO: Replace with dynamic patient ID
        nursing_package_id: selectedPackage.id,
        transaction_id: `txn_${Date.now()}`,
        advance_booking: 0,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        existing_patient: "no",
        patient_name: "John Doe",
        phone_number: "9876543210",
        email: "john@example.com",
        gender: "Male",
        age: 35,
        address: "123 Main Street, City",
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_LOARDS_URL}/api/v1/nursing-bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        }
      );

      const data = await response.json();

      if (data.success || response.ok) {
        addMessage("✅ Your nurse has been successfully booked!", "bot");
        setStep("confirmed");

        // Show success alert
        Swal.fire({
          title: "✅ Booking Confirmed!",
          html: `
            <div style="text-align: left; padding: 10px;">
              <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: #2c3e50;">Booking Details</strong>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Category:</strong>
                <span style="color: #495057;">${selectedCategory.name}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Package:</strong>
                <span style="color: #495057;">${selectedPackage.package_name}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Duration:</strong>
                <span style="color: #495057;">${selectedPackage.duration} hours</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">Price:</strong>
                <span style="color: #28a745; font-weight: bold;">₹${selectedPackage.price}</span>
              </div>
              <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; font-size: 13px;">
                ✓ Your booking has been confirmed successfully!
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#28a745",
          width: "500px",
        });
      } else {
        throw new Error(data.message || "Booking failed");
      }
    } catch (err) {
      addMessage(
        `❌ Sorry, there was an error creating your booking: ${err.message}. Please try again.`,
        "bot"
      );

      Swal.fire({
        title: "Booking Failed",
        text: `Error: ${err.message}. Please try again.`,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setMessages([]);
    setSelectedCategory(null);
    setSelectedPackage(null);
    setPackages([]);
    setStep("greeting");
    startConversation();
  };

  const handleChangeSelection = () => {
    const recentMessages = messages.slice(0, -2);
    setMessages(recentMessages);
    setSelectedPackage(null);
    setStep("selectPackage");
  };

  // ==================== HEALTH PACKAGE BOOKING FUNCTIONS ====================

  const addHealthMessage = (content, type = "bot", options = null) => {
    const now = new Date();
    setHealthMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: content,
        sender: type === "bot" ? "ai" : "user",
        time: now.toLocaleTimeString(),
        date: now.toDateString(),
        created_at: now.toISOString(),
        timestamp: now,
        options,
      },
    ]);
  };

  const startHealthPackageConversation = async () => {
    addHealthMessage(
      "Hi 👋, I'll help you book a health package. Please choose from our available packages."
    );
    await fetchHealthPackages();
  };

  const fetchHealthPackages = async () => {
    setHealthIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_LOARDS_URL}/api/v1/health-packages`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      const data = await response.json();

      if (data.success && data.packages) {
        // Filter only active packages
        const activePackages = data.packages.filter((pkg) => pkg.isActive);
        setHealthPackages(activePackages);
        setHealthStep("selectPackage");
      } else {
        throw new Error("Failed to fetch health packages");
      }
    } catch (err) {
      addHealthMessage(
        "❌ Sorry, I couldn't load the health packages. Please refresh the page.",
        "bot"
      );
    } finally {
      setHealthIsLoading(false);
    }
  };

  const handleHealthPackageSelect = async (pkg) => {
    setSelectedHealthPackage(pkg);
    addHealthMessage(pkg.packageName, "user");
    addHealthMessage("Fetching package details...", "bot");

    await fetchHealthPackageDetails(pkg.id);
  };

  const fetchHealthPackageDetails = async (packageId) => {
    setHealthIsLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_LOARDS_URL
        }/api/v1/health-packages/${packageId}`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      const data = await response.json();

      if (data.success && data.package) {
        setHealthPackageDetails(data.package);
        setHealthStep("showDetails");

        // Remove the "Fetching..." message and add details
        setHealthMessages((prev) => prev.slice(0, -1));
        addHealthMessage(
          `Great choice! Here are the details for **${data.package.packageName}**.`,
          "bot"
        );
      } else {
        throw new Error("Failed to fetch package details");
      }
    } catch (err) {
      setHealthMessages((prev) => prev.slice(0, -1));
      addHealthMessage(
        "❌ Sorry, I couldn't load the package details. Please try selecting a package again.",
        "bot"
      );
      setHealthStep("selectPackage");
    } finally {
      setHealthIsLoading(false);
    }
  };

  const handleConfirmHealthPackage = () => {
    // Show SweetAlert confirmation
    Swal.fire({
      title: "Confirm Health Package Purchase",
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
            <strong style="color: #2c3e50;">Package Details</strong>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #495057;">Package:</strong>
            <span style="color: #495057;">${healthPackageDetails.packageName}</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #495057;">Price:</strong>
            <span style="color: #28a745; font-weight: bold;">₹${healthPackageDetails.packagePrice}</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #495057;">Total Services:</strong>
            <span style="color: #495057;">${healthPackageDetails.services.length}</span>
          </div>
          <div style="margin-bottom: 15px;">
            <strong style="color: #495057;">Payment Method:</strong>
            <span style="color: #495057;">Online</span>
          </div>
          <div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; font-size: 13px;">
            ⚠️ You will be charged ₹${healthPackageDetails.packagePrice} upon confirmation.
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Purchase",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#495057",
      width: "500px",
    }).then((result) => {
      if (result.isConfirmed) {
        handlePurchaseHealthPackage();
      }
    });
  };

  const handlePurchaseHealthPackage = async () => {
    setHealthIsLoading(true);

    try {
      const purchaseData = {
        patientId: 95,
        packageId: healthPackageDetails.id,
        paymentMethod: "online",
        transactionId: `TXN${Date.now()}`,
        notes: "Booked via AI Chat",
      };

      const response = await fetch(
        `${
          import.meta.env.VITE_API_LOARDS_URL
        }/api/v1/health-packages/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_TOKEN}`,
          },
          body: JSON.stringify(purchaseData),
        }
      );

      const data = await response.json();

      if (data.success || response.ok) {
        addHealthMessage(
          "✅ Your health package has been successfully booked!",
          "bot"
        );
        setHealthStep("confirmed");

        // Show success alert with services list
        const servicesList = healthPackageDetails.services
          .map(
            (service) =>
              `<li style="text-align: left; margin-bottom: 8px;">
                <strong>${service.serviceName}</strong>
                <br/>
                <small style="color: #495057;">${service.serviceDescription}</small>
              </li>`
          )
          .join("");

        Swal.fire({
          title: "✅ Purchase Successful!",
          html: `
            <div style="text-align: left; padding: 10px;">
              <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: #2c3e50;">Purchase Details</strong>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Package:</strong>
                <span style="color: #495057;">${healthPackageDetails.packageName}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Transaction ID:</strong>
                <span style="color: #495057;">${purchaseData.transactionId}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Payment Method:</strong>
                <span style="color: #495057;">Online</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">Amount Paid:</strong>
                <span style="color: #28a745; font-weight: bold;">₹${healthPackageDetails.packagePrice}</span>
              </div>
              <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
                <strong style="color: #2c3e50;">Services Included:</strong>
              </div>
              <ul style="padding-left: 20px; margin-bottom: 15px;">
                ${servicesList}
              </ul>
              <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; font-size: 13px;">
                ✓ Your health package has been purchased successfully!
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#28a745",
          width: "550px",
        });
      } else {
        throw new Error(data.message || "Purchase failed");
      }
    } catch (err) {
      addHealthMessage(
        `❌ Sorry, there was an error processing your purchase: ${err.message}. Please try again.`,
        "bot"
      );

      Swal.fire({
        title: "Booking Failed",
        text: `Error: ${err.message}. Please try again.`,
        icon: "error",
        confirmButtonText: "Retry",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setHealthIsLoading(false);
    }
  };

  const handleHealthStartOver = () => {
    setHealthMessages([]);
    setHealthPackages([]);
    setSelectedHealthPackage(null);
    setHealthPackageDetails(null);
    setHealthStep("greeting");
    startHealthPackageConversation();
  };

  const handleHealthChangeSelection = () => {
    const recentMessages = healthMessages.slice(0, -2);
    setHealthMessages(recentMessages);
    setSelectedHealthPackage(null);
    setHealthPackageDetails(null);
    setHealthStep("selectPackage");
  };

  // ==================== DIAGNOSTIC BOOKING FUNCTIONS ====================

  const addDiagnosticMessage = (content, type = "bot", options = null) => {
    const now = new Date();
    setDiagnosticMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: content,
        sender: type === "bot" ? "ai" : "user",
        time: now.toLocaleTimeString(),
        date: now.toDateString(),
        created_at: now.toISOString(),
        timestamp: now,
        options,
      },
    ]);
  };

  const startDiagnosticConversation = async () => {
    addDiagnosticMessage(
      "Hi 👋, I'll help you book a diagnostic test. Please choose from our available tests."
    );
    await fetchDiagnosticTests();
  };

  const fetchDiagnosticTests = async () => {
    setDiagnosticIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_LOARDS_URL}/api/v1/diagnostic/tests`
      );
      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        setDiagnosticTests(data.data);
        setDiagnosticStep("selectTest");
      } else {
        throw new Error("Failed to fetch diagnostic tests");
      }
    } catch (err) {
      addDiagnosticMessage(
        "❌ Sorry, I couldn't load the diagnostic tests. Please refresh the page.",
        "bot"
      );
    } finally {
      setDiagnosticIsLoading(false);
    }
  };

  const handleDiagnosticTestSelect = (test) => {
    setSelectedDiagnosticTest(test);
    setDiagnosticTestDetails(test);
    addDiagnosticMessage(test.Test, "user");
    addDiagnosticMessage(
      `Great choice! Here are the details for **${test.Test}**.`,
      "bot"
    );
    setDiagnosticStep("showDetails");
  };

  const handleConfirmDiagnosticBooking = () => {
    // Ask for date selection in chat
    addDiagnosticMessage(
      "Great! Please select your preferred appointment date.",
      "bot"
    );
    setDiagnosticStep("selectDate");
  };

  const handleDateSelect = (date) => {
    setSelectedAppointmentDate(date);
    addDiagnosticMessage(new Date(date).toLocaleDateString(), "user");
    addDiagnosticMessage(
      "Perfect! Now please select your preferred appointment time.",
      "bot"
    );
    setDiagnosticStep("selectTime");
  };

  const handleTimeSelect = (time) => {
    setSelectedAppointmentTime(time);
    addDiagnosticMessage(time, "user");

    // Show final confirmation popup
    Swal.fire({
      title: "Confirm Diagnostic Test Booking",
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
            <strong style="color: #2c3e50;">Test Details</strong>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #495057;">Test Name:</strong>
            <span style="color: #495057;">${diagnosticTestDetails.Test}</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #495057;">Reporting Name:</strong>
            <span style="color: #495057;">${
              diagnosticTestDetails.ReportingName
            }</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #495057;">Price:</strong>
            <span style="color: #28a745; font-weight: bold;">₹${
              diagnosticTestDetails.Rate
            }</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #495057;">Report Delivery:</strong>
            <span style="color: #495057;">${
              diagnosticTestDetails.DeliveryAfter
            } hours</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #495057;">Appointment Date:</strong>
            <span style="color: #495057;">${new Date(
              selectedAppointmentDate
            ).toLocaleDateString()}</span>
          </div>
          <div style="margin-bottom: 15px;">
            <strong style="color: #495057;">Appointment Time:</strong>
            <span style="color: #495057;">${time}</span>
          </div>
          <div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; font-size: 13px;">
            ⚠️ You will be charged ₹${
              diagnosticTestDetails.Rate
            } upon confirmation.
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Booking",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#495057",
      width: "550px",
    }).then((result) => {
      if (result.isConfirmed) {
        handleBookDiagnosticTest(selectedAppointmentDate, time);
      } else {
        // If cancelled, go back to time selection
        setDiagnosticStep("selectTime");
        addDiagnosticMessage(
          "Booking cancelled. Please select a time to continue or change your selection.",
          "bot"
        );
      }
    });
  };

  const handleBookDiagnosticTest = async (appointmentDate, appointmentTime) => {
    setDiagnosticIsLoading(true);

    try {
      // Create FormData instead of JSON
      const formData = new FormData();
      formData.append("name", "John Doe"); // Patient name
      formData.append("email", "john.doe@example.com"); // Patient email
      formData.append("phone", "9876543210"); // Patient phone
      formData.append(
        "testId",
        diagnosticTestDetails.id || diagnosticTestDetails.TestId
      ); // Test ID
      formData.append("patientId", 10); // Patient ID (should come from user context)
      formData.append("appointmentDate", appointmentDate); // Selected date
      formData.append("appointmentTime", `${appointmentTime}:00`); // Selected time with seconds

      console.log("Diagnostic Booking FormData:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_LOARDS_URL}/api/v1/diagnostic/booking`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
          body: formData, // Send FormData instead of JSON
        }
      );

      const data = await response.json();

      console.log("Diagnostic Booking Response:", data);
      console.log("Response Status:", response.status);

      if (data.success) {
        addDiagnosticMessage(
          "✅ Your diagnostic test has been successfully booked!",
          "bot"
        );
        setDiagnosticStep("confirmed");

        // Show success alert
        Swal.fire({
          title: "✅ Booking Confirmed!",
          html: `
            <div style="text-align: left; padding: 10px;">
              <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: #2c3e50;">Booking Details</strong>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Test Name:</strong>
                <span style="color: #495057;">${
                  diagnosticTestDetails.Test
                }</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Reporting Name:</strong>
                <span style="color: #495057;">${
                  diagnosticTestDetails.ReportingName
                }</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Test Code:</strong>
                <span style="color: #495057;">${
                  diagnosticTestDetails.TestCode
                }</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Method:</strong>
                <span style="color: #495057;">${
                  diagnosticTestDetails.Method
                }</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Sample Type:</strong>
                <span style="color: #495057;">${
                  diagnosticTestDetails.SMType
                }</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Report Delivery:</strong>
                <span style="color: #495057;">${
                  diagnosticTestDetails.DeliveryAfter
                } hours</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #495057;">Appointment Date:</strong>
                <span style="color: #495057;">${new Date(
                  appointmentDate
                ).toLocaleDateString()}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">Appointment Time:</strong>
                <span style="color: #495057;">${appointmentTime}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #495057;">Price:</strong>
                <span style="color: #28a745; font-weight: bold;">₹${
                  diagnosticTestDetails.Rate
                }</span>
              </div>
              <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; font-size: 13px;">
                ✓ Your diagnostic test booking has been confirmed successfully!
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "OK",
          showDenyButton: true,
          denyButtonText: "Book Another Test",
          confirmButtonColor: "#28a745",
          denyButtonColor: "#8a2be2",
          width: "550px",
        }).then((result) => {
          if (result.isDenied) {
            handleDiagnosticStartOver();
          }
        });
      } else {
        console.error("Booking failed with response:", data);
        throw new Error(data.message || data.error || "Booking failed");
      }
    } catch (err) {
      console.error("Diagnostic booking error:", err);
      addDiagnosticMessage(
        `❌ Sorry, there was an error creating your booking: ${err.message}. Please try again.`,
        "bot"
      );

      Swal.fire({
        title: "Booking Failed",
        text: `Error: ${err.message}. Please try again.`,
        icon: "error",
        confirmButtonText: "Retry",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setDiagnosticIsLoading(false);
    }
  };

  const handleDiagnosticStartOver = () => {
    setDiagnosticMessages([]);
    setDiagnosticTests([]);
    setSelectedDiagnosticTest(null);
    setDiagnosticTestDetails(null);
    setDiagnosticStep("greeting");
    startDiagnosticConversation();
  };

  const handleDiagnosticChangeSelection = () => {
    const recentMessages = diagnosticMessages.slice(0, -2);
    setDiagnosticMessages(recentMessages);
    setSelectedDiagnosticTest(null);
    setDiagnosticTestDetails(null);
    setDiagnosticStep("selectTest");
  };

  // Mode selection screen
  if (!activeMode) {
    return (
      <div className="main-content">
        <div className="chatting-panel">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "70vh" }}
          >
            <div className="text-center">
              <h4 className="mb-4">
                <i className="fa-light fa-comments me-2"></i>
                How can I help you today?
              </h4>
              <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4 mb-3">
                  <div
                    className="card shadow-sm hover-card h-100 mx-auto"
                    style={{ cursor: "pointer", maxWidth: "280px" }}
                    onClick={() => handleModeSelect("general")}
                  >
                    <div className="card-body text-center p-4">
                      <i
                        className="fa-light fa-robot text-primary mb-3"
                        style={{ fontSize: "3rem" }}
                      ></i>
                      <h5 className="mb-2">General Query Assistance</h5>
                      <p className="text-muted small mb-0">
                        Get instant answers to your questions
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-3">
                  <div
                    className="card shadow-sm hover-card h-100 mx-auto"
                    style={{ cursor: "pointer", maxWidth: "280px" }}
                    onClick={() => handleModeSelect("booking")}
                  >
                    <div className="card-body text-center p-4">
                      <i
                        className="fa-light fa-calendar-check text-success mb-3"
                        style={{ fontSize: "3rem" }}
                      ></i>
                      <h5 className="mb-2">Doctor Appointment Booking</h5>
                      <p className="text-muted small mb-0">
                        Schedule a consultation with a qualified doctor
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row justify-content-center">
                <div className="col-md-4 mb-3">
                  <div
                    className="card shadow-sm hover-card h-100 mx-auto"
                    style={{ cursor: "pointer", maxWidth: "280px" }}
                    onClick={() => handleModeSelect("nurse")}
                  >
                    <div className="card-body text-center p-4">
                      <i
                        className="fa-light fa-user-nurse text-info mb-3"
                        style={{ fontSize: "3rem" }}
                      ></i>
                      <h5 className="mb-2">Nursing Care Booking</h5>
                      <p className="text-muted small mb-0">
                        Book a certified nurse for home care services
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div
                    className="card shadow-sm hover-card h-100 mx-auto"
                    style={{ cursor: "pointer", maxWidth: "280px" }}
                    onClick={() => handleModeSelect("diagnostic")}
                  >
                    <div className="card-body text-center p-4">
                      <i
                        className="fa-light fa-syringe mb-3"
                        style={{ fontSize: "3rem", color: "#8a2be2" }}
                      ></i>
                      <h5 className="mb-2">Diagnostic Test Booking</h5>
                      <p className="text-muted small mb-0">
                        Book lab tests and health checkups
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div
                    className="card shadow-sm hover-card h-100 mx-auto"
                    style={{ cursor: "pointer", maxWidth: "280px" }}
                    onClick={() => handleModeSelect("healthpackage")}
                  >
                    <div className="card-body text-center p-4">
                      <i
                        className="fa-light fa-heart-pulse text-danger mb-3"
                        style={{ fontSize: "3rem" }}
                      ></i>
                      <h5 className="mb-2">Health Package Booking</h5>
                      <p className="text-muted small mb-0">
                        Explore and purchase our range of health packages
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // General Query or AI Booking modes
  if (activeMode === "general" || activeMode === "booking") {
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
  }

  // Health Package Booking mode
  if (activeMode === "healthpackage") {
    return (
      <div className="main-content">
        <div className="chatting-panel">
          <div className="d-flex">
            <AiChatingArea
              conversationType="healthpackage_booking"
              isHealthPackageBooking={true}
              healthPackageState={{
                step: healthStep,
                packages: healthPackages,
                selectedPackage: selectedHealthPackage,
                packageDetails: healthPackageDetails,
                messages: healthMessages,
                isLoading: healthIsLoading,
                handleStartOver: handleHealthStartOver,
                handleChangeSelection: handleHealthChangeSelection,
              }}
              onHealthPackageSelect={handleHealthPackageSelect}
              onConfirmHealthPackage={handleConfirmHealthPackage}
              onBackToSelection={handleBackToSelection}
              activeMode={activeMode}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Diagnostic Booking mode
  if (activeMode === "diagnostic") {
    return (
      <div className="main-content">
        <div className="chatting-panel">
          <div className="d-flex">
            <AiChatingArea
              conversationType="diagnostic_booking"
              isDiagnosticBooking={true}
              diagnosticBookingState={{
                step: diagnosticStep,
                tests: diagnosticTests,
                selectedTest: selectedDiagnosticTest,
                testDetails: diagnosticTestDetails,
                messages: diagnosticMessages,
                isLoading: diagnosticIsLoading,
                handleStartOver: handleDiagnosticStartOver,
                handleChangeSelection: handleDiagnosticChangeSelection,
                selectedAppointmentDate: selectedAppointmentDate,
                selectedAppointmentTime: selectedAppointmentTime,
              }}
              onDiagnosticTestSelect={handleDiagnosticTestSelect}
              onConfirmDiagnosticBooking={handleConfirmDiagnosticBooking}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
              onBackToSelection={handleBackToSelection}
              activeMode={activeMode}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Nurse Booking mode - using built-in chat interface
  return (
    <div className="main-content">
      <div className="chatting-panel">
        <div className="d-flex">
          <AiChatingArea
            conversationType="nurse_booking"
            isNurseBooking={true}
            nurseBookingState={{
              step,
              categories,
              packages,
              selectedCategory,
              selectedPackage,
              messages,
              isLoading,
              handleStartOver,
              handleChangeSelection,
            }}
            onCategorySelect={handleCategorySelect}
            onPackageSelect={handlePackageSelect}
            onConfirmNurseBooking={handleConfirmBooking}
            onBackToSelection={handleBackToSelection}
            activeMode={activeMode}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AiChat;
