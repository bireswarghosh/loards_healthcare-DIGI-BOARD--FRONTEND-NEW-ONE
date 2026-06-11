
import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "../../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DigiContext } from "../../context/DigiContext";
import DocumentEditor from "../../components/editor/DocumentEditor";

    
import { createPortal } from "react-dom";

const PortalModal = ({ children }) => {
  return createPortal(children, document.body);
};

const TestMaster = () => {
  const { isBelowLg } = useContext(DigiContext);
  const navigate = useNavigate();
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
  const [htmlContent, setHtmlContent] = useState("");
  const [currentTestForHtml, setCurrentTestForHtml] = useState(null);

  // Google integration states inside modal
  const [googleDocId, setGoogleDocId] = useState(null);
  const [driveFiles, setDriveFiles] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [activeTab, setActiveTab] = useState("existing");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [newDocTitle, setNewDocTitle] = useState("");

  const [showGoogleWizard, setShowGoogleWizard] = useState(false);
  const [googleStatus, setGoogleStatus] = useState({
    oauthConfigured: false,
    googleConnected: false,
    config: { googleClientId: "", googleClientSecret: "", googleRedirectUri: "" }
  });
  const [googleClientInput, setGoogleClientInput] = useState({
    googleClientId: "",
    googleClientSecret: "",
    googleRedirectUri: ""
  });

  const fetchGoogleStatus = async () => {
    try {
      const res = await axiosInstance.get('/auth/google/status');
      if (res.data.success) {
        setGoogleStatus(res.data);
        setGoogleClientInput({
          googleClientId: res.data.config.googleClientId || "",
          googleClientSecret: "",
          googleRedirectUri: res.data.config.googleRedirectUri || "http://localhost:5000/api/v1/auth/google/callback"
        });
      }
    } catch (err) {
      console.error("Error fetching Google status:", err);
    }
  };

  const handleSaveGoogleConfig = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...googleClientInput };
      if (!payload.googleClientSecret) {
        delete payload.googleClientSecret;
      }
      const res = await axiosInstance.post('/auth/google/config', payload);
      if (res.data.success) {
        toast.success("Google configuration saved successfully!");
        fetchGoogleStatus();
      }
    } catch (err) {
      console.error("Error saving Google config:", err);
      toast.error("Failed to save Google configuration");
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const currentOrigin = window.location.origin;
      let redirectUrl = `${currentOrigin}/TestMaster`;
      if (currentTestForHtml?.TestId) {
        redirectUrl += `?open_test_id=${currentTestForHtml.TestId}`;
      }
      const res = await axiosInstance.get(`/auth/google/url?frontend_url=${encodeURIComponent(redirectUrl)}`);
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to get authorization URL");
      }
    } catch (err) {
      console.error("Error getting auth URL:", err);
      toast.error("Failed to connect with Google");
    }
  };

  const handleDisconnectGoogle = async () => {
    if (window.confirm("Are you sure you want to disconnect your Google account?")) {
      try {
        const res = await axiosInstance.post('/auth/google/disconnect');
        if (res.data.success) {
          toast.success("Google account disconnected successfully");
          fetchGoogleStatus();
        }
      } catch (err) {
        console.error("Error disconnecting Google:", err);
        toast.error("Failed to disconnect Google account");
      }
    }
  };

  const editorContentRef = useRef("");



  const handleViewHtml = async (test) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/tests/${test.TestId}/html-content`);
      const testRes = await axiosInstance.get(`/tests/${test.TestId}`);

      if (response.data.success && response.data.data && testRes.data?.data) {
        const { htmlContent: content, fileName, source } = response.data.data;
        const fetchedTest = testRes.data.data;

        setHtmlContent(content || "");
        editorContentRef.current = content || "";
        
        let currentDocId = fetchedTest.google_doc_id || null;

        // Fetch latest Google connection status
        let isConnected = false;
        try {
          const statusRes = await axiosInstance.get('/auth/google/status');
          isConnected = statusRes.data?.success && statusRes.data.googleConnected;
        } catch (e) {
          console.error("Error checking Google status:", e);
        }

        if (!currentDocId && isConnected) {
          try {
            toast.info("Auto-provisioning Google Doc template...");
            const title = `${fetchedTest.Test} Template`;
            const createRes = await axiosInstance.post('/google-docs/create', { 
              title, 
              testId: fetchedTest.TestId 
            });
            if (createRes.data.success && createRes.data.data?.id) {
              currentDocId = createRes.data.data.id;
              toast.success("Google Document auto-created & linked!");
              setGoogleDocId(currentDocId);
              setCurrentTestForHtml({ ...fetchedTest, google_doc_id: currentDocId, file_name: fileName || fetchedTest.file_name });
              fetchTests(page);
            } else {
              setGoogleDocId(null);
              setCurrentTestForHtml({ ...fetchedTest, file_name: fileName || fetchedTest.file_name });
            }
          } catch (createErr) {
            console.error("Auto-creation of Google Doc failed:", createErr);
            setGoogleDocId(null);
            setCurrentTestForHtml({ ...fetchedTest, file_name: fileName || fetchedTest.file_name });
          }
        } else {
          setGoogleDocId(currentDocId);
          setCurrentTestForHtml({ ...fetchedTest, file_name: fileName || fetchedTest.file_name });
        }

        setShowHtmlEditor(true);

        if (source === 'converted' && !currentDocId) {
          toast.success("DOCX converted to HTML successfully!");
        } else if (source === 'r2_not_found' && !currentDocId) {
          toast.warn("No DOCX file found in R2 for this test");
        } else if (source === 'empty' && !currentDocId) {
          toast.info("No file linked to this test");
        }
      } else {
        toast.error("Failed to load test data");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load HTML content");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHtmlContent = async (data) => {
    if (!currentTestForHtml?.TestId) return;

    try {
      setLoading(true);
      const exportedContent = data?.html || editorContentRef.current || htmlContent;

      await axiosInstance.put(`/tests/${currentTestForHtml.TestId}/html-content`, {
        htmlContent: exportedContent,
      });
      toast.success("HTML content updated successfully!");
      fetchTests(page);
    } catch (error) {
      console.error("Error saving HTML:", error);
      toast.error("Failed to save HTML content");
    } finally {
      setLoading(false);
    }
  };

  const fetchDriveFiles = async () => {
    try {
      const res = await axiosInstance.get('/google-docs/list');
      if (res.data.success) {
        setDriveFiles(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching Google Drive files:", err);
    }
  };

  const handleLinkDoc = async (docId) => {
    if (!docId || !currentTestForHtml?.TestId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.post('/google-docs/link', { 
        testId: currentTestForHtml.TestId, 
        docId 
      });
      if (res.data.success) {
        toast.success("Google Document linked successfully!");
        setGoogleDocId(docId);
        setCurrentTestForHtml(prev => ({ ...prev, google_doc_id: docId }));
        setShowLinkModal(false);
        fetchTests(page);
      }
    } catch (err) {
      console.error("Error linking Google Doc:", err);
      toast.error("Failed to link Google Document");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkDoc = async () => {
    if (!currentTestForHtml?.TestId) return;
    if (!window.confirm("Are you sure you want to unlink this Google Doc from the test? The local HTML template will remain saved, but editing changes in Google Doc will no longer sync until linked again.")) return;
    try {
      setLoading(true);
      const res = await axiosInstance.post('/google-docs/unlink', { 
        testId: currentTestForHtml.TestId 
      });
      if (res.data.success) {
        toast.success("Google Document unlinked successfully!");
        setGoogleDocId(null);
        setCurrentTestForHtml(prev => ({ ...prev, google_doc_id: null }));
        fetchTests(page);
      }
    } catch (err) {
      console.error("Error unlinking Google Doc:", err);
      toast.error("Failed to unlink Google Document");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoc = async () => {
    if (!currentTestForHtml?.TestId) return;
    const title = newDocTitle.trim() || `${currentTestForHtml.Test} Template`;
    try {
      setLoading(true);
      const res = await axiosInstance.post('/google-docs/create', { 
        title, 
        testId: currentTestForHtml.TestId 
      });
      if (res.data.success && res.data.data?.id) {
        toast.success(`Google Document "${title}" created and linked!`);
        setGoogleDocId(res.data.data.id);
        setCurrentTestForHtml(prev => ({ ...prev, google_doc_id: res.data.data.id }));
        setNewDocTitle("");
        setShowLinkModal(false);
        fetchTests(page);
      }
    } catch (err) {
      console.error("Error creating Google Doc:", err);
      toast.error("Failed to create Google Document");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromGoogle = async () => {
    if (!googleDocId || !currentTestForHtml?.TestId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.post('/google-docs/sync', { 
        testId: currentTestForHtml.TestId, 
        docId: googleDocId 
      });
      if (res.data.success) {
        toast.success("Successfully synchronized latest changes from Google Docs!");
        const response = await axiosInstance.get(`/tests/${currentTestForHtml.TestId}/html-content`);
        if (response.data.success && response.data.data) {
          setHtmlContent(response.data.data.htmlContent || "");
          editorContentRef.current = response.data.data.htmlContent || "";
        }
      }
    } catch (err) {
      console.error("Error syncing from Google Docs:", err);
      toast.error("Failed to sync from Google Docs. Ensure your Google account is connected.");
    } finally {
      setLoading(false);
    }
  };

  // Force re-convert from R2 (even if html already exists)
  const handleReconvert = async () => {
    if (!currentTestForHtml?.TestId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.post(`/tests/${currentTestForHtml.TestId}/convert-existing-file`);
      if (res.data.success) {
        setHtmlContent(res.data.data.htmlContent || "");
        toast.success("Re-converted from DOCX!");
      } else {
        toast.error(res.data.message || "Re-convert failed");
      }
    } catch (error) {
      console.error("Re-convert error:", error);
      toast.error("Failed to re-convert from DOCX");
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
        `/tests/search/advanced?test=${encodeURIComponent(searchText)}&page=1&limit=${limit}`,
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
    fetchTests(1); // back to normal list
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
const getDepartmentName = (subDeptId) => {
  const item = subDepartments.find(
    (d) => Number(d.SubDepartmentId) === Number(subDeptId)
  );
  return item ? item.Department : "";
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
      const endpoint = showInactive ? "/tests/inactive" : "/tests";
      const res = await axiosInstance.get(
        `${endpoint}?page=${pageNumber}&limit=${limit}`,
      );
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
    fetchGoogleStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google_connected") === "true") {
      toast.success("Google Account connected successfully!");
      const openTestId = params.get("open_test_id");
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchGoogleStatus();
      if (openTestId) {
        axiosInstance.get(`/tests/${openTestId}`)
          .then((res) => {
            if (res.data?.data) {
              handleViewHtml(res.data.data);
            }
          })
          .catch((err) => {
            console.error("Error fetching test on reconnect:", err);
          });
      }
    }
  }, []);

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
      (d) => Number(d.SubDepartmentId) === Number(id),
    );
    return it ? it.SubDepartment : "N/A";
  };

  const startSerial = (page - 1) * limit;

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    if (isSearching && searchText.trim()) {
      setLoading(true);
      axiosInstance
        .get(`/tests/search/advanced?test=${encodeURIComponent(searchText)}&page=${p}&limit=${limit}`)
        .then((res) => {
          setTests(res.data.data || []);
          const pag = res.data.pagination || {};
          setPage(pag.currentPage ?? p);
          setTotalPages(pag.totalPages ?? 1);
        })
        .catch((err) => {
          console.error("Search pagination error:", err);
          toast.error("Failed to fetch search results");
        })
        .finally(() => setLoading(false));
    } else {
      fetchTests(p);
    }
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
              <button
                className="btn btn-sm btn-secondary"
                onClick={clearSearch}
              >
                Clear
              </button>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowGoogleWizard(true)}
              title="Google Docs Setup"
            >
              <i className="fa-brands fa-google me-1"></i> Google Docs Setup
            </button>
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
              <div
                style={{
                  height: isBelowLg
                    ? "calc(100vh - 250px)"
                    : "calc(100vh - 200px)",
                }}
              >
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
                          <td>
                            {t.Test}
                            {t.file_name && (
                              <span className="badge bg-light text-dark ms-1" style={{ fontSize: "10px", fontWeight: "normal" }}>
                                <i className="fa fa-file-text-o me-1"></i>{t.file_name}
                              </span>
                            )}
                            {t.google_doc_id && (
                              <span className="badge bg-success text-white ms-1" style={{ fontSize: "10px", fontWeight: "normal" }}>
                                <i className="fa-brands fa-google me-1"></i>Google Doc
                              </span>
                            )}
                          </td>
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
            <button className="page-link">
              {page}/{totalPages}
            </button>
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
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowDrawer(false)}
                >
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
                            checked={formData.NABLTag === true}
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
                            checked={formData.NABLTag === false}
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
                          onChange={(e) => handleInput("Test", e.target.value)}
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
                      <div className="col-md-3">
                        <label className="form-label fw-bold small">
                          Sub Department
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
                      <div className="col-md-3">
                        <label className="form-label fw-bold small">
                          Department
                        </label>
                        <input
                          className="form-control form-control-sm"
                          value={getDepartmentName(formData.SubDepartmentId)}
                          disabled
                        />
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
                            <option key={s.SampleTypeId} value={s.SampleTypeId}>
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
                        <label className="form-label fw-bold small">Rate</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.Rate ?? ""}
                          onChange={(e) => handleInput("Rate", e.target.value)}
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
                          onChange={(e) => handleInput("BRate", e.target.value)}
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
                        <label className="form-label fw-bold small">Cost</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.cost ?? ""}
                          onChange={(e) => handleInput("cost", e.target.value)}
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

      {/* ---------- HTML Editor Modal (CKEditor / Google Docs + Preview) ---------- */}
      {showHtmlEditor && (
        <PortalModal>
          <>
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: 99999 }}
            ></div>
            <div
              className="modal d-block"
              style={{ zIndex: 100000, overflow: "hidden" }}
            >
              <div
                className="modal-dialog modal-xl modal-dialog-centered"
                style={{ maxWidth: "95%", height: "95vh", margin: "2.5vh auto" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content" style={{ height: "100%", overflow: "hidden" }}>
                  <div className="modal-header py-2 d-flex justify-content-between align-items-center">
                    <h5 className="modal-title m-0 d-flex align-items-center">
                      <i className="fa-light fa-file-lines me-2"></i>
                      Template Editor - {currentTestForHtml?.Test}
                      {currentTestForHtml?.file_name && (
                        <span className="ms-2 badge bg-secondary fw-normal" style={{ fontSize: "11px" }}>
                          <i className="fa-light fa-file me-1"></i>
                          {currentTestForHtml.file_name}
                        </span>
                      )}
                      {googleDocId && (
                        <span className="ms-2 badge bg-success text-white fw-normal" style={{ fontSize: "11px" }}>
                          <i className="fa-brands fa-google me-1"></i>Linked to Google Doc
                        </span>
                      )}
                    </h5>
                    <div className="d-flex gap-2 align-items-center me-3">
                      {googleDocId ? (
                        <>
                          <a 
                            href={`https://docs.google.com/document/d/${googleDocId}/edit`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-outline-primary py-1 px-2"
                            style={{ fontSize: "12px" }}
                          >
                            <i className="fa-solid fa-up-right-from-square me-1"></i> Open Google Doc
                          </a>
                          <button 
                            className="btn btn-xs btn-success py-1 px-2" 
                            onClick={handleSyncFromGoogle} 
                            disabled={loading}
                            style={{ fontSize: "12px" }}
                          >
                            <i className="fa-solid fa-rotate me-1"></i> Sync from Google Docs
                          </button>
                          <button 
                            className="btn btn-xs btn-outline-danger py-1 px-2" 
                            onClick={handleUnlinkDoc} 
                            disabled={loading}
                            style={{ fontSize: "12px" }}
                          >
                            <i className="fa-solid fa-link-slash me-1"></i> Unlink
                          </button>
                        </>
                      ) : (
                        <>
                          {googleStatus.googleConnected ? (
                            <button 
                              className="btn btn-xs btn-outline-success py-1 px-2" 
                              onClick={() => {
                                fetchDriveFiles();
                                setShowLinkModal(true);
                              }}
                              disabled={loading}
                              style={{ fontSize: "12px" }}
                            >
                              <i className="fa-brands fa-google me-1"></i> Link Google Doc
                            </button>
                          ) : (
                            <button 
                              className="btn btn-xs btn-success py-1 px-2" 
                              onClick={handleConnectGoogle}
                              disabled={loading}
                              style={{ fontSize: "12px" }}
                            >
                              <i className="fa-brands fa-google me-1"></i> Connect Google Account
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    <button
                      className="btn-close"
                      onClick={() => setShowHtmlEditor(false)}
                    ></button>
                  </div>

                  <div
                    className="modal-body p-0"
                    style={{
                      height: "calc(100% - 110px)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {googleDocId ? (
                      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#f1f3f4", height: "100%" }}>
                        <iframe
                          src={`https://docs.google.com/document/d/${googleDocId}/edit?embedded=true`}
                          style={{ width: "100%", height: "100%", border: "none" }}
                          allow="autoplay; encrypted-media"
                          title="Google Docs Editor"
                        />
                      </div>
                    ) : (
                      <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                        <DocumentEditor
                          initialContent={htmlContent}
                          documentTitle={currentTestForHtml?.Test || "Document"}
                          onSave={(data) => {
                            editorContentRef.current = data.html;
                            handleSaveHtmlContent(data);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="modal-footer py-2 d-flex justify-content-between">  
                    <div className="d-flex gap-2">
                      {!googleDocId && (
                        <button
                          className="btn btn-sm btn-warning"    
                          onClick={handleReconvert}
                          disabled={loading}
                          title="Re-download DOCX from R2 and convert again"
                        >
                          <i className="fa-light fa-rotate me-1"></i>
                          {loading ? "Converting..." : "Re-convert DOCX"}
                        </button>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setShowHtmlEditor(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        </PortalModal>
      )}

      {/* ---------- Link Google Doc Sub-Modal ---------- */}
      {showLinkModal && (
        <PortalModal>
          <>
            <div 
              className="modal-backdrop fade show" 
              style={{ zIndex: 100005 }}
              onClick={() => setShowLinkModal(false)}
            ></div>
            <div 
              className="modal d-block" 
              style={{ zIndex: 100010, overflow: "hidden" }}
              onClick={() => setShowLinkModal(false)}
            >
              <div 
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header py-2">
                    <h5 className="modal-title">Link to Google Document</h5>
                    <button type="button" className="btn-close" onClick={() => setShowLinkModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <ul className="nav nav-tabs mb-3">
                      <li className="nav-item">
                        <button 
                          className={`nav-link btn-sm py-1 px-3 ${activeTab === "existing" ? "active" : ""}`}
                          onClick={() => setActiveTab("existing")}
                          type="button"
                        >
                          Link Existing Doc
                        </button>
                      </li>
                      <li className="nav-item">
                        <button 
                          className={`nav-link btn-sm py-1 px-3 ${activeTab === "new" ? "active" : ""}`}
                          onClick={() => setActiveTab("new")}
                          type="button"
                        >
                          Create New Doc
                        </button>
                      </li>
                    </ul>
                    <div className="tab-content">
                      {activeTab === "existing" ? (
                        <div>
                          <div className="mb-3">
                            <label className="form-label small fw-bold">Select Document from Drive</label>
                            <select 
                              className="form-select form-select-sm"
                              value={selectedDocId}
                              onChange={(e) => setSelectedDocId(e.target.value)}
                            >
                              <option value="">-- Choose a Google Doc --</option>
                              {driveFiles.map(file => (
                                <option key={file.id} value={file.id}>{file.name}</option>
                              ))}
                            </select>
                          </div>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-primary w-100" 
                            onClick={() => handleLinkDoc(selectedDocId)}
                            disabled={!selectedDocId || loading}
                          >
                            Link Selected Document
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-3">
                            <label className="form-label small fw-bold">New Document Title</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm"
                              placeholder="E.g., Glucose Test Template"
                              value={newDocTitle}
                              onChange={(e) => setNewDocTitle(e.target.value)}
                            />
                          </div>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-success w-100" 
                            onClick={handleCreateDoc}
                            disabled={loading}
                          >
                            Create and Link Document
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer py-2">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowLinkModal(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        </PortalModal>
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

      {/* ---------- Google Docs Setup Wizard Modal ---------- */}
      {showGoogleWizard && (
        <PortalModal>
          <>
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: 99999 }}
            ></div>
            <div
              className="modal d-block"
              style={{ zIndex: 100000, overflowY: "auto" }}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      <i className="fa-brands fa-google text-primary me-2"></i>
                      Google Docs Integration
                    </h5>
                    <button
                      className="btn-close"
                      onClick={() => setShowGoogleWizard(false)}
                    ></button>
                  </div>
                  <div className="modal-body p-4 text-center">
                    {/* Connection Status Section */}
                    <div className="mb-4 p-4 border rounded bg-light">
                      <div className="auth-icon-badge mb-3">
                        <i className={`fa-brands fa-google fs-1 ${googleStatus.googleConnected ? 'text-success' : 'text-muted'}`}></i>
                      </div>
                      <h5>Google Account Connection</h5>
                      <p className="text-muted small mt-2">
                        {googleStatus.googleConnected 
                          ? 'Your Google Account is connected. Google Docs and Google Drive features are ready.' 
                          : 'Google API credentials are configured in the backend environment. Connect your Google account below to start linking templates.'}
                      </p>
                      <div className="mt-4">
                        {googleStatus.googleConnected ? (
                          <button className="btn btn-danger w-100" onClick={handleDisconnectGoogle}>
                            <i className="fa-solid fa-sign-out-alt me-2"></i> Disconnect Google Account
                          </button>
                        ) : (
                          <button 
                            className="btn btn-success w-100" 
                            onClick={handleConnectGoogle}
                            disabled={!googleStatus.oauthConfigured}
                          >
                            <i className="fa-brands fa-google me-2"></i> Connect Google Account
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary px-4"
                      onClick={() => setShowGoogleWizard(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        </PortalModal>
      )}

      <Footer />
    </div>
  );
};

export default TestMaster;

