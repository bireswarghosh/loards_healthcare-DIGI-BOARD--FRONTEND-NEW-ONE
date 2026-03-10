import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../axiosInstance";

const DateWiseDrChargesDetailPdf = () => {
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [fetchedData, setFetchedData] = useState([]);
  const [allDocMap, setAllDocMap] = useState({});

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
        `/doctor-visits/search/date-range?startDate=${from}&endDate=${to}&page=1&limit=9999`,
      );

      if (res.data.success) {
        let data = res.data.data;
        console.log("fetched data: ", data);

        setFetchedData(res.data.data);
      } else {
        setFetchedData([]);
      }
    } catch (error) {
      console.log("Error fetching ipd adm data: ", error);
    }
  };

  const handlePrintReport = (reportData) => {
    // 1. Create a hidden iframe to hold the print content
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;

    // 2. Generate the HTML content
    const htmlContent = `
    <html>
      <head>
        <title>Print Report</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h2 { margin: 0; text-transform: uppercase; letter-spacing: 1px; }
          .header p { margin: 5px 0; font-size: 14px; font-weight: bold; }
          
          .report-title { 
            border-top: 2px solid #000; 
            border-bottom: 2px solid #000; 
            text-align: center; 
            padding: 5px 0;
            margin-bottom: 10px;
            font-weight: bold;
          }
          
          .date-range { display: flex; justify-content: center; font-size: 12px; margin-bottom: 10px; font-weight: bold;}
          .date-range span { margin: 0 20px; }

          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: left; padding: 8px 0; }
          td { padding: 4px 0; }
          
          .text-right { text-align: right; }
          .total-row td { border-top: 1px solid #000; border-bottom: 2px solid #000; font-weight: bold; padding-top: 8px; }
          
          @media print {
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Lords Diagnostic</h2>
          <p>13/3, CIRCULAR 2ND BYE LANE,</p>
        </div>

        <div class="report-title">Indoor Doctor Details</div>

        <div class="date-range">
          <span>From : ${reportData.fromDate}</span>
          <span>To : ${reportData.toDate}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th width="50%">Doctor</th>
              <th class="text-right">Rate</th>
              <th class="text-right">No Of Visit</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.doctors
              .map(
                (doc) => `
              <tr>
                <td>${doc.name}</td>
                <td class="text-right">${doc.rate.toFixed(2)}</td>
                <td class="text-right">${doc.visits}</td>
                <td class="text-right">${doc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            `,
              )
              .join("")}
            <tr class="total-row">
              <td colspan="2" class="text-right">Total</td>
              <td class="text-right">${reportData.totalVisits}</td>
              <td class="text-right">${reportData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;

    // 3. Write content, wait for load, and print
    doc.write(htmlContent);
    doc.close();

    printFrame.contentWindow.focus();
    setTimeout(() => {
      printFrame.contentWindow.print();
      document.body.removeChild(printFrame); // Clean up
    }, 500);
  };

  // Example Usage:
  // handlePrintReport(reportData);
  const fetchAllDOC = async () => {
    try {
      const res = await axiosInstance.get("/doctors");
      if (res.data.success) {
        let data = res.data.data;
        let dataMap = {};

        for (let i = 0; i < data.length; i++) {
          dataMap[data[i].DoctorId] = data[i].Doctor || "";
        }
        setAllDocMap(dataMap);
      } else {
        setAllDocMap({});
      }
    } catch (error) {
      console.log("Error fetching OC:", error);
    }
  };

  useEffect(() => {
    fetchAllDOC();
  }, []);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      fetchData(fromDate, toDate);
    }, 500);
    return () => clearTimeout(timeOut);
  }, [fromDate, toDate]);

  useEffect(() => {
    if (fetchedData.length != 0 && Object.keys(allDocMap).length != 0) {
      console.log("fetched Data: ", fetchedData);
      console.log("all doc:", allDocMap);

      let pData = {
        fromDate: fromDate?.split("-").reverse().join("/"),
        toDate: toDate?.split("-").reverse().join("/"),
      };

      let docArr = [];
      let totalVisits = 0;
      let totalAmount = 0;
      for (let i = 0; i < fetchedData.length; i++) {
        let item = {
          name: allDocMap[fetchedData[i]?.DoctorId] || "",
          rate: Number(fetchedData[i]?.Rate || 0),
          visits: Number(fetchedData[i]?.NoOfVisit),
          amount: Number(fetchedData[i]?.Amount),
        };
        totalVisits += item.visits;
        totalAmount += item.amount;
        docArr.push(item);
      }

      pData["doctors"] = docArr;
      pData["totalAmount"] = totalAmount;
      pData["totalVisits"] = totalVisits;

      console.log("P data: ", pData);
      setPrintData(pData);
      setTimeout(() => {
        setLoadBtn(false);
      }, 3000);
    }
  }, [fetchedData, allDocMap]);

  return (
    <div>
      <div className="container my-5">
        <div className="panel shadow-lg border-0 rounded-4">
          <div className="panel-body p-4 p-md-5">
            <h4 className="mb-4 text-center">
              📊 Final Bill Other Charges Register
            </h4>

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
                  const dummyReportData = {
                    fromDate: "23/Jun/2023",
                    toDate: "23/Jun/2023",
                    doctors: [
                      {
                        name: "ABHRA MUKHOPADHYAY",
                        rate: 0.0,
                        visits: "372,200,780",
                        amount: 2500.0,
                      },
                      {
                        name: "ARINDAM GHOSH",
                        rate: 0.0,
                        visits: "372,200,780",
                        amount: 2200.0,
                      },
                      {
                        name: "ARNAB SAHA",
                        rate: 0.0,
                        visits: "372,200,780",
                        amount: 1700.0,
                      },
                      {
                        name: "SISIR KUMAR PATRA",
                        rate: 0.0,
                        visits: "372,200,780",
                        amount: 2200.0,
                      },
                      {
                        name: "RAMYAJIT LAHIRI",
                        rate: 0.0,
                        visits: "372,200,780",
                        amount: 1700.0,
                      },
                      {
                        name: "RAHUL CHATTERJEE",
                        rate: 0.0,
                        visits: "372,200,780",
                        amount: 2200.0,
                      },
                    ],
                    totalVisits: "233,204,680.0",
                    totalAmount: 12500.0,
                  };

                  // Trigger the print
                  // handlePrintReport(dummyReportData);
                  handlePrintReport(printData);
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

export default DateWiseDrChargesDetailPdf;

