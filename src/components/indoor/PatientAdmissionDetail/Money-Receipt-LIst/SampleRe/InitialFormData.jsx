import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Barcode from "react-barcode";
import axiosInstance from "../../../../../axiosInstance";

function InitialFormData() {
  const { id } = useParams();
  // console.log("id is ", id)
  const navigate = useNavigate();
  const [mode, setMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get("mode");
    if (id) {
      return modeParam || "view";
    }
    return "create";
  });
  const [loading, setLoading] = useState(false);

  // State for form fields
  const [receiptData, setReceiptData] = useState({
    MoneyreeciptId: "",
    MoneyreeciptNo: "",
    RefferenceId: "",
    ReceiptType: 0,
    ReceiptDate: new Date().toISOString().split("T")[0],
    PaymentType: "Old Data Not Found",
    Amount: "Old Data Not Found",
    Bank: "Old Data Not Found",
    Cheque: "Old Data Not Found",
    ChqDate: "Old Data Not Found",
    ClearDate: "Old Data Not Found",
    Narration: "Old Data Not Found",
    UserId: 37,
    SlipNo: "Old Data Not Found",
    TDS: "Old Data Not Found",
    PaidBy: "Old Data Not Found",
    Remarks: "Old Data Not Found",
    ReceiptTime: "",
    PrintDate: "",
    admission: null,
  });

  useEffect(() => {
    if (id) {
      fetchReceipt();
    }
  }, [id]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const decodedId = decodeURIComponent(id);
      const response = await axiosInstance.get(`/moneyreceipt/${decodedId}`);
      if (response.data.success) {
        const apiData = response.data.data;
        setReceiptData({
          ...apiData,
          ReceiptDate: apiData.ReceiptDate
            ? apiData.ReceiptDate.substring(0, 10)
            : "",
          ChqDate: apiData.ChqDate ? apiData.ChqDate.substring(0, 10) : "",
          ClearDate: apiData.ClearDate
            ? apiData.ClearDate.substring(0, 10)
            : "",
          PrintDate: apiData.PrintDate
            ? apiData.PrintDate.substring(0, 10)
            : "",
          ReceiptTime: apiData.ReceiptTime || "",
        });
      }
    } catch (error) {
      console.error("Error fetching receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response =
        mode === "create"
          ? await axiosInstance.post("/moneyreceipt", receiptData)
          : await axiosInstance.put(
              `/moneyreceipt/${decodeURIComponent(id)}`,
              receiptData
            );

      if (response.data.success) {
        alert(
          `Receipt ${mode === "create" ? "created" : "updated"} successfully!`
        );
        navigate("/sampleReceipts");
      }
    } catch (error) {
      console.error("Error saving receipt:", error);
      alert("Error saving receipt");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setReceiptData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Generate comprehensive barcode data
  const generateBarcodeData = () => {
    const data = [
      `Receipt:${receiptData.MoneyreeciptNo}`,
      `Date:${receiptData.ReceiptDate}`,
      `Amount:${receiptData.Amount}`,
      `Type:${receiptData.ReceiptType}`,
      `Ref:${receiptData.RefferenceId}`,
      `Patient:${receiptData.admission?.PatientName || "N/A"}`,
      `Admission:${receiptData.admission?.AdmitionNo || "N/A"}`,
    ].filter((item) => !item.includes("undefined") && !item.includes("null"));
    return data.join("|");
  };

  // *** FormInput component removed as requested ***

  return (
    <>
      <div className="container-fluid py-3 px-lg-3">
        {/* Main Panel/Card */}
        <div className="panel card shadow-sm border">
          {/* Panel Header - Adjusted for the detail layout */}
          <div className="panel-header card-header d-flex justify-content-between align-items-center p-2">
            <div className="panel-title fw-bold">Money Receipt Detail</div>
            <div className="tabs d-flex gap-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => navigate("/sampleReceipts")}
              >
                List
              </button>
              <button className="btn btn-sm btn-primary">Detail</button>
            </div>
          </div>
          {/* Panel Body */}
          <div className="panel-body card-body p-3">
            {/* Top Section / Money Receipt Detail */}
            <h5 className="fw-bold text-info mb-3">Money Receipt Detail</h5>
            <div className="row g-3 mb-4">
              {/* Receipt Info Column (Left) */}
              <div className="col-lg-9">
                <div className="p-3 border rounded shadow-sm ">
                  <div className="row g-3">
                    {/* Replacing FormInput for Receipt No */}
                    <div className="col-md-3">
                      <label htmlFor="MoneyreeciptNo" className="form-label small">Receipt No</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="MoneyreeciptNo"
                        name="MoneyreeciptNo"
                        value={receiptData.MoneyreeciptNo}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                    {/* Replacing FormInput for ReceiptDate */}
                    <div className="col-md-3">
                      <label htmlFor="ReceiptDate" className="form-label small">Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        id="ReceiptDate"
                        name="ReceiptDate"
                        value={receiptData.ReceiptDate}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                    {/* Replacing FormInput for ReceiptTime */}
                    <div className="col-md-3">
                      <label htmlFor="ReceiptTime" className="form-label small">Time</label>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        id="ReceiptTime"
                        name="ReceiptTime"
                        value={receiptData.ReceiptTime}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                    {/* Replacing FormInput for Amount */}
                    <div className="col-md-3">
                      <label htmlFor="Amount" className="form-label small">Amount</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        id="Amount"
                        name="Amount"
                        value={receiptData.Amount}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small">Receipt Type</label>
                      <select
                        className="form-control form-control-sm"
                        id="ReceiptType"
                        name="ReceiptType"
                        value={receiptData.ReceiptType}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      >
                        <option value={0}>Current</option>
                        <option value={1}>Patient Due</option>
                        <option value={2}>Corporate Due</option>
                        <option value={3}>In Admissible</option>
                        <option value={4}>Booking</option>
                        <option value={5}>Refund</option>
                      </select>
                    </div>
                    {/* Replacing FormInput for SlipNo */}
                    <div className="col-md-3">
                      <label htmlFor="SlipNo" className="form-label small">Slip No.</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="SlipNo"
                        name="SlipNo"
                        value={receiptData.SlipNo}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">Reference ID</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="RefferenceId"
                        name="RefferenceId"
                        value={receiptData.RefferenceId}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Barcode/Doctor Charges Column (Right) */}
              <div className="col-lg-4 d-flex flex-column">
                <div className="p-3 border rounded shadow-sm flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label small fw-bold mb-0">
                      Doctor Charges:
                    </label>
                    <span className="fw-bold text-success">
                      {receiptData.doctorCharges || "N/A"}
                    </span>
                  </div>
                  <div className="text-center p-1 rounded bg-white border">
                    {(receiptData.MoneyreeciptNo ||
                      receiptData.admission?.AdmitionNo) && (
                      <div className="mb-2 text-center">
                        <Barcode
                          value={generateBarcodeData()}
                          format="CODE128"
                          width={0.5}
                          height={40}
                          displayValue={true}
                          fontSize={10}
                          margin={5}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* Patient Detail Section */}
            <h5 className="fw-bold text-info mb-3">Patient Detail</h5>
            <div className="row g-3 mb-4 p-3 border rounded shadow-sm">
              <div className="col-md-3">
                <label className="form-label small">Patient Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.PatientName || ""}
                  readOnly
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Age</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.Age || ""}
                  readOnly
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Sex</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.Sex || ""}
                  readOnly
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Marital Status</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.MStatus || ""}
                  readOnly
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Admission No</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.AdmitionNo || ""}
                  readOnly
                />
              </div>

              {/* Address Fields */}
              <div className="col-md-4">
                <label className="form-label small">Address Line 1</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.Add1 || ""}
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Address Line 2</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.Add2 || ""}
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Address Line 3</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.Add3 || ""}
                  readOnly
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small">Area/P.S.</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.AreaId || ""}
                  readOnly
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Guardian</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.GurdianName || ""}
                  readOnly
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Religion</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.ReligionId || ""}
                  readOnly
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Phone No</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={receiptData.admission?.PhoneNo || ""}
                  readOnly
                />
              </div>
            </div>

            <hr className="my-4" />

            {/* Payment Detail Section */}
            <h5 className="fw-bold text-info mb-3">Payment Detail</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 border rounded shadow-sm ">
                  <h6 className="fw-bold mb-3">Transaction Details</h6>
                  <div className="row g-3">
                    {/* Replacing FormInput for Amount (again) */}
                    <div className="col-md-3">
                      <label htmlFor="Amount" className="form-label small">Amount</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="Amount"
                        name="Amount"
                        value={receiptData.Amount}
                        onChange={handleChange}
                      />
                    </div>
                    {/* Replacing FormInput for TDS */}
                    <div className="col-md-3">
                      <label htmlFor="TDS" className="form-label small">TDS</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="TDS"
                        name="TDS"
                        value={receiptData.TDS}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">Payment Type</label>
                      <select
                        className="form-control form-control-sm"
                        id="PaymentType"
                        name="PaymentType"
                        value={receiptData.PaymentType}
                        onChange={handleChange}
                      >
                        <option value={0}>Cash</option>
                        <option value={1}>Bank</option>
                        <option value={2}>Card</option>
                        <option value={3}>UPI</option>
                      </select>
                    </div>
                    {/* Replacing FormInput for PaidBy */}
                    <div className="col-md-3">
                      <label htmlFor="PaidBy" className="form-label small">Paid By</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="PaidBy"
                        name="PaidBy"
                        value={receiptData.PaidBy}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label small">Remarks</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="Remarks"
                        name="Remarks"
                        value={receiptData.Remarks}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label small">Narration</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="Narration"
                        name="Narration"
                        value={receiptData.Narration}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label small text-danger">
                        Remarks (DB value not found - what value should be
                        here?)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="Narration_duplicate"
                        name="Narration_duplicate"
                        value={receiptData.Narration}
                        onChange={handleChange}
                        placeholder="This seems to be a duplicate/placeholder field."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                {/* Cheque/Card Details */}
                <div className="p-3 border rounded shadow-sm">
                  <h6 className="fw-bold mb-3">Cheque/Card Details</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      {/* Replacing FormInput for Bank */}
                      <div className="col-md-12 p-0"> {/* Adjusted column for inline replacement */}
                        <label htmlFor="Bank" className="form-label small">Bank Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          id="Bank"
                          name="Bank"
                          value={receiptData.Bank}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      {/* Replacing FormInput for ChqDate (Cheque Received Date) */}
                      <div className="col-md-12 p-0">
                        <label htmlFor="ChqDate" className="form-label small">Chq Rct Dt</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          id="ChqDate"
                          name="ChqDate"
                          value={receiptData.ChqDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      {/* Replacing FormInput for Cheque */}
                      <div className="col-md-12 p-0">
                        <label htmlFor="Cheque" className="form-label small">Cheque / CARD</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          id="Cheque"
                          name="Cheque"
                          value={receiptData.Cheque}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    
                    <div className="col-md-6">
                      {/* Replacing FormInput for ClearDate (Cheque Date) */}
                      <div className="col-md-12 p-0">
                        <label htmlFor="ClearDate" className="form-label small">Chq Date</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          id="ClearDate"
                          name="ClearDate"
                          value={receiptData.ClearDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
          {/* End panel-body */}
          {/* Panel Footer - Action Buttons */}
          <div className="panel-footer card-footer p-3  border-top">
            <div className="d-flex flex-wrap justify-content-end gap-2">
              <button
                className="btn btn-success btn-sm rounded-pill px-3"
                onClick={handleSubmit}
                disabled={loading || mode === "view"}
              >
                Save
              </button>
              <button
                className="btn btn-dark btn-sm rounded-pill px-3"
                onClick={() => navigate("/sampleReceipts")}
              >
                Exit
              </button>
            </div>
          </div>
        </div>{" "}
        {/* End main panel */}
      </div>
    </>
  );
}

export default InitialFormData;