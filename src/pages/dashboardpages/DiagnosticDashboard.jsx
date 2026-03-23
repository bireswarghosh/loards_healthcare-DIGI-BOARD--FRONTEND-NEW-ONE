import React, { useEffect, useState } from "react";



import PatientCompareGraph from "./PatientGrowthGraph";
// import TopAreaGraph from "./TopAreaGraph";
// import TopDeptGraph from "./TopDeptGraph";
import CommonBarChart from "./CommonBarChart";
import DashboardStats from "./DashboardStats";
import DateFilter from "./DateFilter";
import PatientPieChart from "./PatientPieChart";
import CommonTable from "./CommonTable";
import DodgeGameLoader from "./LoadingGame";
import TestTable from "./TestTable";
import axiosInstance from "../../axiosInstance";

const DiagnosticDashboard = () => {
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
  const [leadReport, setLeadReport] = useState([]);
  const [response1, setResponse1] = useState("");

  const getPatientCount = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/diagnostic/bookings", {
        params: {
          fromDate: startDate,
          toDate: endDate,
        },
      });

      setResponse(res.data);
    } catch (error) {
    } finally {
      setLoading(false);
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
  const campLeadReport = async () => {
    const res = await axiosInstance.get("/camping/campleadreport", {
      params: {
        startDate,
        endDate,
      },
    });

    setLeadReport(res.data);
  };
  const fetchTests = async () => {
    try {
      setLoading(true);
      if (startDate && endDate) {
        const res = await axiosInstance.get(
          `/case01/cases-with-details?page=1&limit=999&startDate=${startDate}&endDate=${endDate}`
        );
        // const totalTests = res.data.totalTests;
        setResponse1(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPatientCount();
    fetchAreas();
    fetchDepts();
    campLeadReport();
    fetchTests();
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

  const bookingColumns = [
    {
      header: "#",
      render: (_, index) => index + 1,
    },
    {
      header: "Status",
      render: (row) => {
        const status = row.status?.toLowerCase();

        let badgeClass = "bg-secondary";
        let label = "Unknown";

        if (status === "completed") {
          badgeClass = "bg-success";
          label = "Completed";
        } else if (status === "pending") {
          badgeClass = "bg-warning text-dark";
          label = "Pending";
        } else if (status === "cancelled") {
          badgeClass = "bg-danger";
          label = "Cancelled";
        } else if (status === "confirmed") {
          badgeClass = "bg-info";
          label = "Confirmed";
        }

        return (
          <span className={`badge rounded-pill px-3 py-2 ${badgeClass}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: "Patient",
      accessor: "name",
    },
    {
      header: "Test",
      accessor: "test_name",
    },
    {
      header: "Aptmt Date",
      render: (row) => row.appointment_date?.split("T")[0],
    },
    {
      header: "Contact",
      render: (row) => <span className="ad-phone">📞 {row.phone}</span>,
    },
  ];

  // ========================camoing table columns==================
  const campingColumns = [
    {
      header: "#",
      render: (_, index) => <span className="ad-rank">#{index + 1}</span>,
    },
    {
      header: "ID",
      accessor: "camping_id",
    },
    {
      header: "Name",
      accessor: "camping_name",
    },
    {
      header: "Date",
      render: (row) => (
        <span className="ad-date">{row.start_date?.split("T")[0]}</span>
      ),
    },
    {
      header: "Leads",
      accessor: "total_leads",
    },
  ];

  return (
    <>
      <style>{`
      .dashboard-bg {
        background: #bbd4f7;
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
          // <ZLoader />
          <DodgeGameLoader />
        ) : (
          <>
            {/* 🔍 FILTER + STATS */}
            <div className="dashboard-section sticky-filter">
              <div className="  ">
                <DateFilter
                  startDate={startDate}
                  endDate={endDate}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                />
              </div>
            </div>
            <div className="mb-3">
              <DashboardStats response={response1} />
            </div>

            {/* 📊 TABLE + GRAPH */}
            <div className="row g-4 dashboard-section">
              <div className="col-lg-8">
                <div className="dashboard-card">
                  <TestTable
                    data={response1.data}
                    totalTests={response1.totalTests}
                  />
                </div>
              </div>

              <div className="col-lg-4">
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
              </div>
            </div>

            {/* 📈 CHARTS */}
            <div className="row g-4 dashboard-section">
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
            </div>
            {/* ///camping table  */}
            <div className="row g-4 dashboard-section">
              <div className="col-lg-8">
                <div className="dashboard-card">
                  <CommonTable
                    data={leadReport.data}
                    columns={campingColumns}
                    title="📋Camping Table"
                    total={leadReport.grandTotal}
                  />
                </div>
              </div>
            </div>

            {/* ////test table--- */}
            <div className="row g-4 dashboard-section">
              <div className="col-lg-4">
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
              </div>
              <div className="col-lg-8">
                <div className="dashboard-card">
                  <CommonTable
                    data={response.data}
                    columns={bookingColumns}
                    title="📋 Booking Table"
                    total={response.count}
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

export default DiagnosticDashboard;
