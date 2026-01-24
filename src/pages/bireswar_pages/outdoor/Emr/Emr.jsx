import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosInstance";
import { toast } from "react-toastify";

const Emr = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("pastHistory");

  // Search and Pagination State
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    registrationId: "",
    patientName: "",
    doctorId: "",
    fromDate: "",
    toDate: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // EMR State
  const [pastHistoryRows, setPastHistoryRows] = useState([
    { id: 1, value: "" },
  ]);
  const [diagnosisRows, setDiagnosisRows] = useState([{ id: 1, value: "" }]);
  const [investigationRows, setInvestigationRows] = useState([
    { id: 1, value: "" },
  ]);
  const [complaintRows, setComplaintRows] = useState([{ id: 1, value: "" }]);
  const [adviceRows, setAdviceRows] = useState([{ id: 1, value: "" }]);
  const [medicineRows, setMedicineRows] = useState([
    { id: 1, medicine: "", dose: "", days: "", unit: "" },
  ]);

  const [pastHistoryMap, setPastHistoryMap] = useState([]);

  const [showDropDown, setShowDropDown] = useState(true);

  useEffect(() => {
    loadPatients();
    fetchPastHistory();
  }, []);

  const fetchPastHistory = async () => {
    try {
      const res = await axiosInstance.get("/past-histories");
      console.log(res.data.data);
      res.data.success
        ? setPastHistoryMap(res.data.data)
        : setPastHistoryMap([]);
    } catch (error) {
      console.log("error fetching past history: ", error);
    }
  };

  const loadPatients = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...searchFilters,
      });

      const response = await axiosInstance.get(`/emr/patients?${params}`);
      setPatients(response.data.data || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadPatients(1);
  };

  const handlePageChange = (page) => {
    loadPatients(page);
  };

  const handleFilterChange = (field, value) => {
    setSearchFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewEmr = async (patient) => {
    const formattedPatient = {
      ...patient,
      PVisitId: patient.PVisitId,
      patientregistration: {
        PatientName: patient.PatientName,
        Age: patient.Age,
        Sex: patient.Sex,
        PhoneNo: patient.PhoneNo,
      },
      doctormaster: {
        DoctorName: patient.DoctorName,
      },
      department: {
        Department: patient.Department,
      },
    };

    setSelectedPatient(formattedPatient);
    setShowDetail(true);
    await loadEmrData(formattedPatient);
  };

  const loadEmrData = async (patient) => {
    if (!patient?.RegistrationId) return;

    try {
      const response = await axiosInstance.get(
        `/emr/${patient.RegistrationId}`,
      );
      const emrData = response.data.data;

      setPastHistoryRows([{ id: 1, value: "", isExisting: false }]);
      setDiagnosisRows([{ id: 1, value: "", isExisting: false }]);
      setInvestigationRows([{ id: 1, value: "", isExisting: false }]);
      setComplaintRows([{ id: 1, value: "", isExisting: false }]);
      setAdviceRows([{ id: 1, value: "", isExisting: false }]);
      setMedicineRows([
        {
          id: 1,
          medicine: "",
          dose: "",
          days: "",
          unit: "",
          isExisting: false,
        },
      ]);

      if (emrData.pastHistory?.length > 0) {
        setPastHistoryRows(
          emrData.pastHistory.map((item, index) => ({
            id: index + 1,
            value: item.pasthistory || "",
            slno: item.SlNo,
            isExisting: true,
          })),
        );
      }

      if (emrData.diagnosis?.length > 0) {
        setDiagnosisRows(
          emrData.diagnosis.map((item, index) => ({
            id: index + 1,
            value: item.diagonisis || "",
            slno: item.SlNo,
            isExisting: true,
          })),
        );
      }

      if (emrData.investigations?.length > 0) {
        setInvestigationRows(
          emrData.investigations.map((item, index) => ({
            id: index + 1,
            value: item.Invest || "",
            slno: item.SlNo,
            isExisting: true,
          })),
        );
      }

      if (emrData.complaints?.length > 0) {
        setComplaintRows(
          emrData.complaints.map((item, index) => ({
            id: index + 1,
            value: item.chief || "",
            slno: item.SlNo,
            isExisting: true,
          })),
        );
      }

      if (emrData.medicine?.length > 0) {
        setAdviceRows(
          emrData.medicine.map((item, index) => ({
            id: index + 1,
            value: item.Medicine || "",
            slno: item.SlNo,
            isExisting: true,
          })),
        );
      }

      if (emrData.adviceMedicine?.length > 0) {
        setMedicineRows(
          emrData.adviceMedicine.map((item, index) => ({
            id: index + 1,
            medicine: item.advmed || "",
            dose: item.dose || "",
            days: item.nodays || "",
            unit: item.dunit || "",
            slno: item.SlNo,
            isExisting: true,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading EMR data:", error);
    }
  };

  const saveEmrData = async () => {
    if (!selectedPatient) {
      alert("No patient selected!");
      return;
    }

    try {
      const newPastHistory = pastHistoryRows.filter(
        (row) => row.value.trim() && !row.isExisting,
      );
      const newDiagnosis = diagnosisRows.filter(
        (row) => row.value.trim() && !row.isExisting,
      );
      const newInvestigations = investigationRows.filter(
        (row) => row.value.trim() && !row.isExisting,
      );
      const newComplaints = complaintRows.filter(
        (row) => row.value.trim() && !row.isExisting,
      );
      const newAdvice = adviceRows.filter(
        (row) => row.value.trim() && !row.isExisting,
      );
      const newMedicine = medicineRows.filter(
        (row) => row.medicine.trim() && !row.isExisting,
      );

      const totalNewRecords =
        newPastHistory.length +
        newDiagnosis.length +
        newInvestigations.length +
        newComplaints.length +
        newAdvice.length +
        newMedicine.length;

      if (totalNewRecords === 0) {
        toast.error("No new data to save!");
        // alert("No new data to save!");
        return;
      }

      // const confirmSave = window.confirm(
      //   `Save ${totalNewRecords} new EMR records for patient ${selectedPatient.patientregistration?.PatientName}?`
      // );
      // if (!confirmSave) return;

      // const savePromises = [];

      console.log("id: ", selectedPatient.RegistrationId);

      const finalPastHistory = newPastHistory.map((item) => ({
        pasthistory: item.value,
      }));
      const finalDiagnosis = newDiagnosis.map((item) => ({
        diagonisis: item.value,
      }));
      const finalInvestigations = newInvestigations.map((item) => ({
        Invest: item.value,
      }));
      const finalComplaints = newComplaints.map((item) => ({
        chief: item.value,
      }));
      const finalAdvice = newAdvice.map((item) => ({ Medicine: item.value }));
      const finalMedicine = newMedicine.map((item) => ({
        advmed: item.medicine,
        dose: item.dose,
        nodays: item.days,
        dunit: item.unit,
      }));

      // console.log("past history: ", finalPastHistory);
      // console.log("diagnosis: ", finalDiagnosis);
      // console.log("investigation: ", finalInvestigations);
      // console.log("complaints: ", finalComplaints);
      // console.log("advice: ", finalAdvice);
      // console.log("medicine: ", finalMedicine);

      
      
       await axiosInstance.post("/emr/bulk", {
         RegistrationId: selectedPatient.RegistrationId,
         VisitId: "",
         admissionid: null,
         pastHistory: finalPastHistory,
         diagnosis: finalDiagnosis,
         medicine:finalAdvice,
         complaints: finalComplaints,
         investigations: finalInvestigations,
         adviceMedicine: finalMedicine,
       });

      
      // newPastHistory.forEach((row) => {
      //   savePromises.push(
      //     axiosInstance.post(`/emr/past-history`, {
      //       RegistrationId: selectedPatient.RegistrationId,
      //       VisitId: selectedPatient.PVisitId,
      //       pasthistory: row.value,
      //       admissionid: null,
      //     })
      //   );
      // });

      // newDiagnosis.forEach((row) => {
      //   savePromises.push(
      //     axiosInstance.post(`/emr/diagnosis`, {
      //       RegistrationId: selectedPatient.RegistrationId,
      //       VisitId: selectedPatient.PVisitId,
      //       diagonisis: row.value,
      //       admissionid: null,
      //     })
      //   );
      // });

      // newInvestigations.forEach((row) => {
      //   savePromises.push(
      //     axiosInstance.post(`/emr/investigations`, {
      //       RegistrationId: selectedPatient.RegistrationId,
      //       VisitId: selectedPatient.PVisitId,
      //       Invest: row.value,
      //       admissionid: null,
      //     })
      //   );
      // });

      // newComplaints.forEach((row) => {
      //   savePromises.push(
      //     axiosInstance.post(`/emr/complaints`, {
      //       RegistrationId: selectedPatient.RegistrationId,
      //       VisitId: selectedPatient.PVisitId,
      //       chief: row.value,
      //       admissionid: null,
      //     })
      //   );
      // });

      // newAdvice.forEach((row) => {
      //   savePromises.push(
      //     axiosInstance.post(`/emr/medicine`, {
      //       RegistrationId: selectedPatient.RegistrationId,
      //       VisitId: selectedPatient.PVisitId,
      //       Medicine: row.value,
      //       admissionid: null,
      //     })
      //   );
      // });

      // newMedicine.forEach((row) => {
      //   savePromises.push(
      //     axiosInstance.post(`/emr/advice-medicine`, {
      //       RegistrationId: selectedPatient.RegistrationId,
      //       VisitId: selectedPatient.PVisitId,
      //       advmed: row.medicine,
      //       dose: row.dose,
      //       nodays: row.days,
      //       dunit: row.unit,
      //       admissionid: null,
      //     })
      //   );
      // });

      // await Promise.all(savePromises);

      // alert(`✅ Successfully saved ${totalNewRecords} EMR records!`);
      await loadEmrData(selectedPatient);
      toast.success(`Successfully saved ${totalNewRecords} EMR records!`);
    } catch (error) {
      console.error("Error saving EMR data:", error);
      alert(
        "❌ Error saving EMR data: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const addRow = (rows, setRows) => {
    const newId =
      rows.length > 0 ? Math.max(...rows.map((row) => row.id)) + 1 : 1;
    if (rows[0] && rows[0].medicine !== undefined) {
      setRows([
        ...rows,
        {
          id: newId,
          medicine: "",
          dose: "",
          days: "",
          unit: "",
          isExisting: false,
        },
      ]);
    } else {
      setRows([...rows, { id: newId, value: "", isExisting: false }]);
    }
  };

  const deleteRow = async (row, rows, setRows) => {
    if (row.isExisting && row.slno) {
      try {
        let endpoint = "";
        if (rows === pastHistoryRows) endpoint = "past-history";
        else if (rows === diagnosisRows) endpoint = "diagnosis";
        else if (rows === investigationRows) endpoint = "investigations";
        else if (rows === complaintRows) endpoint = "complaints";
        else if (rows === adviceRows) endpoint = "medicine";
        else if (rows === medicineRows) endpoint = "advice-medicine";

        await axiosInstance.delete(`/emr/${endpoint}/${row.slno}`);
        alert("Record deleted successfully!");
      } catch (error) {
        console.error("Error deleting record:", error);
        alert("Error deleting record");
        return;
      }
    }

    if (rows.length > 1) {
      setRows(rows.filter((r) => r.id !== row.id));
    } else if (rows.length === 1 && !row.isExisting) {
      // Clear the last empty row instead of deleting if it's not saved
      if (rows === medicineRows) {
        setRows([
          {
            id: 1,
            medicine: "",
            dose: "",
            days: "",
            unit: "",
            isExisting: false,
          },
        ]);
      } else {
        setRows([{ id: 1, value: "", isExisting: false }]);
      }
    }
  };

  const updateRow = async (row, field, value, rows) => {
    if (row.isExisting && row.slno) {
      try {
        let endpoint = "";
        let data = {};

        if (rows === pastHistoryRows) {
          endpoint = "past-history";
          data = { pasthistory: value };
        } else if (rows === diagnosisRows) {
          endpoint = "diagnosis";
          data = { diagonisis: value };
        } else if (rows === investigationRows) {
          endpoint = "investigations";
          data = { Invest: value };
        } else if (rows === complaintRows) {
          endpoint = "complaints";
          data = { chief: value };
        } else if (rows === adviceRows) {
          endpoint = "medicine";
          data = { Medicine: value };
        } else if (rows === medicineRows) {
          endpoint = "advice-medicine";
          const currentRow = rows.find((r) => r.id === row.id);
          data = {
            advmed: field === "medicine" ? value : currentRow.medicine,
            dose: field === "dose" ? value : currentRow.dose,
            nodays: field === "days" ? value : currentRow.days,
            dunit: field === "unit" ? value : currentRow.unit,
          };
        }

        await axiosInstance.put(`/emr/${endpoint}/${row.slno}`, data);
      } catch (error) {
        console.error("Error updating record:", error);
      }
    }
  };

  const handleRowChange = (id, field, value, rows, setRows) => {
    const row = rows.find((r) => r.id === id);
    const updatedRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row,
    );
    setRows(updatedRows);
    if (row && row.isExisting) {
      updateRow(row, field, value, rows);
    }
  };

  // Generic render function for single-value tables
  const renderSingleValueTable = (title, rows, setRows, placeholder) => (
    <div className="card shadow-sm border-0">
      <div className="card-header  d-flex justify-content-between align-items-center py-2">
        <h6 className="mb-0 text-primary fw-bold">{title}</h6>
        <button
          className="btn btn-sm btn-success"
          onClick={() => {
            addRow(rows, setRows);
            setShowDropDown(true);
          }}
        >
          <i className="bi bi-plus"></i> Add Row
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-bordered table-striped mb-0 table-hover">
            <thead className="">
              <tr>
                <th style={{ width: "50px" }} className="text-center">
                  #
                </th>
                <th>Description</th>
                <th style={{ width: "80px" }} className="text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="text-center align-middle">{index + 1}</td>
                  <td>
                    {placeholder !== "Enter past history details..." ? (
                      <input
                        type="text"
                        className="form-control form-control-sm border-0 bg-transparent"
                        value={row.value}
                        placeholder={placeholder}
                        onChange={(e) =>
                          handleRowChange(
                            row.id,
                            "value",
                            e.target.value,
                            rows,
                            setRows,
                          )
                        }
                      />
                    ) : row.value ? (
                      <input
                        type="text"
                        className="form-control form-control-sm border-0 bg-transparent"
                        value={row.value}
                        placeholder={placeholder}
                        onChange={(e) => {
                          if (e.target.value === "") {
                            handleRowChange(
                              row.id,
                              "value",
                              " ",
                              rows,
                              setRows,
                            );
                            return;
                          }
                          handleRowChange(
                            row.id,
                            "value",
                            e.target.value,
                            rows,
                            setRows,
                          );
                        }}
                      />
                    ) : (
                      <>
                        {/* {console.log("hi",pastHistoryMap)} */}
                        {showDropDown && (
                          <select
                            className="form-control form-control-sm border-0 bg-transparent"
                            value={row.value}
                            onChange={(e) => {
                              // console.log("val: ",e.target.value)
                              if (
                                e.target.value === "Write your own past history"
                              ) {
                                setShowDropDown(false);
                                handleRowChange(
                                  row.id,
                                  "value",
                                  " ",
                                  rows,
                                  setRows,
                                );
                                return;
                              }
                              handleRowChange(
                                row.id,
                                "value",
                                e.target.value,
                                rows,
                                setRows,
                              );
                            }}
                          >
                            <option value="">---</option>
                            {pastHistoryMap.map((hist, i) => (
                              <option key={i} value={hist.pasthistory}>
                                {hist.pasthistory}
                              </option>
                            ))}
                            <option value="Write your own past history">
                              Write your own past history
                            </option>
                          </select>
                        )}
                      </>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-danger border-0"
                      onClick={() => deleteRow(row, rows, setRows)}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "pastHistory":
        return renderSingleValueTable(
          "Past History",
          pastHistoryRows,
          setPastHistoryRows,
          "Enter past history details...",
        );
      case "complaints":
        return renderSingleValueTable(
          "Chief Complaints",
          complaintRows,
          setComplaintRows,
          "Enter complaint details...",
        );
      case "diagnosis":
        return renderSingleValueTable(
          "Diagnosis",
          diagnosisRows,
          setDiagnosisRows,
          "Enter diagnosis...",
        );
      case "investigations":
        return renderSingleValueTable(
          "Investigations",
          investigationRows,
          setInvestigationRows,
          "Enter investigation...",
        );
      case "advice":
        return renderSingleValueTable(
          "Medical Advice",
          adviceRows,
          setAdviceRows,
          "Enter advice...",
        );
      case "medicine":
        return (
          <div className="card shadow-sm border-0">
            <div className="card-header  d-flex justify-content-between align-items-center py-2">
              <h6 className="mb-0 text-primary fw-bold">
                Prescription Medicine
              </h6>
              <button
                className="btn btn-sm btn-success"
                onClick={() => addRow(medicineRows, setMedicineRows)}
              >
                + Add Medicine
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered table-striped mb-0 align-middle">
                  <thead className="">
                    <tr>
                      <th className="text-center">#</th>
                      <th>Medicine Name</th>
                      <th>Dose</th>
                      <th>Days</th>
                      <th>Unit</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {console.log("Medicine rows: ", medicineRows)}
                    {medicineRows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="text-center">{index + 1}</td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={row.medicine}
                            placeholder="Medicine Name"
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "medicine",
                                e.target.value,
                                medicineRows,
                                setMedicineRows,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={row.dose}
                            placeholder="Dosage"
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "dose",
                                e.target.value,
                                medicineRows,
                                setMedicineRows,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={row.days}
                            placeholder="Days"
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "days",
                                e.target.value,
                                medicineRows,
                                setMedicineRows,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={row.unit}
                            placeholder="Unit"
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "unit",
                                e.target.value,
                                medicineRows,
                                setMedicineRows,
                              )
                            }
                          />
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-danger border-0"
                            onClick={() =>
                              deleteRow(row, medicineRows, setMedicineRows)
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (showDetail && selectedPatient) {
    return (
      <div className="container-fluid p-3">
        <div className="card shadow">
          {/* Header */}
          <div className="card-header  py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="mb-0  fw-bold">
                <i className="bi bi-file-medical me-2"></i>Electronic Medical
                Records
              </h5>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowDetail(false)}
                >
                  <i className="bi bi-arrow-left"></i> Back to List
                </button>
                <button className="btn btn-primary btn-sm active">
                  Detail View
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={saveEmrData}
                >
                  <i className="bi bi-save me-1"></i> Save Documents
                </button>
              </div>
            </div>
          </div>

          <div className="card-body ">
            {/* Patient Info */}
            <div className="card mb-4 border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted text-uppercase small fw-bold mb-3 border-bottom pb-2">
                  Patient Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-3 ">
                    <div className="mb-2">
                      <label className="form-label small text-muted mb-1">
                        Registration No
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm fw-bold"
                        value={selectedPatient.RegistrationId || ""}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="form-label small text-muted mb-1">
                        Patient Name
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm fw-bold"
                        value={
                          selectedPatient.patientregistration?.PatientName || ""
                        }
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="col-md-3 ">
                    <div className="mb-2">
                      <label className="form-label small text-muted mb-1">
                        Date
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={new Date(
                          selectedPatient.PVisitDate,
                        ).toLocaleDateString()}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="form-label small text-muted mb-1">
                        Age
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={selectedPatient.patientregistration?.Age || ""}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-2">
                      <label className="form-label small text-muted mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={
                          selectedPatient.patientregistration?.PhoneNo || ""
                        }
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="form-label small text-muted mb-1">
                        Weight
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={selectedPatient.Weight || "0.000"}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="col-md-3 ">
                    <div className="mb-2">
                      <label className="form-label small text-muted mb-1">
                        Time
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={selectedPatient.vTime || ""}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="form-label small text-muted mb-1">
                        Sex
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={selectedPatient.patientregistration?.Sex || ""}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}

            <ul
              className="nav nav-pills nav-fill gap-2 mb-3 p-0 border-0"
              role="tablist"
            >
              {[
                { key: "pastHistory", label: "Past History" },
                { key: "complaints", label: "Chief Complaints" },
                { key: "diagnosis", label: "Diagnosis" },
                { key: "investigations", label: "Investigations" },
                { key: "advice", label: "Advice" },
                { key: "medicine", label: "Medicine" },
              ].map((tab) => (
                <li className="nav-item" key={tab.key}>
                  <button
                    className={`nav-link 
                    ${
                      activeTab === tab.key
                        ? "active fw-semibold text-white bg-primary"
                        : "text-muted"
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                    style={{ borderRadius: "0.5rem" }}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Tab Content */}
            <div
              className="tab-content  p-3 rounded-bottom shadow-sm"
              style={{ minHeight: "400px" }}
            >
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3">
      <div className="card shadow-sm">
        <div className="card-header ">
          <h5 className="card-title mb-0">Patient EMR Records</h5>
        </div>

        {/* Search Filters */}
        <div className="card-body border-bottom ">
          <div className="row g-3 align-items-end">
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-bold">General Search</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by ID, Name, Phone..."
                value={searchFilters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <label className="form-label small fw-bold">
                Registration ID
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Reg ID"
                value={searchFilters.registrationId}
                onChange={(e) =>
                  handleFilterChange("registrationId", e.target.value)
                }
              />
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <label className="form-label small fw-bold">Patient Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Name"
                value={searchFilters.patientName}
                onChange={(e) =>
                  handleFilterChange("patientName", e.target.value)
                }
              />
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <label className="form-label small fw-bold">From Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={searchFilters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              />
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <label className="form-label small fw-bold">To Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={searchFilters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
              />
            </div>
            <div className="col-lg-1 col-md-2 col-sm-12">
              <div className="d-flex gap-1">
                <button
                  className="btn btn-primary btn-sm w-100"
                  onClick={handleSearch}
                  title="Search"
                >
                  Search
                </button>
                <button
                  className="btn btn-secondary btn-sm w-100"
                  title="Reset"
                  onClick={() => {
                    setSearchFilters({
                      search: "",
                      registrationId: "",
                      patientName: "",
                      doctorId: "",
                      fromDate: "",
                      toDate: "",
                    });
                    loadPatients(1);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0 align-middle">
                  <thead className="">
                    <tr>
                      <th>Registration ID</th>
                      <th>Patient Name</th>
                      <th>Visit Date</th>
                      <th>Doctor</th>
                      <th>Department</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length > 0 ? (
                      patients.map((patient, index) => (
                        <tr key={index}>
                          <td>
                            <span className="">{patient.RegistrationId}</span>
                          </td>
                          <td className="fw-bold">
                            {patient.PatientName || "N/A"}
                          </td>
                          <td>
                            {new Date(patient.PVisitDate).toLocaleDateString()}
                          </td>
                          <td>{patient.DoctorName || "N/A"}</td>
                          <td>{patient.Department || "N/A"}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleViewEmr(patient)}
                            >
                              <i className="bi bi-eye-fill me-1"></i> View EMR
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="card-footer  d-flex justify-content-between align-items-center py-3 flex-wrap">
                  <div className="small text-muted mb-2 mb-md-0">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems,
                    )}{" "}
                    of {pagination.totalItems} entries
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li
                        className={`page-item ${
                          !pagination.hasPrevPage ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            handlePageChange(pagination.currentPage - 1)
                          }
                          disabled={!pagination.hasPrevPage}
                        >
                          Previous
                        </button>
                      </li>

                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.currentPage - 2 &&
                            page <= pagination.currentPage + 2)
                        ) {
                          return (
                            <li
                              key={page}
                              className={`page-item ${
                                page === pagination.currentPage ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            </li>
                          );
                        } else if (
                          page === pagination.currentPage - 3 ||
                          page === pagination.currentPage + 3
                        ) {
                          return (
                            <li key={page} className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                        return null;
                      })}

                      <li
                        className={`page-item ${
                          !pagination.hasNextPage ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            handlePageChange(pagination.currentPage + 1)
                          }
                          disabled={!pagination.hasNextPage}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emr;