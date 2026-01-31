import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import Barcode from "react-barcode";
import axiosInstance from "../../../../../axiosInstance";
import QRCode from "react-qr-code";
import AsyncApiSelect from "./AsyncApiSelect";
import { toast } from "react-toastify";
import { set } from "date-fns";

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

  const [religion, setReligion] = useState({});
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
        RefferenceId: AdmitionId,
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
          `/area/${res.data.data.admission?.AreaId}`,
        );
        console.log("Fetched area: ", res1.data.data);
        res1.data.success ? setArea(res1.data.data) : setArea({});
      }

      if (res.data.data.admission?.ReligionId) {
        const res2 = await axiosInstance.get(
          `/religion/${res.data.data.admission?.ReligionId}`,
        );
        // console.log("religion data: ",res2.data.data)
        // console.log("Fetched area: ", res1.data.data);
        res2.data.success
          ? setReligion(res2.data.data)
          : setReligion({ ReligionId: 0, Religion: "N/A" });
      }
    } catch (error) {
      setReligion({ ReligionId: "", Religion: "NA" });
      console.log("error fetching adm data", error);
    }
  };

  // print function
  //   const handlePrint = (data) => {
  //     // Destructure data with fallbacks to ensure the receipt prints even if some data is missing
  //     const {
  //       receiptNo = "",
  //       receiptDate = "",
  //       admissionNo = "",
  //       admissionDate = "",
  //       patientName = "",
  //       age = "",
  //       sex = "",
  //       address = "",
  //       bedNo = "",
  //       doctorName = "",
  //       guardianName = "",
  //       remarks = "",
  //       amount = "0.00",
  //       amountInWords = "",
  //       paymentMode = "CASH",
  //       receivedBy = "Admin",
  //     } = data;

  //     // Get current date/time for the print footer
  //     const printDateTime = new Date()
  //       .toLocaleString("en-IN", { hour12: true })
  //       .toUpperCase();

  //     const printContent = `
  //     <!DOCTYPE html>
  //     <html>
  //     <head>
  //       <title>Money Receipt Print</title>
  //       <style>
  //         body {
  //           font-family: 'Helvetica', 'Arial', sans-serif;
  //           font-size: 12px;
  //           margin: 0;
  //           padding: 20px;
  //           color: #000;
  //         }
  //         .container {
  //           width: 100%;
  //           max-width: 800px; /* Adjust based on paper size */
  //           margin: 0 auto;
  //         }
  //         .header {
  //           text-align: center;
  //           margin-bottom: 20px;
  //         }
  //         .header h1 {
  //           margin: 0;
  //           font-size: 24px;
  //           font-weight: bold;
  //           text-transform: uppercase;
  //         }
  //         .header p {
  //           margin: 2px 0;
  //           font-size: 11px;
  //         }
  //         .title-box {
  //           text-align: center;
  //           font-weight: bold;
  //           text-decoration: underline;
  //           margin: 10px 0 20px 0;
  //           font-size: 16px;
  //         }
  //         .info-grid {
  //           display: flex;
  //           flex-wrap: wrap;
  //           margin-bottom: 10px;
  //           padding: 10px;
  //           border: 1px solid #000;

  //         }
  //         .row {
  //           width: 100%;
  //           display: flex;
  //           justify-content: space-between;
  //           margin-bottom: 8px;
  //         }
  //         .field {
  //           flex: 1;
  //         }
  //         .field.half {
  //           flex: 0 0 48%; /* Creates two columns */
  //         }
  //         .field.full {
  //           flex: 0 0 100%;
  //         }
  //         .label {
  //           font-weight: bold;
  //           display: inline-block;
  //           min-width: 110px; /* Aligns the colons */
  //         }
  //         .value {
  //           font-weight: normal;
  //         }
  //         .payment-section {
  //           margin-top: 20px;

  //           padding-top: 10px;
  //         }
  //         .amount-box {
  //           margin: 15px 0;
  //           font-style: italic;
  //           font-weight: bold;
  //         }
  //         .footer {
  //           margin-top: 40px;
  //           display: flex;
  //           justify-content: space-between;
  //           font-size: 10px;
  //           padding-top: 5px;
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <div class="container">
  //         <div class="header">
  //           <h1>LORDS HEALTH CARE</h1>
  //           <p>13/3, Circular 2nd Bye Lane, Kona Expressway, Nabanna</p>
  //           <p>(Near Jumanabala Balika Vidyalaya) Shibpur, Howrah - 711 102, W.B.</p>
  //           <p>Phone No.: 8272904444 HELPLINE - 7003378414, Toll Free No. 1800-309-0895</p>
  //           <p>E-mail: patientdesk@lordshealthcare.org, Website: www.lordshealthcare.org</p>
  //         </div>

  //         <div class="title-box">MONEY RECEIPT</div>

  //         <div class="info-grid">
  //           <div class="row">
  //             <div class="field half">
  //               <span class="label">Receipt No.</span>: <span class="value">${receiptNo}</span>
  //             </div>
  //             <div class="field half">
  //               <span class="label">Receipt Date</span>: <span class="value">${receiptDate}</span>
  //             </div>
  //           </div>

  //           <div class="row">
  //             <div class="field half">
  //               <span class="label">Patient Name</span>: <span class="value">${patientName}</span>
  //             </div>
  //             <div class="field half">
  //               <span class="label">Age</span>: <span class="value">${age}</span>
  //             </div>
  //           </div>

  //  <div class="row">
  //             <div class="field half">
  //               <span class="label">Admission No.</span>: <span class="value">${admissionNo}</span>
  //             </div>
  //             <div class="field half">
  //               <span class="label">Admission Date</span>: <span class="value">${admissionDate}</span>
  //             </div>
  //           </div>

  //           <div class="row">
  //              <div class="field full">
  //               <span class="label">ADDRESS</span>: <span class="value">${address}</span>
  //             </div>
  //           </div>

  //           <div class="row">
  //             <div class="field half">
  //               <span class="label">BED No.</span>: <span class="value">${bedNo}</span>
  //             </div>
  //             <div class="field half">
  //               <span class="label">Under Doctor</span>: <span class="value">${doctorName}</span>
  //             </div>
  //           </div>

  //            <div class="row">
  //              <div class="field half">
  //               <span class="label">GUARDIAN NAME</span>: <span class="value">${guardianName}</span>
  //             </div>
  //              <div class="field half">
  //               <span class="label">Sex</span>: <span class="value">${sex}</span>
  //             </div>
  //           </div>
  //         </div>

  //         <div class="payment-section">
  //           <div class="row">
  //             <div class="field full">
  //                <span class="label">Remarks</span>: <span class="value">${remarks}</span>
  //             </div>
  //           </div>

  //           <div class="amount-box">
  //             Received With Thanks The Amount of Rs. ${amount} (${amountInWords}) For Patient ${patientName}
  //           </div>

  //           <div class="row">
  //             <div class="field full">
  //                <span class="label">Payment Nature</span>: <span class="value">Payment Vide ${paymentMode}</span>
  //             </div>
  //           </div>
  //         </div>

  //         <div class="footer">
  //           <div>Print Date & Time: ${printDateTime}</div>
  //           <div>Received By: ${receivedBy}</div>
  //         </div>
  //       </div>
  //     </body>
  //     </html>
  //   `;

  //     // Create a hidden iframe or new window to handle the printing
  //     const printWindow = window.open("", "_blank");

  //     if (printWindow) {
  //       printWindow.document.write(printContent);
  //       printWindow.document.close(); // Necessary for IE >= 10
  //       printWindow.focus(); // Necessary for IE >= 10

  //       // Wait for content to load before printing
  //       setTimeout(() => {
  //         printWindow.print();
  //         printWindow.close();
  //       }, 250);
  //     } else {
  //       console.error("Popup blocked. Please allow popups for printing.");
  //     }
  //   };

  // const [bed, setBed] = useState({});

  const fetchBedData = async (id) => {
    try {
      const res = await axiosInstance.get(`/bedMaster/${id}`);
      // console.log("Bed data: ", res.data.data);
      // res.data.success ? setBed(res.data.data) : setBed({});
      if (res.data.success) {
        return res.data.data || {};
      }
    } catch (error) {
      console.log("error fetching bed data", error);
      return {
        Bed: "",
      };
    }
  };

  const fetchDoctorData = async () => {
    try {
      const res = await axiosInstance.get(`/doctors`);

      // console.log("Doctor data: ", res.data.data);

      // res.data.success ? setDoctor(res.data.data || []) : setDoctor([]);
      // res.data.success ?  res.data.data || [] : null;
      if (res.data.success) {
        return res.data.data || [];
      }
    } catch (error) {
      console.log("error fetching doctor data", error);
      return [];
    }
  };

  const handlePrint = (data) => {
    const {
      receiptNo = "",
      receiptDate = "",
      admissionNo = "",
      admissionDate = "",
      patientName = "",
      age = "",
      sex = "",
      address = "",
      bedNo = "",
      doctorName = "",
      guardianName = "",
      remarks = "",
      amount = "0.00",
      amountInWords = "",
      paymentMode = "CASH",
      receivedBy = "Admin",
    } = data;

function convertAmountToWords(amount) {
  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen"
  ];

  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty",
    "sixty", "seventy", "eighty", "ninety"
  ];

  const numToWords = (num) => {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000)
      return ones[Math.floor(num / 100)] + " hundred" + (num % 100 ? " " + numToWords(num % 100) : "");
    if (num < 100000)
      return numToWords(Math.floor(num / 1000)) + " thousand" + (num % 1000 ? " " + numToWords(num % 1000) : "");
    if (num < 10000000)
      return numToWords(Math.floor(num / 100000)) + " lakh" + (num % 100000 ? " " + numToWords(num % 100000) : "");
    return numToWords(Math.floor(num / 10000000)) + " crore" + (num % 10000000 ? " " + numToWords(num % 10000000) : "");
  };

  amount = parseFloat(amount).toFixed(2);
  const [rupees, paise] = amount.split(".");

  const rupeesInWords = numToWords(parseInt(rupees));
  const paiseInWords = numToWords(parseInt(paise));

  return `Rupees ${rupeesInWords || "zero"} and ${paiseInWords || "zero"} paise only`;
}


    const printDateTime = new Date()
      .toLocaleString("en-IN", { hour12: true })
      .toUpperCase();

    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Money Receipt Print</title>

      <!-- JsBarcode CDN -->
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>

      <style>
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          font-size: 12px;
          margin: 0;
          padding: 20px;
          color: #000;
        }
        .container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .header p {
          margin: 2px 0;
          font-size: 11px;
        }
        .title-box {
          text-align: center;
          font-weight: bold;
          text-decoration: underline;
          margin: 10px 0 20px 0;
          font-size: 16px;
        }
        .info-grid {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 10px;
          padding: 10px;
          border: 1px solid #000;
        }
        .row {
          width: 100%;
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .field {
          flex: 1;
        }
        .field.half {
          flex: 0 0 48%;
        }
        .field.full {
          flex: 0 0 100%;
        }
        .label {
          font-weight: bold;
          display: inline-block;
          min-width: 110px;
        }
        .value {
          font-weight: normal;
        }
        .payment-section {
          margin-top: 20px;
          padding-top: 10px;
        }
        .amount-box {
          margin: 15px 0;
          font-style: italic;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding-top: 5px;
        }
      </style>
    </head>

    <body>
      <div class="container">

     <div class="header" 
     style="display:flex; justify-content:center; align-items:center; gap:7px;">

  <!-- Left: Small Logo -->
  <div style="width:80px; text-align:left; margin-right:1px;">
    <img src="data:image/jpeg;base64,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" 
         alt="Logo"
         style="width:70px; height:auto;" />
  </div>

  <!-- Center: Title -->
  <div style="text-align:center; flex:1; margin:0 3px;">
    <h1 style="margin:0; font-size:22px;">LORDS HEALTH CARE</h1>
    <p style="margin:1px 0;">13/3, Circular 2nd Bye Lane, Kona Expressway, Nabanna</p>
    <p style="margin:1px 0;">(Near Jumanabala Balika Vidyalaya) Shibpur, Howrah - 711 102, W.B.</p>
    <p style="margin:1px 0;">Phone No.: 8272904444 • HELPLINE: 7003378414 • Toll Free: 1800-309-0895</p>
    <p style="margin:1px 0;">E-mail: patientdesk@lordshealthcare.org | Website: www.lordshealthcare.org</p>
  </div>

  <!-- Right: Barcode -->
  <div style="width:130px; text-align:left; margin-left:1px;">
    <svg id="barcode"></svg>
  </div>

</div>



        <div class="title-box">MONEY RECEIPT</div>

        <div class="info-grid">
          <div class="row">
            <div class="field half">
              <span class="label">Receipt No.</span>: <span class="value">${receiptNo}</span>
            </div>
            <div class="field half">
              <span class="label">Receipt Date</span>: <span class="value">${receiptDate}</span>
            </div>
          </div>

          <div class="row">
            <div class="field half">
              <span class="label">Patient Name</span>: <span class="value">${patientName}</span>
            </div>
            <div class="field half">
              <span class="label">Age</span>: <span class="value">${age}</span>
            </div>
          </div>

          <div class="row">
            <div class="field half">
              <span class="label">Admission No.</span>: <span class="value">${admissionNo}</span>
            </div>
            <div class="field half">
              <span class="label">Admission Date</span>: <span class="value">${admissionDate}</span>
            </div>
          </div>

          <div class="row">
            <div class="field full">
              <span class="label">ADDRESS</span>: <span class="value">${address}</span>
            </div>
          </div>

          <div class="row">
            <div class="field half">
              <span class="label">BED No.</span>: <span class="value">${bedNo}</span>
            </div>
            <div class="field half">
              <span class="label">Under Doctor</span>: <span class="value">${doctorName}</span>
            </div>
          </div>

          <div class="row">
            <div class="field half">
              <span class="label">GUARDIAN NAME</span>: <span class="value">${guardianName}</span>
            </div>
            <div class="field half">
              <span class="label">Sex</span>: <span class="value">${sex}</span>
            </div>
          </div>
        </div>

        <div class="payment-section">
          <div class="row">
            <div class="field full">
              <span class="label">Remarks</span>: <span class="value">${remarks}</span>
            </div>
          </div>

          <div class="amount-box">
            Received With Thanks The Amount of Rs. ${amount} (${convertAmountToWords(amount)}) For Patient ${patientName}
          </div>

          <div class="row">
            <div class="field full">
              <span class="label">Payment Nature</span>: <span class="value">Payment Vide ${paymentMode}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <div>Print Date & Time: ${printDateTime}</div>
          <div>Received By: ${receivedBy}</div>
        </div>
      </div>
    </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      // 🔥 Barcode Initialize After Load
      printWindow.onload = () => {
        // JsBarcode(printWindow.document.getElementById("barcode"), admissionNo, {
        //   format: "CODE128",
        //   width: 2,
        //   height: 50,
        //   displayValue: true,
        // });

        JsBarcode(printWindow.document.getElementById("barcode"), admissionNo, {
          format: "CODE128",
          width: 1.7,
          height: 35,
          displayValue: true,
          fontSize: 8,
        });

        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    } else {
      console.error("Popup blocked. Please allow popups for printing.");
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
            `/area/${apiData.admission?.AreaId}`,
          );
          res.data.success ? setArea(res.data.data) : setArea({});
        }

        if (apiData.admission?.ReligionId) {
          const res2 = await axiosInstance.get(
            `/religion/${apiData.admission?.ReligionId}`,
          );
          // console.log("religion data: ",res2.data.data)
          // console.log("Fetched area: ", res1.data.data);
          res2.data.success
            ? setReligion(res2.data.data)
            : setReligion({ ReligionId: "", Religion: "NA" });
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
      const { admission, MoneyreeciptId, MoneyreeciptNo, ...rest } =
        receiptData;

      // console.log("data: ",rest)

      const newData = {
        ...rest,
        ChqDate: (() => {
          const d = new Date(rest.ChqDate);
          d.setDate(d.getDate() + 1);
          return d.toISOString().slice(0, 10);
        })(),
        ClearDate: (() => {
          const d = new Date(rest.ClearDate);
          d.setDate(d.getDate() + 1);
          return d.toISOString().slice(0, 10);
        })(),
        ReceiptDate: (() => {
          const d = new Date(rest.ReceiptDate);
          d.setDate(d.getDate() + 1);
          return d.toISOString().slice(0, 10);
        })(),
      };

      // console.log("newData: ",newData);

      const response =
        mode === "create"
          ? await axiosInstance.post("/moneyreceipt", rest)
          : await axiosInstance.put(
              `/moneyreceipt/${decodeURIComponent(id)}`,
              newData,
            );

      if (response.data.success) {
        toast.success(
          `Receipt ${mode === "create" ? "created" : "updated"} successfully!`,
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
                        value={
                          mode !== "create"
                            ? (() => {
                                const d = new Date(receiptData.ReceiptDate);
                                d.setDate(d.getDate() + 1);
                                return d.toISOString().slice(0, 10);
                              })()
                            : receiptData.ReceiptDate
                        }
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
                        value={
                          receiptData.RefferenceId
                            ? `A-${receiptData.RefferenceId}`
                            : null
                        }
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
                          value={
                            mode !== "create"
                              ? (() => {
                                  const d = new Date(receiptData.ChqDate);
                                  d.setDate(d.getDate() + 1);
                                  return d.toISOString().slice(0, 10);
                                })()
                              : receiptData.ChqDate
                          }
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

                          value={
                            mode !== "create"
                              ? (() => {
                                  const d = new Date(receiptData.ClearDate);
                                  d.setDate(d.getDate() + 1);
                                  return d.toISOString().slice(0, 10);
                                })()
                              : receiptData.ClearDate
                          }
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
          <div className="panel-footer card-footer p-3  border-top">
            <div className="d-flex flex-wrap justify-content-end gap-2">
              {id && mode !== "create" && (
                <button
                  className="btn btn-primary btn-sm rounded-pill px-3"
                  onClick={async() => {
                    console.log("Printing receipt...", receiptData);

                   const bed= await fetchBedData(receiptData.admission?.BedId);
                    const doctor = await fetchDoctorData();

                    console.log("bed data:", bed);
                    console.log("doctor data:", doctor);
                    setTimeout(() => {
                      const dData = {
                        receiptNo: receiptData.MoneyreeciptNo || "",
                        receiptDate:
                          receiptData.ReceiptDate?.split("-")
                            .reverse()
                            .join(".") || "",
                        admissionNo: receiptData?.admission?.AdmitionNo || "",
                        admissionDate: "15.06.2023",
                        patientName: receiptData?.admission?.PatientName || "",
                        age: `${receiptData?.admission?.Age} Y` || " Y",
                        sex: receiptData?.admission?.Sex || "",
                        address:
                          `${receiptData?.admission?.Add1 || ""}, ${receiptData?.admission?.Add2 || ""}, ${receiptData?.admission?.Add3 || ""}` ||
                          "",
                        amount: receiptData.Amount || "",
                        bedCategory: "ICU",
                        bedNo: bed?.Bed || "",
                        doctorName:
                          `${doctor?.find((item) => item.DoctorId == receiptData.admission.UCDoctor1Id)?.Doctor || ""} ${doctor?.find((item) => item.DoctorId == receiptData.admission.UCDoctor2Id)?.Doctor || ""} ${doctor?.find((item) => item.DoctorId == receiptData.admission.UCDoctor3Id)?.Doctor || ""}` ||
                          "",
                        guardianName: receiptData?.admission?.GurdianName || "",
                        remarks: receiptData.Remarks || "",
                        amountInWords:
                          "Rupees five thousand and zero paise only",
                        paymentMode:
                          receiptData.PaymentType == 0
                            ? "Cash"
                            : receiptData.PaymentType == 1
                              ? "Bank"
                              : receiptData.PaymentType == 2
                                ? "Card"
                                : "UPI" || "",
                        receivedBy: "Admin",
                      };

                      // Trigger the print
                      handlePrint(dData);
                    }, 2000);

                    // const dData = {
                    //   receiptNo: receiptData.MoneyreeciptNo||"",
                    //   receiptDate: receiptData.ReceiptDate?.split("-").reverse().join(".") || "",
                    //   admissionNo: receiptData?.admission?.AdmitionNo||"",
                    //   admissionDate: "15.06.2023",
                    //   patientName: receiptData?.admission?.PatientName|| "",
                    //   age:`${receiptData?.admission?.Age} Y` ||" Y",
                    //   sex:receiptData?.admission?.Sex||"",
                    //   address:`${receiptData?.admission?.Add1 || ""}, ${receiptData?.admission?.Add2 || ""}, ${receiptData?.admission?.Add3 || ""}` ||"",
                    //   amount: receiptData.Amount || "",
                    //   bedCategory: "ICU",
                    //   bedNo: bed?.Bed||"",
                    //   doctorName: "S.B.MISRA",
                    //   guardianName: receiptData?.admission?.GurdianName||"",
                    //   remarks: receiptData.Remarks || "",
                    //   amountInWords: "Rupees five thousand and zero paise only",
                    //   paymentMode: receiptData.PaymentType == 0 ? "Cash" : receiptData.PaymentType == 1 ? "Bank" : receiptData.PaymentType == 2 ? "Card" : "UPI" || "",
                    //   receivedBy: "Admin",
                    // };

                    // // Trigger the print
                    // handlePrint(dData);
                  }}
                  disabled={loading}
                >
                  Print
                </button>
              )}

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


