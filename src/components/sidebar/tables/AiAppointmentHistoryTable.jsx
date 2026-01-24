import React, { useState, useEffect } from "react";
import { Table, Badge, Form, Button } from "react-bootstrap";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import DataTableFilter from "../filter/DataTableFilter";
import PaginationSection from "./PaginationSection";

const AiAppointmentHistoryTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage, setDataPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const PATIENT_ID = 95; // Should come from auth context
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    fetchAppointmentHistory();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchAppointmentHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: dataPerPage,
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
      });

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/appointments/history/${PATIENT_ID}?${params}`,
        {
          headers: {
            "x-timezone": userTimezone,
          },
        }
      );
      const data = await response.json();

      if (data.appointments) {
        setAppointments(data.appointments);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching appointment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "warning",
      accepted: "info",
      completed: "success",
      cancelled: "danger",
    };
    return <Badge bg={statusColors[status] || "secondary"}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    return (
      <Badge bg={type === "offline" ? "primary" : "success"}>
        {type === "offline" ? "🏥 In-Person" : "💻 Online"}
      </Badge>
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAppointments = appointments
    .filter(
      (appointment) =>
        appointment.doctor_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.problem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patient_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.time?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (appointment) => !statusFilter || appointment.status === statusFilter
    )
    .filter(
      (appointment) =>
        !typeFilter || appointment.appointment_type === typeFilter
    )
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "created_at" || sortField === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate pagination based on filtered data
  const totalItems = filteredAppointments.length;
  const startIndex = (currentPage - 1) * dataPerPage;
  const endIndex = startIndex + dataPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    endIndex
  );
  const calculatedTotalPages = Math.ceil(totalItems / dataPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= calculatedTotalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="col-12">
      <div className="card">
        <div className="card-header">
          <h5>AI Appointment Booking History</h5>
        </div>

        {/* Filters */}
        <div className="card-header">
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <div className="flex-fill">
              <Form.Control
                type="text"
                placeholder="Search by doctor, problem, patient, date, or time..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: "300px" }}
              />
            </div>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: "120px" }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
            <Form.Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ minWidth: "120px" }}
            >
              <option value="">All Types</option>
              <option value="online">Online</option>
              <option value="offline">In-Person</option>
            </Form.Select>
            <Form.Select
              value={dataPerPage}
              onChange={(e) => setDataPerPage(Number(e.target.value))}
              style={{ maxWidth: "80px" }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
            <Button variant="outline-primary" onClick={fetchAppointmentHistory}>
              <i className="fa-light fa-refresh me-1"></i>
              Refresh
            </Button>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading appointment history...</p>
            </div>
          ) : (
            <>
              <OverlayScrollbarsComponent>
                <Table className="table table-dashed table-hover digi-dataTable table-striped">
                  <thead>
                    <tr>
                      <th
                        className="sortable"
                        onClick={() => handleSort("id")}
                        style={{ cursor: "pointer" }}
                      >
                        ID
                        {sortField === "id" && (
                          <i
                            className={`fa-light fa-chevron-${
                              sortDirection === "asc" ? "up" : "down"
                            } ms-1`}
                          ></i>
                        )}
                      </th>
                      <th
                        className="sortable"
                        onClick={() => handleSort("doctor_name")}
                        style={{ cursor: "pointer" }}
                      >
                        Doctor
                        {sortField === "doctor_name" && (
                          <i
                            className={`fa-light fa-chevron-${
                              sortDirection === "asc" ? "up" : "down"
                            } ms-1`}
                          ></i>
                        )}
                      </th>
                      <th
                        className="sortable"
                        onClick={() => handleSort("appointment_type")}
                        style={{ cursor: "pointer" }}
                      >
                        Type
                        {sortField === "appointment_type" && (
                          <i
                            className={`fa-light fa-chevron-${
                              sortDirection === "asc" ? "up" : "down"
                            } ms-1`}
                          ></i>
                        )}
                      </th>
                      <th
                        className="sortable"
                        onClick={() => handleSort("date")}
                        style={{ cursor: "pointer" }}
                      >
                        Date & Time
                        {sortField === "date" && (
                          <i
                            className={`fa-light fa-chevron-${
                              sortDirection === "asc" ? "up" : "down"
                            } ms-1`}
                          ></i>
                        )}
                      </th>
                      <th>Problem</th>
                      <th
                        className="sortable"
                        onClick={() => handleSort("status")}
                        style={{ cursor: "pointer" }}
                      >
                        Status
                        {sortField === "status" && (
                          <i
                            className={`fa-light fa-chevron-${
                              sortDirection === "asc" ? "up" : "down"
                            } ms-1`}
                          ></i>
                        )}
                      </th>
                      <th>Ambulance</th>
                      <th
                        className="sortable"
                        onClick={() => handleSort("created_at")}
                        style={{ cursor: "pointer" }}
                      >
                        Created
                        {sortField === "created_at" && (
                          <i
                            className={`fa-light fa-chevron-${
                              sortDirection === "asc" ? "up" : "down"
                            } ms-1`}
                          ></i>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAppointments.length > 0 ? (
                      paginatedAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>#{appointment.id}</td>
                          <td>
                            <div>
                              <strong>{appointment.doctor_name}</strong>
                              <br />
                              <small className="text-muted">
                                {appointment.doctor_specialty}
                              </small>
                            </div>
                          </td>
                          <td>{getTypeBadge(appointment.appointment_type)}</td>
                          <td>
                            <div>
                              <strong>{appointment.date}</strong>
                              <br />
                              <small className="text-muted">
                                {appointment.time}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: "200px" }}>
                              {appointment.problem?.length > 50
                                ? `${appointment.problem.substring(0, 50)}...`
                                : appointment.problem}
                            </div>
                          </td>
                          <td>{getStatusBadge(appointment.status)}</td>
                          <td>
                            {appointment.ambulance_name ? (
                              <div>
                                <Badge bg="success">
                                  🚑 {appointment.ambulance_name}
                                </Badge>
                                <br />
                                <small className="text-muted">
                                  Status:{" "}
                                  {appointment.pickup_status || "Pending"}
                                </small>
                              </div>
                            ) : (
                              <Badge bg="secondary">No Ambulance</Badge>
                            )}
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(
                                appointment.createdAt
                              ).toLocaleDateString()}
                            </small>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="text-muted">
                            {searchTerm || statusFilter || typeFilter
                              ? "No appointments match your filters"
                              : "No appointment history found"}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </OverlayScrollbarsComponent>

              {/* Results info */}
              <div className="table-bottom-control">
                <div className="dataTables_info">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)}{" "}
                  of {totalItems} entries
                  {(searchTerm || statusFilter || typeFilter) &&
                    ` (filtered from ${appointments.length} total entries)`}
                </div>
                {calculatedTotalPages > 1 && (
                  <PaginationSection
                    currentPage={currentPage}
                    totalPages={calculatedTotalPages}
                    paginate={paginate}
                    pageNumbers={pageNumbers}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiAppointmentHistoryTable;
