import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";

const BedStatus = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [bedSearch, setBedSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [admissionSearch, setAdmissionSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minBooking, setMinBooking] = useState("");
  const [maxBooking, setMaxBooking] = useState("");
  const [sortBy, setSortBy] = useState("Bed");
  const [sortDir, setSortDir] = useState("asc");
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    axiosInstance.get("/bed-status/departments").then((r) => setDepartments(r.data.data || []));
  }, []);

  useEffect(() => {
    if (!selectedDept) { setBeds([]); return; }
    setLoading(true);
    axiosInstance
      .get(`/bed-status/beds?DepartmentId=${selectedDept}`)
      .then((r) => {
        const d = r.data.data || r.data || [];
        console.log("Beds API response:", r.data, "Parsed beds:", d);
        setBeds(Array.isArray(d) ? d : []);
      })
      .finally(() => setLoading(false));
  }, [selectedDept]);

  // Apply all filters
  const filtered = beds
    .filter((b) => {
      if (!globalSearch) return true;
      const s = globalSearch.toLowerCase();
      return (
        (b.Bed || "").toLowerCase().includes(s) ||
        (b.ShortName || "").toLowerCase().includes(s) ||
        (b.CurrentPatient || "").toLowerCase().includes(s) ||
        (b.CurrentAdmitionNo || "").toLowerCase().includes(s) ||
        (b.CurrentPhone || "").toLowerCase().includes(s)
      );
    })
    .filter((b) => {
      if (statusFilter === "Occupied") return !!b.CurrentAdmitionId;
      if (statusFilter === "Vacant") return !b.CurrentAdmitionId;
      return true;
    })
    .filter((b) => !bedSearch || (b.Bed || "").toLowerCase().includes(bedSearch.toLowerCase()))
    .filter((b) => !patientSearch || (b.CurrentPatient || "").toLowerCase().includes(patientSearch.toLowerCase()))
    .filter((b) => !admissionSearch || (b.CurrentAdmitionNo || "").toLowerCase().includes(admissionSearch.toLowerCase()))
    .filter((b) => {
      if (!dateFrom && !dateTo) return true;
      if (!b.CurrentAdmitionDate) return false;
      const d = new Date(b.CurrentAdmitionDate);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      return true;
    })
    .filter((b) => {
      if (minBooking !== "" && b.BookingCount < Number(minBooking)) return false;
      if (maxBooking !== "" && b.BookingCount > Number(maxBooking)) return false;
      return true;
    })
    .sort((a, b) => {
      let va, vb;
      switch (sortBy) {
        case "Status": va = a.CurrentAdmitionId ? 1 : 0; vb = b.CurrentAdmitionId ? 1 : 0; break;
        case "BookingCount": va = a.BookingCount; vb = b.BookingCount; break;
        case "TotalFlow": va = Number(a.TotalFlow); vb = Number(b.TotalFlow); break;
        default: va = (a.Bed || "").toLowerCase(); vb = (b.Bed || "").toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const occupied = filtered.filter((b) => b.CurrentAdmitionId);
  const vacant = filtered.filter((b) => !b.CurrentAdmitionId);

  const clearFilters = () => {
    setStatusFilter("All"); setBedSearch(""); setPatientSearch(""); setAdmissionSearch("");
    setDateFrom(""); setDateTo(""); setMinBooking(""); setMaxBooking("");
    setSortBy("Bed"); setSortDir("asc");
  };

  return (
    <div style={{ padding: 16, fontFamily: "Tahoma, Arial, sans-serif", fontSize: 13 }}>
      <h5 className="mb-3" style={{ fontWeight: 700 }}>🛏️ Bed Status &amp; Occupancy</h5>

      {/* Department selector */}
      <div className="row mb-3 align-items-center">
        <div className="col-auto"><label className="fw-bold">Department:</label></div>
        <div className="col-md-4">
          <select
            className="form-select form-select-sm"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">-- Select Department --</option>
            {departments.map((d) => (
              <option key={d.DepartmentId} value={d.DepartmentId}>{d.Department}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Global Search */}
      {selectedDept && (
        <div className="row mb-3">
          <div className="col-md-4">
            <input
              className="form-control form-control-sm"
              placeholder="🔍 Search bed, patient, admission no, phone..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      {selectedDept && (
        <div className="card mb-3 p-2" style={{ fontSize: 12 }}>
          <div className="row g-2 align-items-end">
            <div className="col-md-2 col-sm-4">
              <label className="form-label mb-0 fw-bold">Status</label>
              <select className="form-select form-select-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>All</option><option>Occupied</option><option>Vacant</option>
              </select>
            </div>
            <div className="col-md-2 col-sm-4">
              <label className="form-label mb-0 fw-bold">Bed</label>
              <input className="form-control form-control-sm" placeholder="Search bed..." value={bedSearch} onChange={(e) => setBedSearch(e.target.value)} />
            </div>
            <div className="col-md-2 col-sm-4">
              <label className="form-label mb-0 fw-bold">Patient</label>
              <input className="form-control form-control-sm" placeholder="Search patient..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
            </div>
            <div className="col-md-2 col-sm-4">
              <label className="form-label mb-0 fw-bold">Admission No</label>
              <input className="form-control form-control-sm" placeholder="Search adm no..." value={admissionSearch} onChange={(e) => setAdmissionSearch(e.target.value)} />
            </div>
            <div className="col-md-2 col-sm-3">
              <label className="form-label mb-0 fw-bold">Date From</label>
              <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="col-md-2 col-sm-3">
              <label className="form-label mb-0 fw-bold">Date To</label>
              <input type="date" className="form-control form-control-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="col-md-1 col-sm-3">
              <label className="form-label mb-0 fw-bold">Min Book</label>
              <input type="number" className="form-control form-control-sm" value={minBooking} onChange={(e) => setMinBooking(e.target.value)} />
            </div>
            <div className="col-md-1 col-sm-3">
              <label className="form-label mb-0 fw-bold">Max Book</label>
              <input type="number" className="form-control form-control-sm" value={maxBooking} onChange={(e) => setMaxBooking(e.target.value)} />
            </div>
            <div className="col-md-2 col-sm-4">
              <label className="form-label mb-0 fw-bold">Sort By</label>
              <div className="d-flex gap-1">
                <select className="form-select form-select-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="Bed">Bed</option><option value="Status">Status</option><option value="BookingCount">Booking Count</option><option value="TotalFlow">Total Flow</option>
                </select>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} title="Toggle sort direction">
                  {sortDir === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
            <div className="col-auto">
              <button className="btn btn-sm btn-outline-danger" onClick={clearFilters}>✕ Clear</button>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {selectedDept && (
        <div className="row mb-3 g-2">
          <div className="col-auto">
            <div className="card border-primary" style={{ minWidth: 130 }}>
              <div className="card-body py-2 px-3 text-center">
                <div className="fw-bold text-primary" style={{ fontSize: 22 }}>{filtered.length}</div>
                <small>Total Beds</small>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="card border-danger" style={{ minWidth: 130 }}>
              <div className="card-body py-2 px-3 text-center">
                <div className="fw-bold text-danger" style={{ fontSize: 22 }}>{occupied.length}</div>
                <small>Occupied</small>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="card border-success" style={{ minWidth: 130 }}>
              <div className="card-body py-2 px-3 text-center">
                <div className="fw-bold text-success" style={{ fontSize: 22 }}>{vacant.length}</div>
                <small>Vacant</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bed table */}
      {loading ? (
        <p>Loading...</p>
      ) : beds.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-sm table-hover" style={{ fontSize: 12 }}>
            <thead style={{ backgroundColor: "#343a40", color: "#fff" }}>
              <tr>
                <th>#</th>
                <th>Bed</th>
                <th>Short Name</th>
                <th>Status</th>
                <th>Current Patient</th>
                <th>Admission No</th>
                <th>Admission Date</th>
                <th>Phone</th>
                <th>Booking Count</th>
                <th>Total Flow (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const isOccupied = !!b.CurrentAdmitionId;
                return (
                  <tr key={b.BedId} style={isOccupied ? { backgroundColor: "#fff3cd" } : {}}>
                    <td>{i + 1}</td>
                    <td>{b.Bed}</td>
                    <td>{b.ShortName || "-"}</td>
                    <td>
                      <span className={`badge ${isOccupied ? "bg-danger" : "bg-success"}`}>
                        {isOccupied ? "Occupied" : "Vacant"}
                      </span>
                    </td>
                    <td>{b.CurrentPatient || "-"}</td>
                    <td>{b.CurrentAdmitionNo || "-"}</td>
                    <td>{b.CurrentAdmitionDate ? new Date(b.CurrentAdmitionDate).toLocaleDateString("en-IN") : "-"}</td>
                    <td>{b.CurrentPhone || "-"}</td>
                    <td className="text-center fw-bold">{b.BookingCount}</td>
                    <td className="text-end fw-bold">{Number(b.TotalFlow).toLocaleString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: "#e9ecef", fontWeight: 700 }}>
              <tr>
                <td colSpan={8} className="text-end">Grand Total:</td>
                <td className="text-center">{filtered.reduce((s, b) => s + b.BookingCount, 0)}</td>
                <td className="text-end">₹ {filtered.reduce((s, b) => s + Number(b.TotalFlow), 0).toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : selectedDept ? (
        <p className="text-muted">No beds found for this department.</p>
      ) : null}
    </div>
  );
};

export default BedStatus;
