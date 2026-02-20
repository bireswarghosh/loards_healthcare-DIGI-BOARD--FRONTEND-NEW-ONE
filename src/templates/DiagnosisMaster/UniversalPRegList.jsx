import React, { useCallback, useEffect, useState } from "react";
import UniversalPReg from "./UniversalPReg";
import useAxiosFetch from "./Fetch";
import UniversalPTable from "./UniversalPTable";
import useInfiniteScroll from "./useInfiniteScroll";

const UniversalPRegList = () => {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [patients, setPatients] = useState([]);
  const[patientName,setPatientName]=useState("")
  const { data,loading } = useAxiosFetch(
    `/patientregistration?page=${pageNo}&limit=20&startDate=${startDate}&endDate=${endDate}&patientName=${patientName}`,
    [pageNo, startDate, endDate, patientName]
  );
  useEffect(() => {
    if (!data) return;

    setPatients((prev) => (pageNo === 1 ? data : [...prev, ...data]));
  }, [data]);
  const [selectedId, setSelectedId] = useState(null);
  console.log(patients);
const handleSearch = () => {
  setPageNo(1); // reset page
  setPatients([]); // clear old data
};

const clearSearch = () => {
  setStartDate("");
  setEndDate("");
  setPatientName("");
  setPageNo(1);
  setPatients([]);
};

  const columns = [
    // Action
    {
      header: "Action",
      render: (row) => (
        <div className="d-flex gap-1">
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => {
              setSelectedId(row.RegistrationId);
              setOpen(true);
            }}
          >
            <i className="fa-light fa-eye"></i>
          </button>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => openEdit()}
          >
            <i className="fa-light fa-pen-to-square"></i>
          </button>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              setDeleteId();
              setShowConfirm(true);
            }}
          >
            <i className="fa-light fa-trash-can"></i>
          </button>
        </div>
      ),
    },
    {
      header: "Patient Name",
      render: (row) => `${row.PPr || ""} ${row.PatientName}`,
    },

    // Registration
    {
      header: "Reg. No",
      accessor: "RegistrationNo",
    },
    {
      header: "Reg. Date",
      render: (row) =>
        row.RegistrationDate
          ? new Date(row.RegistrationDate).toLocaleDateString("en-IN")
          : "-",
    },

    // Patient Info

    {
      header: "Age",
      render: (row) => `${row.Age} ${row.AgeType}`,
    },
    {
      header: "Gender",
      accessor: "Sex",
    },
    // {
    //   header: "Blood",
    //   accessor: "BloodGroup",
    // },

    // Contact
    {
      header: "Phone",
      accessor: "PhoneNo",
    },

    // Address
    // {
    //   header: "Address",
    //   render: (row) =>
    //     [row.Add1, row.Add2, row.Add3].filter(Boolean).join(", "),
    // },

    // Doctor & Speciality
    // {
    //   header: "Doctor ID",
    //   accessor: "DoctorId",
    // },
    // {
    //   header: "Speciality",
    //   accessor: "SpecialityId",
    // },

    // Financial
    // {
    //   header: "Total ₹",
    //   render: (row) => `₹ ${row.TotAmount}`,
    // },
    // {
    //   header: "Advance ₹",
    //   render: (row) => `₹ ${row.AdvAmt}`,
    // },
    // {
    //   header: "Discount ₹",
    //   render: (row) => `₹ ${row.Discount}`,
    // },

    // Vital
    // {
    //   header: "BP",
    //   render: (row) => `${row.bpmax}/${row.bpmin}`,
    // },
    // {
    //   header: "Weight (kg)",
    //   accessor: "Weight",
    // },
  ];
 const loadMore = useCallback(() => {
   setPageNo((p) => p + 1);
 }, []);

  const loaderRef = useInfiniteScroll(loadMore);
  return (
    <>
      <div className="d-flex gap-2 justify-content-end m-3">
        <input
          type="date"
          className="form-control form-control-sm"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ width: 140 }}
        />

        <input
          type="date"
          className="form-control form-control-sm"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ width: 140 }}
        />

        <input
          className="form-control form-control-sm"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          style={{ width: 150 }}
        />
        <button className="btn btn-sm btn-info" onClick={handleSearch}>
          <i className="fa fa-search"></i>
        </button>

        <button className="btn btn-sm btn-secondary" onClick={clearSearch}>
          Clear
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setOpen((prev) => !prev)}
        >
          + Add
        </button>
        {/* <button className="btn btn-sm btn-primary" onClick={openAdd}>
          <i className="fa-light fa-plus"></i> Add
        </button> */}
      </div>

      <UniversalPTable
        loading={loading}
        columns={columns}
        data={patients}
        ref1={loaderRef}
      />

      {/* Drawer */}
      <div
        className="position-fixed end-0 shadow profile-right-sidebar  "
        style={{
          top: "100px",
          width: "900px",
          height: "calc(100vh - 100px)",
          zIndex: 9998,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.6s ease-in-out",
        }}
      >
        <UniversalPReg
          RegistrationId={selectedId}
          setSelectedId={setSelectedId}
          setOpen={setOpen}
        />
      </div>
    </>
  );
};

export default UniversalPRegList;