import React from "react";

const DischargeAndAdvise = () => {
  const [activeTab, setActiveTab] = React.useState("list");

  const dischargeData = [
    {
      dischargeNo: "D-002456/24-25",
      dischargeTime: "10:00 AM",
      dischargeDate: "22/02/2025",
      patientName: "PRABIR MUKHERJEE",
      underDr: "ABHRA",
      admissionNo: "A-001006/24-25",
      phoneNo: "3381121385 M2",
      bedNo: "",
      status: "warning",
    },
    {
      dischargeNo: "D-002457/24-25",
      dischargeTime: "08:23 AM",
      dischargeDate: "22/02/2025",
      patientName: "SALAUDDIN MOLLAH",
      underDr: "RAMYAJIT LAHIRI",
      admissionNo: "A-001032/24-25",
      phoneNo: "3292256156 M3",
      bedNo: "",
      status: "warning",
    },
    {
      dischargeNo: "D-002458/24-25",
      dischargeTime: "08:46 AM",
      dischargeDate: "22/02/2025",
      patientName: "SK. MOSTAK AHAMMAD",
      underDr: "ABHRA",
      admissionNo: "A-001035/24-25",
      phoneNo: "9830348796 M1",
      bedNo: "",
      status: "success",
    },
  ];

  const TabButton = ({ tabName, activeTab, setActiveTab, icon, label }) => (
    <li className="nav-item" role="presentation">
      <button
        className={`nav-link px-4 py-2 small fw-bold ${
          activeTab === tabName ? "active digi-tab-active" : "digi-tab"
        }`}
        onClick={() => setActiveTab(tabName)}
        type="button"
      >
        {icon && <i className={`bi ${icon} me-2`}></i>}
        {label}
      </button>
    </li>
  );

  return (
    <div className="container-fluid py-3">

      {/* EMR Styled Panel Wrapper */}
      <div className="panel shadow-sm rounded-4 overflow-hidden">

        {/* Header */}
        <div className="panel-header d-flex justify-content-between align-items-center px-3 py-2">
          <h5 className="panel-title m-0">
            <i className="bi bi-file-earmark-medical text-primary me-2"></i>
            Discharge And Advise
          </h5>

          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-secondary">List</button>
            <button className="btn btn-sm btn-primary">Detail</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-bottom bg-white">
          <ul className="nav nav-tabs digi-tabs">
            <TabButton
              tabName="list"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon="bi-list-ul"
              label="List"
            />
            <TabButton
              tabName="detail"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon="bi-file-earmark-person-fill"
              label="Detail"
            />
            <TabButton
              tabName="advice"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon="bi-file-earmark-medical-fill"
              label="Advice"
            />
            <TabButton
              tabName="mrd"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon="bi-folder-fill"
              label="MRD"
            />
          </ul>
        </div>

        {/* Body */}
        <div className="panel-body p-3">

          {/* Filter */}
          <div className="panel p-3 mb-3">
            <h6 className="text-primary fw-bold mb-2">Filter</h6>

            <div className="row g-3 align-items-end">
              <div className="col-md-5 col-lg-4">
                <label className="form-label small fw-bold">Date Range</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">From</span>
                  <input type="date" className="form-control" defaultValue="2025-02-22" />
                  <span className="input-group-text">To</span>
                  <input type="date" className="form-control" defaultValue="2025-02-22" />
                </div>
              </div>

              <div className="col-md-auto ms-auto">
                <button className="btn btn-sm btn-primary px-4">
                  <i className="bi bi-search me-1"></i>Show Records
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-sm table-bordered table-striped">
              <thead className="digi-table-header">
                <tr>
                  <th>Discharge No</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Patient Name</th>
                  <th>Under Dr.</th>
                  <th>Admission No</th>
                  <th>Phone No</th>
                  <th>Bed No</th>
                </tr>
              </thead>

              <tbody>
                {dischargeData.map((row, i) => (
                  <tr key={i} className={`table-${row.status}`}>
                    <td className="fw-bold">{row.dischargeNo}</td>
                    <td>{row.dischargeTime}</td>
                    <td>{row.dischargeDate}</td>
                    <td>{row.patientName}</td>
                    <td>{row.underDr}</td>
                    <td>{row.admissionNo}</td>
                    <td>{row.phoneNo}</td>
                    <td>{row.bedNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="panel-footer d-flex justify-content-end gap-2 p-2">
          <button className="btn btn-sm btn-outline-secondary px-4">New</button>
          <button className="btn btn-sm btn-outline-primary px-4">Edit</button>
          <button className="btn btn-sm btn-danger px-4">Delete</button>
          <button className="btn btn-sm btn-warning px-4">Undo</button>
          <button className="btn btn-sm btn-info text-white px-4">Print</button>
          <button className="btn btn-sm btn-dark px-4">Exit</button>
        </div>
      </div>
    </div>
  );
};

export default DischargeAndAdvise;
