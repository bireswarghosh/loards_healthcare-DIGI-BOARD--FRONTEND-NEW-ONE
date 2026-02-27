import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance";


const API_BASE_URL = "https://lords-backend.onrender.com/api/v1";


const OtherCharges = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [admissionData, setAdmissionData] = useState({});
  const [otherCharges, setOtherCharges] = useState([]);
  const [masterCharges, setMasterCharges] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchBy, setSearchBy] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [admissionId, setAdmissionId] = useState(
    location.state?.admissionId || "000436/17-18",
  );
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [newCharge, setNewCharge] = useState({
    OtherChargesId: "",
    Qty: 1,
    Rate: 0,
    Amount: 0,
    EDate: new Date().toISOString().split("T")[0],
    UserId: 1,
    Remarks: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [chargeSearch, setChargeSearch] = useState("");
  const [filteredCharges, setFilteredCharges] = useState([]);


  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);


  const [delId, setDelId] = useState("");


  const [bedName, setBedName] = useState("");


  const [company, setCompany] = useState([]);


  const [selOtherCharges, setSelOtherCharges] = useState({
    Qty: "",
    Rate: "",
    Amount: "",
    Remarks: "",
    Package: "",
  });
  const [companyWiseOCdata, setCompanyWiseOCdata] = useState([]);


  const handleChange = (e, i) => {
    const { name, value } = e.target;


    let data = otherCharges[i];


    data[name] = value;


    setSelOtherCharges({
      Qty: data.Qty,
      Rate: data.Rate,
      Amount: data.Amount,
      Remarks: data.Remarks,
      Package: data.Package,
    });


    setOtherCharges((prev) => [...prev]);
  };


  const handleSave = async (id) => {
    try {
      const res = axiosInstance.put(
        `/admissions/${admissionId}/charges/${id}`,
        selOtherCharges,
      );
      fetchOtherCharges();
      toast.success("Updated successfully");
    } catch (error) {
      console.log("error updating: ", error);
    }
  };


  const fetchCompany = async () => {
    try {
      const res = await axiosInstance.get(`/cashless`);


      res.data.success ? setCompany(res.data.data) : null;
    } catch (error) {
      console.log("error cashless: ", error);
    }
  };


  const fetchBed = async (id) => {
    try {
      console.log("HD");
      const res = await axiosInstance.get(`/bedMaster/${id}`);


      res.data.success ? setBedName(res.data.data.Bed) : setBedName("");
    } catch (error) {
      console.log("error fetching bed by id: ", error);
    }
  };


  useEffect(() => {
    // If coming from AdmissionList, use the passed data
    if (location.state?.selectedAdmission) {
      console.log("adm data: ", location.state.selectedAdmission);
      setAdmissionData(location.state.selectedAdmission);
      setAdmissionId(location.state.selectedAdmission.AdmitionId);
      if (location.state.selectedAdmission.BedId) {
        console.log("babu");
        fetchBed(location.state.selectedAdmission.BedId);
      }
    }


    if (admissionId) {
      if (!location.state?.selectedAdmission) {
        fetchAdmissionData();
      }
      fetchOtherCharges();
    }
    fetchMasterCharges();
    fetchCompany();
  }, [admissionId, location.state]);


  const fetchCompanyWiseOC = async (id) => {
    try {
      const res = await axiosInstance.get(
        `/company-wise-other-charges?cashlessId=${id}`,
      );
      console.log("Company wise oc data: ", res.data.data);
      res.data.success
        ? setCompanyWiseOCdata(res.data.data)
        : setCompanyWiseOCdata([]);
    } catch (error) {
      console.log("error fetching company wise oc: ", error);
    }
  };


  useEffect(() => {
    console.log("cashless id: ", admissionData.CashLessId);
    if (admissionData.CashLessId) {
      fetchCompanyWiseOC(admissionData.CashLessId);
    }
  }, [admissionData.CashLessId]);


  useEffect(() => {
    if (companyWiseOCdata.length != 0 && masterCharges.length != 0) {
      console.log("Company wise other charges data: ", companyWiseOCdata);
      console.log("Master charges data: ", masterCharges);


      const comWOClookUP = {};
      for (let i = 0; i < companyWiseOCdata.length; i++) {
        comWOClookUP[companyWiseOCdata[i].other_charges_id] =
          companyWiseOCdata[i];
      }


      const b = masterCharges;


      for (let i = 0; i < b.length; i++) {
        const id = b[i].OtherChargesId;


        if (comWOClookUP[id]) {
          const fromComWOClookUP = comWOClookUP[id];


          b[i].Rate = Number(fromComWOClookUP.rate);
          b[i].ICU = Number(fromComWOClookUP.icu);
          b[i].CAB = Number(fromComWOClookUP.cab);
          b[i].SUIT = Number(fromComWOClookUP.suit);
        }
      }
console.log("bigb: ",b)
      setMasterCharges(b)
    }
  }, [companyWiseOCdata, masterCharges.length]);


  useEffect(() => {
    const filtered = masterCharges.filter(
      (charge) =>
        charge.OtherCharges.toLowerCase().includes(
          chargeSearch.toLowerCase(),
        ) || charge.OtherChargesId.toString().includes(chargeSearch),
    );
    setFilteredCharges(filtered);
  }, [masterCharges, chargeSearch]);


  const fetchMasterCharges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/otherCharges`);
      if (response.data.success) {
        setMasterCharges(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching master charges:", error);
    }
  };


  const fetchAdmissionData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/admissions/${admissionId}`,
      );
      if (response.data.success) {
        setAdmissionData(response.data.data.admission);
      }
    } catch (error) {
      console.error("Error fetching admission:", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchOtherCharges = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admission-charges/${admissionId}`,
      );
      if (response.data.success) {
        setOtherCharges(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
    }
  };


  const handleFind = async () => {
    if (!searchValue) return;
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/admissions/search/${searchValue}`;


      // Add search type parameter
      const params = new URLSearchParams();
      params.append("searchBy", searchBy);


      const response = await axios.get(`${url}?${params}`);
      if (response.data.success && response.data.data.length > 0) {
        // Sort results based on radio selection
        let sortedResults = [...response.data.data];
        if (searchBy === "orderName") {
          sortedResults.sort((a, b) =>
            a.PatientName.localeCompare(b.PatientName),
          );
        } else if (searchBy === "orderDate") {
          sortedResults.sort(
            (a, b) => new Date(b.AdmitionDate) - new Date(a.AdmitionDate),
          );
        }


        setSearchResults(sortedResults);
        setShowSearchResults(true);
      } else {
        toast.error("No results found");
        // alert("No results found");
      }
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Search failed");
      //   alert("Search failed");
    } finally {
      setLoading(false);
    }
  };


  const selectPatient = async (admission) => {
    setAdmissionId(admission.AdmitionId);
    setAdmissionData(admission);
    setShowSearchResults(false);
    setSearchValue("");


    // Fetch charges for selected patient
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admission-charges/${admission.AdmitionId}`,
      );
      if (response.data.success) {
        setOtherCharges(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching charges for selected patient:", error);
    }
  };


  const selectMasterCharge = (charge) => {
    setSelectedCharge(charge);
    setNewCharge({
      ...newCharge,
      OtherChargesId: charge.OtherChargesId,
      Rate: charge.Rate || 0,
    });
  };


  const toggleChargeSelection = (charge) => {
    const isSelected = selectedCharges.find(
      (c) => c.OtherChargesId === charge.OtherChargesId,
    );
    if (isSelected) {
      setSelectedCharges(
        selectedCharges.filter(
          (c) => c.OtherChargesId !== charge.OtherChargesId,
        ),
      );
    } else {
      setSelectedCharges([...selectedCharges, charge]);
    }
  };


  const selectAllCharges = () => {
    if (selectedCharges.length === filteredCharges.length) {
      setSelectedCharges([]);
    } else {
      setSelectedCharges([...filteredCharges]);
    }
  };


  const addMultipleCharges = async () => {
    try {
      for (const charge of selectedCharges) {
        const chargeData = {
          OtherChargesId: charge.OtherChargesId,
          Rate: charge.Rate || 0,
          Qty: 1,
          Amount: charge.Rate || 0,
          EDate: new Date().toISOString().split("T")[0],
          UserId: 1,
          Remarks: "",
        };
        await axios.post(
          `${API_BASE_URL}/admissions/${admissionId}/charges`,
          chargeData,
        );
      }
      fetchOtherCharges();
      setSelectedCharges([]);
      setShowAddModal(false);
      //   alert(`${selectedCharges.length} charges added successfully!`);
      toast.success(`${selectedCharges.length} charges added successfully!`);
    } catch (error) {
      console.error("Error adding charges:", error);
      toast.error("Error adding charges");
      //   alert("Error adding charges");
    }
  };


  const addNewCharge = async () => {
    try {
      const chargeData = {
        ...newCharge,
        Amount: newCharge.Rate * newCharge.Qty,
      };
      await axios.post(
        `${API_BASE_URL}/admissions/${admissionId}/charges`,
        chargeData,
      );
      fetchOtherCharges();
      setNewCharge({
        OtherChargesId: "",
        Qty: 1,
        Rate: 0,
        Amount: 0,
        EDate: new Date().toISOString().split("T")[0],
        UserId: 1,
        Remarks: "",
      });
      setShowAddModal(false);
      setSelectedCharge(null);
      alert("Charge added successfully!");
    } catch (error) {
      console.error("Error adding charge:", error);
      alert("Error adding charge");
    }
  };


  //   const deleteCharge = async (chargeId) => {
  //     // if (!window.confirm("Are you sure you want to delete this charge?")) return;


  //     setShowConfirm(true);
  //     if (confirmDelete) {
  //       deleteChargeById(chargeId);
  //       setConfirmDelete(false);
  //       setShowConfirm(false);
  //     }
  //   };


  const deleteChargeById = async (chargeId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/admissions/${admissionId}/charges/${chargeId}`,
      );
      fetchOtherCharges();
      setShowConfirm(false);
      toast.success("Charge deleted successfully");
      setDelId("");
      //   alert("Charge deleted successfully!");
    } catch (error) {
      console.error("Error deleting charge:", error);
      //   alert("Error deleting charge");
      toast.error("Error deleting charge");
    }
  };


  // const calculateTotals = () => {
  //   const total = otherCharges.reduce(
  //     (sum, charge) => sum + (charge.Amount || 0),
  //     0,
  //   );
  //   return { total, sgst: 0, cgst: 0 };
  // };
  const calculateTotals = () => {
    const total = otherCharges.reduce(
      (sum, charge) => sum + (Number(charge.Rate) * Number(charge.Qty)  || 0),
      0,
    );
    return { total, sgst: 0, cgst: 0 };
  };
  

  // {Number(charge.Rate) * Number(charge.Qty)}

  const totals = calculateTotals();


  return (
    <>
      <div className="container-fluid py-4">
        <div className="card shadow-lg rounded-4 border-0 ">
          <div className="text-end">
            <button
              className="btn btn-primary"
              onClick={() => {
                navigate("/othercharges");
              }}
            >
              <i className="fa-solid fa-arrow-left"></i> Back
            </button>
          </div>
          <div className="card-body">
            {/* Search Filters */}
            <div className="row g-3 mb-4 align-items-center">
              <div className="col-md-2">
                <label>Current Date</label>
                <input
                  type="date"
                  className="form-control"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="col-md-3">
                <label>Patient's Name</label>
                {/* <input
                  className="form-control"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    searchBy === "name"
                      ? "Enter patient name"
                      : "Enter admission no"
                  }
                /> */}
                <input
                  className="form-control"
                  value={admissionData?.PatientName}
                  // onChange={(e) => setSearchValue(e.target.value)}
                  // placeholder={
                  //   searchBy === "name"
                  //     ? "Enter patient name"
                  //     : "Enter admission no"
                  // }
                />
              </div>
              <div className="col-md-2">
                <label>Admission No</label>
                <input
                  className="form-control"
                  value={admissionData?.AdmitionId || ""}
                  readOnly
                />
              </div>
              <div className="col-md-2">
                <label>Bed No</label>
                <input
                  className="form-control"
                  value={bedName || ""}
                  readOnly
                />
              </div>
              {/* <div className="col-md-3">
                <button
                  className="btn btn-primary mt-4"
                  onClick={handleFind}
                  disabled={loading}
                >
                  {loading ? "Finding..." : "Find"}
                </button>
              </div> */}
            </div>


            {/* Search Options */}
            {/* <div className="row mb-3">
              <div className="col-md-12 d-flex gap-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="searchBy"
                    value="name"
                    checked={searchBy === "name"}
                    onChange={(e) => setSearchBy(e.target.value)}
                  />
                  <label className="form-check-label">Find By Name</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="searchBy"
                    value="no"
                    checked={searchBy === "no"}
                    onChange={(e) => setSearchBy(e.target.value)}
                  />
                  <label className="form-check-label">Find By No</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="searchBy"
                    value="orderName"
                    checked={searchBy === "orderName"}
                    onChange={(e) => setSearchBy(e.target.value)}
                  />
                  <label className="form-check-label">Order By Name</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="searchBy"
                    value="orderDate"
                    checked={searchBy === "orderDate"}
                    onChange={(e) => setSearchBy(e.target.value)}
                  />
                  <label className="form-check-label">Order By Date</label>
                </div>
              </div>
            </div> */}


            {/* Search Results Modal */}
            {showSearchResults && (
              <div className="border rounded p-3 bg-warning-subtle mb-4">
                <h6 className="fw-bold text-warning mb-3">
                  Search Results - Click to Select
                </h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Admission ID</th>
                        <th>Patient Name</th>
                        <th>Phone</th>
                        <th>Age</th>
                        <th>Sex</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((admission, i) => (
                        <tr
                          key={i}
                          style={{ cursor: "pointer" }}
                          onClick={() => selectPatient(admission)}
                        >
                          <td>{admission.AdmitionId}</td>
                          <td>{admission.PatientName}</td>
                          <td>{admission.PhoneNo}</td>
                          <td>{admission.Age}</td>
                          <td>{admission.Sex}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectPatient(admission);
                              }}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowSearchResults(false)}
                >
                  Close
                </button>
              </div>
            )}


            {/* Patient Info */}
            {admissionData && (
              <div className="border rounded p-3  mb-4">
                <h6 className="fw-bold text-primary mb-3">Patient Detail</h6>


                <div className="row g-5 mb-3">
                  <div className="col-md-6">
                    <label>Address</label>
                    <textarea
                      className="form-control"
                      value={`${admissionData.Add1 || ""}\n${admissionData.Add2 || ""}\n${admissionData.Add3 || ""}`}
                      readOnly
                    />
                  </div>


                  <div className="col-md-2">
                    <label>Age</label>
                    <input
                      className="form-control"
                      value={admissionData.Age || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-md-2">
                    <label>Sex</label>
                    <input
                      className="form-control"
                      value={admissionData.Sex || ""}
                      readOnly
                    />
                  </div>
                </div>


                <div className="row g-5 mb-3">
                  <div className="col-md-4">
                    <label>Phone</label>
                    <input
                      className="form-control"
                      value={admissionData.PhoneNo || ""}
                      readOnly
                    />
                  </div>


                  <div className="col-md-3">
                    <label>Marital Status[U/M]</label>
                    <input
                      className="form-control"
                      value={admissionData.MStatus || ""}
                      readOnly
                    />
                  </div>


                  <div className="col-md-3">
                    <label>Admission Date</label>
                    <input
                      type="text"
                      className="form-control"
                      value={
                        admissionData.AdmitionDate?.split("T")[0]
                          .split("-")
                          .reverse()
                          .join("/") || ""
                      }
                      readOnly
                    />
                  </div>
                </div>


                <div className="row g-5 mb-3">
                  <div className="col-md-5">
                    <label>Remarks</label>
                    <input
                      className="form-control"
                      value={admissionData.Remarks || ""}
                      readOnly
                    />
                  </div>


                  <div className="col-md-2">
                    <label>Company</label>
                    {/* <input
                      className="form-control"
                      value={admissionData.CompanyId || ""}
                      readOnly
                    /> */}
                    <input
                      className="form-control"
                      value={
                        company.find(
                          (item) => item.CashlessId == admissionData.CompanyId,
                        )?.Cashless || ""
                      }
                      readOnly
                    />
                  </div>
                  <div className="col-md-2">
                    <label>Cash Less</label>
                    {/* <input
                      className="form-control"
                      value={admissionData.CashLessId || ""}
                      readOnly
                    /> */}
                    <input
                      className="form-control"
                      value={
                        company.find(
                          (item) => item.CashlessId == admissionData.CashLessId,
                        )?.Cashless || ""
                      }
                      readOnly
                    />
                  </div>


                  <div className="col-md-2">
                    <label>
                      Package (Need to ask Lords what is the purpose of it)
                    </label>
                    <input
                      className="form-control"
                      value={admissionData.Status || ""}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}


            {/* Add Button */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-success mb-0">Available Charges</h6>
              <div>
                <span className="badge bg-success me-2">
                  {masterCharges.length} charges
                </span>
                <button
                  className="btn btn-success"
                  onClick={() => setShowAddModal(true)}
                >
                  Add
                </button>
              </div>
            </div>


            {/* Existing Patient Charges */}
            <div className="border rounded p-3  mb-4">
              <h6 className="fw-bold text-warning mb-3">
                Existing Patient Charges
              </h6>
              <div
                className="table-responsive"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  overflowX: "auto",
                }}
              >
                <table className="table table-sm table-hover">
                  <thead className=" ">
                    <tr>
                      <th>Action</th>
                      <th>Charge Name</th>
                      <th>Rate(₹)</th>
                      <th>Unit</th>
                      <th>Qty</th>
                      <th>Amount</th>
                      <th>Remarks</th>
                      <th>Package</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherCharges.length > 0 ? (
                      otherCharges.map((charge, i) => {
                        const masterCharge = masterCharges.find(
                          (mc) => mc.OtherChargesId === charge.OtherChargesId,
                        );
                        {
                          console.log("hi: ", masterCharge);
                        }
                        return (
                          <tr key={i}>
                            <td className="d-flex">
                              <button
                                className="btn btn-sm btn-outline-info me-1"
                                onClick={() => {
                                  handleSave(charge.Id);
                                }}
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  setShowConfirm(true);
                                  setDelId(charge.Id);
                                }}
                              >
                                <i className="fa-solid fa-trash"></i>{" "}
                              </button>
                            </td>
                            <td>
                              {masterCharge?.OtherCharges ||
                                `Charge ID: ${charge.OtherChargesId}`}
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={charge.Rate}
                                name="Rate"
                                onChange={(e) => {
                                  handleChange(e, i);
                                }}
                                // placeholder={charge.Rate}
                              />
                            </td>
                            <td>{masterCharge?.Unit || "-"}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={charge.Qty}
                                name="Qty"
                                onChange={(e) => {
                                  handleChange(e, i);
                                }}
                              />
                            </td>
                            <td>₹{Number(charge.Rate) * Number(charge.Qty)}</td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={charge.Remarks}
                                name="Remarks"
                                onChange={(e) => {
                                  handleChange(e, i);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={charge.Package}
                                name="Package"
                                onChange={(e) => {
                                  handleChange(e, i);
                                }}
                              />
                            </td>
                            <td>{charge.EDate?.split("T")[0]}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-muted text-center">
                          No charges found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>


            {/* Totals */}
            <div className="row g-3 mb-4">
              <div className="col-md-3 ms-auto">
                <label className="fw-bold">SGST Total</label>
                <input
                  className="form-control"
                  value={totals.sgst.toFixed(2)}
                  readOnly
                />
              </div>
              <div className="col-md-3">
                <label className="fw-bold">CGST Total</label>
                <input
                  className="form-control"
                  value={totals.cgst.toFixed(2)}
                  readOnly
                />
              </div>
              <div className="col-md-3">
                <label className="fw-bold">Total Amt</label>
                <input
                  className="form-control text-danger fw-bold"
                  value={totals.total.toFixed(2)}
                  readOnly
                />
              </div>
            </div>


            {/* Action Buttons */}
            {/* <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={fetchOtherCharges}>
                Refresh
              </button>
              <button
                className="btn btn-success"
                onClick={() => window.print()}
              >
                Print
              </button>
            </div> */}


            {/* Add Charge Modal */}
            <Modal
              show={showAddModal}
              onHide={() => setShowAddModal(false)}
              size="xl"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Available Charges</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {/* Search */}
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search charges by name or ID..."
                    value={chargeSearch}
                    onChange={(e) => setChargeSearch(e.target.value)}
                  />
                </div>


                {/* Select All */}
                <div className="mb-3">
                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={
                        selectedCharges.length === filteredCharges.length &&
                        filteredCharges.length > 0
                      }
                      onChange={selectAllCharges}
                    />
                    Select All ({filteredCharges.length} charges)
                  </label>
                </div>


                {/* Selected Charges Display */}
                {selectedCharges.length > 0 && (
                  <div className=" mb-3">
                    <h6 className="fw-bold mb-2">
                      Selected Charges ({selectedCharges.length}):
                    </h6>
                    <div className="row">
                      {selectedCharges.map((charge, i) => (
                        <div key={i} className="col-md-6 mb-1">
                          <small>
                            <span className="badge bg-primary me-1">
                              {charge.OtherChargesId}
                            </span>
                            {charge.OtherCharges} - ₹{charge.Rate}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-sm table-hover">
                    <thead className="">
                      <tr>
                        <th>Select</th>
                        <th>ID</th>
                        <th>Charge Name</th>
                        <th>Rate</th>
                        <th>Unit</th>
                        <th>Single Add</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCharges.map((charge, i) => {
                        const isSelected = selectedCharges.find(
                          (c) => c.OtherChargesId === charge.OtherChargesId,
                        );
                        return (
                          <tr key={i}>
                            <td>
                              <input
                                type="checkbox"
                                checked={!!isSelected}
                                onChange={() => toggleChargeSelection(charge)}
                              />
                            </td>
                            <td>{charge.OtherChargesId}</td>
                            <td>{charge.OtherCharges}</td>
                            <td>₹{charge.Rate}</td>
                            <td>{charge.Unit}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => selectMasterCharge(charge)}
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>


                {selectedCharge && (
                  <div className="mt-4 border-top pt-3">
                    <h6>Add Charge: {selectedCharge.OtherCharges}</h6>
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label>Rate</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newCharge.Rate}
                          onChange={(e) =>
                            setNewCharge({
                              ...newCharge,
                              Rate: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <label>Quantity</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newCharge.Qty}
                          onChange={(e) =>
                            setNewCharge({
                              ...newCharge,
                              Qty: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <label>Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={newCharge.EDate}
                          onChange={(e) =>
                            setNewCharge({
                              ...newCharge,
                              EDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <label>Amount</label>
                        <input
                          className="form-control"
                          value={`₹${(newCharge.Rate * newCharge.Qty).toFixed(
                            2,
                          )}`}
                          readOnly
                        />
                      </div>
                      <div className="col-12">
                        <label>Remarks</label>
                        <input
                          className="form-control"
                          value={newCharge.Remarks}
                          onChange={(e) =>
                            setNewCharge({
                              ...newCharge,
                              Remarks: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Close
                </Button>
                {selectedCharges.length > 0 && (
                  <Button variant="warning" onClick={addMultipleCharges}>
                    Add {selectedCharges.length} Selected
                  </Button>
                )}
                {selectedCharge && (
                  <Button variant="success" onClick={addNewCharge}>
                    Add Single Charge
                  </Button>
                )}
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>


      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div
          className="modal-backdrop fade show"
          style={{ zIndex: 99999 }}
        ></div>
      )}
      {showConfirm && (
        <div
          className="modal d-block"
          style={{ zIndex: 100000, background: "rgba(0,0,0,0.2)" }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-light fa-triangle-exclamation me-2"></i>
                  Confirm Delete
                </h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowConfirm(false);
                    deleteChargeById(delId);
                  }}
                ></button>
              </div>


              <div className="modal-body text-center">
                <p className="fs-6 mb-1">
                  Are you sure you want to delete this?
                </p>
                <p className="text-muted">This cannot be undone.</p>
              </div>


              <div className="modal-footer d-flex justify-content-center gap-3">
                <button
                  className="btn btn-secondary px-4"
                  onClick={() => {
                    setShowConfirm(false);
                  }}
                >
                  Cancel
                </button>


                <button
                  className="btn btn-danger px-4"
                  onClick={() => {
                    deleteChargeById(delId);
                  }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default OtherCharges;



