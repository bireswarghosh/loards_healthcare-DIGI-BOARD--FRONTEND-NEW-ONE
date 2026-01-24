import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAxiosFetch from "./DiagnosisMaster/Fetch";
// import useAxiosFetch from "./Fetch";

const DischargePrint = () => {
  const { id } = useParams();

  // ───────────────────────────────
  // 1) Fetch Discharge Data
  // ───────────────────────────────
  const { data: dischargeData } = useAxiosFetch(`/discert/${id}`, [id]);

  const renderMultiline = (text) => {
  if (!text) return null; 
  return String(text)
    .split(/\r?\n/)
    .map((line, i) => <div key={i}>{line}</div>);
};


  // ───────────────────────────────
  // 2) Fetch Patient Data
  // ───────────────────────────────
  const admissionId = dischargeData?.AdmitionId;
  const { data: patient } = useAxiosFetch(
    admissionId ? `/admission/${admissionId}` : null,
    [admissionId]
  );

  // ───────────────────────────────
  // 3) Fetch EMR DATA
  // ───────────────────────────────
  const { data: emr } = useAxiosFetch(
    admissionId ? `/emr/${id}` : null,
    [admissionId]
  );

  if (!dischargeData || !patient) return null;

  // helper: ordered bullet list
  const bulletList = (arr, key) =>
    arr?.length ? (
      <ol>
        {[...arr]
          .sort((a, b) => a.SlNo - b.SlNo)
          .map((item, idx) => (
            <li key={idx}>{item[key]}</li>
          ))}
      </ol>
    ) : (
      <span className="text-muted"></span>
    );

  // helper: advice medicine table
  const adviceTable = (arr) =>
    arr?.length ? (
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #000", padding: "4px" }}>
              Medicine
            </th>
            <th style={{ border: "1px solid #000", padding: "4px" }}>Dose</th>
            <th style={{ border: "1px solid #000", padding: "4px" }}>Unit</th>
            <th style={{ border: "1px solid #000", padding: "4px" }}>Days</th>
          </tr>
        </thead>
        <tbody>
          {arr
            .sort((a, b) => a.SlNo - b.SlNo)
            .map((m, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #000", padding: "4px" }}>
                  {m.advmed}
                </td>
                <td style={{ border: "1px solid #000", padding: "4px" }}>
                  {m.dose}
                </td>
                <td style={{ border: "1px solid #000", padding: "4px" }}>
                  {m.dunit}
                </td>
                <td style={{ border: "1px solid #000", padding: "4px" }}>
                  {m.nodays}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    ) : (
      <></>
    );

  return (
    <>
      {/* PRINT CSS */}
      <style>{`
        @page {
          size: A4;
          margin: 12mm;
        }

        body {
          font-family: "Times New Roman", serif;
          font-size: 12px;
          color: #000;
        }

        .section-title {
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 4px;
          border-bottom: 1px solid #000;
          font-size: 14px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        td, th {
          border: 1px solid #000;
          padding: 4px;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          #printSection, #printSection * {
            visibility: visible !important;
          }

          #printSection {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }

          .no-print {
            display: none !important;
          }
        }

        .no-print {
          position: fixed;
          top: 70px;
          right: 10px;
          z-index: 999;
        }
      `}</style>

      <button
        onClick={() => window.print()}
        className="btn btn-primary btn-sm no-print"
      >
        🖨 Print
      </button>

      {/* ─────────────────────────────── */}
      {/*          PRINT SECTION          */}
      {/* ─────────────────────────────── */}
      <div id="printSection">
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <h3>LORDS HEALTH CARE</h3>
          <div>13/3 Circular 2nd Bye Lane, Shibpur, Howrah – 711102</div>
          <div>
            Phone: (033) 2688-1734 | Helpline: 8272904444 | Toll Free:
            1800-309-0895
          </div>
        </div>

        <hr />

        {/* BASIC INFO */}
        <table>
          <tbody>
            <tr>
              <td>
                <b>Discharge Advice No</b>
              </td>
              <td>{dischargeData.DisCerNo}</td>
              <td>
                <b>Type of Discharge</b>
              </td>
              <td>{dischargeData.DiscType}</td>
            </tr>

            <tr>
              <td>
                <b>Admission No</b>
              </td>
              <td>{patient.AdmitionId}</td>
              <td>
                <b>Bed</b>
              </td>
              <td>{patient.BedId}</td>
            </tr>

            <tr>
              <td>
                <b>Admission Date</b>
              </td>
              <td>{patient.AdmitionDate?.split("T")[0]}</td>
              <td>
                <b>Discharge Date</b>
              </td>
              <td>{dischargeData.DisCerDate?.split("T")[0]}</td>
            </tr>

            <tr>
              <td>
                <b>Admission Time</b>
              </td>
              <td>{patient.AdmitionTime}</td>
              <td>
                <b>Discharge Time</b>
              </td>
              <td>{dischargeData.DisCerTime}</td>
            </tr>
          </tbody>
        </table>

        <br />

        {/* PATIENT INFO */}
        <table>
          <tbody>
            <tr>
              <td>
                <b>Patient Name</b>
              </td>
              <td>{patient.PatientName}</td>
              <td>
                <b>Age / Sex</b>
              </td>
              <td>
                {patient.Age} / {patient.Sex}
              </td>
            </tr>

            <tr>
              <td>
                <b>Guardian Name</b>
              </td>
              <td>{patient.RelativeName}</td>
              <td>
                <b>Relation</b>
              </td>
              <td>{patient.Relation}</td>
            </tr>

            <tr>
              <td>
                <b>Address</b>
              </td>
              <td colSpan={3}>
                {patient.Add1} {patient.Add2} {patient.Add3}
              </td>
            </tr>

            <tr>
              <td>
                <b>Under Care Doctor</b>
              </td>
              <td>{patient.UCDoctor1Id}</td>
              <td>
                <b>Referred By</b>
              </td>
              <td>{patient.UCDoctor2Id}</td>
            </tr>
          </tbody>
        </table>

        {/* EMR SECTIONS */}
        <div className="section-title">Diagnosis :</div>
        {bulletList(emr?.diagnosis, "diagonisis")}

        <div className="section-title">
          Present Complains / Reason for Admission :
        </div>
        {bulletList(emr?.complaints, "chief")}

        <div className="section-title">Past History :</div>
        {bulletList(emr?.pastHistory, "History")}

        <div className="section-title">Significant Findings :</div>
        {renderMultiline(dischargeData.G)}

        <div className="section-title">Investigation Results :</div>
        {bulletList(emr?.investigations, "Invest")}

        <div className="section-title">Course in the Hospital :</div>
        {renderMultiline(dischargeData.B)}

        <div className="section-title">Condition at Discharge :</div>
        {renderMultiline(dischargeData.F)}

        <div className="section-title">Advice (Diet & Medication) :</div>
        {renderMultiline(dischargeData.E)}
        {adviceTable(emr?.adviceMedicine)}

        <div className="section-title">Remarks :</div>
        {renderMultiline(dischargeData.Remarks)}

        {/* FOOTER */}
        <br />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <b>Date:</b> {new Date().toLocaleDateString()}
          </div>
          <div>
            <b>Signature of Doctor / R.M.O</b>
          </div>
        </div>
      </div>
    </>
  );
};

export default DischargePrint;