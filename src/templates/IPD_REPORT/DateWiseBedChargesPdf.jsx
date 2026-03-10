
import React, { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";
import axiosInstance from "../../axiosInstance";

const DateWiseBedChargesPdf = () => {
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [fetchedData, setFetchedData] = useState([]);
  const [allBedMap, setAllBedMap] = useState({});

  const [printData, setPrintData] = useState([]);

  const [loadBtn, setLoadBtn] = useState(false);

  // const [printData, setPrintData] = useState({})

  const fetchData = async (from, to) => {
    try {
      if (!from || !to) {
        return;
      }
      setLoadBtn(true);
      const res = await axiosInstance.get(
        `/fb-with-details?startDate=${from}&endDate=${to}&page=1&limit=9999`,
      );

      if (res.data.success) {
        let data = res.data.data;

        let dataArr = [];
        for (let i = 0; i < data.length; i++) {
          dataArr.push({
            name: data[i]?.PatientName || "",
            admissionNo: data[i]?.AdmitionNo || "",
            billNo: data[i]?.BillNo || "",
            admissionDate:
              data[i]?.AdmitionDate?.split("T")[0]
                ?.split("-")
                ?.reverse()
                ?.join("/") || "",
            finalbillbeddtl: data[i]?.details?.finalbillbeddtl || [],
            total:
              data[i]?.details?.finalbillbeddtl?.reduce(
                (sum, item) => sum + Number(item.BedRate || 0),
                0,
              ) || 0,
          });
        }

        setFetchedData(dataArr);
      } else {
        setFetchedData([]);
      }
    } catch (error) {
      console.log("Error fetching ipd adm data: ", error);
    }
  };

  function handlePrintReport(from, to, data) {
    const printWindow = window.open("", "_blank");

    // Calculate Grand Total
    const grandTotal = data
      .reduce((sum, p) => sum + p.total, 0)
      .toLocaleString("en-IN", { minimumFractionDigits: 2 });

    const htmlContent = `
    <html>
    <head>
      <title>Final Bill Bed Charges Register</title>
      <style>
        body { font-family: 'Arial', sans-serif; font-size: 11px; margin: 20px; color: #000; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 2px; font-size: 14px; text-transform: uppercase; }
        .header p { margin: 2px; font-size: 10px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 8px 4px; text-align: left; }
        td { padding: 4px; vertical-align: top; }
        
        .patient-row { border-bottom: 0.5px solid #ccc; font-size: 9px;  }
        .charge-details { font-family: 'Courier New', monospace; font-size: 10px; }
        .text-right { text-align: right; font-size: 9px;  }
        .grand-total { border-top: 2px solid #000; border-bottom: 2px solid #000; font-weight: bold; margin-top: 10px; padding: 5px 0; }
        
        @media print {
          button { display: none; }
          @page { margin: 0.5cm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>LORDS DIAGNOSTIC</h2>
        <p>13/3, CIRCULAR 2ND BYE LANE, </p>
        <br/>
        <strong>Final Bill Bed Charges Register</strong><br/>
        <span>From :${from} To : ${to}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th width="25%">Patient Name</th>
            <th width="12%">AdmissionNo</th>
            <th width="12%">BillNo</th>
            <th width="12%">AdmissionDate</th>
            <th width="25%">Bed Details</th>
            <th width="14%" class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (patient) => `
            <tr class="patient-row">
              <td><strong>${patient.name}</strong></td>
              <td>${patient.admissionNo}</td>
              <td>${patient.billNo}</td>
              <td>${patient.admissionDate}</td>
              <td colspan="2">
                <table style="width: 100%">
                  ${patient.charges
                    .map(
                      (c) => `
                    <tr class="charge-details">
                      <td width="40%">${c.details}</td>
                      <td width="20%">${c.duration}</td>
                      <td width="40%">${c.period}</td>
                      <td class="text-right">${c.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                  <tr>
                    <td colspan="3"></td>
                    <td class="text-right" style="border-top: 1px solid #eee; font-weight: bold; font-family: Arial;">
                      ${patient.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="grand-total">
        <span style="margin-left: 40%;">Grand Total</span>
        <span style="float: right;">${grandTotal}</span>
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function () {
      printWindow.print();
      printWindow.close();
    };
  }

  // Example Usage:
  // handlePrintReport(reportData);
  const fetchAllBED = async () => {
    try {
      const res = await axiosInstance.get("/bedMaster?page=1&limit=999999");
      if (res.data.success) {
        let data = res.data.data;
        let dataMap = {};

        for (let i = 0; i < data.length; i++) {
          dataMap[data[i].BedId] = data[i]?.Bed || "";
        }
        setAllBedMap(dataMap);
      } else {
        setAllBedMap({});
      }
    } catch (error) {
      console.log("Error fetching OC:", error);
    }
  };

  useEffect(() => {
    fetchAllBED();
  }, []);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      fetchData(fromDate, toDate);
    }, 500);
    return () => clearTimeout(timeOut);
  }, [fromDate, toDate]);

  useEffect(() => {
    if (fetchedData.length != 0 && Object.keys(allBedMap).length != 0) {
      console.log("fetched Data: ", fetchedData);
      console.log("all bed:", allBedMap);

      let pData = [];

      for (let i = 0; i < fetchedData.length; i++) {
        const { finalbillbeddtl, ...prev } = fetchedData[i];
        console.log("prev", prev);
        let obj = { ...prev };
        console.log("Obj : ", obj);
        let chrg = [];
        console.log("h:", fetchedData[i]);
        for (let j = 0; j < fetchedData[i].finalbillbeddtl.length; j++) {
          console.log("hi");
          let bedObj = {};
          bedObj["details"] =
            allBedMap[fetchedData[i].finalbillbeddtl[j]?.BedId || ""] || "";
          bedObj["duration"] = " ";
          bedObj["period"] = fetchedData[i].finalbillbeddtl[j]?.MyDate?.split(
            "T",
          )[0]
            ?.split("-")
            ?.reverse()
            ?.join("/");
          bedObj["amount"] = fetchedData[i].finalbillbeddtl[j]?.BedRate || 0;

          console.log("Bed obj: ", bedObj);
          chrg.push(bedObj);
        }
        console.log("Charge arr: ", chrg);
        obj["charges"] = chrg;
        const total = chrg.reduce(
          (acc, item) => acc + Number(item.amount || 0),
          0,
        );
        obj["total"] = total;
        pData.push(obj);
      }

      console.log("P data: ", pData);
      setPrintData(pData);
      setTimeout(() => {
        setLoadBtn(false);
      }, 3000);
    }
  }, [fetchedData, allBedMap]);

  return (
    <div>
      <div className="container my-5">
        <div className="panel shadow-lg border-0 rounded-4">
          <div className="panel-body p-4 p-md-5">
            <h4 className="mb-4 text-center">📊 Bed Charges</h4>

            {/* Date Range */}
            <div className="row g-3 mb-4 align-items-center">
              <div className="col-md-2 text-md-end">
                <label className="form-label fw-semibold">Date Range:</label>
              </div>

              {/* FROM DATE */}
              <div className="col-md-4">
                <div className="input-group" style={{ position: "relative" }}>
                  <input
                    className="form-control form-control"
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      //   console.log(e.target.value);
                      setFromDate(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="col-md-1 text-center fw-semibold d-none d-md-block">
                - To -
              </div>

              {/* TO DATE */}
              <div className="col-md-4">
                <div className="input-group" style={{ position: "relative" }}>
                  <input
                    className="form-control form-control"
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      //   console.log(e.target.value);
                      setToDate(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Print Button */}
            <div className="text-center mt-4">
              <button
                className="btn btn-primary btn-lg px-5"
                onClick={() => {
                  if (loadBtn || printData.length == 0) {
                    toast.error("No data to print.");
                    return;
                  }
                  const dummyPatients = [
                    {
                      name: "BHARATI SAMANTA",
                      admissionNo: "A-000283/23-24",
                      billNo: "F-000204/23-24",
                      admissionDate: "19/06/2023",
                      charges: [
                        {
                          details: "IC6 @4500",
                          duration: "2 Day",
                          period: "19/06/2023 To 20/06/2023",
                          amount: 4500.0,
                        },
                        {
                          details: "F4 @1200",
                          duration: "3 Day",
                          period: "20/06/2023 To 22/06/2023",
                          amount: 2400.0,
                        },
                        {
                          details: "IC1 @4500",
                          duration: "1 Day",
                          period: "22/06/2023 To 22/06/2023",
                          amount: 4500.0,
                        },
                      ],
                      total: 11400.0,
                    },
                    {
                      name: "SK RUHUL AMIN",
                      admissionNo: "A-000276/23-24",
                      billNo: "F-000205/23-24",
                      admissionDate: "18/06/2023",
                      charges: [
                        {
                          details: "1 @4900",
                          duration: "2 Day",
                          period: "18/06/2023 To 19/06/2023",
                          amount: 4900.0,
                        },
                        {
                          details: "IC1 @4500",
                          duration: "3 Day",
                          period: "19/06/2023 To 21/06/2023",
                          amount: 9000.0,
                        },
                        {
                          details: "1 @4900",
                          duration: "2 Day",
                          period: "21/06/2023 To 22/06/2023",
                          amount: 9800.0,
                        },
                      ],
                      total: 23700.0,
                    },
                  ];
                  // Trigger the print
                  // handlePrintReport(dummyReportData);
                  handlePrintReport(
                    fromDate?.split("-").reverse().join("/"),
                    toDate?.split("-").reverse().join("/"),
                    printData,
                  );
                  // handlePrintReport(
                  //   fromDate?.split("-").reverse().join("/"),
                  //   toDate?.split("-").reverse().join("/"),
                  //   dummyPatients,
                  // );
                }}
              >
                {loadBtn ? (
                  <span>
                    <i className="fa-light fa-print me-2"></i>
                    Loading...
                  </span>
                ) : (
                  <span>
                    <i className="fa-light fa-print me-2"></i>
                    Print Report
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateWiseBedChargesPdf;

