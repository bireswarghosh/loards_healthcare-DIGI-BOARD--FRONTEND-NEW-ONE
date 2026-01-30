import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
// import useAxiosFetch from "./Fetch";
import JsBarcode from "jsbarcode";
import useAxiosFetch from "./DiagnosisMaster/Fetch";

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
  const { data: emr } = useAxiosFetch(admissionId ? `/emr/${id}` : null, [
    admissionId,
  ]);
  // fetch doctor name===============================
  const { data: doctor } = useAxiosFetch(
    patient?.UCDoctor1Id ? `doctormaster/${patient?.UCDoctor1Id}` : null,
    [patient?.UCDoctor1Id]
  );
  // fetch doctor name===============================
  const { data: doctor2 } = useAxiosFetch(
    patient?.UCDoctor1Id ? `doctormaster/${patient.UCDoctor2Id}` : null,
    [patient?.UCDoctor1Id]
  );
  // fetch bed============================
  const { data: bed } = useAxiosFetch(
    patient.BedId ? `/bedMaster/${patient.BedId}` : null,
    [patient.BedId]
  );
  const getDischargeText = (value) => {
    const map = {
      0: "Normal Discharge",
      1: "Discharge On Request",
      2: "Discharge on Risk Bond",
      3: "Expired",
      4: "Referred",
      5: "Lama",
      6: "Discharge Against Medical Service",
      7: "Left Against Discharge Advice",
    };
    return map[value] || "";
  };

  const barcodeImg = useMemo(() => {
    if (!dischargeData?.AdmitionId) return "";
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, `A-${dischargeData?.AdmitionId}`, {
      format: "CODE128",
      width: 3,
      height: 100,
      displayValue: true,
    });
    return canvas.toDataURL("image/png");
  }, [dischargeData?.AdmitionId]);

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
            <th style={{ border: "1px solid #000", padding: "2px" }}>Sl</th>
            <th style={{ border: "1px solid #000", padding: "2px" }}>
              Medicine
            </th>
            <th style={{ border: "1px solid #000", padding: "2px" }}>Dose</th>
            <th style={{ border: "1px solid #000", padding: "2px" }}>Unit</th>
            <th style={{ border: "1px solid #000", padding: "2px" }}>Days</th>
          </tr>
        </thead>
        <tbody>
          {arr
            .sort((a, b) => a.SlNo - b.SlNo)
            .map((m, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #000", padding: "2px" }}>
                  {m.SlNo}
                </td>
                <td style={{ border: "1px solid #000", padding: "2px" }}>
                  {m.advmed}
                </td>
                <td style={{ border: "1px solid #000", padding: "2px" }}>
                  {m.dose}
                </td>
                <td style={{ border: "1px solid #000", padding: "2px" }}>
                  {m.dunit}
                </td>
                <td style={{ border: "1px solid #000", padding: "2px" }}>
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
          margin: 10mm;
        }

        body {
          font-family: "Times New Roman", serif;
          font-size: 12px;
          color: #000;
        }

        .section-title {
          font-weight: bold;
          margin-top: 8px;
          // margin-bottom: 4px;
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
          .info-box {
  display: flex;
  gap: 4px;
  font-size: 14px;
}
.info-box .label {
  font-weight: 600;
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
      <div
        id="printSection"
        className="container-fluid border border-dark rounded p-3 mb-1 bg-light "
      >
        {/* HEADER */}

        <div className="container-fluid">
          {/* HEADER BOX */}
          <div className="p-3 mb-1">
            <div className="row align-items-center">
              {/* Logo */}
              <div className="col-sm-2 text-center">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLBp8HRkxkrAD3J_42s4lQdr95CDxPS-aQCQ&s"
                  alt="Hospital Logo"
                />
              </div>

              {/* Hospital Info */}
              <div className="col-sm-8 text-center">
                <h4 className="fw-bold mb-1">LORDS HEALTH CARE</h4>

                <div>
                  <div>
                    13/3, Circular 2nd bye lane, (Near Jumanabala Balika
                    Vidyalaya) Shibpur, Howrah - 711 102, W.B.
                  </div>
                  <div>
                    Phone No.: (033) 2688 1734, 8272904444, HELPLINE
                    -7003378414, Toll Free No. 1800-309-0895
                  </div>
                  <div>
                    E-mail: patientdesk@lordshealthcare.org,
                    Website:www.lordshealthcare.org
                  </div>
                </div>
              </div>

              {/* Barcode Placeholder */}
              <div className="col-sm-2 text-end">
                {barcodeImg && <img src={barcodeImg} alt="barcode" />}
              </div>
            </div>

            {/* CENTER HEADING BOX */}
            <div className="text-center ">
              <div
                className="border border-dark  fw-semibold"
                // style={{ fontSize: "15px" }}
              >
                DISCHARGE SUMMARY & CERTIFICATE
              </div>
            </div>

            {/* ADVICE / REFERRED / UHID */}
            <div className="row  text-center">
              <div className="col-sm-4 text-start">
                <b>Discharge Advice No :</b> {dischargeData?.DisCerNo}
              </div>

              <div className="col-sm-3 fw-semibold">
                {getDischargeText(dischargeData.DiscType)}
              </div>

              <div className="col-sm-3 text-end">
                <b>UHID :</b> {patient.UHID}
              </div>
            </div>
          </div>
          {/* END HEADER BOX */}
        </div>

        

        {/* BASIC INFO */}

        <div className="container-fluid border rounded p-2 mb-1">
          {/* BOX START */}

          <div className="row mb-1">
            <div className="col-sm-3 d-flex">
              <span className="fw-semibold me-1">Patient:</span>
              <span>{patient.PatientName}</span>
            </div>

            <div className="col-sm-3 d-flex">
              <span className="fw-semibold me-1">Patient Id:</span>
              <span>{`A-${patient?.AdmitionId}`}</span>
            </div>

            <div className="col-sm-3 d-flex">
              <span className="fw-semibold me-1">Age:</span>
              <span>{patient.Age}</span>
            </div>

            <div className="col-sm-3 d-flex">
              <span className="fw-semibold me-1">Sex:</span>
              <span>{patient.Sex}</span>
            </div>
          </div>

          <div className="row mb-1">
            <div className="col-sm-3 d-flex">
              <span className="fw-semibold me-1">Under Care:</span>
              <span>{doctor.Doctor}</span>
            </div>

            <div className="col-sm-2 d-flex">
              <span className="fw-semibold me-1">Bed:</span>
              <span>{bed?.Bed}</span>
            </div>

            <div className="col-sm-3 d-flex">
              <span className="fw-semibold me-1">Type Of Discharge:</span>
              <span>{getDischargeText(dischargeData.DiscType)}</span>
            </div>

            <div className="col-sm-3 d-flex">
              <span className="fw-semibold me-1">Admission Date:</span>
              <span>{patient.AdmitionDate?.split("T")[0]}</span>
            </div>
          </div>
          <div className="row mb-1">
            <div className="col-sm-3 d-flex">
              <span className="fw-semibold me-1">Admission Time:</span>
              <span>{patient.AdmitionTime}</span>
            </div>

            <div className="col-sm-3 d-flex">
              <span className="fw-semibold me-1">Discharge Date:</span>
              <span>{dischargeData.DisCerDate?.split("T")[0]}</span>
            </div>

            <div className="col-sm-3 d-flex">
              <span className="fw-semibold me-1">Discharge Time:</span>
              <span>{dischargeData.DisCerTime}</span>
            </div>
            <div className="col-sm-3 d-flex">
              <span className="fw-semibold me-1">Referring Dr.</span>
              <span>{doctor2.Doctor}</span>
            </div>
          </div>

          <div className="row mb-1">
            <div className="col-sm-12 d-flex">
              <span className="fw-semibold me-1">Address:</span>
              <span>
                {patient.Add1} {patient.Add2} {patient.Add3}
              </span>
            </div>
          </div>

          {/* BOX END */}
        </div>

        {/* EMR SECTIONS */}
        <div className="section-title">Diagnosis :</div>
        {bulletList(emr?.diagnosis, "diagonisis")}

        <div className="section-title">
          Present Complaints / Reason for Admission :
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

        <div className="section-title">
          {dischargeData?.DiscType === 0
            ? "Advice (Diet & Medication) :"
            : "On Going Medicine :"}
        </div>

        {adviceTable(emr?.adviceMedicine)}

        <div className="section-title">
          Follow Up Date (With Instruction Notes) :
        </div>
        {renderMultiline(dischargeData.E)}

        {/* FOOTER */}

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
};;;;

export default DischargePrint;