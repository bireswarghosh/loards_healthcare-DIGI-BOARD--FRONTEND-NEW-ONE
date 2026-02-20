import React from "react";
// import logo from "../../../../loards_healthcare-DIGI-BOARD--FRONTEND-NEW-ONE/public\assets\images\logo-small.png";


const PrintOtherCharges = ({ data }) => {
  if (!data) return null;

  const safe = (v) => (v !== undefined && v !== null ? v : "");
  const num = (v) => Number(v || 0).toFixed(2);

  return (
    <div
      style={{
        padding: "20px",
        width: "210mm",
        margin: "0 auto",
        fontFamily: "Arial",
        fontSize: "14px",
      }}
    >
      <style>
        {`
          @page { size: A4; margin: 10mm; }
          @media print { body { margin: 0; } }
          table, th, td { border-collapse: collapse; }
        `}
      </style>

      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <h2 style={{ margin: 0, fontWeight: "bold" }}>LORDS HEALTH CARE</h2>
        <p style={{ margin: 0 }}>
          13/3, Circular 2nd Bye Lane, Kona Expressway, Howrah - 711102, W.B.
        </p>
        <p style={{ margin: 0 }}>Phone: 8272904444 | HELPLINE: 7003378414</p>
      </div>
      <div>
        <img
          // src="/assets/images/logo-big.png"
          src="/assets/images/images.jpg"
          alt="logo"
          style={{ width: "80px" }}
        />
      </div>

      <h4 style={{ textAlign: "center", margin: "8px 0", fontWeight: "bold" }}>
        OUTDOOR BILL CUM RECEIPT
      </h4>

      {/* BILL HEADER */}
      <table style={{ width: "100%", border: "1px solid #000" }}>
        <tbody>
          <tr>
            <td style={{ padding: "5px" }}>
              <b>Registration No:</b> {safe(data.RegistrationId)}
            </td>
            <td style={{ padding: "5px" }}>
              <b>Date:</b> {safe(data.OutBillDate)}
            </td>
          </tr>

          <tr>
            <td style={{ padding: "5px" }}>
              <b>Patient Name:</b> {safe(data.PatientName)}
            </td>
            <td style={{ padding: "5px" }}>
              <b>Bill No:</b> {safe(data.OutBillNo)}
            </td>
          </tr>

          <tr>
            <td style={{ padding: "5px" }}>
              <b>Address:</b> {safe(data.Add1)} {safe(data.Add2)}{" "}
              {safe(data.Add3)}
            </td>
            <td style={{ padding: "5px" }}>
              <b>Phone:</b> {safe(data.PhoneNo)}
            </td>
          </tr>

          <tr>
            <td style={{ padding: "5px" }}>
              <b>Doctor:</b> {safe(data.DoctorName)}
            </td>
            <td style={{ padding: "5px" }}>
              <b>Age:</b> {safe(data.Age)}Y
            </td>
            <td style={{ padding: "5px" }}>
              <b>Sex:</b> {safe(data.Sex)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* CHARGE ITEMS */}
      <table
        style={{ width: "100%", border: "1px solid #000", marginTop: "15px" }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "left",
              }}
            >
              PARTICULARS
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px",
                width: "120px",
                textAlign: "right",
              }}
            >
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          {(data.chargeItems || []).map((item, idx) => (
            <tr key={idx}>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                }}
              >
                {safe(item.OtherCharge)}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "right",
                }}
              >
                {num(item.Amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS */}
      <div
        style={{
          width: "100%",
          marginTop: "12px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <table style={{ width: "40%" }}>
          <tbody>
            <tr>
              <td>
                <b>Less Discount:</b>
              </td>
              <td style={{ textAlign: "right" }}>{num(data.DiscAmt)}</td>
            </tr>
            <tr>
              <td>
                <b>PAID AMOUNT:</b>
              </td>
              <td style={{ textAlign: "right" }}>{num(data.paidamt)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* DATE */}
      <p style={{ marginTop: "20px" }}>
        <b>PRINT DATE & TIME :</b> {new Date().toLocaleString()}
      </p>

      <p style={{ textAlign: "right", marginTop: "50px" }}>
        <b>Billed By :</b> {safe(data.billedBy)}
      </p>
    </div>
  );
};

export default PrintOtherCharges;