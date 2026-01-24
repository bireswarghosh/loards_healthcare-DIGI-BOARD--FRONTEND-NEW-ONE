import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import Barcode from "react-barcode";
import axiosInstance from "../../../../../axiosInstance";
import QRCode from "react-qr-code";
import AsyncApiSelect from "./AsyncApiSelect";
import {toast} from 'react-toastify'

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
  const [area, setArea] = useState({});

  const [admId, setAdmId] = useState("");
  const [patient, setPatient] = useState({});

  const [religion,setReligion]= useState({})
  // State for form fields
  // const [receiptData, setReceiptData] = useState({
  //   MoneyreeciptId: "",
  //   MoneyreeciptNo: "",
  //   RefferenceId: "",
  //   ReceiptType: 0,
  //   ReceiptDate: new Date().toISOString().split("T")[0],
  //   PaymentType: "Old Data Not Found",
  //   Amount: "Old Data Not Found",
  //   Bank: "Old Data Not Found",
  //   Cheque: "Old Data Not Found",
  //   ChqDate: "Old Data Not Found",
  //   ClearDate: "Old Data Not Found",
  //   Narration: "Old Data Not Found",
  //   UserId: 37,
  //   SlipNo: "Old Data Not Found",
  //   TDS: "Old Data Not Found",
  //   PaidBy: "Old Data Not Found",
  //   Remarks: "Old Data Not Found",
  //   ReceiptTime: "",
  //   PrintDate: "",
  //   admission: null,
  // });

  const [receiptData, setReceiptData] = useState({
    MoneyreeciptId: "",
    MoneyreeciptNo: "",
    RefferenceId: "",
    ReceiptType: 0,
    ReceiptDate: new Date().toISOString().split("T")[0],
    PaymentType: "",
    Amount: "",
    Bank: "",
    Cheque: "",
    ChqDate: new Date().toISOString().split("T")[0],
    ClearDate: new Date().toISOString().split("T")[0],
    Narration: "",
    UserId: 37,
    SlipNo: "",
    TDS: "",
    PaidBy: "",
    Remarks: "",
    ReceiptTime: "",
    PrintDate: "",
    admission: null,
  });

  const fetchAdmData = async (id) => {
    try {
      const res = await axiosInstance.get(`/admissions/${id}`);
      console.log(res.data.data.admission);
      const {
        AdmitionId,
        AdmitionNo,
        PatientName,
        PhoneNo,
        Age,
        Sex,
        MStatus,
        Add1,
        Add2Add3,
        GurdianName,
        ReligionId,
        AreaId,
        ...rest
      } = res.data.data.admission;
      setReceiptData((prev) => ({
        ...prev,
        RefferenceId:AdmitionId,
        admission: {
          AdmitionId,
          AdmitionNo,
          PatientName,
          PhoneNo,
          Age,
          Sex,
          MStatus,
          Add1,
          Add2Add3,
          GurdianName,
          ReligionId,
          AreaId,
        },
      }));

      console.log("Area id: ", res.data.data.admission?.AreaId);

      if (res.data.data.admission?.AreaId) {
        const res1 = await axiosInstance.get(
          `/area/${res.data.data.admission?.AreaId}`
        );
        console.log("Fetched area: ", res1.data.data);
        res1.data.success ? setArea(res1.data.data) : setArea({});
      }

      if(res.data.data.admission?.ReligionId){
 const res2 = await axiosInstance.get(
          `/religion/${res.data.data.admission?.ReligionId}`
        );
        // console.log("religion data: ",res2.data.data)
        // console.log("Fetched area: ", res1.data.data);
        res2.data.success ? setReligion(res2.data.data) : setReligion({"ReligionId": 0,
"Religion": "N/A"});
      }
    } catch (error) {
      setReligion({"ReligionId": "",
"Religion": "NA"})
      console.log("error fetching adm data", error);
    }
  };

  useEffect(() => {
    // console.log("mode: ", mode);
    if (id) {
      fetchReceipt();
    }
  }, [id]);

  useEffect(() => {
    if (admId) {
      fetchAdmData(admId);
      console.log("I am changed: ", admId);
    }
  }, [admId]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const decodedId = decodeURIComponent(id);
      const response = await axiosInstance.get(`/moneyreceipt/${decodedId}`);
      if (response.data.success) {
        const apiData = response.data.data;
        console.log(apiData.admission?.AreaId);
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
        if (apiData.admission?.AreaId) {
          const res = await axiosInstance.get(
            `/area/${apiData.admission?.AreaId}`
          );
          res.data.success ? setArea(res.data.data) : setArea({});
        }

        if(apiData.admission?.ReligionId){
 const res2 = await axiosInstance.get(
          `/religion/${apiData.admission?.ReligionId}`
        );
        // console.log("religion data: ",res2.data.data)
        // console.log("Fetched area: ", res1.data.data);
        res2.data.success ? setReligion(res2.data.data) : setReligion({"ReligionId": "",
"Religion": "NA"});
      }
      }
    } catch (error) {
      // console.error("Error fetching receipt:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async () => {
    try {
      setLoading(true);
const {admission,MoneyreeciptId,
MoneyreeciptNo, ...rest}=receiptData

// console.log("data: ",rest)


  const newData = {
    ...rest,
    ChqDate:(() => {
      const d = new Date(rest.ChqDate);
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    })(),
    ClearDate:(() => {
      const d = new Date(rest.ClearDate);
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    })(),
    ReceiptDate: (() => {
      const d = new Date(rest.ReceiptDate);
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    })()
  };

// console.log("newData: ",newData);

      const response =
        mode === "create"
          ? await axiosInstance.post("/moneyreceipt", rest)
          : await axiosInstance.put(
              `/moneyreceipt/${decodeURIComponent(id)}`,
              newData
            );

      if (response.data.success) {
        
        toast.success(
          `Receipt ${mode === "create" ? "created" : "updated"} successfully!`
        );
        navigate("/sampleReceipts");
      }
    } catch (error) {
      console.error("Error saving receipt:", error);
      toast.error("Error saving receipt");
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
              <div className="col-lg-8">
                <div className="p-3 border rounded shadow-sm ">
                  <div className="row g-3">
                    {/* Replacing FormInput for Receipt No */}
                    <div className="col-md-3">
                      <label
                        htmlFor="MoneyreeciptNo"
                        className="form-label small"
                      >
                        Receipt No
                      </label>
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
                      <label htmlFor="ReceiptDate" className="form-label small">
                        Date
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        id="ReceiptDate"
                        name="ReceiptDate"
                        value={ mode!=='create'
        ? (() => {
            const d = new Date(receiptData.ReceiptDate);
            d.setDate(d.getDate() + 1);
            return d.toISOString().slice(0, 10);
          })()
        : receiptData.ReceiptDate}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                    {/* Replacing FormInput for ReceiptTime */}
                    <div className="col-md-3">
                      <label htmlFor="ReceiptTime" className="form-label small">
                        Time
                      </label>
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
                      <label htmlFor="Amount" className="form-label small">
                        Amount
                      </label>
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
                      <label htmlFor="SlipNo" className="form-label small">
                        Slip No.
                      </label>
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
                      <label className="form-label small">Booking No</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="RefferenceId"
                        name="RefferenceId"
                        readOnly
                        value={receiptData.RefferenceId?`A-${receiptData.RefferenceId}`:null}
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
                  {/* <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label small fw-bold mb-0">
                      Doctor Charges:
                    </label>
                    <span className="fw-bold text-success">
                      {receiptData.doctorCharges || "N/A"}
                    </span>
                  </div> */}
                  <div className="text-center p-1 rounded border">
                    {(receiptData.MoneyreeciptNo ||
                      receiptData.admission?.AdmitionNo) &&
                    mode !== "create" ? (
                      <div className=" text-center">
                        {/* {console.log(generateBarcodeData())} */}
                        {/* <Barcode
                          value={generateBarcodeData()}
                          format="CODE128"
                          width={0.5}
                          height={40}
                          displayValue={true}
                          fontSize={10}
                          margin={5}
                        /> */}{" "}
                        <QRCode
                          size={256}
                          style={{
                            height: "auto",
                            maxWidth: "30%",
                            width: "30%",
                          }}
                          value={generateBarcodeData()}
                          viewBox={`0 0 256 256`}
                        />
                      </div>
                    ) : (
                      <div>No QR code available.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* Patient Detail Section */}
            <h5 className="fw-bold text-info mb-3">Patient Detail</h5>
            {/* {console.log(mode)} */}
            {mode !== "create" ? (
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
                    value={area?.Area || ""}
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
                    value={religion.Religion || "N/A"}
                    // value={receiptData.admission?.ReligionId || ""}
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
            ) : (
              <div className="row g-3 mb-4 p-3 border rounded shadow-sm">
                <div className="col-md-3">
                  <label className="form-label small">Patient Name</label>
                  {/* <input
                    type="text"
                    className="form-control form-control-sm"
                    value={receiptData.admission?.PatientName}
                  /> */}

                  <AsyncApiSelect
                    api={`https://lords-backend.onrender.com/api/v1/admission/search`}
                    value={admId}
                    onChange={(value) => {
                      setAdmId(value.value);
                      // console.log(value.value)
                    }}
                    labelKey="PatientName"
                    valueKey="AdmitionId"
                    searchKey="q"
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

                {/* <div className="col-md-3">
                  <label className="form-label small">Area/P.S.</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={receiptData.admission?.AreaId || ""}
                    readOnly
                  />
                </div> */}

                <div className="col-md-3">
                  <label className="form-label small">Area/P.S.</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={area?.Area || ""}
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
                    // value={receiptData.admission?.ReligionId || ""}
                    value={religion.Religion || "N/A"}
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
            )}

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
                      <label htmlFor="Amount" className="form-label small">
                        Amount
                      </label>
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
                      <label htmlFor="TDS" className="form-label small">
                        TDS
                      </label>
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
                      <label htmlFor="PaidBy" className="form-label small">
                        Paid By
                      </label>
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
                      {/* <input
                        type="text"
                        className="form-control form-control-sm"
                        id="Remarks"
                        name="Remarks"
                        value={receiptData.Remarks}
                        onChange={handleChange}
                      /> */}

                      <select
                      className="form-control form-control-sm"
                        id="Remarks"
                        name="Remarks"
                        value={receiptData.Remarks}
                        onChange={handleChange}
                      >
                        <option value={""}>---</option>
                        <option value={"Advance"}>Advance</option>
                        <option value={"Part Payment"}>Part Payment</option>
                        <option value={"Final Payment"}>Final Payment</option>
                        <option value={"Refund"}>Refund</option>
                        <option value={"Booking"}>Booking</option>
                        <option value={"OT Payment"}>OT Payment</option>
                      </select>
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
                    {/* <div className="col-md-12">
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
                    </div> */}
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
                      <div className="col-md-12 p-0">
                        {" "}
                        {/* Adjusted column for inline replacement */}
                        <label htmlFor="Bank" className="form-label small">
                          Bank Name
                        </label>
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
                        <label htmlFor="ChqDate" className="form-label small">
                          Chq Rct Dt
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          id="ChqDate"
                          name="ChqDate"
                          // value={receiptData.ChqDate}
                           value={ mode!=='create'
        ? (() => {
            const d = new Date(receiptData.ChqDate);
            d.setDate(d.getDate() + 1);
            return d.toISOString().slice(0, 10);
          })()
        : receiptData.ChqDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      {/* Replacing FormInput for Cheque */}
                      <div className="col-md-12 p-0">
                        <label htmlFor="Cheque" className="form-label small">
                          Cheque / CARD
                        </label>
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
                        <label htmlFor="ClearDate" className="form-label small">
                          Chq Date
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          id="ClearDate"
                          name="ClearDate"
                          // value={receiptData.ClearDate}

                           value={ mode!=='create'
        ? (() => {
            const d = new Date(receiptData.ClearDate);
            d.setDate(d.getDate() + 1);
            return d.toISOString().slice(0, 10);
          })()
        : receiptData.ClearDate}
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