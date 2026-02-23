import { useState, useEffect, useRef, useContext } from "react";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DigiContext } from "../../context/DigiContext";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TestMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState("add"); // add | edit | view
  const [editingItem, setEditingItem] = useState(null);

  // 🔹 ALL FIELDS (frontend + backend) – no undefined
  const emptyForm = {
    TestId: null,
    Test: "",
    ReportingName: "",
    SubDepartmentId: "",
    Method: "",
    Rate: "",
    DescFormat: "",
    TestCode: "",
    ARate: "",
    BRate: "",
    ICURate: "",
    CABRate: "",
    SUITRate: "",
    DeliveryAfter: "",
    SampleTypeId: "",
    SMType: "",
    NABLTag: false, // true => NABL, false => NOT NABL
    NSBilling: false,
    NotReq: false,
    agent: false,
    RateEdit: false,
    IsFormulative: true,
    FForm: false,
    IsProfile: false,
    OutSource: false,
    IsDisc: false,
    cNotReq: false,
    cost: "",
    Interpretation: "",
    Instructions: "",
    BloodFormatMapping: "",
    ProfileTagging: "",

    // 🔥 EXTRA BACKEND FIELDS (from Postman)
    Introduction: "",
    Delivery: "",
    RSlNo: "",
    FormulaText: "",
    FormulaValue: "",
    Units: "",
    Gender: "",
    Container: "",
    Storage: "",
    Department: "",
    Remarks: "",
    ActualColName: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const [subDepartments, setSubDepartments] = useState([]);
  const [sampleTypes, setSampleTypes] = useState([]);

  // pagination (SampleType style)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // delete modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const drawerRef = useRef(null);

  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [currentTestForHtml, setCurrentTestForHtml] = useState(null);
  const [isEditingHtml, setIsEditingHtml] = useState(false);

  const handleViewHtml = async (test) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/tests/${test.TestId}`);
      
      if (response.data.success && response.data.data) {
        const content = response.data.data.html_content || '';
        setHtmlContent(content);
        setCurrentTestForHtml(test);
        setIsEditingHtml(false); // Start with visual editor
        setShowHtmlEditor(true);
      } else {
        toast.error('Failed to load test data');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load HTML content');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHtmlContent = async () => {
    if (!currentTestForHtml?.TestId) return;
    
    try {
      setLoading(true);
      await axiosInstance.put(`/tests/${currentTestForHtml.TestId}`, {
        html_content: htmlContent
      });
      toast.success('HTML content updated successfully!');
      setShowHtmlEditor(false);
      fetchTests(page);
    } catch (error) {
      console.error('Error saving HTML:', error);
      toast.error('Failed to save HTML content');
    } finally {
      setLoading(false);
    }
  };


  //// for search-------
  const [searchText, setSearchText] = useState("");
const [isSearching, setIsSearching] = useState(false);

// search api fetch ---------
const handleSearch = async () => {
  if (!searchText.trim()) {
    toast.info("Enter test name to search");
    return;
  }

  setIsSearching(true);
  setLoading(true);

  try {
    const res = await axiosInstance.get(
      `/tests/search/advanced?test=${encodeURIComponent(searchText)}&page=1&limit=${limit}`
    );

    setTests(res.data.data || []);
    const pag = res.data.pagination || {};
    setPage(pag.currentPage ?? 1);
    setTotalPages(pag.totalPages ?? 1);

  } catch (err) {
    console.error("Search error:", err);
    toast.error("Search failed");
  } finally {
    setLoading(false);
  }
};
// clear search----- 
const clearSearch = () => {
  setSearchText("");
  setIsSearching(false);
  fetchTests(1);   // back to normal list
};
// onkey press search--- 
const onKeyPressSearch = (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
};


  // helper
  const toNumberOrNull = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  // =============================
  // 📌 API CALLS
  // =============================

  const fetchSubDepartments = async () => {
    try {
      const res = await axiosInstance.get("/subdepartment");
      setSubDepartments(res.data.data || []);
    } catch (err) {
      console.error("subdepartments error", err);
      setSubDepartments([]);
    }
  };

  const fetchSampleTypes = async () => {
    try {
      const res = await axiosInstance.get("/sampletypes?page=1&limit=1000");
      setSampleTypes(res.data.data || []);
    } catch (err) {
      console.error("sampletypes error", err);
      setSampleTypes([]);
    }
  };

  const fetchTests = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const endpoint = showInactive ? '/tests/inactive' : '/tests';
      const res = await axiosInstance.get(`${endpoint}?page=${pageNumber}&limit=${limit}`);
      const data = res.data.data || [];
      setTests(data);

      const pag = res.data.pagination || {};
      setPage(pag.currentPage ?? pag.page ?? pageNumber);
      setTotalPages(pag.totalPages ?? 1);
      setLimit(pag.limit ?? 20);
    } catch (err) {
      console.error("tests fetch error", err);
      toast.error("Failed to fetch tests");
      setTests([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSubDepartments();
    fetchSampleTypes();
    fetchTests(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive]);

  // drawer openers
  const openDrawerAdd = () => {
    setFormData(emptyForm);
    setEditingItem(null);
    setModalType("add");
    setShowDrawer(true);
  };

  const openDrawerEdit = (item) => {
    // merge with emptyForm to avoid any undefined field
    setFormData({
      ...emptyForm,
      ...item,
       NABLTag: item.NABLTag === 1 ? true : false,
    });
    setEditingItem(item);
    setModalType("edit");
    setShowDrawer(true);
  };

  const openDrawerView = (item) => {
    setFormData({
      ...emptyForm,
      ...item,
       NABLTag: item.NABLTag === 1 ? true : false,
    });
    setEditingItem(item);
    setModalType("view");
    setShowDrawer(true);
  };

  const handleInput = (field, value) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleToggle = (field) =>
    setFormData((p) => ({ ...p, [field]: !p[field] }));

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        Test: formData.Test || null,
        ReportingName: formData.ReportingName || null,
        SubDepartmentId: toNumberOrNull(formData.SubDepartmentId),
        Method: formData.Method || null,
        Rate: toNumberOrNull(formData.Rate),
        DescFormat: toNumberOrNull(formData.DescFormat),
        TestCode: formData.TestCode || null,
        ARate: toNumberOrNull(formData.ARate),
        BRate: toNumberOrNull(formData.BRate),
        ICURate: toNumberOrNull(formData.ICURate),
        CABRate: toNumberOrNull(formData.CABRate),
        SUITRate: toNumberOrNull(formData.SUITRate),
        DeliveryAfter: toNumberOrNull(formData.DeliveryAfter),

        SampleTypeId: toNumberOrNull(formData.SampleTypeId),
        SMType: formData.SMType || null,

        NABLTag: formData.NABLTag ? 1 : 0,
        NSBilling: formData.NSBilling ? 1 : 0,
        NotReq: formData.NotReq ? 1 : 0,
        agent: formData.agent ? 1 : 0,
        RateEdit: formData.RateEdit ? 1 : 0,
        IsFormulative: formData.IsFormulative ? 1 : 0,
        FForm: formData.FForm ? 1 : 0,
        IsProfile: formData.IsProfile ? 1 : 0,
        OutSource: formData.OutSource ? 1 : 0,
        IsDisc: formData.IsDisc ? 1 : 0,
        cNotReq: formData.cNotReq ? 1 : 0,
        cost: toNumberOrNull(formData.cost),

        Interpretation: formData.Interpretation || null,
        Instructions: formData.Instructions || null,
        BloodFormatMapping: formData.BloodFormatMapping || null,
        ProfileTagging: formData.ProfileTagging || null,

        // 🔥 extra fields mapped safely (no undefined)
        Introduction: formData.Introduction || null,
        Delivery: formData.Delivery || null,
        RSlNo: toNumberOrNull(formData.RSlNo),
        FormulaText: formData.FormulaText || null,
        FormulaValue: toNumberOrNull(formData.FormulaValue),
        Units: formData.Units || null,
        Gender: formData.Gender || null,
        Container: formData.Container || null,
        Storage: formData.Storage || null,
        Department: formData.Department || null,
        Remarks: formData.Remarks || null,
        ActualColName: formData.ActualColName || null,

        CreatedBy: "admin",
        CreatedDate: new Date().toISOString(),
        UpdatedBy: "admin",
        UpdatedDate: new Date().toISOString(),
        Status: "Active",
      };

      // just to double-check: no undefined
      // console.log("payload", payload);

      if (modalType === "edit" && editingItem?.TestId) {
        await axiosInstance.put(`/tests/${editingItem.TestId}`, payload);
        toast.success("Test updated");
      } else {
        await axiosInstance.post("/tests", payload);
        toast.success("Test created");
      }

      fetchTests(page);
      setShowDrawer(false);
    } catch (err) {
      console.error("save error", err?.response?.data || err);
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axiosInstance.patch(`/tests/${id}/toggle-status`);
      fetchTests(page);
    } catch (err) {
      console.error("toggle error", err);
      toast.error("Failed to toggle status");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/tests/${deleteId}`);
      toast.success("Deleted");

      if (tests.length === 1 && page > 1) {
        fetchTests(page - 1);
      } else {
        fetchTests(page);
      }

      setShowConfirm(false);
      setDeleteId(null);
    } catch (err) {
      console.error("delete error", err);
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const getSubDeptName = (id) => {
    const it = subDepartments.find(
      (d) => Number(d.SubDepartmentId) === Number(id)
    );
    return it ? it.SubDepartment : "N/A";
  };

  const startSerial = (page - 1) * limit;

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchTests(p);
  };

  // Escape -> close drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);



    return (
    <div className="main-content">
      <ToastContainer />

      {/* ---------- TABLE PANEL ---------- */}
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🧪 Test Master</h5>
<div className="d-flex gap-2">
  <input
    type="text"
    className="form-control form-control-sm"
    placeholder="🔍 Search Test Name"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    onKeyDown={onKeyPressSearch}
    style={{ width: 220 }}
  />

  <button className="btn btn-sm btn-info" onClick={handleSearch}>
    <i className="fa fa-search"></i>
  </button>

  {isSearching && (
    <button className="btn btn-sm btn-secondary" onClick={clearSearch}>
      Clear
    </button>
  )}
</div>

          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm ${showInactive ? "btn-secondary" : "btn-warning"}`}
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? "Show Active" : "Show Inactive"}
            </button>
            <button className="btn btn-sm btn-primary" onClick={openDrawerAdd}>
              <i className="fa-light fa-plus"></i> Add Test
            </button>
          </div>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <OverlayScrollbarsComponent>
              <div style={{ height: isBelowLg ? "calc(100vh - 250px)" : "calc(100vh - 200px)" }}>
                <table className="table table-sm table-striped table-hover table-dashed">
                  <thead className="sticky-top">
                    <tr>
                      <th>Sl No</th>
                      <th>Test</th>
                      <th>SubDept</th>
                      <th>Code</th>
                      <th>Rate</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-3">
                          No data
                        </td>
                      </tr>
                    ) : (
                      tests.map((t, i) => (
                        <tr key={t.TestId ?? i}>
                          <td>{startSerial + i + 1}</td>
                          <td>{t.Test}</td>
                          <td>{getSubDeptName(t.SubDepartmentId)}</td>
                          <td>{t.TestCode}</td>
                          <td>{t.Rate}</td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={t.Active === 1}
                                onChange={() => toggleStatus(t.TestId)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleViewHtml(t)}
                                title="View/Edit HTML"
                              >
                                <i className="fa-light fa-file-code" />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => openDrawerView(t)}
                              >
                                <i className="fa-light fa-eye" />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openDrawerEdit(t)}
                              >
                                <i className="fa-light fa-pen" />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  setDeleteId(t.TestId);
                                  setShowConfirm(true);
                                }}
                              >
                                <i className="fa-light fa-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </OverlayScrollbarsComponent>
          )}
        </div>
      </div>

      {/* ---------- PAGINATION (SampleType style) ---------- */}
      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page - 1)}>
              Prev
            </button>
          </li>

          <li className="page-item disabled">
            <button className="page-link">{page}/{totalPages}</button>
          </li>

          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>

      {/* ---------- DRAWER (900px, multi-column) ---------- */}
      {showDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 9998 }}
            onClick={() => setShowDrawer(false)}
          ></div>

          <div
            ref={drawerRef}
            className="profile-right-sidebar active"
            style={{
              zIndex: 9999,
              width: "100%",
              maxWidth: "1100px", // 900px drawer
              right: showDrawer ? "0" : "-100%",
              top: "70px",
              height: "calc(100vh - 70px)",
              // background: "#fff",
              overflowX: "hidden",
              overflowY: "hidden",
            }}
          >
            <button
              className="right-bar-close"
              onClick={() => setShowDrawer(false)}
            >
              <i className="fa-light fa-angle-right"></i>
            </button>

            <div className="top-panel" style={{ height: "100%" }}>
              <div className="d-flex justify-content-between me-3 ">
                 <div
                className="dropdown-txt"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  // backgroundColor: "#0a1735",
                  // color: "#fff",
                  padding: "10px",
                }}
              >
                {modalType === "add"
                  ? "➕ Add Test"
                  : modalType === "edit"
                  ? "✏️ Edit Test"
                  : "👁️ View Test"}
              </div>
              <div style={{cursor:"pointer"}} onClick={() => setShowDrawer(false)}>
                X
              </div>
              </div>
             
              

              <OverlayScrollbarsComponent
                style={{ height: "calc(100% - 50px)" }}
              >
                <div className="p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (modalType !== "view") handleSave();
                    }}
                  >
                    {/* NABL + NotReq/Agent/NSBilling row */}
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", gap: 8 }}>
                        <label className="form-label fw-bold small mb-0">
                          NABL Tag
                        </label>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="nablRadio"
                            id="nablYes"
                            checked={formData.NABLTag === true }
                            onChange={() => handleInput("NABLTag", true)}
                            disabled={modalType === "view"}
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="nablYes"
                          >
                            NABL
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="nablRadio"
                            id="nablNo"
                            checked={formData.NABLTag === false }
                            onChange={() => handleInput("NABLTag", false)}
                            disabled={modalType === "view"}
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="nablNo"
                          >
                            NOT NABL
                          </label>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.NotReq}
                            onChange={() => handleToggle("NotReq")}
                            disabled={modalType === "view"}
                            id="NotReq"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="NotReq"
                          >
                            NotReq
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.agent}
                            onChange={() => handleToggle("agent")}
                            disabled={modalType === "view"}
                            id="agent"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="agent"
                          >
                            Agent
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.NSBilling}
                            onChange={() => handleToggle("NSBilling")}
                            disabled={modalType === "view"}
                            id="NSBilling"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="NSBilling"
                          >
                            NS Billing
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Test / Reporting / Code */}
                    <div className="row mt-1">
                      <div className="col-md-4">
                        <label className="form-label fw-bold small">
                          Test Name
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.Test}
                          onChange={(e) =>
                            handleInput("Test", e.target.value)
                          }
                          disabled={modalType === "view"}
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-bold small">
                          Reporting Name
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.ReportingName}
                          onChange={(e) =>
                            handleInput("ReportingName", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Test Code
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.TestCode}
                          onChange={(e) =>
                            handleInput("TestCode", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>
                       <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Method
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.Method}
                          onChange={(e) =>
                            handleInput("Method", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>
                    </div>

                    {/* SubDept / SampleType / Method */}
                    <div className="row mt-1">
                      <div className="col-md-4">
                        <label className="form-label fw-bold small">
                          SubDepartment
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.SubDepartmentId ?? ""}
                          onChange={(e) =>
                            handleInput("SubDepartmentId", e.target.value)
                          }
                          disabled={modalType === "view"}
                        >
                          <option value="">Select</option>
                          {subDepartments.map((d) => (
                            <option
                              key={d.SubDepartmentId}
                              value={d.SubDepartmentId}
                            >
                              {d.SubDepartment}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-bold small">
                          Sample Type
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.SampleTypeId ?? ""}
                          onChange={(e) =>
                            handleInput("SampleTypeId", e.target.value)
                          }
                          disabled={modalType === "view"}
                        >
                          <option value="">Select</option>
                          {sampleTypes.map((s) => (
                            <option
                              key={s.SampleTypeId}
                              value={s.SampleTypeId}
                            >
                              {s.SampleType}
                              {s.Colour ? ` (${s.Colour})` : ""}
                            </option>
                          ))}
                        </select>
                        
                      </div>
 <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Delivery After
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="Days"
                          value={formData.DeliveryAfter ?? ""}
                          onChange={(e) =>
                            handleInput("DeliveryAfter", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>
                     
                    </div>

                    {/* Delivery / DescFormat / Rate / ARate / BRate / ICU */}
                    <div className="row mt-1">
                     

                      {/* <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Format ID
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.DescFormat ?? ""}
                          onChange={(e) =>
                            handleInput("DescFormat", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div> */}

                      <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Rate
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.Rate ?? ""}
                          onChange={(e) =>
                            handleInput("Rate", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>

                      {/* <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          A Rate
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.ARate ?? ""}
                          onChange={(e) =>
                            handleInput("ARate", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div> */}

                      <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          IPD Rate
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.BRate ?? ""}
                          onChange={(e) =>
                            handleInput("BRate", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          ICU Rate
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.ICURate ?? ""}
                          onChange={(e) =>
                            handleInput("ICURate", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>
                       <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          CAB Rate
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.CABRate ?? ""}
                          onChange={(e) =>
                            handleInput("CABRate", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>
                        <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          SUIT Rate
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.SUITRate ?? ""}
                          onChange={(e) =>
                            handleInput("SUITRate", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>
                        <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Cost
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.cost ?? ""}
                          onChange={(e) =>
                            handleInput("cost", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>
                    </div>

                 
                    

                    {/* Profile Tag + BloodFormat */}
                    <div className="row mt-1">
                      <div className="col-md-3">
                        <label className="form-label fw-bold small">
                          Profile Tagging
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.ProfileTagging ?? ""}
                          onChange={(e) =>
                            handleInput("ProfileTagging", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label fw-bold small">
                          Blood Format Mapping
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.BloodFormatMapping ?? ""}
                          onChange={(e) =>
                            handleInput("BloodFormatMapping", e.target.value)
                          }
                          disabled={modalType === "view"}
                        >
                          <option value="">Select</option>
                          <option value="HB">HB</option>
                          <option value="CBC">CBC</option>
                          <option value="Platelet">Platelet</option>
                          <option value="TC-DC">TC / DC</option>
                          <option value="ESR">ESR</option>
                        </select>
                      </div>

                      {/* <div className="col-md-3">
                        <label className="form-label fw-bold small">
                          SM Type
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.SMType ?? ""}
                          onChange={(e) =>
                            handleInput("SMType", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div> */}

                      {/* <div className="col-md-3">
                        <label className="form-label fw-bold small">
                          R Sl No
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.RSlNo ?? ""}
                          onChange={(e) =>
                            handleInput("RSlNo", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div> */}
                    </div>

                    {/* Checkboxes row */}
                    <div className="row mt-1">
                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.RateEdit}
                            onChange={() => handleToggle("RateEdit")}
                            disabled={modalType === "view"}
                            id="RateEdit"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="RateEdit"
                          >
                            Rate Edit
                          </label>
                        </div>
                      </div>

                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.IsFormulative}
                            onChange={() => handleToggle("IsFormulative")}
                            disabled={modalType === "view"}
                            id="IsFormulative"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="IsFormulative"
                          >
                            Is Formulative
                          </label>
                        </div>
                      </div>

                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.FForm}
                            onChange={() => handleToggle("FForm")}
                            disabled={modalType === "view"}
                            id="FForm"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="FForm"
                          >
                            F-Form
                          </label>
                        </div>
                      </div>

                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.IsProfile}
                            onChange={() => handleToggle("IsProfile")}
                            disabled={modalType === "view"}
                            id="IsProfile"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="IsProfile"
                          >
                            Profile
                          </label>
                        </div>
                      </div>

                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.OutSource}
                            onChange={() => handleToggle("OutSource")}
                            disabled={modalType === "view"}
                            id="OutSource"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="OutSource"
                          >
                            OutSource
                          </label>
                        </div>
                      </div>

                      {/* <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.IsDisc}
                            onChange={() => handleToggle("IsDisc")}
                            disabled={modalType === "view"}
                            id="IsDisc"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="IsDisc"
                          >
                            IsDisc
                          </label>
                        </div>
                      </div> */}

                      <div className="col-md-2 ">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.cNotReq}
                            onChange={() => handleToggle("cNotReq")}
                            disabled={modalType === "view"}
                            id="cNotReq"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="cNotReq"
                          >
                            cNotReq
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Units / Gender / Container / Storage / Department / ActualColName */}
                    {/* <div className="row mt-1">
                      <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Units
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.Units ?? ""}
                          onChange={(e) =>
                            handleInput("Units", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Gender
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.Gender ?? ""}
                          onChange={(e) =>
                            handleInput("Gender", e.target.value)
                          }
                          disabled={modalType === "view"}
                          placeholder="Both / Male / Female"
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Container
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.Container ?? ""}
                          onChange={(e) =>
                            handleInput("Container", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Storage
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.Storage ?? ""}
                          onChange={(e) =>
                            handleInput("Storage", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Department
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.Department ?? ""}
                          onChange={(e) =>
                            handleInput("Department", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label fw-bold small">
                          Actual Column Name
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={formData.ActualColName ?? ""}
                          onChange={(e) =>
                            handleInput("ActualColName", e.target.value)
                          }
                          disabled={modalType === "view"}
                        />
                      </div>
                    </div> */}

                    {/* Introduction / Delivery / Remarks / Interpretation / Instructions */}
                    {/* <div className="mt-2">
                      <label className="form-label fw-bold small">
                        Introduction
                      </label>
                      <textarea
                        rows={2}
                        className="form-control form-control-sm"
                        value={formData.Introduction ?? ""}
                        onChange={(e) =>
                          handleInput("Introduction", e.target.value)
                        }
                        disabled={modalType === "view"}
                      />
                    </div> */}

                    {/* <div className="mt-2">
                      <label className="form-label fw-bold small">
                        Delivery Text
                      </label>
                      <textarea
                        rows={1}
                        className="form-control form-control-sm"
                        value={formData.Delivery ?? ""}
                        onChange={(e) =>
                          handleInput("Delivery", e.target.value)
                        }
                        disabled={modalType === "view"}
                      />
                    </div> */}

                    {/* <div className="mt-2">
                      <label className="form-label fw-bold small">
                        Remarks
                      </label>
                      <textarea
                        rows={1}
                        className="form-control form-control-sm"
                        value={formData.Remarks ?? ""}
                        onChange={(e) =>
                          handleInput("Remarks", e.target.value)
                        }
                        disabled={modalType === "view"}
                      />
                    </div> */}

                    <div className="mt-1">
                      <label className="form-label fw-bold small">
                        Interpretation
                      </label>
                      <textarea
                        rows={1}
                        className="form-control form-control-sm"
                        value={formData.Interpretation ?? ""}
                        onChange={(e) =>
                          handleInput("Interpretation", e.target.value)
                        }
                        disabled={modalType === "view"}
                      />
                    </div>

                    <div className="mt-1">
                      <label className="form-label fw-bold small">
                        Instructions
                      </label>
                      <textarea
                        rows={1}
                        className="form-control form-control-sm"
                        value={formData.Introduction ?? ""}
                        onChange={(e) =>
                          handleInput("Introduction", e.target.value)
                        }
                        disabled={modalType === "view"}
                      />
                    </div>



                    {/* Footer buttons */}
                    <div className="d-flex gap-2 mt-1">
                      <button
                        type="button"
                        className="btn btn-secondary w-50"
                        onClick={() => setShowDrawer(false)}
                      >
                        Cancel
                      </button>

                      {modalType !== "view" && (
                        <button
                          type="submit"
                          className="btn btn-primary w-50"
                          disabled={loading}
                        >
                          {loading
                            ? "Saving..."
                            : modalType === "edit"
                            ? "Update Test"
                            : "Save Test"}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </OverlayScrollbarsComponent>
            </div>
          </div>
        </>
      )}

      {/* ---------- HTML Editor Modal ---------- */}
      {showHtmlEditor && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 99999 }}
            onClick={() => setShowHtmlEditor(false)}
          ></div>
          <div
            className="modal d-block"
            style={{ zIndex: 100000 }}
            onClick={() => setShowHtmlEditor(false)}
          >
            <div
              className="modal-dialog modal-xl modal-dialog-centered"
              style={{ maxWidth: '95%', height: '95vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content" style={{ height: '100%' }}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fa-light fa-file-lines me-2"></i>
                    HTML Content - {currentTestForHtml?.Test}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowHtmlEditor(false)}
                  ></button>
                </div>

                <div className="modal-body" style={{ height: 'calc(100% - 120px)', display: 'flex', flexDirection: 'column' }}>
                  {isEditingHtml ? (
                    <textarea
                      className="form-control"
                      style={{ height: '100%', fontFamily: 'monospace', fontSize: '14px' }}
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="Enter HTML content here..."
                    />
                  ) : (
                    <ReactQuill
                      theme="snow"
                      value={htmlContent}
                      onChange={setHtmlContent}
                      style={{ height: 'calc(100% - 50px)' }}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'align': [] }],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'image'],
                          ['clean']
                        ]
                      }}
                    />
                  )}
                </div>

                <div className="modal-footer d-flex justify-content-between">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsEditingHtml(!isEditingHtml)}
                  >
                    <i className={`fa-light fa-${isEditingHtml ? 'eye' : 'code'} me-2`}></i>
                    {isEditingHtml ? 'Visual Editor' : 'View HTML Code'}
                  </button>
                  
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowHtmlEditor(false)}
                    >
                      Close
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveHtmlContent}
                      disabled={loading}
                    >
                      <i className="fa-light fa-save me-2"></i>
                      {loading ? 'Saving...' : 'Save HTML'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------- Delete Confirm Modal ---------- */}
      {showConfirm && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 99999 }}
          ></div>
          <div
            className="modal d-block"
            style={{ zIndex: 100000, background: "rgba(0,0,0,0.2)" }}
            onClick={() => setShowConfirm(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fa-light fa-triangle-exclamation me-2"></i>
                    Confirm Delete
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowConfirm(false)}
                  ></button>
                </div>

                <div className="modal-body text-center">
                  <p className="fs-6 mb-1">
                    Are you sure you want to delete this test?
                  </p>
                  <p className="text-muted">This cannot be undone.</p>
                </div>

                <div className="modal-footer d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-secondary px-4"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-danger px-4"
                    onClick={confirmDelete}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default TestMaster;