import React from "react";

/* ============================================================
   EMR THEME HELPERS
============================================================ */
const Panel = ({ title, children, right }) => (
  <div className="panel mb-3">
    <div className="panel-header d-flex justify-content-between align-items-center">
      <h5 className="panel-title">{title}</h5>
      <div>{right}</div>
    </div>
    <div className="panel-body">{children}</div>
  </div>
);

const FormField = ({
  label,
  type = "text",
  defaultValue = "",
  placeholder = "",
  children,
  readOnly = false,
}) => (
  <div className="mb-2">
    <label className="form-label small fw-bold">{label}</label>
    <input
      type={type}
      className={`form-control form-control-sm ${
        readOnly ? "bg-light" : ""
      }`}
      defaultValue={defaultValue}
      placeholder={placeholder}
      readOnly={readOnly}
    />
    {children}
  </div>
);

const TableHeader = ({ columns }) => (
  <thead className="digi-table-header">
    <tr>
      {columns.map((c, i) => (
        <th key={i} className={c.className || ""} style={c.style}>
          {c.label}
        </th>
      ))}
    </tr>
  </thead>
);

/* ============================================================
   MAIN COMPONENT
============================================================ */
const Estimate = () => {
  return (
    <div className="container-fluid py-3">

      {/* ===================== HEADER ===================== */}
      <div className="panel mb-3">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5 className="panel-title">Estimate / Package Billing</h5>

          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-secondary">List</button>
            <button className="btn btn-sm btn-primary">Estimate</button>
          </div>
        </div>
      </div>

      {/* ===================== Patient Search ===================== */}
      <Panel title="Patient Search">
        <div className="row g-2 align-items-end">

          <div className="col-md-4">
            <FormField label="Search by Name" placeholder="Patient Name" />
          </div>

          <div className="col-md-3">
            <FormField
              label="Search by Phone"
              placeholder="Phone Number"
            />
          </div>

          <div className="col-md-3">
            <FormField
              label="Search by Admission No"
              placeholder="A-00xxxx/xx-xx"
            />
          </div>

          <div className="col-md-2 d-flex gap-2">
            <button className="btn btn-sm btn-primary w-100">Find</button>
            <button className="btn btn-sm btn-dark w-100">Clear</button>
          </div>
        </div>
      </Panel>

      {/* ===================== Patient Details ===================== */}
      <Panel title="Patient Details">
        <div className="row g-2">

          <div className="col-md-3">
            <FormField label="Patient Name" defaultValue="MD YOUNUS" />
          </div>

          <div className="col-md-2">
            <FormField label="Age" defaultValue="18" />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold">Gender</label>
            <select className="form-select form-select-sm">
              <option>M</option>
              <option>F</option>
            </select>
          </div>

          <div className="col-md-3">
            <FormField label="Phone" defaultValue="9830xxxxxx" />
          </div>

          <div className="col-md-2">
            <FormField
              label="Admission No"
              defaultValue="A-001736/20-21"
            />
          </div>
        </div>
      </Panel>

      {/* ===================== Estimate Header ===================== */}
      <Panel title="Estimate Header">
        <div className="row g-2">

          <div className="col-md-3">
            <label className="form-label small fw-bold">Package Type</label>
            <select className="form-select form-select-sm">
              <option>General</option>
              <option>Premium</option>
            </select>
          </div>

          <div className="col-md-3">
            <FormField
              label="Estimate Date"
              type="date"
              defaultValue="2025-02-22"
            />
          </div>

          <div className="col-md-3">
            <FormField label="Estimate Time" defaultValue="12:10 PM" />
          </div>

          <div className="col-md-3">
            <FormField label="Prepared By" defaultValue="ADMIN" />
          </div>
        </div>
      </Panel>

      {/* ===================== Estimate Items ===================== */}
      <Panel title="Estimate Items">

        {/* --- Add Item Row --- */}
        <div className="row g-2 align-items-end mb-3">

          <div className="col-md-4">
            <FormField
              label="Select Service / Procedure"
              placeholder="Search service..."
            />
          </div>

          <div className="col-md-2">
            <FormField label="Rate" defaultValue="0.00" />
          </div>

          <div className="col-md-2">
            <FormField label="Qty" type="number" defaultValue={1} />
          </div>

          <div className="col-md-2">
            <FormField
              label="Amount"
              defaultValue="0.00"
              readOnly={true}
            />
          </div>

          <div className="col-md-2">
            <button className="btn btn-sm btn-primary w-100">
              Add Item
            </button>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="table-responsive">
          <table className="table table-sm table-bordered mb-0">

            <TableHeader
              columns={[
                { label: "SL", style: { width: "40px" } },
                { label: "Description" },
                { label: "Rate", className: "text-end", style: { width: "100px" } },
                { label: "Qty", className: "text-center", style: { width: "70px" } },
                { label: "Amount", className: "text-end", style: { width: "120px" } },
                { label: "Del", className: "text-center", style: { width: "60px" } },
              ]}
            />

            <tbody>
              <tr>
                <td>1</td>
                <td>Cabin Charge</td>
                <td className="text-end">3500.00</td>
                <td className="text-center">1</td>
                <td className="text-end">3500.00</td>
                <td className="text-center">
                  <button className="btn btn-sm btn-danger py-0 px-2">
                    X
                  </button>
                </td>
              </tr>

              <tr>
                <td>2</td>
                <td>Doctor Visit Charge</td>
                <td className="text-end">1200.00</td>
                <td className="text-center">2</td>
                <td className="text-end">2400.00</td>
                <td className="text-center">
                  <button className="btn btn-sm btn-danger py-0 px-2">
                    X
                  </button>
                </td>
              </tr>
            </tbody>

          </table>
        </div>
      </Panel>

      {/* ===================== Summary ===================== */}
      <Panel title="Estimate Summary">
        <div className="row g-3">

          <div className="col-md-3">
            <FormField
              label="Gross Amount"
              defaultValue="5900.00"
              readOnly={true}
            />
          </div>

          <div className="col-md-3">
            <FormField label="Discount" defaultValue="0.00" />
          </div>

          <div className="col-md-3">
            <FormField
              label="Net Amount"
              defaultValue="5900.00"
              readOnly={true}
            />
          </div>

          <div className="col-md-3">
            <FormField label="Advance Paid" defaultValue="0.00" />
          </div>

          <div className="col-md-3">
            <FormField
              label="Balance"
              defaultValue="5900.00"
              readOnly={true}
            />
          </div>
        </div>
      </Panel>

      {/* ===================== Footer Buttons ===================== */}
      <div className="d-flex flex-wrap gap-2 p-2">
        <button className="btn btn-primary btn-sm px-4">Save Estimate</button>
        <button className="btn btn-warning btn-sm px-4">Edit</button>
        <button className="btn btn-danger btn-sm px-4">Delete</button>
        <button className="btn btn-secondary btn-sm px-4">Reset</button>
        <button className="btn btn-info btn-sm px-4 text-white">Print</button>
        <button className="btn btn-dark btn-sm px-4">Exit</button>
      </div>

    </div>
  );
};

export default Estimate;
