import { useState, useEffect, useCallback, useRef } from "react";
// import { DigiContext } from '../context/DigiContext'; // Commented out as context is not defined here
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../../../components/footer/Footer";
import axiosInstance from "../../../../axiosInstance";

const OtherCharges = () => {
  const navigate = useNavigate();
  // const { isBelowLg } = useContext(DigiContext); // Uncomment if DigiContext is available
  const isBelowLg = false; // Placeholder if context is unavailable

  const dropdownRef = useRef(null);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & Search for the main list
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // General search input like in Emr.jsx

  // State for Modal (View / Edit functionality)
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState("view"); // 'view' | 'edit' | 'add'

  // Edit form state
  const [editForm, setEditForm] = useState({
    outBillId: "",
    registrationId: "",
    patientName: "",
    outBillDate: "",
    amount: "",
    phoneNo: "",
  });

  // Add form state
  const [addForm, setAddForm] = useState({
    registrationId: "",
    patientName: "",
    outBillDate: "",
    amount: "",
    phoneNo: "",
  });

  // Advanced Search Filters
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    registrationId: "",
    billNo: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  // State for dropdown visibility in table
  const handleDropdownToggle = (event, id) => {
    event.stopPropagation();
    const updatedData = charges.map((data) => ({
      ...data,
      showDropdown: data.OutBillId === id ? !data.showDropdown : false,
    }));
    setCharges(updatedData);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const updatedData = charges.map((data) => ({
          ...data,
          showDropdown: false,
        }));
        setCharges(updatedData);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [charges]);

  // Fetch data from API
  const fetchCharges = useCallback(
    async (
      page = currentPage,
      search = searchQuery,
      filters = searchFilters
    ) => {
      setLoading(true);
      setError(null);
      try {
        // limit=10 is kept constant
        let url = `/opd-other-charges?page=${page}&limit=10`;
        let currentFilters = filters;

        if (!showAdvancedSearch && search) {
          url = `/opd-other-charges/search/advanced?page=${page}&limit=10&billNo=${encodeURIComponent(
            search
          )}`;
          currentFilters = { ...searchFilters, billNo: search };
        } else {
          const hasFilters = Object.values(currentFilters).some(
            (value) => value && value.toString().trim() !== ""
          );
          if (hasFilters) {
            url = `/opd-other-charges/search/advanced?page=${page}&limit=10`;
            Object.keys(currentFilters).forEach((key) => {
              if (
                currentFilters[key] &&
                currentFilters[key].toString().trim() !== ""
              ) {
                url += `&${key}=${encodeURIComponent(currentFilters[key])}`;
              }
            });
          }
        }

        const response = await axiosInstance.get(url);

        if (response.data.success) {
          setCharges(
            response.data.data.map((item) => ({ ...item, showDropdown: false }))
          );
          setTotalPages(response.data.pagination.totalPages);
          setCurrentPage(page);
        }
      } catch (err) {
        setError(
          "Failed to fetch records: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    },
    [searchFilters, searchQuery, showAdvancedSearch, currentPage]
  );

  useEffect(() => {
    fetchCharges(currentPage, searchQuery, searchFilters);
  }, [
    fetchCharges,
    currentPage,
    searchQuery,
    searchFilters,
    showAdvancedSearch,
  ]);

  // Handle Search & Filter Logic
  const handleSearch = () => {
    setCurrentPage(1); // Reset to page 1 for new search/filter
    fetchCharges(1, searchQuery, searchFilters);
  };

  const handleClearSearch = () => {
    const clearedFilters = {
      registrationId: "",
      billNo: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    };
    setSearchQuery("");
    setSearchFilters(clearedFilters);
    setCurrentPage(1);
    // Fetch with no filters/search
    fetchCharges(1, "", clearedFilters);
  };

  const handleFilterChange = (key, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGeneralSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value) {
      setCurrentPage(1);
      fetchCharges(1, "", searchFilters);
    }
  };

  // Input handle func
  const handleAddInputChange = (field, value) => {
    setAddForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // add form submit logic
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        RegistrationId: addForm.registrationId,
        OutBillDate: addForm.outBillDate,
        Amount: addForm.amount,
        PhoneNo: addForm.phoneNo,
        PatientName: addForm.patientName,
      };

      await axiosInstance.post("/opd-other-charges", payload);

      alert("New charge added successfully!");

      setShowModal(false);
      fetchCharges(currentPage, searchQuery, searchFilters);
    } catch (err) {
      console.error("Error adding charge:", err);
      setError(
        "Error adding charge: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete record
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        setLoading(true);
        await axiosInstance.delete(
          `/opd-other-charges/${encodeURIComponent(id)}`
        );
        alert("Record deleted successfully!");
        fetchCharges(currentPage, searchQuery, searchFilters);
      } catch (err) {
        console.error("Error deleting record:", err);
        setError(
          "Error deleting record: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setModalType("view");
    setShowModal(true);
  };

  // Format date to yyyy-MM-dd for input[type="date"]
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditForm({
      outBillId: item.OutBillId || "",
      registrationId: item.RegistrationId || "",
      patientName: item.patientregistration?.PatientName || "",
      outBillDate: formatDateForInput(item.OutBillDate),
      amount: item.Amount ?? "",
      phoneNo: item.patientregistration?.PhoneNo || "",
    });
    setModalType("edit");
    setShowModal(true);
  };

  const handleAddNew = () => {
    setModalType("add");
    setAddForm({
      registrationId: "",
      patientName: "",
      outBillDate: "",
      amount: "",
      phoneNo: "",
    });
    setShowModal(true);
  };

  const handleEditInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setLoading(true);
      const payload = {
        OutBillDate: editForm.outBillDate,
        Amount: editForm.amount,
        // প্রয়োজন হলে backend অনুযায়ী আরও field এখানে যোগ করবে
      };

      await axiosInstance.put(
        `/opd-other-charges/${encodeURIComponent(selectedItem.OutBillId)}`,
        payload
      );

      alert("Record updated successfully!");
      setShowModal(false);
      // Refresh current page data
      fetchCharges(currentPage, searchQuery, searchFilters);
    } catch (err) {
      console.error("Error updating record:", err);
      setError(
        "Error updating record: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const renderViewModalContent = (item) => {
    if (!item) return null;
    return (
      <div className="row">
        <div className="col-12 mb-3">
          <label className="form-label">Bill ID</label>
          <input
            type="text"
            className="form-control"
            value={item.OutBillId}
            disabled
          />
        </div>
        <div className="col-12 mb-3">
          <label className="form-label">Registration ID</label>
          <input
            type="text"
            className="form-control"
            value={item.RegistrationId}
            disabled
          />
        </div>
        <div className="col-12 mb-3">
          <label className="form-label">Patient Name</label>
          <input
            type="text"
            className="form-control"
            value={item.patientregistration?.PatientName || "N/A"}
            disabled
          />
        </div>
        <div className="col-12 mb-3">
          <label className="form-label">Bill Date</label>
          <input
            type="text"
            className="form-control"
            value={new Date(item.OutBillDate).toLocaleDateString()}
            disabled
          />
        </div>
        <div className="col-12 mb-3">
          <label className="form-label">Amount</label>
          <input
            type="text"
            className="form-control"
            value={`₹${item.Amount}`}
            disabled
          />
        </div>
        <div className="col-12 mb-3">
          <label className="form-label">Phone</label>
          <input
            type="text"
            className="form-control"
            value={item.patientregistration?.PhoneNo || "N/A"}
            disabled
          />
        </div>
      </div>
    );
  };

  const renderEditModalContent = () => {
    return (
      <form onSubmit={handleUpdateSubmit}>
        <div className="row">
          <div className="col-12 mb-3">
            <label className="form-label">Bill ID</label>
            <input
              type="text"
              className="form-control"
              value={editForm.outBillId}
              disabled
            />
          </div>
          <div className="col-12 mb-3">
            <label className="form-label">Registration ID</label>
            <input
              type="text"
              className="form-control"
              value={editForm.registrationId}
              disabled
            />
          </div>
          <div className="col-12 mb-3">
            <label className="form-label">Patient Name</label>
            <input
              type="text"
              className="form-control"
              value={editForm.patientName}
              disabled
            />
          </div>
          <div className="col-12 mb-3">
            <label className="form-label">Bill Date</label>
            <input
              type="date"
              className="form-control"
              value={editForm.outBillDate}
              onChange={(e) =>
                handleEditInputChange("outBillDate", e.target.value)
              }
            />
          </div>
          <div className="col-12 mb-3">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              value={editForm.amount}
              onChange={(e) => handleEditInputChange("amount", e.target.value)}
            />
          </div>
          <div className="col-12 mb-3">
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-control"
              value={editForm.phoneNo}
              disabled
            />
          </div>
        </div>
        <div className="d-flex gap-2 mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary w-50"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary w-50"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    );
  };

  const renderAdvancedSearchForm = () => (
    <div className="card-body border-bottom pt-3 pb-3">
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label">Registration ID</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Enter Registration ID"
            value={searchFilters.registrationId}
            onChange={(e) =>
              handleFilterChange("registrationId", e.target.value)
            }
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Bill Number</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Enter Bill Number"
            value={searchFilters.billNo}
            onChange={(e) => handleFilterChange("billNo", e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={searchFilters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={searchFilters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Min Amount</label>
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Min Amount"
            value={searchFilters.minAmount}
            onChange={(e) => handleFilterChange("minAmount", e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Max Amount</label>
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Max Amount"
            value={searchFilters.maxAmount}
            onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
          />
        </div>
        <div className="col-md-6 d-flex align-items-end">
          <button
            className="btn btn-success btn-sm me-2"
            onClick={handleSearch}
          >
            Search
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );

  // add form ui
  const renderAddModalContent = () => {
    return (
      <form onSubmit={handleAddSubmit}>
        <div className="row">
          <div className="col-12 mb-3">
            <label className="form-label">Registration ID</label>
            <input
              type="text"
              className="form-control"
              value={addForm.registrationId}
              onChange={(e) =>
                handleAddInputChange("registrationId", e.target.value)
              }
              required
            />
          </div>

          <div className="col-12 mb-3">
            <label className="form-label">Patient Name</label>
            <input
              type="text"
              className="form-control"
              value={addForm.patientName}
              onChange={(e) =>
                handleAddInputChange("patientName", e.target.value)
              }
              required
            />
          </div>

          <div className="col-12 mb-3">
            <label className="form-label">Bill Date</label>
            <input
              type="date"
              className="form-control"
              value={addForm.outBillDate}
              onChange={(e) =>
                handleAddInputChange("outBillDate", e.target.value)
              }
              required
            />
          </div>

          <div className="col-12 mb-3">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              value={addForm.amount}
              onChange={(e) => handleAddInputChange("amount", e.target.value)}
              required
            />
          </div>

          <div className="col-12 mb-3">
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-control"
              value={addForm.phoneNo}
              onChange={(e) => handleAddInputChange("phoneNo", e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary w-50"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary w-50"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    );
  };

  const renderTable = () => {
    return (
      <table className="table table-dashed table-hover digi-dataTable all-employee-table table-striped">
        <thead>
          <tr>
            <th className="no-sort">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </th>
            <th>Action</th>
            <th>Bill ID</th>
            <th>Registration ID</th>
            <th>Patient Name</th>
            <th>Bill Date</th>
            <th>Amount</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {charges.length > 0 ? (
            charges.map((charge) => (
              <tr key={charge.OutBillId}>
                <td>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </td>
                <td>
                  <div
                    className="digi-dropdown dropdown d-inline-block"
                    ref={dropdownRef}
                  >
                    <button
                      className={`btn btn-sm btn-outline-primary ${
                        charge.showDropdown ? "show" : ""
                      }`}
                      onClick={(event) =>
                        handleDropdownToggle(event, charge.OutBillId)
                      }
                    >
                      Action <i className="fa-regular fa-angle-down"></i>
                    </button>
                    <ul
                      className={`digi-table-dropdown digi-dropdown-menu dropdown-menu dropdown-slim dropdown-menu-sm ${
                        charge.showDropdown ? "show" : ""
                      }`}
                    >
                      <li>
                        <a
                          href="#"
                          className="dropdown-item"
                          onClick={(e) => {
                            e.preventDefault();
                            handleView(charge);
                          }}
                        >
                          <span className="dropdown-icon">
                            <i className="fa-light fa-eye"></i>
                          </span>{" "}
                          View
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="dropdown-item"
                          onClick={(e) => {
                            e.preventDefault();
                            handleEdit(charge);
                          }}
                        >
                          <span className="dropdown-icon">
                            <i className="fa-light fa-pen-to-square"></i>
                          </span>{" "}
                          Edit
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="dropdown-item"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(charge.OutBillId);
                          }}
                        >
                          <span className="dropdown-icon">
                            <i className="fa-light fa-trash-can"></i>
                          </span>{" "}
                          Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
                <td>{charge.OutBillId}</td>
                <td>{charge.RegistrationId}</td>
                <td>{charge.patientregistration?.PatientName || "N/A"}</td>
                <td>{new Date(charge.OutBillDate).toLocaleDateString()}</td>
                <td>
                  <span className="badge bg-success">₹{charge.Amount}</span>
                </td>
                <td
                // style="padding-right: 30px" // Removing inline style as it's commented out
                >
                  {charge.patientregistration?.PhoneNo || "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-muted py-4">
                No Other Charges records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  // ==========================================================
  // FIXED: Simplified Pagination Logic (like VisitList's structural requirements)
  // ==========================================================

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Logic to determine which pages to display in the pagination bar
    const maxPages = 5; // Max page links to display (e.g., 1 2 [3] 4 5)
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    const goToPage = (page) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      setCurrentPage(page);
      fetchCharges(page, searchQuery, searchFilters);
    };

    return (
      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
        <div className="text-muted small">
          Page {currentPage} of {totalPages}
        </div>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            {/* Previous */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>

            {/* Page Numbers */}
            {pageNumbers.map((pageNumber) => (
              <li
                key={pageNumber}
                className={`page-item ${
                  currentPage === pageNumber ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              </li>
            ))}

            {/* Next */}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  // ==========================================================
  // END: FIXED Pagination Logic
  // ==========================================================

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          <div className="panel">
            <div className="panel-header">
              <h5>💰 Other Charges Management</h5>
              <div className="btn-box d-flex flex-wrap gap-2">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                >
                  <i
                    className={`fa-light ${
                      showAdvancedSearch
                        ? "fa-eye-slash"
                        : "fa-magnifying-glass"
                    }`}
                  ></i>{" "}
                  {showAdvancedSearch ? "Hide" : "Show"} Advanced Search
                </button>
                <div id="tableSearch">
                  {!showAdvancedSearch && (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search Bill No..."
                      value={searchQuery}
                      onChange={handleGeneralSearchChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                    />
                  )}
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleAddNew}
                >
                  <i className="fa-light fa-plus"></i> Add New
                </button>
              </div>
            </div>

            {showAdvancedSearch && renderAdvancedSearchForm()}

            <div className="panel-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {isBelowLg ? (
                    <OverlayScrollbarsComponent>
                      <div className="table-responsive">{renderTable()}</div>
                    </OverlayScrollbarsComponent>
                  ) : (
                    <div className="table-responsive">{renderTable()}</div>
                  )}
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for View / Edit (Sidebar style from Emr.jsx) */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
            style={{ zIndex: 9998 }}
          ></div>
          <div
            className={`profile-right-sidebar ${showModal ? "active" : ""}`}
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "500px",
              right: showModal ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowModal(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>
            <div
              className="top-panel"
              style={{ height: "100%", paddingTop: "10px" }}
            >
              <div
                // FIXED: Used theme-aware Bootstrap classes for the sticky header
                // bg-body-tertiary will be dark in dark mode and light in light mode.
                className="dropdown-txt  border-bottom"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                {modalType === "add"
                  ? "➕ Add Other Charge"
                  : modalType === "edit"
                  ? `✏️ Edit Charge (${selectedItem?.OutBillId})`
                  : `👁️ View Charge (${selectedItem?.OutBillId})`}
              </div>
              
              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 70px)" }}
              >
                <div className="p-3">
                  {modalType === "view"
                    ? renderViewModalContent(selectedItem)
                    : modalType === "edit"
                    ? renderEditModalContent()
                    : renderAddModalContent()}
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default OtherCharges;