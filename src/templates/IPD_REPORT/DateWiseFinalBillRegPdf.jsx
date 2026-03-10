import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../axiosInstance";

const DateWiseFinalBillReg = () => {
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [fetchedData, setFetchedData] = useState([]);
  const [docMap, setDocMap] = useState({});

  const [loadBtn, setLoadBtn] = useState(false);
  const [printData, setPrintData] = useState([]);

  const fetchData = async (from, to) => {
    if (!from || !to) {
      return;
    }
    try {
      setLoadBtn(true);
      const res = await axiosInstance.get(
        `/fb-with-details?startDate=${from}&endDate=${to}&page=1&limit=999`,
      );

      if (res.data.success) {
        console.log("Fetched data is:", res.data.data);
        setFetchedData(res.data.data);
      } else {
        setFetchedData([]);
      }
    } catch (error) {
      console.log("Error fetching ipd adm data: ", error);
    }
  };

  function handlePrint(data) {
    // 1. Create a hidden iframe for printing to keep the main window clean
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;

    // 2. Define the exact styles to match the register image
    const style = `
        <style>
            @page { size: landscape; margin: 10mm; }
            body { font-family: 'Arial', sans-serif; font-size: 9pt; margin: 0; color: #000; }
            .header { text-align: center; margin-bottom: 15px; text-transform: uppercase; }
            .header h1 { font-size: 13pt; margin: 0; letter-spacing: 1px; }
            .header p { margin: 2pt 0; font-weight: bold; font-size: 9pt; }
            .title { color: red; font-weight: bold; text-decoration: underline; margin: 8pt 0; display: block; }
            
            table { width: 100%; border-collapse: collapse; border-top: 1.5pt solid #000; border-bottom: 1.5pt solid #000; }
            th { font-size: 8pt; padding: 6pt 2pt; text-align: left; border-bottom: 1pt solid #000; }
            td { font-size: 8pt; padding: 5pt 2pt; text-align: right; vertical-align: top; border-bottom: 0.5pt dashed #aaa; }
            
            .left-align { text-align: left; }
            .right-align { text-align: right; }
            .patient-name { font-weight: bold; display: block; }
            .net-amt { font-weight: bold; }
            .sub-val { display: block; margin-top: 2pt; }
        </style>
    `;

    // 3. Build the HTML Table Structure
    let tableRows = "";
    let totalBedCh = 0;
    let totalDiagCh = 0;
    let totalOtCh = 0;
    let totalOCch = 0;
    let totalMedCh = 0;
    let totalSerCh = 0;
    let totalDiscCh = 0;
    let totalNetHomeAmt = 0;
    let totalMedAdv = 0;
    let totalSur = 0;
    let totalDiagAdv = 0;
    let totalDrVisit = 0;
    let totalOICh = 0;
    data.forEach((item) => {
      totalBedCh += Number(item.bedCh);
      totalDiagCh += Number(item.diagCh);
      totalOtCh += Number(item.otCh);
      totalOCch += Number(item.otherCh);
      totalMedCh += Number(item.medicine);
      totalSerCh += Number(item.serviceCh);
      totalDiscCh += Number(item.discAmt);
      totalNetHomeAmt += Number(item.netHomeAmt);
      totalMedAdv += Number(item.medAdv);
      totalSur += Number(item.surgeon);
      totalDiagAdv += Number(item.diagAdv);
      totalDrVisit += Number(item.drVisit);
      totalOICh += Number(item.othersIncome);

      tableRows += `
            <tr>
                <td class="left-align">${item.slNo}</td>
                <td class="left-align">${item.billNo}<br><span class="sub-val">${item.billDate}</span></td>
                <td class="left-align"><span class="patient-name">${item.patientName}</span>${item.doctor}</td>
                <td class="left-align">${item.admNo}<br><span class="sub-val">${item.admDate}</span></td>
                <td>${item.bedCh}<br><span class="sub-val">${item.rmoCh}</span></td>
                <td>${item.diagCh}<br><span class="sub-val">${item.otCh}</span></td>
                <td>${item.otherCh}<br><span class="sub-val">${item.medicine}</span></td>
                <td>${item.serviceCh}<br><span class="sub-val">${item.discAmt}</span></td>
                <td><span class="net-amt">${item.netHomeAmt}</span><br><span class="sub-val">${item.medAdv}</span></td>
                <td>${item.surgeon}<br><span class="sub-val">${item.diagAdv}</span></td>
                <td>${item.drVisit}</td>
                <td>${item.othersIncome}</td>
            </tr>
        `;
    });

    tableRows += ` <tr>
                <td class="left-align"></td>
                <td class="left-align">NURSHING HOME INCOME<br><span class="sub-val">OTHER INCOME</span></td>
                <td class="left-align"><span class="patient-name"></span></td>
                <td class="left-align"><br><span class="sub-val"></span></td>
                <td>${totalBedCh}<br><span class="sub-val">${0.0}</span></td>
                <td>${totalDiagCh}<br><span class="sub-val">${totalOtCh}</span></td>
                <td>${totalOCch}<br><span class="sub-val">${totalMedCh}</span></td>
                <td>${totalSerCh}<br><span class="sub-val">${totalDiscCh}</span></td>
                <td><span class="net-amt">${totalNetHomeAmt}</span><br><span class="sub-val">${totalMedAdv}</span></td>
                <td>${totalSur}<br><span class="sub-val">${totalDiagAdv}</span></td>
                <td>${totalDrVisit}</td>
                <td>${totalOICh}</td>
            </tr>`;

    // 4. Combine into final document
    doc.write(`
        <html>
            <head>${style}</head>
            <body>
                <div class="header">
                    <h1>LORDS DIAGNOSTIC</h1>
                    <p>13/3, CIRCULAR 2ND BYE LANE,</p>
                    <span class="title">FINAL BILL REGISTER</span>
                    <p>Date From: 23/Jun/2023 To: 26/Jun/2023</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th class="left-align">Sl No</th>
                            <th class="left-align">Bill No<br>Bill Date</th>
                            <th class="left-align">Patient Name<br>Doctor Name</th>
                            <th class="left-align">Adm. No.<br>Adm. Date</th>
                            <th class="right-align">Bed Ch.<br>RMO Ch</th>
                            <th class="right-align">Diag Ch<br>OT Ch.</th>
                            <th class="right-align">Other Ch<br>Medicine</th>
                            <th class="right-align">Service Ch<br>Disc Amt</th>
                            <th class="right-align">N Home Amt<br>Med Adv</th>
                            <th class="right-align">Surgeon<br>Diag Adv</th>
                            <th class="right-align">Dr Visit</th>
                            <th class="right-align">Others<br>Income</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
        </html>
    `);

    doc.close();

    // 5. Trigger print and then remove the iframe
    printFrame.contentWindow.focus();
    setTimeout(() => {
      printFrame.contentWindow.print();
      document.body.removeChild(printFrame);
    }, 500);
  }

  const fetchDoctors = async () => {
    try {
      const res = await axiosInstance("/doctors");
      if (res.data.success) {
        const data = {};
        for (let i = 0; i < res.data.data.length; i++) {
          data[res.data.data[i].DoctorId] = res.data.data[i];
        }
        console.log("Doc map: ", data);
        setDocMap(data);
      } else {
        setDocMap({});
      }
    } catch (error) {
      console.log("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      fetchData(fromDate, toDate);
    }, 800);
    return () => clearTimeout(timeOut);
  }, [fromDate, toDate]);

  useEffect(() => {
    if (Object.keys(docMap).length != 0 && fetchedData.length != 0) {
      let data = fetchedData.map((item, idx) => ({
        slNo: idx + 1,
        billNo: item?.BillNo || "",
        billDate:
          item?.BillDate?.split("T")[0]?.split("-")?.reverse().join("/") || "",
        patientName: item?.PatientName || "",
        doctor: docMap[item.UCDoctor1Id]?.Doctor || "",
        admNo: item.AdmitionNo || "",
        admDate:
          item?.AdmitionDate?.split("T")[0]?.split("-")?.reverse().join("/") ||
          "",
        bedCh:
          item.details?.finalbilldtl?.find((item) => item.SlNo == 1)?.Amount1 ||
          "0.00",
        rmoCh:
          item.details?.finalbilldtl?.find((item) => item.SlNo == 1)?.Amount3 ||
          "0.00",
        diagCh:
          item.details?.finalbilldtl?.find((item) => item.SlNo == 5)?.Amount1 ||
          "0.00",
        otCh:
          item.details?.finalbilldtl?.find((item) => item.SlNo == 3)?.Amount1 ||
          "0.00",
        otherCh:
          item.details?.finalbilldtl?.find((item) => item.SlNo == 2)?.Amount1 ||
          "0.00",
        medicine:
          item.details?.finalbilldtl?.find((item) => item.SlNo == 6)?.Amount1 ||
          "0.00",
        serviceCh:
          item.details?.finalbilldtl?.find((item) => item.SlNo == 7)?.Amount1 ||
          "0.00",
        discAmt: item?.Discount || "0.00",
        netHomeAmt:
          Number(
            item.details?.finalbilldtl?.find((item) => item.SlNo == 1)?.Amount1,
          ) +
            Number(
              item.details?.finalbilldtl?.find((item) => item.SlNo == 5)
                ?.Amount1,
            ) +
            Number(
              item.details?.finalbilldtl?.find((item) => item.SlNo == 3)
                ?.Amount1,
            ) +
            Number(
              item.details?.finalbilldtl?.find((item) => item.SlNo == 2)
                ?.Amount1,
            ) +
            Number(
              item.details?.finalbilldtl?.find((item) => item.SlNo == 7)
                ?.Amount1,
            ) || "0.00",
        medAdv: "0.00",
        surgeon: "0.00",
        diagAdv: "0.00", // not found
        drVisit:
          Number(
            item.details?.finalbilldtl?.find((item) => item.SlNo == 4)?.Amount1,
          ) || "0.00",
        othersIncome: "0.00",
      }));

      setPrintData(data);

      setTimeout(() => {
        setLoadBtn(false);
      }, 3000);
    }
  }, [docMap, fetchedData]);

  return (
    <div>
      <div className="container my-5">
        <div className="panel shadow-lg border-0 rounded-4">
          <div className="panel-body p-4 p-md-5">
            <h4 className="mb-4 text-center">
              📊 Date Wise Final Bill Register
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
                disabled={loadBtn}
                onClick={() => {
                  if (fetchedData.length == 0) {
                    toast.error("No data to print.");
                    return;
                  }
                  handlePrint(printData);
                }}
              >
                {loadBtn ? (
                  <span>
                    {" "}
                    <i className="fa-light fa-print me-2"></i>
                    Loading...{" "}
                  </span>
                ) : (
                  <span>
                    {" "}
                    <i className="fa-light fa-print me-2"></i>
                    Print Report{" "}
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

export default DateWiseFinalBillReg;
