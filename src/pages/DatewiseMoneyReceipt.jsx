import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { toast } from "react-toastify";
import { set } from "date-fns";

const DatewiseMoneyReceipt = () => {
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));

  const [moneyreceiptData, setMoneyreceiptData] = useState([]);

  const [transactions, setTransactions] = useState([]);

  const [allBeds, setAllBeds] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [printData, setPrintData] = useState([]);
  const [printLoading, setPrintLoading] = useState(false);

  const fetchBeds = async () => {
    try {
      const res = await axiosInstance.get("/bedMaster?limit=908");
      if (res.data.success) {
        console.log("Beds: ", res.data.data);
        setAllBeds(res.data.data);
      } else {
        setAllBeds([]);
      }
    } catch (error) {
      console.log("Error fetching beds: ", error);
    }
  };
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/auth/users");
      if (res.data.success) {
        // console.log("Users: ", res.data.data);
        setAllUsers(res.data.data);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.log("Error fetching users: ", error);
    }
  };

  const fetchMoneyReceipt = async (from, to) => {
    try {
         setPrintLoading(true);
      const res = await axiosInstance.get(
        `/moneyreceipt/search?page=1&limit=10&dateFrom=${from}&dateTo=${to}&allReceipt=true&refund=false&search=`,
      );
     

      //   console.log("data: ", res.data.data);
      const data = res.data.data;

      if (data.length !== 0) {
        console.log("Raw Data: ", data);
        console.log("bed data: ", allBeds);
        const transactionData = data
          .map((item) => ({
            date: item.ReceiptDate?.split("T")[0]
              .split("-")
              .reverse()
              .join("/"),
            receiptNo: item.MoneyreeciptNo,
            amount: item.Amount,
            tds: item.TDS,
            mode: item.ReceiptType,
            //   user: item.UserId,
            user:
              allUsers?.find((user) => user.UserId === item.UserId)?.UserName ||
              "",
            patientName: item.admission.PatientName || "",
            admNo: item.admission.AdmitionNo,
            //   bedNo: item.admission.BedId,
            bedNo:
              allBeds?.find((bed) => bed.BedId == item.admission.BedId)?.Bed ||
              "",
          }))
          .reverse(); // Reverse to get chronological order
        console.log("transactionData: ", transactionData);

        // grand total amount
        const grandTotalAmount = transactionData.reduce(
          (sum, txn) => sum + txn.amount,
          0,
        );
        console.log("Grand Total Amount: ", grandTotalAmount);
        setTransactions(transactionData);

        // date-wise group data
        const grouped = Object.values(
          transactionData.reduce(
            (a, o) => (
              (a[o.date] ??= { date: o.date, records: [], totalAmount: 0 }),
              a[o.date].records.push(o),
              (a[o.date].totalAmount += o.amount),
              a
            ),
            {},
          ),
        );

        setPrintData(grouped);

        setPrintLoading(false);

        console.log("date wise grouped: ", grouped);

        // print data and time
        // const formatted = (() => {
        //   const d = new Date(),
        //     p = (n) => n.toString().padStart(2, "0");
        //   let h = d.getHours();
        //   const a = h >= 12 ? "PM" : "AM";
        //   h = h % 12 || 12;
        //   return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${h}:${p(d.getMinutes())}:${p(d.getSeconds())}${a}`;
        // })();
        // console.log("Formatted Date: ", formatted);
      }

      res.data.success
        ? setMoneyreceiptData(res.data.data)
        : setMoneyreceiptData([]);
    } catch (error) {
      console.log("Error fetching ipd money receipt data: ", error);
    }
  };

  // --- PRINT FUNCTION ---
  const handlePrint = (fromDate, toDate, data, printDate) => {
    // 1. Calculate Grand Total dynamically from the array
    const calculatedGrandTotal = data.reduce(
      (acc, group) => acc + group.totalAmount,
      0,
    );

    // 2. Open Print Window
    const printWindow = window.open("", "", "height=800,width=1000");

    // 3. Generate Table Header
    const tableHeader = `
    <thead>
      <tr class="header-row">
        <th>Receipt Dt.</th>
        <th>Receipt No</th>
        <th class="text-right">Receipt Amt</th>
        <th class="text-center">TDS</th>
        <th class="text-red">Mode</th>
        <th>User</th>
        <th>Patient Name</th>
        <th>ADM No.</th>
        <th>Bed No.</th>
      </tr>
    </thead>
  `;

    // 4. Generate Body Content (Looping through date groups)
    const tableBodyContent = data
      .map((group) => {
        // A. The Date/Mode Header for this group
        const groupHeaderRow = `
      <tr class="group-row">
        <td colspan="9">
          <div class="group-date">Date : ${group.date}</div>
          <div class="group-mode">Cash</div>
        </td>
      </tr>
    `;

        // B. The Data Rows for this group
        const recordRows = group.records
          .map(
            (txn) => `
      <tr class="data-row">
        <td>${txn.date}</td>
        <td>${txn.receiptNo}</td>
        <td class="text-right">${txn.amount.toFixed(2)}</td>
        <td class="text-center">${txn.tds}</td>
        <td class="text-red">${txn.mode === 0 ? "Cash" : txn.mode}</td>
        <td>${txn.user}</td>
        <td class="font-bold">${txn.patientName}</td>
        <td>${txn.admNo}</td>
        <td class="text-blue italic">${txn.bedNo}</td>
      </tr>
    `,
          )
          .join("");

        // C. The Subtotals for this group (Cash Total & Day Total)
        // We put these inside a row spanning 9 columns to keep them inside the table flow
        const groupTotalRows = `
      <tr>
        <td colspan="9" style="padding: 5px 0 0 0;">
          <div class="total-box cash-total-row">
            <div class="total-label">Cash Total :</div>
            <div class="total-value">${group.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div class="total-value text-center" style="width: 50px">0</div>
            <div class="total-spacer"></div>
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="9" style="padding: 2px 0 10px 0;">
          <div class="total-box day-total-row">
            <div class="total-label">DAY Total :</div>
            <div class="total-value">${group.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div class="total-value text-center" style="width: 50px">0</div>
            <div class="total-spacer"></div>
          </div>
        </td>
      </tr>
    `;

        return groupHeaderRow + recordRows + groupTotalRows;
      })
      .join("");

    // 5. Construct HTML
    const htmlContent = `
    <html>
      <head>
        <title>Print Receipt Details</title>
        <style>
          @media print {
            @page { margin: 10mm; size: A4 landscape; }
            body { -webkit-print-color-adjust: exact; margin: 0; }
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #000;
            padding: 20px;
          }

          /* Utilities */
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-red { color: red; }
          .text-blue { color: #000080; }
          .font-bold { font-weight: bold; }
          .italic { font-style: italic; }

          /* Header */
          .header { text-align: center; margin-bottom: 20px; }
          .org-name { font-size: 18px; font-weight: bold; margin: 0; }
          .address { font-size: 12px; margin: 2px 0; }
          .report-title { color: red; font-size: 12px; font-weight: bold; margin-top: 5px; text-transform: uppercase; }

          .filters-row { display: flex; justify-content: space-between; margin: 0 5px 10px 5px; font-weight: bold; }

          /* Table Styling */
          table { width: 100%; border-collapse: collapse; margin-bottom: 0px; }
          
          /* Table Header */
          thead th {
            background-color: #f2f2f2;
            border-top: 2px solid #ccc;
            border-bottom: 2px solid #ccc;
            padding: 8px 5px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
          }
          thead th.text-right { text-align: right; }
          thead th.text-center { text-align: center; }

          /* Group Rows */
          .group-row td { padding: 15px 5px 5px 5px; }
          .group-date { color: #800080; font-weight: bold; margin-bottom: 2px; }
          .group-mode { color: #000080; font-weight: bold; text-decoration: underline; }

          /* Data Rows */
          .data-row td {
            padding: 4px 5px;
            font-size: 11px;
            vertical-align: top;
          }

          /* Totals Styling */
          .total-box { display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold; font-size: 11px; }
          .total-label { width: 40%; text-align: right; padding-right: 15px; }
          .total-value { width: 15%; text-align: left; }
          .total-spacer { flex-grow: 1; }

          .cash-total-row { border: 1px dashed #000080; color: #000080; padding: 6px; }
          .day-total-row { border: 1px dashed green; padding: 6px; }
          
          /* Grand Total (Outside Table) */
          .grand-total-row { border: 1px solid green; padding: 6px; margin-top: 5px; font-weight: bold; display: flex; justify-content: space-between; font-size: 11px;}

          /* Footer */
          .footer-summary { border: 1px solid green; display: flex; margin-top: 20px; padding: 10px; font-weight: bold; }
          .footer-item { flex: 1; display: flex; justify-content: center; }
          .footer-divider { border-right: 1px solid green; }
          .print-meta { margin-top: 10px; font-size: 10px; font-weight: bold; }
        </style>
      </head>
      <body>

        <div class="header">
          <div class="org-name">LORDS DIAGNOSTIC</div>
          <div class="address">13/3, CIRCULAR 2ND BYE LANE,</div>
          <div class="report-title">DATEWISE INDOOR MONEY RECEIPT DETAILS</div>
        </div>

        <div class="filters-row">
          <span>Admision No.</span>
          <span>From: &nbsp; ${fromDate} &nbsp;&nbsp; To: &nbsp; ${toDate}</span>
        </div>

        <table>
          ${tableHeader}
          <tbody>
            ${tableBodyContent}
          </tbody>
        </table>

        <div class="grand-total-row">
          <div class="total-label">GRAND Total :</div>
          <div class="total-value">${calculatedGrandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div class="total-value text-center" style="width: 50px">0</div>
          <div class="total-spacer"></div>
        </div>

        <div class="text-right" style="margin: 5px 0; font-weight: bold; padding-right: 200px;">
          TDS Total &nbsp;&nbsp;&nbsp; : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 0
        </div>

        <div class="footer-summary">
          <div class="footer-item footer-divider">
            Cash Total &nbsp;&nbsp; : &nbsp;&nbsp; ${calculatedGrandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div class="footer-item footer-divider">
            Bank Total &nbsp;&nbsp; :
          </div>
          <div class="footer-item">
            Card Total &nbsp;&nbsp; :
          </div>
        </div>

        <div class="print-meta">
          Print Date &Time : ${printDate}
        </div>

      </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // --- USAGE EXAMPLE ---

  // 1. Define the data exactly as seen in your image

  // 2. Call the function (e.g., inside an onClick handler)

  /**
   * Helper: Formats ISO date string to DD/MM/YYYY
   */
  function formatDate(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Helper: Formats numbers to Currency (e.g., 12,345.00)
   */
  function formatCurrency(num) {
    if (num === null || num === undefined) return "0.00";
    return Number(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  useEffect(() => {
    fetchBeds();
    fetchUsers();
  }, []);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      fetchMoneyReceipt(fromDate, toDate);
    }, 500);
    return () => clearTimeout(timeOut);
  }, [fromDate, toDate]);

  return (
    <div>
      <div className="container my-5">
        <div className="panel shadow-lg border-0 rounded-4">
          <div className="panel-body p-4 p-md-5">
            <h4 className="mb-4 text-center">
              📊 Date Wise Money Receipt (ALL USERS)
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
                disabled={printLoading}
                onClick={() => {
                  if (moneyreceiptData.length == 0) {
                    // console.log("No data to print");
                    toast.warning("No data to print");
                    return;
                  }
                  const formatted = (() => {
                    const d = new Date(),
                      p = (n) => n.toString().padStart(2, "0");
                    let h = d.getHours();
                    const a = h >= 12 ? "PM" : "AM";
                    h = h % 12 || 12;
                    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${h}:${p(d.getMinutes())}:${p(d.getSeconds())}${a}`;
                  })();
                  handlePrint(
                    fromDate?.split("-").reverse().join("/"),
                    toDate?.split("-").reverse().join("/"),
                    printData,
                    formatted,
                  );
                }}
              >
                <i className="fa-light fa-print me-2"></i>
                Print Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatewiseMoneyReceipt;
