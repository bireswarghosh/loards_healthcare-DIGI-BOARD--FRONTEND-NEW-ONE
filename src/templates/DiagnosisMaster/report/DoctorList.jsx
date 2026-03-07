import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance";
import useAxiosFetch from "../Fetch";
import { set } from "date-fns";
// https://lords-backend.onrender.com/api/v1/doctormaster?page=1&limit=10000

const DoctorList = () => {
  const [selectedFilter, setSelectedFilter] = useState("allDoctors");
  const [selectionFilter, setSelectionFilter] = useState("selective");
  const [executives, setExecutives] = useState([]);
  const [selectedExecutives, setSelectedExecutives] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  //
  const [loading, setLoading] = useState(false);
  const { data: doctors } = useAxiosFetch(
    "/doctormasters-mexecutive?allData=true",
    []
  );
  const { data: doctorWithSp } = useAxiosFetch(
    "/doctormaster?page=1&limit=10000",
    []
  );
  const { data: departments } = useAxiosFetch("/speciality", []);
  const fetchExecutive = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/mexecutive");
      setExecutives(res.data ? res.data : []);
      //   console.log(res.data)
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchExecutive();
  }, []);

  const handleExCheckBox = (id) => {
    setSelectedExecutives((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleDepartmentCheckBox = (id) => {
    setSelectedDepartments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleSelection = (type) => {
    setSelectionFilter(type);
    if (type === "all") {
      setSelectedExecutives(executives.map((x) => x.MExecutiveId));
      setSelectedDepartments(departments.map((x) => x.SpecialityId));
    } else {
      setSelectedExecutives([]);
      setSelectedDepartments([]);
    }
  };
  const titleText =
    selectedFilter === "marketingExecutive"
      ? "Executive Wise Doctor List"
      : "Category Wise Doctor List";

  const handlePrint = () => {
    let groupedData = [];
    // === Group Data ===
    if (selectedFilter === "marketingExecutive") {
      groupedData = executives
        .filter((ex) => selectedExecutives.includes(ex.MExecutiveId))
        .map((ex) => ({
          title: ex.MExecutive,
          doctors: doctors.filter((d) => d.MExecutiveId === ex.MExecutiveId),
        }));
    }
    if (selectedFilter === "categoryWise") {
      groupedData = departments
        .filter((dept) => selectedDepartments.includes(dept.SpecialityId))
        .map((dept) => ({
          title: dept.Speciality,
          doctors: doctorWithSp.filter(
            (d) => d.SpecialityId === dept.SpecialityId
          ),
        }));
    }

    let innerHTML = `
      <div class="container">
  `;

    groupedData.forEach((group) => {
      innerHTML += `
      <h5 class="mt-3 mb-1"><b>${group.title}</b></h5>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th style="width: 60px">#</th>
            <th>Doctor Name</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
    `;

      group.doctors.forEach((doc, index) => {
        innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${doc.Doctor}</td>
          <td>${doc.Phone}</td>
        </tr>
      `;
      });

      innerHTML += `
        </tbody>
      </table>
    `;
    });

    innerHTML += `</div>`;

    const printWindow = window.open("", "", "width=900,height=700");

    printWindow.document.write(`
    <html>
      <head >
<title>HALE LUIA</title>        

        <link rel="stylesheet"
         href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">

        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            padding: 20px;
          }

          .report-header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }

          .report-title {
            font-size: 24px;
            font-weight: 700;
          }

          .sub-title {
            font-size: 14px;
            margin-top: -4px;
            color: #555;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }

          th, td {
            border: 1px solid #000 !important;
            padding: 8px !important;
            font-size: 14px;
          }

          thead {
            background-color: #343a40;
            color: #fff;
          }

          .footer {
            border-top: 2px solid #000;
            margin-top: 40px;
            padding-top: 10px;
            text-align: center;
            font-size: 12px;
            color: #333;
          }
        </style>
      </head>

      <body>
        <div class="report-header">
          <div class="report-title">${titleText}</div>
          <div class="sub-title">Generated List Based on Selection</div>
        </div>

        ${innerHTML}

        <div class="footer">
          Generated on: ${new Date().toLocaleString()} By DEB M
        </div>
      </body>
    </html>
  `);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

  return (
    <div className="container mt-1">
      {/* =============nav========== */}
      <nav className="navbar navbar-dark bg-primary rounded shadow mb-1">
        <span className="navbar-brand ms-2 h5">DoctorList</span>
      </nav>
      {/* FILTER OPTIONS */}
      <div className="card shadow-sm border-0 mb-1">
        <div className="card-body">
          <h6 className="text-primary fw-bold mb-1">Filter Options</h6>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="w-100 border rounded p-1 d-flex align-items-center gap-2">
                <input
                  type="radio"
                  name="doctorFilter"
                  checked={selectedFilter === "allDoctors"}
                  onChange={() => setSelectedFilter("allDoctors")}
                />
                <span>All Doctors</span>
              </label>
            </div>

            <div className="col-md-4">
              <label className="w-100 border rounded p-2 d-flex align-items-center gap-2">
                <input
                  type="radio"
                  name="doctorFilter"
                  checked={selectedFilter === "marketingExecutive"}
                  onChange={() => setSelectedFilter("marketingExecutive")}
                />
                <span>Marketing Executive Wise</span>
              </label>
            </div>

            <div className="col-md-4">
              <label className="w-100 border rounded p-2 d-flex align-items-center gap-2">
                <input
                  type="radio"
                  name="doctorFilter"
                  checked={selectedFilter === "categoryWise"}
                  onChange={() => setSelectedFilter("categoryWise")}
                />
                <span>Category Wise</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SELECTION OPTIONS */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="text-primary fw-bold mb-1">Selection Options</h6>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="w-100 border rounded p-2 d-flex align-items-center gap-2">
                <input
                  type="radio"
                  name="selectionFilter"
                  checked={selectionFilter === "all"}
                  onChange={() => handleSelection("all")}
                />
                <span>All</span>
              </label>
            </div>

            <div className="col-md-6">
              <label className="w-100 border rounded p-2 d-flex align-items-center gap-2">
                <input
                  type="radio"
                  name="selectionFilter"
                  checked={selectionFilter === "selective"}
                  onChange={() => handleSelection("selective")}
                />
                <span>Selective</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div>
        {/* SHOW EXECUTIVE LIST WHEN MARKETING EXECUTIVE SELECTED */}
        {selectedFilter === "marketingExecutive" && (
          <div className="card shadow-sm border-0 mb-1">
            <div className="card-body">
              <h6 className="fw-bold mb-1">Select Marketing Executives</h6>

              <div className="list-group hide-scroll">
                {executives.map((ex) => (
                  <label
                    key={ex.MExecutiveId}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{ex.MExecutive}</span>

                    <input
                      type="checkbox"
                      checked={selectedExecutives.includes(ex.MExecutiveId)}
                      onChange={() => handleExCheckBox(ex.MExecutiveId)}
                    />
                  </label>
                ))}
              </div>
              <style>
                {`
    .hide-scroll::-webkit-scrollbar {
      display: none;
    }
  `}
              </style>
            </div>
          </div>
        )}
        {selectedFilter === "categoryWise" && (
          <div className="card shadow-sm border-0 mb-1">
            <div className="card-body">
              <h6 className="fw-bold mb-1">Select Categories</h6>

              <div className="list-group hide-scroll">
                {departments.map((dept) => (
                  <label
                    key={dept.SpecialityId}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{dept.Speciality}</span>

                    <input
                      type="checkbox"
                      checked={selectedDepartments.includes(dept.SpecialityId)}
                      onChange={() =>
                        handleDepartmentCheckBox(dept.SpecialityId)
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRINT BUTTON */}
        <div className="d-flex justify-content-end mt-3">
          <button
            onClick={handlePrint}
            className="btn btn-primary shadow-sm px-4"
          >
            <i className="fa fa-print me-2"></i> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorList;
