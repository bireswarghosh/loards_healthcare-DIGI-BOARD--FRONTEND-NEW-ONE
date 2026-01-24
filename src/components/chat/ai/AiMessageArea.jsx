import React, { useEffect, useRef, useState, useMemo } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

// Small helper: format bytes
function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

const FilePreview = ({ file }) => {
  const [url, setUrl] = useState(null);
  const [text, setText] = useState(null);

  useEffect(() => {
    let mounted = true;
    let obj = null;
    setText(null);
    if (!file) return;

    // If file has a url property (from database), use it directly
    if (file.url) {
      setUrl(file.url);
      return;
    }

    // Otherwise, handle as File object
    if (file.type && file.type.startsWith("image/")) {
      obj = URL.createObjectURL(file);
      if (mounted) setUrl(obj);
    } else if (
      file.type === "application/pdf" ||
      (file.name && file.name.toLowerCase().endsWith(".pdf"))
    ) {
      obj = URL.createObjectURL(file);
      if (mounted) setUrl(obj);
    } else if (
      (file.type && file.type.startsWith("text/")) ||
      (file.name &&
        file.name.match(
          /\.(txt|md|json|js|jsx|ts|tsx|py|java|c|cpp|h|css|html|xml|yaml|yml)$/i
        ))
    ) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (!mounted) return;
        const txt = String(ev.target.result || "");
        setText(txt.slice(0, 3000));
      };
      reader.onerror = () => setText(null);
      reader.readAsText(file);
    } else {
      obj = URL.createObjectURL(file);
      if (mounted) setUrl(obj);
    }

    return () => {
      mounted = false;
      if (obj) URL.revokeObjectURL(obj);
    };
  }, [file]);

  if (!file) return null;

  // image preview
  if (file.type && file.type.startsWith("image/")) {
    return (
      <img
        src={url}
        alt={file.name}
        style={{ maxWidth: 260, maxHeight: 260 }}
      />
    );
  }

  // pdf preview via embed
  if (
    file.type === "application/pdf" ||
    (file.name && file.name.toLowerCase().endsWith(".pdf"))
  ) {
    return <embed src={url} type="application/pdf" width="260" height="300" />;
  }

  // text preview - only for File objects, not URLs
  if (text) {
    return (
      <div style={{ maxWidth: 420, maxHeight: 300, overflow: "auto" }}>
        <strong>{file.name}</strong>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{text}</pre>
      </div>
    );
  }

  // generic file card with download
  return (
    <div className="d-flex align-items-center">
      <div style={{ marginRight: 12 }}>
        <i className="fa-regular fa-file" style={{ fontSize: 32 }}></i>
      </div>
      <div>
        <div>
          <strong>{file.name}</strong>
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          {file.type || "Unknown type"} • {formatBytes(file.size)}
        </div>
        {url && (
          <div style={{ marginTop: 8 }}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary"
            >
              <i className="fa-solid fa-download me-1"></i>Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const AiMessageArea = ({
  messages,
  loading,
  isAppointmentChat,
  isNurseBooking,
  nurseBookingState,
  onCategorySelect,
  onPackageSelect,
  onConfirmNurseBooking,
  isHealthPackageBooking,
  healthPackageState,
  onHealthPackageSelect,
  onConfirmHealthPackage,
  isDiagnosticBooking,
  diagnosticBookingState,
  onDiagnosticTestSelect,
  onConfirmDiagnosticBooking,
  onDateSelect,
  onTimeSelect,
  onSendSelection,
  bookingData,
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = msg.date || new Date().toDateString(); // Fallback
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);
  return (
    <div className="panel-body msg-area w-100 flex-grow-1">
      <OverlayScrollbarsComponent
        className="main-menu w-100 h-80"
        options={{
          className: "os-theme-light msg-scrollbar",
          scrollbars: {
            visibility: "auto",
            autoHide: "scroll",
          },
        }}
      >
        <div className="scrollable" ref={scrollRef}>
          <div
            className="main-chat-area d-flex flex-column w-100 h-80"
            style={{ paddingBottom: "100px" }}
          >
            {messages.length === 0 && isAppointmentChat && (
              <div className="single-message">
                <div className="avatar">
                  <img src="assets/images/avatar-2.png" alt="AI" />
                </div>
                <div className="msg-box">
                  <div className="msg-box-inner">
                    <div className="msg-option">
                      <span className="msg-time">
                        {new Date().toLocaleTimeString()}
                      </span>
                      <button className="btn-flush">
                        <i className="fa-light fa-ellipsis-vertical"></i>
                      </button>
                    </div>
                    <p>Hi, tell me your problem in brief</p>
                  </div>
                </div>
              </div>
            )}
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <React.Fragment key={date}>
                <div className="day-divider">
                  <span>{formatDate(date)}</span>
                </div>
                {dateMessages.map((message, index) => (
                  <div
                    key={`${date}-${index}`}
                    className={`single-message ${
                      message.sender === "user" ? "outgoing" : ""
                    }`}
                  >
                    {message.sender === "ai" && (
                      <div className="avatar">
                        <img src="assets/images/avatar-2.png" alt="AI" />
                      </div>
                    )}
                    <div className="msg-box">
                      <div className="msg-box-inner">
                        <div className="msg-option">
                          <span className="msg-time">{message.time}</span>
                          <button className="btn-flush">
                            <i className="fa-light fa-ellipsis-vertical"></i>
                          </button>
                        </div>
                        {message.sender === "user" && (
                          <span className="sent-status seen" title="seen">
                            <i className="fa-solid fa-circle-check"></i>
                          </span>
                        )}
                        {isAppointmentChat && message.sender === "ai" ? (
                          <FormattedMessage
                            text={message.text}
                            onSendSelection={onSendSelection}
                          />
                        ) : isNurseBooking && message.sender === "ai" ? (
                          <p
                            dangerouslySetInnerHTML={{
                              __html: message.text.replace(
                                /\*\*(.*?)\*\*/g,
                                "<strong>$1</strong>"
                              ),
                            }}
                          />
                        ) : isHealthPackageBooking &&
                          message.sender === "ai" ? (
                          <p
                            dangerouslySetInnerHTML={{
                              __html: message.text.replace(
                                /\*\*(.*?)\*\*/g,
                                "<strong>$1</strong>"
                              ),
                            }}
                          />
                        ) : (
                          <p>{message.text}</p>
                        )}
                        {message.file && (
                          <div className="file-attachment mt-2">
                            <FilePreview file={message.file} />
                          </div>
                        )}
                      </div>
                    </div>
                    {message.sender === "user" && (
                      <div className="avatar">
                        <img src="assets/images/admin.png" alt="User" />
                      </div>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
            {loading && (
              <div className="single-message">
                <div className="avatar">
                  <img src="assets/images/avatar-2.png" alt="AI" />
                </div>
                <div className="msg-box">
                  <div className="msg-box-inner">
                    <p>Typing...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nurse Booking UI */}
            {isNurseBooking && nurseBookingState && (
              <div className="nurse-booking-interface">
                {/* Categories selection */}
                {nurseBookingState.step === "selectCategory" &&
                  nurseBookingState.categories.length > 0 && (
                    <div className="single-message">
                      <div className="msg-box">
                        <div className="msg-box-inner">
                          <div className="row g-3 mt-2">
                            {nurseBookingState.categories.map((cat) => (
                              <div key={cat.id} className="col-md-6">
                                <div
                                  className="card shadow-sm"
                                  onClick={() => onCategorySelect(cat)}
                                  style={{
                                    cursor: "pointer",
                                    transition: "all 0.3s",
                                    border: "1px solid black",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform =
                                      "translateY(-2px)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform =
                                      "translateY(0)")
                                  }
                                >
                                  <div className="card-body p-3">
                                    <div className="d-flex align-items-center">
                                      {/* {cat.logo && (
                                      <div className="flex-shrink-0 me-3">
                                        <img
                                          src={cat.logo}
                                          alt={cat.name}
                                          style={{ width: "45px", height: "45px", objectFit: "cover" }}
                                          className="rounded"
                                        />
                                      </div>
                                    )} */}
                                      <div className="flex-grow-1">
                                        <h6 className="text-black">
                                          <i className="fa-light fa-notes-medical me-2"></i>
                                          {cat.name}
                                        </h6>
                                      </div>
                                      <div className="flex-shrink-0">
                                        <i className="fa-light fa-chevron-right text-primary"></i>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Packages selection */}
                {nurseBookingState.step === "selectPackage" &&
                  nurseBookingState.packages.length > 0 && (
                    <div className="single-message">
                      <div className="msg-box">
                        <div className="msg-box-inner">
                          <div className="row g-3 mt-2">
                            {nurseBookingState.packages.map((pkg) => (
                              <div key={pkg.id} className="col-md-6">
                                <div
                                  className="card border-success shadow-sm"
                                  onClick={() => onPackageSelect(pkg)}
                                  style={{
                                    cursor: "pointer",
                                    transition: "all 0.3s",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform =
                                      "translateY(-2px)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform =
                                      "translateY(0)")
                                  }
                                >
                                  <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <h6 className="mb-0 text-success">
                                        <i className="fa-light fa-box-check me-2"></i>
                                        {pkg.package_name}
                                      </h6>
                                      <span className="badge bg-success">
                                        {pkg.duration}h
                                      </span>
                                    </div>
                                    {pkg.description && (
                                      <p className="text-muted small mb-2">
                                        {pkg.description}
                                      </p>
                                    )}
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span className="fw-bold text-success fs-5">
                                        ₹{pkg.price}
                                      </span>
                                      <i className="fa-light fa-chevron-right text-success"></i>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Package selected - Show summary and confirm */}
                {nurseBookingState.step === "summary" &&
                  nurseBookingState.selectedPackage && (
                    <div className="single-message">
                      <div className="msg-box">
                        <div className="msg-box-inner">
                          <div className="card border-0 shadow">
                            <div className="card-header bg-primary text-white">
                              <h6 className="mb-0">
                                <i className="fa-light fa-clipboard-list me-2"></i>
                                Booking Summary
                              </h6>
                            </div>
                            <div className="card-body">
                              <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                  <div className="d-flex align-items-start">
                                    <i className="fa-light fa-folder-tree me-2 text-primary mt-1"></i>
                                    <div>
                                      <small className="text-muted d-block">
                                        Category
                                      </small>
                                      <strong className="text-dark">
                                        {
                                          nurseBookingState.selectedCategory
                                            ?.name
                                        }
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-start">
                                    <i className="fa-light fa-box me-2 text-success mt-1"></i>
                                    <div>
                                      <small className="text-muted d-block">
                                        Package
                                      </small>
                                      <strong className="text-dark">
                                        {
                                          nurseBookingState.selectedPackage
                                            .package_name
                                        }
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-start">
                                    <i className="fa-light fa-clock me-2 text-info mt-1"></i>
                                    <div>
                                      <small className="text-muted d-block">
                                        Duration
                                      </small>
                                      <strong className="text-dark">
                                        {
                                          nurseBookingState.selectedPackage
                                            .duration
                                        }{" "}
                                        hours
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-start">
                                    <i className="fa-light fa-indian-rupee-sign me-2 text-warning mt-1"></i>
                                    <div>
                                      <small className="text-muted d-block">
                                        Total Price
                                      </small>
                                      <strong className="text-success fs-5">
                                        ₹
                                        {
                                          nurseBookingState.selectedPackage
                                            .price
                                        }
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="d-flex gap-2 pt-3 border-top">
                                <button
                                  className="btn btn-success flex-grow-1"
                                  onClick={onConfirmNurseBooking}
                                  disabled={nurseBookingState.isLoading}
                                >
                                  {nurseBookingState.isLoading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fa-light fa-check-circle me-2"></i>
                                      Confirm Booking
                                    </>
                                  )}
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={
                                    nurseBookingState.handleChangeSelection
                                  }
                                  disabled={nurseBookingState.isLoading}
                                >
                                  <i className="fa-light fa-undo me-1"></i>
                                  Change
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Confirmed state with actions */}
            {isNurseBooking &&
              nurseBookingState &&
              nurseBookingState.step === "confirmed" && (
                <div className="single-message">
                  <div className="msg-box">
                    <div className="msg-box-inner">
                      <div className="card border-0 shadow-lg text-center">
                        <div className="card-body py-4">
                          <div className="mb-3">
                            <i
                              className="fa-light fa-circle-check text-success"
                              style={{ fontSize: "3.5rem" }}
                            ></i>
                          </div>
                          <h5 className="text-success mb-2">
                            Booking Confirmed!
                          </h5>
                          <p className="text-muted mb-4">
                            Your nurse booking has been successfully processed.
                          </p>
                          <button
                            className="btn btn-primary"
                            onClick={nurseBookingState.handleStartOver}
                          >
                            <i className="fa-light fa-calendar-plus me-2"></i>
                            Book Another
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Health Package Booking UI */}
            {isHealthPackageBooking && healthPackageState && (
              <div className="health-package-booking-interface">
                {/* Packages selection */}
                {healthPackageState.step === "selectPackage" &&
                  healthPackageState.packages.length > 0 && (
                    <div className="single-message">
                      <div className="msg-box">
                        <div className="msg-box-inner">
                          <div className="row g-3 mt-2">
                            {healthPackageState.packages.map((pkg) => (
                              <div key={pkg.id} className="col-md-6">
                                <div
                                  className="card shadow-sm"
                                  onClick={() => onHealthPackageSelect(pkg)}
                                  style={{
                                    cursor: "pointer",
                                    transition: "all 0.3s",
                                    border: "1px solid #dc3545",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform =
                                      "translateY(-2px)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform =
                                      "translateY(0)")
                                  }
                                >
                                  <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <h6 className="mb-0 text-danger">
                                        <i className="fa-light fa-heart-pulse me-2"></i>
                                        {pkg.packageName}
                                      </h6>
                                      <span className="badge bg-danger">
                                        {pkg.services?.length || 0} services
                                      </span>
                                    </div>
                                    {pkg.packageDescription && (
                                      <p className="text-muted small mb-2">
                                        {pkg.packageDescription}
                                      </p>
                                    )}
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span className="fw-bold text-danger fs-5">
                                        ₹{pkg.packagePrice}
                                      </span>
                                      <button className="btn btn-sm btn-danger">
                                        View Details
                                        <i className="fa-light fa-chevron-right ms-2"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Package Details */}
                {healthPackageState.step === "showDetails" &&
                  healthPackageState.packageDetails && (
                    <div className="single-message">
                      <div className="msg-box">
                        <div className="msg-box-inner">
                          <div className="card border-0 shadow">
                            <div className="card-header bg-danger text-white">
                              <h6 className="mb-0">
                                <i className="fa-light fa-clipboard-list me-2"></i>
                                Package Details
                              </h6>
                            </div>
                            <div className="card-body">
                              <div className="mb-3">
                                <h5 className="text-danger mb-1">
                                  {
                                    healthPackageState.packageDetails
                                      .packageName
                                  }
                                </h5>
                                {healthPackageState.packageDetails
                                  .packageDescription && (
                                  <p className="text-muted">
                                    {
                                      healthPackageState.packageDetails
                                        .packageDescription
                                    }
                                  </p>
                                )}
                              </div>

                              <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                  <div className="d-flex align-items-start">
                                    <i className="fa-light fa-indian-rupee-sign me-2 text-danger mt-1"></i>
                                    <div>
                                      <small className="text-muted d-block">
                                        Price
                                      </small>
                                      <strong className="text-danger fs-5">
                                        ₹
                                        {
                                          healthPackageState.packageDetails
                                            .packagePrice
                                        }
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-start">
                                    <i className="fa-light fa-list-check me-2 text-info mt-1"></i>
                                    <div>
                                      <small className="text-muted d-block">
                                        Services Included
                                      </small>
                                      <strong className="text-dark">
                                        {healthPackageState.packageDetails
                                          .services?.length || 0}{" "}
                                        services
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Services List */}
                              {healthPackageState.packageDetails.services &&
                                healthPackageState.packageDetails.services
                                  .length > 0 && (
                                  <div className="mb-3">
                                    <div className="bg-light p-3 rounded">
                                      <h6 className="text-dark mb-3">
                                        <i className="fa-light fa-notes-medical me-2"></i>
                                        Services Included:
                                      </h6>
                                      <ul className="list-unstyled mb-0">
                                        {healthPackageState.packageDetails.services.map(
                                          (service) => (
                                            <li
                                              key={service.id}
                                              className="mb-2 ps-3"
                                            >
                                              <div className="d-flex">
                                                <i className="fa-light fa-check-circle text-success me-2 mt-1"></i>
                                                <div>
                                                  <strong className="text-dark d-block">
                                                    {service.serviceName}
                                                  </strong>
                                                  {service.serviceDescription && (
                                                    <small className="text-muted">
                                                      {
                                                        service.serviceDescription
                                                      }
                                                    </small>
                                                  )}
                                                </div>
                                              </div>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                              <div className="d-flex gap-2 pt-3 border-top">
                                <button
                                  className="btn btn-danger flex-grow-1"
                                  onClick={onConfirmHealthPackage}
                                  disabled={healthPackageState.isLoading}
                                >
                                  {healthPackageState.isLoading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fa-light fa-check-circle me-2"></i>
                                      Confirm Purchase
                                    </>
                                  )}
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={
                                    healthPackageState.handleChangeSelection
                                  }
                                  disabled={healthPackageState.isLoading}
                                >
                                  <i className="fa-light fa-undo me-1"></i>
                                  Change
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Confirmed state */}
                {healthPackageState.step === "confirmed" && (
                  <div className="single-message">
                    <div className="msg-box">
                      <div className="msg-box-inner">
                        <div className="card border-0 shadow-lg text-center">
                          <div className="card-body py-4">
                            <div className="mb-3">
                              <i
                                className="fa-light fa-circle-check text-success"
                                style={{ fontSize: "3.5rem" }}
                              ></i>
                            </div>
                            <h5 className="text-success mb-2">
                              Purchase Successful!
                            </h5>
                            <p className="text-muted mb-4">
                              Your health package has been successfully
                              purchased.
                            </p>
                            <button
                              className="btn btn-primary"
                              onClick={healthPackageState.handleStartOver}
                            >
                              <i className="fa-light fa-heart-pulse me-2"></i>
                              Purchase Another
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Diagnostic Booking UI */}
            {isDiagnosticBooking && diagnosticBookingState && (
              <div className="diagnostic-booking-interface">
                {/* Diagnostic Tests selection */}
                {diagnosticBookingState.step === "selectTest" &&
                  diagnosticBookingState.tests.length > 0 && (
                    <div className="single-message">
                      <div className="msg-box">
                        <div className="msg-box-inner">
                          <div className="row g-3 mt-2">
                            {diagnosticBookingState.tests.map((test) => (
                              <div key={test.TestId} className="col-md-6">
                                <div
                                  className="card shadow-sm"
                                  onClick={() => onDiagnosticTestSelect(test)}
                                  style={{
                                    cursor: "pointer",
                                    transition: "all 0.3s",
                                    border: "2px solid #8a2be2",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform =
                                      "translateY(-2px)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform =
                                      "translateY(0)")
                                  }
                                >
                                  <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <h6
                                        className="mb-0"
                                        style={{ color: "#8a2be2" }}
                                      >
                                        <i className="fa-light fa-syringe me-2"></i>
                                        {test.Test}
                                      </h6>
                                      <span
                                        className="badge"
                                        style={{
                                          backgroundColor: "#8a2be2",
                                          color: "white",
                                        }}
                                      >
                                        {test.DeliveryAfter}h delivery
                                      </span>
                                    </div>
                                    {test.Introduction && (
                                      <p
                                        className="text-muted small mb-2"
                                        style={{
                                          display: "-webkit-box",
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: "vertical",
                                          overflow: "hidden",
                                        }}
                                      >
                                        {test.Introduction}
                                      </p>
                                    )}
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span
                                        className="fw-bold fs-5"
                                        style={{ color: "#8a2be2" }}
                                      >
                                        ₹{test.Rate}
                                      </span>
                                      <button
                                        className="btn btn-sm"
                                        style={{
                                          backgroundColor: "#8a2be2",
                                          color: "white",
                                          border: "none",
                                        }}
                                      >
                                        View Test Details
                                        <i className="fa-light fa-chevron-right ms-2"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Test Details */}
                {diagnosticBookingState.step === "showDetails" &&
                  diagnosticBookingState.testDetails && (
                    <div className="single-message">
                      <div className="msg-box">
                        <div className="msg-box-inner">
                          <div className="card border-0 shadow">
                            <div
                              className="card-header text-white"
                              style={{ backgroundColor: "#8a2be2" }}
                            >
                              <h6 className="mb-0">
                                <i className="fa-light fa-syringe me-2"></i>
                                Test Details
                              </h6>
                            </div>
                            <div className="card-body">
                              <div className="mb-3">
                                <h5
                                  className="mb-1"
                                  style={{ color: "#8a2be2" }}
                                >
                                  {diagnosticBookingState.testDetails.Test}
                                </h5>
                                <p className="text-muted mb-2">
                                  <strong>Reporting Name:</strong>{" "}
                                  {
                                    diagnosticBookingState.testDetails
                                      .ReportingName
                                  }
                                </p>
                                {diagnosticBookingState.testDetails
                                  .Introduction && (
                                  <p className="text-muted">
                                    {
                                      diagnosticBookingState.testDetails
                                        .Introduction
                                    }
                                  </p>
                                )}
                              </div>

                              <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                  <div className="d-flex align-items-start">
                                    <i
                                      className="fa-light fa-indian-rupee-sign me-2 mt-1"
                                      style={{ color: "#8a2be2" }}
                                    ></i>
                                    <div>
                                      <small className="text-muted d-block">
                                        Price
                                      </small>
                                      <strong
                                        className="fs-5"
                                        style={{ color: "#8a2be2" }}
                                      >
                                        ₹
                                        {
                                          diagnosticBookingState.testDetails
                                            .Rate
                                        }
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-start">
                                    <i className="fa-light fa-clock me-2 text-info mt-1"></i>
                                    <div>
                                      <small className="text-muted d-block">
                                        Report Delivery
                                      </small>
                                      <strong className="text-dark">
                                        {
                                          diagnosticBookingState.testDetails
                                            .DeliveryAfter
                                        }{" "}
                                        hours
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Information */}
                              <div className="mb-3">
                                <div className="bg-light p-3 rounded">
                                  <h6 className="text-dark mb-3">
                                    <i className="fa-light fa-info-circle me-2"></i>
                                    Additional Information:
                                  </h6>
                                  <div className="row g-2">
                                    {diagnosticBookingState.testDetails
                                      .Method && (
                                      <div className="col-12">
                                        <div className="d-flex">
                                          <strong
                                            className="text-muted me-2"
                                            style={{ minWidth: "120px" }}
                                          >
                                            Method:
                                          </strong>
                                          <span className="text-dark">
                                            {
                                              diagnosticBookingState.testDetails
                                                .Method
                                            }
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {diagnosticBookingState.testDetails
                                      .SMType && (
                                      <div className="col-12">
                                        <div className="d-flex">
                                          <strong
                                            className="text-muted me-2"
                                            style={{ minWidth: "120px" }}
                                          >
                                            Sample Type:
                                          </strong>
                                          <span className="text-dark">
                                            {
                                              diagnosticBookingState.testDetails
                                                .SMType
                                            }
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {diagnosticBookingState.testDetails
                                      .TestCode && (
                                      <div className="col-12">
                                        <div className="d-flex">
                                          <strong
                                            className="text-muted me-2"
                                            style={{ minWidth: "120px" }}
                                          >
                                            Test Code:
                                          </strong>
                                          <span className="text-dark">
                                            {
                                              diagnosticBookingState.testDetails
                                                .TestCode
                                            }
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {diagnosticBookingState.testDetails
                                      .Interpretation && (
                                      <div className="col-12">
                                        <div className="d-flex">
                                          <strong
                                            className="text-muted me-2"
                                            style={{ minWidth: "120px" }}
                                          >
                                            Interpretation:
                                          </strong>
                                          <span className="text-dark">
                                            {
                                              diagnosticBookingState.testDetails
                                                .Interpretation
                                            }
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="d-flex gap-2 pt-3 border-top">
                                <button
                                  className="btn flex-grow-1"
                                  style={{
                                    backgroundColor: "#8a2be2",
                                    color: "white",
                                    border: "none",
                                  }}
                                  onClick={onConfirmDiagnosticBooking}
                                  disabled={diagnosticBookingState.isLoading}
                                >
                                  {diagnosticBookingState.isLoading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fa-light fa-calendar-check me-2"></i>
                                      Book This Test
                                    </>
                                  )}
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={
                                    diagnosticBookingState.handleChangeSelection
                                  }
                                  disabled={diagnosticBookingState.isLoading}
                                >
                                  <i className="fa-light fa-undo me-1"></i>
                                  Change Test
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Date Selection */}
                {diagnosticBookingState.step === "selectDate" && (
                  <div className="single-message">
                    <div className="msg-box">
                      <div className="msg-box-inner">
                        <div className="card border-0 shadow">
                          <div
                            className="card-header text-white"
                            style={{ backgroundColor: "#8a2be2" }}
                          >
                            <h6 className="mb-0">
                              <i className="fa-light fa-calendar me-2"></i>
                              Select Appointment Date
                            </h6>
                          </div>
                          <div className="card-body">
                            <p className="text-muted mb-3">
                              Please choose your preferred date for the
                              diagnostic test
                            </p>
                            <input
                              type="date"
                              className="form-control"
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) =>
                                onDateSelect && onDateSelect(e.target.value)
                              }
                              style={{ fontSize: "16px", padding: "10px" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Selection */}
                {diagnosticBookingState.step === "selectTime" && (
                  <div className="single-message">
                    <div className="msg-box">
                      <div className="msg-box-inner">
                        <div className="card border-0 shadow">
                          <div
                            className="card-header text-white"
                            style={{ backgroundColor: "#8a2be2" }}
                          >
                            <h6 className="mb-0">
                              <i className="fa-light fa-clock me-2"></i>
                              Select Appointment Time
                            </h6>
                          </div>
                          <div className="card-body">
                            <p className="text-muted mb-2">
                              <strong>Selected Date:</strong>{" "}
                              {new Date(
                                diagnosticBookingState.selectedAppointmentDate
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-muted mb-3">
                              Please choose your preferred time for the
                              appointment
                            </p>
                            <input
                              type="time"
                              className="form-control"
                              onChange={(e) =>
                                onTimeSelect && onTimeSelect(e.target.value)
                              }
                              style={{ fontSize: "16px", padding: "10px" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirmed state */}
                {diagnosticBookingState.step === "confirmed" && (
                  <div className="single-message">
                    <div className="msg-box">
                      <div className="msg-box-inner">
                        <div className="card border-0 shadow-lg text-center">
                          <div className="card-body py-4">
                            <div className="mb-3">
                              <i
                                className="fa-light fa-circle-check text-success"
                                style={{ fontSize: "3.5rem" }}
                              ></i>
                            </div>
                            <h5 className="text-success mb-2">
                              Booking Confirmed!
                            </h5>
                            <p className="text-muted mb-4">
                              Your diagnostic test has been successfully booked.
                            </p>
                            <button
                              className="btn"
                              style={{
                                backgroundColor: "#8a2be2",
                                color: "white",
                                border: "none",
                              }}
                              onClick={diagnosticBookingState.handleStartOver}
                            >
                              <i className="fa-light fa-syringe me-2"></i>
                              Book Another Test
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
};

const FormattedMessage = ({ text, onSendSelection }) => {
  const lines = text.split("\n");
  const formatted = [];

  // Determine selection type from message context
  const lowerText = text.toLowerCase();
  let selectionType = null;

  if (
    lowerText.includes("choose a doctor") ||
    lowerText.includes("please choose a doctor") ||
    lowerText.includes("select a doctor") ||
    lowerText.includes("available doctors") ||
    lowerText.includes("recommended doctors")
  ) {
    selectionType = "doctor";
  } else if (
    lowerText.includes("choose a time slot") ||
    lowerText.includes("please choose a time slot") ||
    lowerText.includes("select a time") ||
    lowerText.includes("available slots")
  ) {
    selectionType = "slot";
  } else if (
    lowerText.includes("choose appointment type") ||
    lowerText.includes("please choose appointment type") ||
    lowerText.includes("select appointment type") ||
    lowerText.includes("appointment type")
  ) {
    selectionType = "type";
  } else if (
    lowerText.includes("ambulance") ||
    lowerText.includes("need ambulance") ||
    lowerText.includes("ambulance pickup")
  ) {
    selectionType = "ambulance";
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    // Match numbered options: "1. ", "1) ", or "1."
    const numberMatch = trimmed.match(/^(\d+)[\.\)]\s*(.+)$/);

    if (numberMatch && selectionType) {
      const num = parseInt(numberMatch[1]);
      const content = numberMatch[2];

      // Create structured selection message
      const selectionMessage = `SELECTION:${selectionType}:${num}:${content}`;

      // Style buttons based on selection type
      let buttonClass = "btn btn-sm btn-primary me-2 mb-2";
      let icon = "";

      if (selectionType === "doctor") {
        buttonClass = "btn btn-sm btn-outline-primary me-2 mb-2 text-start";
        icon = "👨‍⚕️ ";
      } else if (selectionType === "slot") {
        buttonClass = "btn btn-sm btn-outline-success me-2 mb-2";
        icon = "🕐 ";
      } else if (selectionType === "type") {
        buttonClass = "btn btn-sm btn-outline-info me-2 mb-2";
        icon = content.toLowerCase().includes("online") ? "💻 " : "🏥 ";
      } else if (selectionType === "ambulance") {
        buttonClass = "btn btn-sm btn-outline-warning me-2 mb-2";
        icon = content.toLowerCase().includes("yes") ? "🚑 " : "❌ ";
      }

      formatted.push(
        <button
          key={index}
          className={buttonClass}
          style={{
            minWidth: selectionType === "doctor" ? "280px" : "150px",
            textAlign: selectionType === "doctor" ? "left" : "center",
          }}
          onClick={() => {
            onSendSelection(selectionMessage, null);
          }}
        >
          {icon}
          {selectionType === "doctor" ? (
            <span>{content}</span>
          ) : (
            <span>
              <strong>{num}.</strong> {content}
            </span>
          )}
        </button>
      );
      return;
    }

    // Regular text line - render with markdown-like formatting
    if (line.trim()) {
      // Check for headers (lines ending with :)
      if (line.trim().endsWith(":") && !line.includes("Dr.")) {
        formatted.push(
          <p key={index} className="mb-2 mt-3 fw-bold text-primary">
            {line}
          </p>
        );
      }
      // Check for bullet points
      else if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
        formatted.push(
          <p key={index} className="mb-1 ms-3">
            {line}
          </p>
        );
      }
      // Check for confirmation messages
      else if (line.includes("✅") || line.includes("CONFIRMED")) {
        formatted.push(
          <p key={index} className="mb-2 text-success fw-bold">
            {line}
          </p>
        );
      }
      // Regular text
      else {
        formatted.push(
          <p key={index} className="mb-1">
            {line}
          </p>
        );
      }
    }
  });

  return <div>{formatted}</div>;
};

export default AiMessageArea;
