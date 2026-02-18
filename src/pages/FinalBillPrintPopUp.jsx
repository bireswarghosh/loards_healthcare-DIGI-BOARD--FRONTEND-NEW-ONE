import React from "react";
import { handlePrint1, handlePrint2 } from "./FinalBillPrintFunc";


// Neutral, modern Radio Component
const ModernRadio = ({
  id,
  label,
  defaultChecked,
  name = "reportOptions",
  printType,
  setPrintType,
}) => (
  <label
    htmlFor={id}
    className="d-flex align-items-center px-3 py-2 mb-2 rounded border transition-all cursor-pointer hover-bg-light"
    style={{
      backgroundColor: "#f8f9fa",
      borderColor: "#dee2e6",
      cursor: "pointer",
      transition: "0.2s ease",
    }}
  >
    <input
      className="form-check-input m-0 me-3 shadow-none"
      type="radio"
      name={name}
      id={id}
      defaultChecked={defaultChecked}
      style={{ cursor: "pointer" }}
      onClick={() => {
        setPrintType(id);
      }}
    />
    <span className="text-secondary fw-medium small">{label}</span>
  </label>
);


// Neutral, modern Checkbox Component
const ModernCheckbox = ({ id, label }) => (
  <label
    className="d-flex align-items-center mb-2 cursor-pointer"
    style={{ cursor: "pointer" }}
  >
    <input
      className="form-check-input m-0 me-2 shadow-none border-secondary-subtle"
      type="checkbox"
      id={id}
    />
    <span className="text-muted small fw-semibold">{label}</span>
  </label>
);


const ModernNeutralModal = ({
  showModal,
  setShowModal,
  printType,
  setPrintType,
  billData1,
  defaultInvoiceData
}) => {
  return (
    <div
      className="modal-overlay d-flex align-items-center justify-content-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 9999, // High z-index to stay on top
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className=" rounded-4 shadow-lg p-4 border-0"
        style={{
          backgroundColor: "#e8e8f3",
          maxWidth: "550px",
          width: "90%",
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        {/* Header Section */}
        <div className="mb-4">
          <h5 className="fw-bold  m-0">Report Selection</h5>
          <p className="text-muted small">
            Choose the document type you wish to generate.
          </p>
        </div>


        <div className="row g-3">
          {/* Left Column */}
          <div className="col-12 col-md-6">
            <ModernRadio
              id="billSummary"
              label="Bill Summary"
              printType={printType}
              setPrintType={setPrintType}
            />
            <ModernRadio
              id="patientCopy"
              label="Patient Copy"
              printType={printType}
              setPrintType={setPrintType}
            />
            <ModernRadio
              id="diagnosticDetail"
              label="Diagnostic Detail"
              printType={printType}
              setPrintType={setPrintType}
            />
            <ModernRadio
              id="otBillDetail"
              label="OT Bill Detail"
              printType={printType}
              setPrintType={setPrintType}
            />
            <ModernRadio
              id="medicineDetail"
              label="Medicine Detail"
              printType={printType}
              setPrintType={setPrintType}
            />
            <ModernRadio
              id="doctorVisit"
              label="Doctor Visit"
              printType={printType}
              setPrintType={setPrintType}
            />
          </div>


          {/* Right Column */}
          <div className="col-12 col-md-6">
            <ModernRadio
              id="indoorCopy"
              label="Indoor Copy"
              printType={printType}
              setPrintType={setPrintType}
            />
            <ModernRadio
              id="approvalCopy"
              label="Approval Copy"
              printType={printType}
              setPrintType={setPrintType}
            />
            <ModernRadio
              id="othersCopy"
              label="Others Copy"
              printType={printType}
              setPrintType={setPrintType}
            />
            <ModernRadio
              id="extraCharges"
              label="Extra Charges"
              printType={printType}
              setPrintType={setPrintType}
            />
            <ModernRadio
              id="packagePpn"
              label="Package PPN"
              printType={printType}
              setPrintType={setPrintType}
            />
            <ModernRadio
              id="nonPayable"
              label="Non Payable Item"
              printType={printType}
              setPrintType={setPrintType}
            />
          </div>
        </div>


        <hr className="my-4 text-secondary opacity-25" />


        {/* Footer: Checkboxes and Actions */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex gap-4">
            <ModernCheckbox id="showSrvChg" label="Show Service Chg" />
            <ModernCheckbox id="packageDetail" label="Package Details" />
          </div>


          <div className="d-flex gap-2">
            <button
              className="btn btn-light text-secondary fw-bold px-4 py-2 border-0"
              type="button"
              style={{ fontSize: "0.85rem" }}
              onClick={() => {
                setShowModal((prev) => !prev);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary fw-bold px-4 py-2 shadow-sm"
              type="button"
              style={{ fontSize: "0.85rem", borderRadius: "8px" }}
              onClick={() => {
                switch (printType) {
                  case "billSummary":
                    handlePrint1(billData1);
                    break;
                  case "diagnosticDetail":
                    // handlePrint2(defaultInvoiceData);
                    break;
                  default:
                    console.log("wrong choice");
                }
                setShowModal(false);
              }}
            >
              Show Report
            </button>
          </div>
        </div>
      </div>


      <style>{`
        .hover-bg-light:hover {
          background-color: #f1f3f5 !important;
          border-color: #adb5bd !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};


export default ModernNeutralModal;



