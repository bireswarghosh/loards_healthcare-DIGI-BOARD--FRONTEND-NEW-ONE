import React, { useState, useEffect } from "react";
import { Table, Form, Button, Badge, Modal, InputGroup } from "react-bootstrap";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AiHistoryTable = ({
  title,
  data,
  loading,
  columns,
  searchableFields = [],
  filterableFields = [],
  sortableFields = [],
  onViewDetails,
  onRefresh,
  itemsPerPageOptions = [10, 25, 50, 100],
  defaultItemsPerPage = 10,
  showExport = false,
  onExport,
  renderDetailsModal,
  updateAppointmentStatus,
  onReschedule,
  onCancel,
  additionalActions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [patientDetails, setPatientDetails] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);

  // Sample patient and doctor data (in a real app, this would come from API)
  const samplePatients = [
    {
      id: 1,
      name: "John Doe",
      age: 35,
      gender: "M",
      phone: "+1234567890",
      email: "john@example.com",
    },
    {
      id: 7,
      name: "Alice Johnson",
      age: 29,
      gender: "F",
      phone: "+1987654321",
      email: "alice@example.com",
    },
    {
      id: 12,
      name: "Jane Smith",
      age: 34,
      gender: "F",
      phone: "+1122334455",
      email: "jane@example.com",
    },
    {
      id: 53,
      name: "Mr. Maharaz",
      age: 52,
      gender: "M",
      phone: "+1555666777",
      email: "maharaz@example.com",
    },
  ];

  const sampleDoctors = [
    {
      id: 1,
      name: "Dr. Alice Johnson",
      specialization: "Cardiology",
      phone: "+1111111111",
      email: "alice@hospital.com",
      license_number: "MD12345",
    },
    {
      id: 2,
      name: "Dr. Bob Lee",
      specialization: "Neurology",
      phone: "+2222222222",
      email: "bob@hospital.com",
      license_number: "MD23456",
    },
    {
      id: 3,
      name: "Dr. Carol White",
      specialization: "General Medicine",
      phone: "+3333333333",
      email: "carol@hospital.com",
      license_number: "MD34567",
    },
    {
      id: 4,
      name: "Dr. David Brown",
      specialization: "Dermatology",
      phone: "+4444444444",
      email: "david@hospital.com",
      license_number: "MD45678",
    },
  ];

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      return date.toLocaleString("en-US", options);
    } catch {
      return "Invalid Date";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };
      return date.toLocaleDateString("en-US", options);
    } catch {
      return "Invalid Date";
    }
  };

  // Filter data based on search term and filters
  const filteredData = data.filter((item) => {
    // Search term filter
    const matchesSearch =
      !searchTerm ||
      searchableFields.some((field) => {
        const value = getNestedValue(item, field);
        return (
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

    // Field filters
    const matchesFilters = Object.entries(filters).every(
      ([field, filterValue]) => {
        if (!filterValue) return true;
        const value = getNestedValue(item, field);
        return (
          value &&
          value.toString().toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    );

    return matchesSearch && matchesFilters;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = getNestedValue(a, sortField);
    const bValue = getNestedValue(b, sortField);

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);

    // Reset previous details
    setPatientDetails(null);
    setDoctorDetails(null);

    // Check if we have patient_id and doctor_id columns
    const hasPatientId = columns.some((col) => col.field === "patient_id");
    const hasDoctorId = columns.some((col) => col.field === "doctor_id");

    // Fetch patient details if patient_id exists
    if (hasPatientId && item.patient_id) {
      const patient = samplePatients.find(
        (p) => p.id === parseInt(item.patient_id)
      );
      if (patient) {
        setPatientDetails(patient);
      }
    }

    // Fetch doctor details if doctor_id exists
    if (hasDoctorId && item.doctor_id) {
      const doctor = sampleDoctors.find(
        (d) => d.id === parseInt(item.doctor_id)
      );
      if (doctor) {
        setDoctorDetails(doctor);
      }
    }

    if (onViewDetails) {
      onViewDetails(item);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(paginatedData.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (itemId, checked) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, itemId]);
    } else {
      setSelectedRows((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const renderCell = (item, column) => {
    const value = getNestedValue(item, column.field);

    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === "date") {
      return formatDate(value);
    }

    if (column.type === "datetime") {
      return formatDateTime(value);
    }

    if (column.type === "badge") {
      const badgeColor =
        typeof column.badgeColor === "function"
          ? column.badgeColor(item)
          : column.badgeColor || "secondary";
      return <Badge bg={badgeColor}>{value}</Badge>;
    }

    if (column.type === "truncate") {
      return value && value.length > (column.maxLength || 50)
        ? `${value.substring(0, column.maxLength || 50)}...`
        : value || "N/A";
    }

    return value || "N/A";
  };

  const getUniqueValues = (field) => {
    return [
      ...new Set(
        data.map((item) => getNestedValue(item, field)).filter(Boolean)
      ),
    ];
  };

  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body">
        <div className="table-filter-option customized-data-table">
          <div className="row g-3">
            <div className="col-xl-10 col-md-9">
              <div className="row g-3">
                <div className="col">
                  <form className="row g-2">
                    <div className="col">
                      <Form.Select
                        className="form-control form-control-sm"
                        data-placeholder="Bulk action"
                      >
                        <option value="">Bulk action</option>
                        <option value="0">Delete Selected</option>
                        <option value="1">Export Selected</option>
                      </Form.Select>
                    </div>
                    <div className="col">
                      <button className="btn btn-sm btn-primary w-100">
                        Apply
                      </button>
                    </div>
                  </form>
                </div>
                {filterableFields.slice(0, 2).map((field) => (
                  <div key={field.field} className="col">
                    <Form.Select
                      className="form-control form-control-sm"
                      value={filters[field.field] || ""}
                      onChange={(e) =>
                        handleFilterChange(field.field, e.target.value)
                      }
                    >
                      <option value="">{field.label}</option>
                      {getUniqueValues(field.field).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                ))}
                <div className="col">
                  <button className="btn btn-sm btn-primary">
                    <i className="fa-light fa-filter"></i> Filter
                  </button>
                </div>
              </div>
            </div>
            <div className="col-xl-2 col-md-3 d-flex justify-content-between">
              <div id="tableSearch">
                <div className="table-form-text">
                  <Form.Control
                    type="text"
                    placeholder="Search.."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <OverlayScrollbarsComponent>
          <table
            className="table table-dashed table-hover digi-dataTable all-product-table table-striped"
            id="allProductTable"
          >
            <thead>
              <tr>
                <th className="no-sort">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="markAllProduct"
                      checked={
                        selectedRows.length === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </div>
                </th>
                {columns.map((column) => (
                  <th
                    key={column.field}
                    className={
                      sortableFields.includes(column.field) ? "sortable" : ""
                    }
                    onClick={() =>
                      sortableFields.includes(column.field) &&
                      handleSort(column.field)
                    }
                    style={{
                      cursor: sortableFields.includes(column.field)
                        ? "pointer"
                        : "default",
                    }}
                  >
                    {column.header}
                    {sortField === column.field && (
                      <i
                        className={`fa-light fa-chevron-${
                          sortDirection === "asc" ? "up" : "down"
                        } ms-1`}
                      ></i>
                    )}
                  </th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 2} className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading {title.toLowerCase()}...</p>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={(e) =>
                            handleSelectRow(item.id, e.target.checked)
                          }
                        />
                      </div>
                    </td>
                    {columns.map((column) => (
                      <td key={column.field}>{renderCell(item, column)}</td>
                    ))}
                    <td>
                      <div
                        className="btn-box"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "0.25rem",
                        }}
                      >
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="btn btn-sm btn-outline-primary"
                          title="View Details"
                        >
                          <i className="fa-light fa-eye"></i>
                        </button>
                        {updateAppointmentStatus &&
                          item.status === "pending" && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-success"
                                title="Accept"
                                onClick={async () => {
                                  const result = await updateAppointmentStatus(
                                    item.id,
                                    "accepted"
                                  );
                                  if (result.success) {
                                    toast.success(
                                      "Appointment accepted successfully!"
                                    );
                                    onRefresh && onRefresh();
                                  } else {
                                    toast.error(
                                      "Failed to update status: " + result.error
                                    );
                                  }
                                }}
                              >
                                <i className="fa-light fa-check"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Cancel"
                                onClick={() => onCancel && onCancel(item)}
                              >
                                <i className="fa-light fa-times"></i>
                              </button>
                            </>
                          )}
                        {updateAppointmentStatus &&
                          item.status === "accepted" && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="Complete"
                              onClick={async () => {
                                const result = await updateAppointmentStatus(
                                  item.id,
                                  "completed"
                                );
                                if (result.success) {
                                  toast.success(
                                    "Appointment completed successfully!"
                                  );
                                  onRefresh && onRefresh();
                                } else {
                                  toast.error(
                                    "Failed to update status: " + result.error
                                  );
                                }
                              }}
                            >
                              <i className="fa-light fa-check-circle"></i>
                            </button>
                          )}
                        {onReschedule &&
                          item.status !== "completed" &&
                          item.status !== "cancelled" && (
                            <button
                              className="btn btn-sm btn-outline-warning"
                              title="Reschedule"
                              onClick={() => onReschedule(item)}
                            >
                              <i className="fa-light fa-calendar-alt"></i>
                            </button>
                          )}
                        {additionalActions && additionalActions(item)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 2} className="text-center py-4">
                    No {title ? title.toLowerCase() : "items"} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </OverlayScrollbarsComponent>

        <div className="table-bottom-control">
          <div className="dataTables_info">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
            {totalItems} entries
            {searchTerm && ` (filtered from ${data.length} total entries)`}
          </div>
          <div className="dataTables_paginate paging_simple_numbers">
            <Link
              className={`btn btn-primary previous ${
                currentPage === 1 ? "disabled" : ""
              }`}
              onClick={() =>
                currentPage > 1 && handlePageChange(currentPage - 1)
              }
            >
              <i className="fa-light fa-angle-left"></i>
            </Link>
            <span>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Link
                    key={page}
                    className={`btn btn-primary ${
                      page === currentPage ? "current" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Link>
                )
              )}
            </span>
            <Link
              className={`btn btn-primary next ${
                currentPage === totalPages ? "disabled" : ""
              }`}
              onClick={() =>
                currentPage < totalPages && handlePageChange(currentPage + 1)
              }
            >
              <i className="fa-light fa-angle-right"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => {
          setShowDetailsModal(false);
          setPatientDetails(null);
          setDoctorDetails(null);
        }}
        size="xl"
        dialogClassName="modal-dialog-scrollable"
      >
        <Modal.Header closeButton>
          <Modal.Title>{title} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {selectedItem && (
            <div className="row g-3">
              {/* Patient Details Section */}
              {patientDetails && (
                <div className="col-12 mb-3">
                  <div className="card border-primary">
                    <div className="card-header bg-primary text-white py-2">
                      <h6 className="card-title mb-0">
                        <i className="fa-light fa-user me-2"></i>
                        Patient Information
                      </h6>
                    </div>
                    <div className="card-body p-3">
                      <div className="row g-2">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Name:</span>
                            <span className="fw-medium">
                              {patientDetails.name || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">
                              Patient ID:
                            </span>
                            <span className="fw-medium">
                              {patientDetails.id || selectedItem.patient_id}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Age:</span>
                            <span className="fw-medium">
                              {patientDetails.age || "N/A"} years
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Gender:</span>
                            <span className="fw-medium">
                              {patientDetails.gender === "M"
                                ? "Male"
                                : patientDetails.gender === "F"
                                ? "Female"
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Phone:</span>
                            <span className="fw-medium">
                              {patientDetails.phone || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Email:</span>
                            <span className="fw-medium small">
                              {patientDetails.email || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor Details Section */}
              {doctorDetails && (
                <div className="col-12 mb-3">
                  <div className="card border-success">
                    <div className="card-header bg-success text-white py-2">
                      <h6 className="card-title mb-0">
                        <i className="fa-light fa-user-md me-2"></i>
                        Doctor Information
                      </h6>
                    </div>
                    <div className="card-body p-3">
                      <div className="row g-2">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Name:</span>
                            <span className="fw-medium">
                              {doctorDetails.name || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Doctor ID:</span>
                            <span className="fw-medium">
                              {doctorDetails.id || selectedItem.doctor_id}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">
                              Specialization:
                            </span>
                            <span className="fw-medium">
                              {doctorDetails.specialization || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">License:</span>
                            <span className="fw-medium">
                              {doctorDetails.license_number || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Phone:</span>
                            <span className="fw-medium">
                              {doctorDetails.phone || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Email:</span>
                            <span className="fw-medium small">
                              {doctorDetails.email || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading indicator for details */}
              {/* Removed - no longer needed since we're using local data */}

              {/* Main content - either custom render or default columns */}
              {renderDetailsModal ? (
                <div className="col-12">
                  <div className="card border-info">
                    <div className="card-header bg-info text-white py-2">
                      <h6 className="card-title mb-0">
                        <i className="fa-light fa-file-alt me-2"></i>
                        Analysis Details
                      </h6>
                    </div>
                    <div className="card-body p-3">
                      {renderDetailsModal(selectedItem)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="col-12">
                  <div className="card border-info">
                    <div className="card-header bg-info text-white py-2">
                      <h6 className="card-title mb-0">
                        <i className="fa-light fa-file-alt me-2"></i>
                        Analysis Details
                      </h6>
                    </div>
                    <div className="card-body p-3">
                      <div className="row g-3">
                        {columns.map((column) => (
                          <div key={column.field} className="col-md-4 col-sm-6">
                            <div className="d-flex flex-column">
                              <span className="text-muted small fw-medium mb-1">
                                {column.header}:
                              </span>
                              <div>{renderCell(selectedItem, column)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional details that might not be in columns */}
              {selectedItem.details && (
                <div className="col-12">
                  <div className="card border-warning">
                    <div className="card-header bg-warning py-2">
                      <h6 className="card-title mb-0">
                        <i className="fa-light fa-info-circle me-2"></i>
                        Additional Information
                      </h6>
                    </div>
                    <div className="card-body p-3">
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "inherit",
                            fontSize: "0.875rem",
                            margin: 0,
                          }}
                        >
                          {typeof selectedItem.details === "string"
                            ? selectedItem.details
                            : JSON.stringify(selectedItem.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDetailsModal(false);
              setPatientDetails(null);
              setDoctorDetails(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AiHistoryTable;
