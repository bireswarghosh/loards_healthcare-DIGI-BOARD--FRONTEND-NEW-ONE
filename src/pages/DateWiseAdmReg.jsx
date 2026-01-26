import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../axiosInstance";
import { generateRegistrationChargePDF } from "./bireswar_pages/outdoor/DateWiseRegistrationCharge/registrationChargePDF";

const DateWiseAdmReg = () => {
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [admData, setAdmData] = useState([]);

  const fetchAdms = async (from, to) => {
    try {
      const res = await axiosInstance.get(
        `/admission/filter?startDate=${from}&endDate=${to}`,
      );
      console.log("data: ", res.data);
      setAdmData(res.data);
    } catch (error) {
      console.log("Error fetching ipd adm data: ", error);
    }
  };

  const handlePrint = (from, to, count) => {
    const printContent = `
    <html>
      <head>
        <title>Admission Register</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
          }

          .center {
            text-align: center;
            font-weight: bold;
          }

          .title-red {
            color: red;
            font-weight: bold;
            text-align: center;
            margin-top: 20px;
          }

          .section {
            margin-top: 30px;
            margin-left: 50px;
            font-size: 16px;
          }

          .total-box {
            margin-top: 40px;
            border: 1px solid #000;
            padding: 10px;
            width: 300px;
            margin-left: 50px;
            font-weight: bold;
          }

          p {
            margin: 6px 0;
          }
        </style>
      </head>

      <body>
        <div class="center">
          LORDS DIAGNOSTIC <br />
          13/3, CIRCULAR 2ND BYE LANE,
        </div>

        <div class="title-red">DEPARTMENT-WISE ADMISSION REGISTER</div>

        <div class="center" style="margin-top: 10px;">
          From: ${from} To : ${to}
        </div>

        <div class="section">
          <p>1 &nbsp; ADDITIONAL BED (OPD / DAYCARE) : 0</p>
          <p>2 &nbsp; DOUBLE SHARING (AC) : 0</p>
          <p>3 &nbsp; GEN BED (AC) : 0</p>
          <p>4 &nbsp; ICCU / ITU : 0</p>
          <p>5 &nbsp; NON-AC CABIN W/O ATTACHED BATH : 0</p>
          <p>6 &nbsp; SINGLE AC ROOM (EXECUTIVE) : 0</p>
          <p>7 &nbsp; SINGLE AC ROOM (DELUXE) : 0</p>
          <p>8 &nbsp; SINGLE AC ROOM (ECONOMY) : 0</p>
          <p>9 &nbsp; SUITE : 0</p>
          <p>10 TRIPLE SHARING AC ROOM (AC) : 0</p>
        </div>

        <div class="total-box">
          TOTAL ADMISSIONS : ${count}
        </div>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  useEffect(() => {
    const timeOut = setTimeout(() => {
      fetchAdms(fromDate, toDate);
    },500);
    return () => clearTimeout(timeOut);

    // fetchAdms();
  }, [fromDate, toDate]);

  return (
    <div>
      <div className="container my-5">
        <div className="panel shadow-lg border-0 rounded-4">
          <div className="panel-body p-4 p-md-5">
            <h4 className="mb-4 text-center">
              📊 Date Wise Admission Register
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
                onClick={
                    () => {
                      handlePrint(fromDate, toDate,admData.count)
                    }
                    
                }
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

export default DateWiseAdmReg;
