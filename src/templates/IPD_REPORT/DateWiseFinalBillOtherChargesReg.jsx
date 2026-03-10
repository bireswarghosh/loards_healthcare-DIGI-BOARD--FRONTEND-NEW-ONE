import React, { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";
import axiosInstance from "../../axiosInstance";

const DateWiseFinalBillOtherChargesReg = () => {
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [fetchedData, setFetchedData] = useState([]);
  const [allOcMap, setAllOcMap] = useState({});

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
        console.log("fetched data: ", data);
        let finalBillOcDataMap = {};

let totalAmount = 0

        for (let i = 0; i < data.length; i++) {
          let ocArr = data[i]?.details?.finalbillalldtl?.filter(
            (item) => item.PrintHead == " ",
          );

          // console.log("oc arr: ", ocArr);

          for (let j = 0; j < ocArr.length; j++) {
            // console.log("ocarr j:", ocArr[j]);
            let arr = [finalBillOcDataMap[ocArr[j].SubHead || " "]];
            // console.log("arr: ", arr);
            if (!arr.includes(undefined) && arr.length != 0) {
              let specData = ocArr[j];
              // console.log("spec data not unique: ", specData);
              totalAmount+=Number(specData.Amount) || 0
              arr = [
                ...arr,
                {
                  patient: specData.PatientName || "",
                  admNo: data[i].AdmitionNo || "",
                  billNo: data[i].BillNo || "",
                  date:
                    specData.AdmitionDate?.split("T")[0]
                      ?.split("-")
                      ?.reverse()
                      .join("/") || "",
                  particular: specData.Particular.trim() || "",
                  amount:specData.Amount
                },
              ];
 
              finalBillOcDataMap[ocArr[j].SubHead] = arr.flat();
            } else {
              let specData = ocArr[j];
               totalAmount+=Number(specData.Amount) || 0
              // console.log("spec data unique: ", specData);
              finalBillOcDataMap[ocArr[j].SubHead] = [{
                patient: specData.PatientName || "",
                admNo: data[i].AdmitionNo || "",
                billNo: data[i].BillNo || "",
                date:
                  specData.AdmitionDate?.split("T")[0]
                    ?.split("-")
                    ?.reverse()
                    .join("/") || "",
                particular: specData.Particular.trim() || "",
                amount:specData.Amount
              }];
            }
          }
        }

        console.log("final bill oc map:", finalBillOcDataMap);

let catArr=[]

for (const key in finalBillOcDataMap) {

  let specTotal = 0
  for(let k=0;  k<finalBillOcDataMap[key].length;k++){
    // console.log("da: ",finalBillOcDataMap[key][k])
specTotal += Number(finalBillOcDataMap[key][k].amount) || 0
  }



catArr.push({
  name:key,
  items:finalBillOcDataMap[key],
  totalQty:finalBillOcDataMap[key].length,
  totalAmount:specTotal
})
}

// console.log("total: ",totalAmount)
let pData = {
 hospitalName: "LORDS DIAGNOSTIC",
    address: "13/3, CIRCULAR 2ND BYE LANE",
    reportTitle: "Final Bill Other Charges Register",
    dateRange: `${from?.split("-")?.reverse().join("/")} to ${to?.split("-")?.reverse().join("/")}`,

    categories:catArr,
grandTotalAmount:totalAmount

}
setPrintData(pData)
console.log("print data: ",pData)
  setTimeout(() => {
        setLoadBtn(false);
      }, 3000);
        // console.log("data map: ", ipdOcDataMap);

        // setFetchedData(ipdOcDataMap);
      } else {
        setFetchedData({});
      }
    } catch (error) {
      console.log("Error fetching ipd adm data: ", error);
    }
  };

  // function handlePrintReport(data) {
  //   // 1. Create a hidden iframe
  //   const iframe = document.createElement("iframe");
  //   iframe.style.display = "none";
  //   document.body.appendChild(iframe);

  //   const doc = iframe.contentWindow.document;

  //   // 2. Generate the HTML Rows
  //   let tableContent = "";
  //   data.forEach((group) => {
  //     tableContent += `
  //     <tr class="category-header"><td colspan="7">Item : ${group.category}</td></tr>
  //     ${group.items
  //       .map(
  //         (item) => `
  //       <tr class="data-row">
  //         <td>${item.sl}</td>
  //         <td>${item.date}</td>
  //         <td>${item.admNo}</td>
  //         <td>${item.name}</td>
  //         <td>${item.qty.toFixed(1)}</td>
  //         <td>${item.rate.toFixed(2)}</td>
  //         <td>${item.amount.toFixed(2)}</td>
  //       </tr>
  //     `,
  //       )
  //       .join("")}
  //     <tr class="subtotal-row">
  //       <td colspan="6">Sub Total :</td>
  //       <td>${group.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
  //     </tr>
  //   `;
  //   });

  //   // 3. Construct the Full Document
  //   const htmlContent = `
  //   <html>
  //   <head>
  //     <style>
  //       body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; font-size: 12px; }
  //       .header { text-align: center; margin-bottom: 20px; }
  //       .header h2 { margin: 0; font-size: 18px; }
  //       .header p { margin: 2px; color: #555; }
  //       table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  //       th { background: #f2f2f2; border-bottom: 2px solid #000; padding: 8px; text-align: left; }
  //       td { padding: 6px; border-bottom: 1px dashed #ccc; }
  //       .category-header { font-weight: bold; color: #6a1b9a; padding-top: 15px; }
  //       .subtotal-row td { border-top: 1px solid red; border-bottom: 1px solid red; font-weight: bold; text-align: right; color: #000; }
  //       .grand-total { margin-top: 20px; border: 2px solid red; padding: 10px; text-align: right; font-weight: bold; font-size: 14px; }
  //       @media print { body { padding: 0; } }
  //     </style>
  //   </head>
  //   <body>
  //     <div class="header">
  //       <h2>LORDS DIAGNOSTIC</h2>
  //       <p>13/3, CIRCULAR 2ND BYE LANE</p>
  //       <h3 style="color:red; margin-top:10px;">OTHER CHARGES REGISTER (DETAIL)</h3>
  //       <p>From: 23/Jun/2023 To: 23/Jun/2023</p>
  //     </div>
  //     <table>
  //       <thead>
  //         <tr>
  //           <th>SlNo</th><th>Entry Date</th><th>Admission No</th><th>Patient Name</th>
  //           <th>Qty</th><th>Rate</th><th>Amount</th>
  //         </tr>
  //       </thead>
  //       <tbody>${tableContent}</tbody>
  //     </table>
  //     <div class="grand-total">Grand Total : 14,457.00</div>
  //   </body>
  //   </html>
  // `;

  //   // 4. Write to iframe and Print
  //   doc.open();
  //   doc.write(htmlContent);
  //   doc.close();

  //   // Wait for resources to load, then print
  //   iframe.contentWindow.focus();
  //   setTimeout(() => {
  //     iframe.contentWindow.print();
  //     document.body.removeChild(iframe); // Clean up
  //   }, 500);
  // }

  const reportData = {
    hospitalName: "LORDS DIAGNOSTIC",
    address: "13/3, CIRCULAR 2ND BYE LANE",
    reportTitle: "Final Bill Other Charges Register",
    dateRange: "23/Jun/2023 to 23/Jun/2023",
    categories: [
      {
        name: "REGISTRATION CHARGE",
        items: [
          {
            patient: "SK RUHUL AMIN",
            admNo: "A-000276/23-24",
            billNo: "F-000205/23-24",
            date: "18/06/2023",
            qty: 1,
            rate: 500,
            amount: 500,
          },
          {
            patient: "SIMRAN PARVEEN",
            admNo: "A-000288/23-24",
            billNo: "F-000207/23-24",
            date: "20/06/2023",
            qty: 1,
            rate: 500,
            amount: 500,
          },
          {
            patient: "SHYAMAL GHOSH",
            admNo: "A-000298/23-24",
            billNo: "F-000208/23-24",
            date: "23/06/2023",
            qty: 1,
            rate: 500,
            amount: 500,
          },
        ],
        totalQty: 3,
        totalAmount: 1500,
      },
      {
        name: "RYLES TUBE CHARGES",
        items: [
          {
            patient: "BHARATI SAMANTA",
            admNo: "A-000283/23-24",
            billNo: "F-000204/23-24",
            date: "19/06/2023",
            qty: 1,
            rate: 250,
            amount: 250,
          },
        ],
        totalQty: 1,
        totalAmount: 250,
      },
    ],
    grandTotalAmount: 1750,
  };

  // const handlePrintReport = () => {
  //   // 1. Generate Dummy Data
  //   const categories = [
  //     {
  //       title: "REGISTRATION CHARGE",
  //       items: [
  //         {
  //           name: "SK RUHUL AMIN",
  //           adm: "A-000276/23-24",
  //           bill: "F-000205/23-24",
  //           date: "18/06/2023",
  //           qty: 1,
  //           rate: 500.0,
  //           amt: 500.0,
  //         },
  //         {
  //           name: "SIMRAN PARVEEN",
  //           adm: "A-000288/23-24",
  //           bill: "F-000207/23-24",
  //           date: "20/06/2023",
  //           qty: 1,
  //           rate: 500.0,
  //           amt: 500.0,
  //         },
  //         {
  //           name: "SHYAMAL GHOSH",
  //           adm: "A-000298/23-24",
  //           bill: "F-000208/23-24",
  //           date: "23/06/2023",
  //           qty: 1,
  //           rate: 500.0,
  //           amt: 500.0,
  //         },
  //       ],
  //       totalQty: 3,
  //       totalAmt: 1500.0,
  //     },
  //     {
  //       title: "UNDER CARE DOCTOR FEES",
  //       items: [
  //         {
  //           name: "SK RUHUL AMIN",
  //           adm: "A-000276/23-24",
  //           bill: "F-000205/23-24",
  //           date: "18/06/2023",
  //           qty: 6,
  //           rate: 1200.0,
  //           amt: 7200.0,
  //         },
  //         {
  //           name: "SIMRAN PARVEEN",
  //           adm: "A-000288/23-24",
  //           bill: "F-000207/23-24",
  //           date: "20/06/2023",
  //           qty: 4,
  //           rate: 1000.0,
  //           amt: 4000.0,
  //         },
  //       ],
  //       totalQty: 10,
  //       totalAmt: 11200.0,
  //     },
  //   ];

  //   // 2. Build the HTML String
  //   let reportHtml = `
  //   <html>
  //     <head>
  //       <title>Print Report</title>
  //       <style>
  //         body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; }
  //         .header { text-align: center; margin-bottom: 20px; }
  //         .header h2 { margin: 0; text-transform: uppercase; }
  //         table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  //         th { border-top: 1px solid #000; border-bottom: 1px solid #000; text-align: left; padding: 5px; }
  //         td { padding: 3px 5px; vertical-align: top; }
  //         .cat-title { font-weight: bold; padding-top: 15px; }
  //         .total-row { font-weight: bold; border-top: 1px solid #000; }
  //         .grand-total { font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; font-size: 14px; }
  //         @media print { @page { margin: 0.5cm; } }
  //       </style>
  //     </head>
  //     <body>
  //       <div class="header">
  //         <h2>LORDS DIAGNOSTIC</h2>
  //         <p>13/3, CIRCULAR 2ND BYE LANE.</p>
  //         <p><strong>Final Bill Other Charges Register</strong><br>From: 23/Jun/2023 To: 23/Jun/2023</p>
  //       </div>
  //       <table>
  //         <thead>
  //           <tr>
  //             <th>Patient Name</th>
  //             <th>AdmissionNo</th>
  //             <th>BillNo</th>
  //             <th>AdmissionDate</th>
  //             <th>Particular</th>
           
  //             <th>Amount</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           ${categories
  //             .map(
  //               (cat) => `
  //             <tr><td colspan="7" class="cat-title">${cat.title}</td></tr>
  //             ${cat.items
  //               .map(
  //                 (item) => `
  //               <tr>
  //                 <td>${item.name}</td>
  //                 <td>${item.adm}</td>
  //                 <td>${item.bill}</td>
  //                 <td>${item.date}</td>
  //                 <td>${item.particular}</td>
  //                 <td>${item.amt.toFixed(2)}</td>
  //               </tr>
  //             `,
  //               )
  //               .join("")}
  //             <tr class="total-row">
  //               <td colspan="4" style="text-align:right">Total</td>
  //               <td>${cat.totalQty}</td>
  //               <td></td>
  //               <td>${cat.totalAmt.toFixed(2)}</td>
  //             </tr>
  //           `,
  //             )
  //             .join("")}
  //           <tr class="grand-total">
  //             <td colspan="4" style="text-align:right">Grand Total</td>
  //             <td>000</td>
  //             <td></td>
  //             <td>12700.00</td>
  //           </tr>
  //         </tbody>
  //       </table>
  //     </body>
  //   </html>
  // `;

  //   // 3. Open a temporary window and print
  //   const printWindow = window.open("", "_blank", "width=900,height=700");
  //   printWindow.document.write(reportHtml);
  //   printWindow.document.close();

  //   // Wait for content to load (especially important if you add images/logos)
  //   printWindow.focus();
  //   setTimeout(() => {
  //     printWindow.print();
  //     printWindow.close();
  //   }, 250);
  // };


  const handlePrintReport = (data) => {

    console.log("print inside:",data)
  // 1. Build the HTML String using the 'data' argument
  let reportHtml = `
    <html>
      <head>
        <title>Print Report - ${data.hospitalName}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 11px; padding: 20px; line-height: 1.4; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
          .header p { margin: 2px 0; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { border-top: 1px solid #000; border-bottom: 1px solid #000; text-align: left; padding: 8px 4px; }
          td { padding: 4px; vertical-align: top; }
          
          .cat-title { font-weight: bold; padding-top: 12px; text-decoration: underline; }
          .total-row { font-weight: bold; border-top: 1px solid #000; }
          .total-label { text-align: right; padding-right: 20px; }
          
          .grand-total { font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; font-size: 13px; }
          
          /* Aligns numbers to the right for better readability */
          .num { text-align: right; }
          
          @media print { 
            @page { margin: 0.5cm; } 
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${data.hospitalName}</h2>
          <p>${data.address}</p>
          <br/>
          <strong>${data.reportTitle}</strong><br>
          From: ${data.dateRange}
        </div>

        <table>
          <thead>
            <tr>
              <th >Patient Name</th>
              <th >AdmissionNo</th>
              <th >BillNo</th>
              <th >AdmissionDate</th>
              <th >Particular</th>
              
              <th  >Amount</th>
            </tr>
          </thead>
          <tbody>
          
            ${data.categories.map(cat => `
              <tr>
                <td colspan="7" class="cat-title">${cat.name}</td>


              </tr>
              ${cat.items.map(item => `
                <tr >
                  <td>${item.patient}</td>
                  <td style={{font-size:8px;}}>${item.admNo}</td>
                  <td style={{font-size:8px;}}>${item.billNo}</td>
                  <td>${item.date}</td>
                  <td >${item.particular || ""}</td>
             
                  <td >${item.amount ||0}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" class="total-label">Total</td>
                
                <td></td>
                <td></td>
                <td >${cat.totalAmount?.toFixed(2)||0}</td>
              </tr>
            `).join('')}
            
            <tr class="grand-total">
              <td colspan="3" class="total-label">Grand Total</td>
              <td >
              </td>
              <td></td>
              <td >${data.grandTotalAmount?.toFixed(2)||0}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;

  // 2. Open temporary window and print
  const printWindow = window.open("", "_blank", "width=900,height=700");
  printWindow.document.write(reportHtml);
  printWindow.document.close();

  printWindow.focus();
  // Slight delay to ensure CSS and text are fully rendered before print dialog appears
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

// Example Usage:
// handlePrintReport(reportData);
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

                
                  handlePrintReport( printData );
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

export default DateWiseFinalBillOtherChargesReg;

