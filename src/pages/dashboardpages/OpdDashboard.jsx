
import React, { useEffect, useState } from "react";

import axiosInstance from "../../axiosInstance";

import PatientCompareGraph from "./PatientGrowthGraph";
// import TopAreaGraph from "./TopAreaGraph";
import TopDeptGraph from "./TopDeptGraph";
import CommonBarChart from "./CommonBarChart";
import DashboardStats from "./DashboardStats";
import DateFilter from "./DateFilter";
import PatientPieChart from "./PatientPieChart";
import CommonTable from "./CommonTable";
// import DodgeGameLoader from "./LoadingGame";

const OpdDashboard = () => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [areas, setAreas] = useState([]);
  const [depts, setDepts] = useState([]);
  const [stats, setStats] = useState(null);
  const [patientCountByDoctor, setPatientCountByDoctor] = useState([]);

  const getPatientCount = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/patient-visits?page=1&limit=1000", {
        params: {
          fromDate:startDate,
          toDate:endDate,
        },
      });   //lords-backend.onrender.com/api/v1/patient-visits?page=1&limit=100

      setResponse(res.data);
      setLoading(false);
    } catch (error) {
    } finally {
      // setLoading(false);
    }
  };

  const getPatientCountByDoctor = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/patientcountbydoctor", {
        params: {
         startDate,
         endDate,
        },
      });

      setPatientCountByDoctor(res.data);
      setLoading(false);
    } catch (error) {
    } finally {
      // setLoading(false);
    }
  };
  const fetchAreas = async () => {
    const res = await axiosInstance.get("/top-area", {
      params: {
        startDate,
        endDate,
      },
    });

    setAreas(res.data.data);
  };

  const fetchDepts = async () => {
    const res = await axiosInstance.get("/top-dept", {
      params: {
        startDate,
        endDate,
      },
    });

    setDepts(res.data.data);
  };

  useEffect(() => {
    getPatientCount();
    fetchAreas();
    fetchDepts();
    getPatientCountByDoctor();
  }, [startDate, endDate]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await axiosInstance.get("/patient-stats", {
        params: {
          startDate,
          endDate,
        },
      });
      setStats(res.data.data);
    };
    fetchStats();
  }, []);


const admissionColumns = [
  {
    header: "#",
    render: (_, index) => <span className="ad-rank">#{index + 1}</span>,
  },
  {
    header: "Registration Id",
    accessor: "RegistrationId",
  },
  {
    header: "Patient",
    accessor: "PatientName",
  },
  // {
  //   header: "Date",
  //   render: (row) => (
  //     <span className="ad-date">{row.AdmitionDate?.split("T")[0]}</span>
  //   ),
  // },
  { header: "Depertment", accessor: "SpecialityName" },
  {
    header: "Contact",
    render: (row) => <span className="ad-phone">📞 {row.PhoneNo}</span>,
  },
];

const doctorCountColumns = [
  {
    header: "#",
    render: (_, index) => <span className="ad-rank">#{index + 1}</span>,
  },
  {
    header: "Doctor Id",
    accessor: "DoctorId",
  },
  {
    header: "Doctor",
    accessor: "Doctor",
  },
  // {
  //   header: "Date",
  //   render: (row) => (
  //     <span className="ad-date">{row.AdmitionDate?.split("T")[0]}</span>
  //   ),
  // },
  { header: "Patients", accessor: "total_patients" },
  // {
  //   header: "Contact",
  //   render: (row) => <span className="ad-phone">📞 {row.PhoneNo}</span>,
  // },
];

  return (
    <>
      <style>{`
      .dashboard-bg {
        background: #e1bbf7;
        min-height: 100vh;
        padding: 20px;
       
      }

      .dashboard-section {
        margin-bottom: 20px;
      }

      .dashboard-card {
        background: #fff;
        border-radius: 14px;
        padding: 15px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.05);
        transition: 0.3s;
   
      }

      .dashboard-card:hover {
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      }
             .sticky-filter {
  position: sticky;
  top: 10px;
  z-index: 999;
}
    `}</style>

      <div className="dashboard-bg">
        {loading ? (
          // <DodgeGameLoader />
          <h1>Loading...</h1>
        ) : (
          <>
            {/* 🔍 FILTER + STATS */}
            <div className="dashboard-section sticky-filter">
              <div className="dashboard-card mb-3  ">
                <DateFilter
                  startDate={startDate}
                  endDate={endDate}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                />
              </div>
            </div>
            <div className=" mb-3 ">
              {/* <DashboardStats response={response} /> */}
            </div>
            {/* 📊 TABLE + GRAPH */}
            <div className="row g-4 dashboard-section">
              <div className="col-lg-8">
                <div className="dashboard-card">
                  <CommonTable
                    data={response.data}
                    columns={admissionColumns}
                    title="📋Patients Visit Dashboard"
                    total={response.pagination?.total}
                  />
                </div>
              </div>

              {/* <div className="col-lg-4">
                <div className="dashboard-card">
                  {stats && (
                    <PatientCompareGraph
                      today={stats.today}
                      yesterday={stats.yesterday}
                      thisMonth={stats.thisMonth}
                      lastMonth={stats.lastMonth}
                      thisYear={stats.thisYear}
                      lastYear={stats.lastYear}
                    />
                  )}
                </div>
              </div> */}
            </div>

            {/* 📈 CHARTS */}
            {/* <div className="row g-4 dashboard-section">
              <div className="col-lg-4">
                <div className="dashboard-card">
                  <CommonBarChart
                    data={areas}
                    title="Top Patient Areas"
                    dataKey="Area"
                  />
                </div>
              </div>

              <div className="col-lg-4">
                <div className="dashboard-card">
                  <CommonBarChart
                    data={depts}
                    title="Top Departments"
                    dataKey="Department"
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="dashboard-card">
                  <PatientPieChart
                    total={response.totalPatients}
                    insured={response.insured}
                  />
                </div>
              </div>
            </div> */}
            {/* 📊 TABLE + GRAPH */}
            <div className="row g-4 dashboard-section">
              <div className="col-lg-8">
                <div className="dashboard-card">
                  <CommonTable
                    data={patientCountByDoctor.data}
                    columns={doctorCountColumns}
                    title="📋 Doctors-Patients Dashboard"
                    // total={patientCountByDoctor.data}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default OpdDashboard;

