import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../axiosInstance";

const DateWiseOtherChargesReg = () => {
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [fetchedData, setFetchedData] = useState([]);
  const [allOcMap, setAllOcMap] = useState({});

  const [printData, setPrintData] = useState([]);

  const [loadBtn, setLoadBtn] = useState(false);

  const fetchData = async (from, to) => {
    try {
      if (!from || !to) {
        return;
      }
      setLoadBtn(true);
      const res = await axiosInstance.get(
        `/pdf/IpdOtherCharges?startDate=${from}&endDate=${to}&limit=9999`,
      );
      if (res.data.success) {
        let data = res.data.data;
        let ipdOcDataMap = {};

        for (let i = 0; i < data.length; i++) {
          let arr = ipdOcDataMap[data[i]?.OtherChargesId];
          // console.log('arr: ',arr)
          if (arr && arr.length != 0) {
            arr = [...arr, data[i]];
            ipdOcDataMap[data[i]?.OtherChargesId] = arr;
          } else {
            ipdOcDataMap[data[i]?.OtherChargesId] = [data[i]];
          }
        }

        // console.log("data map: ", ipdOcDataMap);

        setFetchedData(ipdOcDataMap);
      } else {
        setFetchedData({});
      }
    } catch (error) {
      console.log("Error fetching ipd adm data: ", error);
    }
  };

  function handlePrintReport(data) {
    // 1. Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    // 2. Generate the HTML Rows
    let tableContent = "";
    data.forEach((group) => {
      tableContent += `
      <tr class="category-header"><td colspan="7">Item : ${group.category}</td></tr>
      ${group.items
        .map(
          (item) => `
        <tr class="data-row">
          <td>${item.sl}</td>
          <td>${item.date}</td>
          <td>${item.admNo}</td>
          <td>${item.name}</td>
          <td>${item.qty.toFixed(1)}</td>
          <td>${item.rate.toFixed(2)}</td>
          <td>${item.amount.toFixed(2)}</td>
        </tr>
      `,
        )
        .join("")}
      <tr class="subtotal-row">
        <td colspan="6">Sub Total :</td>
        <td>${group.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
    });

    // 3. Construct the Full Document
    const htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; font-size: 18px; }
        .header p { margin: 2px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #f2f2f2; border-bottom: 2px solid #000; padding: 8px; text-align: left; }
        td { padding: 6px; border-bottom: 1px dashed #ccc; }
        .category-header { font-weight: bold; color: #6a1b9a; padding-top: 15px; }
        .subtotal-row td { border-top: 1px solid red; border-bottom: 1px solid red; font-weight: bold; text-align: right; color: #000; }
        .grand-total { margin-top: 20px; border: 2px solid red; padding: 10px; text-align: right; font-weight: bold; font-size: 14px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>LORDS DIAGNOSTIC</h2>
        <p>13/3, CIRCULAR 2ND BYE LANE</p>
        <h3 style="color:red; margin-top:10px;">OTHER CHARGES REGISTER (DETAIL)</h3>
        <p>From: 23/Jun/2023 To: 23/Jun/2023</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>SlNo</th><th>Entry Date</th><th>Admission No</th><th>Patient Name</th>
            <th>Qty</th><th>Rate</th><th>Amount</th>
          </tr>
        </thead>
        <tbody>${tableContent}</tbody>
      </table>
      <div class="grand-total">Grand Total : 14,457.00</div>
    </body>
    </html>
  `;

    // 4. Write to iframe and Print
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Wait for resources to load, then print
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe); // Clean up
    }, 500);
  }

  const fetchAllOC = async () => {
    try {
      const res = await axiosInstance.get("/otherCharges");
      if (res.data.success) {
        let data = res.data.data;
        let dataMap = {};

        for (let i = 0; i < data.length; i++) {
          dataMap[data[i].OtherChargesId] = data[i];
        }
        setAllOcMap(dataMap);
      } else {
        setAllOcMap({});
      }
    } catch (error) {
      console.log("Error fetching OC:", error);
    }
  };

  useEffect(() => {
    fetchAllOC();
  }, []);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      fetchData(fromDate, toDate);
    }, 500);
    return () => clearTimeout(timeOut);
  }, [fromDate, toDate]);

  useEffect(() => {
    if (
      Object.keys(fetchedData).length != 0 &&
      Object.keys(allOcMap).length != 0
    ) {
      console.log("fetched Data: ", fetchedData);
      console.log("all other chrgs:", allOcMap);

      // let allOcMapIdArr= Object.keys(allOcMap)

      let data = [];
      for (const key in fetchedData) {
        let arr = fetchedData[key];
        let itemArr = [];
        let sum = 0;
        let obj = {
          category: allOcMap[key]?.OtherCharges || "",
        };
        for (let i = 0; i < arr.length; i++) {
          itemArr.push({
            sl: i + 1,
            date:
              arr[i]?.EDate?.split("T")[0]?.split("-")?.reverse()?.join("/") ||
              "",
            admNo: arr[i]?.AdmitionNo || "",
            name: arr[i]?.PatientName,
            qty: arr[i]?.Qty,
            rate: arr[i]?.Rate,
            amount: arr[i]?.Amount,
          });

          sum += Number(arr[i]?.Amount);
        }

        obj["subtotal"] = sum;
        obj["items"] = itemArr;

        data.push(obj);
      }
      console.log("reportData: ", data);
      setPrintData(data);

      setTimeout(() => {
        setLoadBtn(false);
      }, 3000);
    }
  }, [fetchedData, allOcMap]);

  return (
    <div>
      <div className="container my-5">
        <div className="panel shadow-lg border-0 rounded-4">
          <div className="panel-body p-4 p-md-5">
            <h4 className="mb-4 text-center">
              📊 Date Wise Other Charges Register
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

export default DateWiseOtherChargesReg;

