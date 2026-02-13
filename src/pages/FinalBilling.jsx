import React, { useEffect, useRef, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import JsBarcode from "jsbarcode";
import { toast } from "react-toastify";

const Barcode = ({ value }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        lineColor: "#000",
        width: 1.4,
        height: 25,
        displayValue: true,
        fontSize: 12,
      });
    }
  }, [value]);

  return <svg ref={svgRef}></svg>;
};

const FinalBilling = () => {
  // Styles object to strictly enforce legacy look without external CSS files
  const styles = {
    container: {
      //backgroundColor: 'primary', // Approximate Windows Form Blue/Purple from image
      fontFamily: "Tahoma, Arial, sans-serif",
      fontSize: "11px",
      color: "primary",
      minHeight: "70vh",
      padding: "8px",
    },
    sectionGroup: {
      border: "1px solid #466075ff",
      margin: "2px 0",
      padding: "4px",
      position: "relative",
      marginTop: "8px",
    },
    legend: {
      position: "absolute",
      top: "-8px",
      left: "10px",
      //   backgroundColor: '#e3e5f1ff',
      //   backgroundColor: 'rgba(16, 160, 243, 0.81)',
      //   backgroundColor: 'primary',
      color: "#primary", // Dark Red title
      padding: "0 4px",
      fontWeight: "bold",
      fontSize: "12px",
    },
    label: {
      color: "secondary", // Reddish labels often seen in legacy apps
      fontWeight: "bold",
      whiteSpace: "nowrap",
      marginRight: "1px",
    },
    labelBlue: {
      color: "blue",
      fontWeight: "bold",
      whiteSpace: "nowrap",
      marginRight: "4px",
    },
    input: {
      border: "1px solid #666", // Inset look
      borderRadius: "0",
      padding: "1px 3px",
      fontSize: "11px",
      height: "16px",
      width: "100%",
      backgroundColor: "#fff",
      boxShadow: "inset 1px 1px 1px rgba(0,0,0,0.2)",
    },
    inputReadonly: {
      backgroundColor: "#e0e0e0",
    },
    tableHeader: {
      backgroundColor: "#808080",
      color: "white",
      fontWeight: "normal",
      padding: "2px",
      borderRight: "1px solid #fff",
    },
    // tableRowSelected: {
    //   // backgroundColor: "#FFFF00", // Legacy Yellow Highlight
    //   backgroundColor: "#c4ddf1f6",
    //   color: "black",

    // },

    tableRowSelected: {
      background: "linear-gradient(90deg, #cce7ff 0%, #b3d9ff 100%)",
      color: "#000",
      fontWeight: "700",
      transition: "0.2s",
    },
  };

  let { id, mode_type } = useParams();
console.log("moe",mode_type)
  // console.log("id1: ",id)
  id = encodeURIComponent(id || "");
  const navigate = useNavigate();
  const [mode, setMode] = useState(mode_type ? mode_type : "add");
  // const [fbData, setFbData] = useState({});
  const [fbData, setFbData] = useState({
    FinalBillId: "",
    BillNo: "",
    BillDate: "",
    BillTime: "",
    ReleaseTime: "",
    BillType: "",
    ReffId: "",
    Discount: 0,
    ReciptAmt: 0,
    CB: "",
    ChequeNo: "",
    ChequeDt: "",
    BankName: "",
    CashlessId: 0,
    Rename: "",
    UserId: 0,
    MoneyreeciptId: "",
    BillAmt: 0,
    Remarks: "",
    EditBill: "",
    TDS: null,
    TDSDate: null,
    MBillNo: "",
    Approval: 0,
    ServiceTax: 0,
    TaxInc: "",
    PatiectPartyAmt: 0,
    CorpPabley: 0,
    details: {
      fbdtl: [],
      finalbillalldtl: [],
      finalbillbeddtl: [],
      finalbilldtl: [],
      finalbillitmdtl: [],
    },
  });
  const [admData, setAdmData] = useState({});
  const [deptData, setdeptData] = useState([]);
  const [deptIndoor, setDeptIndoor] = useState([]);
  const [cashLessData, setCashLessData] = useState([]);

  const [billHeadData, setBillHeadData] = useState([]);

  const [selectedBillHead, setSelectedBillHead] = useState("");

  const [allDoctors, setAllDoctors] = useState([]);

  const [bedDetails, setBedDetails] = useState([]);
  const [ocDeatails, setOcDeatails] = useState([]);
  const [doDetails, setDoDetails] = useState([]);
  const [otcDetails, setOtcDetails] = useState([]);
  const [scDetail, setScDetail] = useState([]);
  const [larDetails, setLarDetails] = useState([]);

  const [authUserData, setAuthUserData] = useState([]);
  const [loggedInUser, setloggedInUser] = useState(
    localStorage.getItem("userId") || "",
  );

  const [diagData, setDiagData] = useState([])

  const [formData, setFormData] = useState({
    Approval: "",
    Discount: "",
    ReciptAmt: "",
    Remarks: "",
    CashlessId: "",
  });

  const handleSave = async () => {
    console.log("update: ", formData);
     console.log(mode)
      console.log(mode_type)
    if (mode_type == "edit") {
      try {
        
      console.log("update: ", formData);
      const res = await axiosInstance.put(`/fb/${fbData.FinalBillId}`,formData);
      if (res.data.success) {
        fetchFB(id)
        toast.success(res.data.message);
      }
      } catch (error) {
        console.log("error updating form: ",error)
      }
    }
  };

const handleUndo = async () => {
  try {
    fetchFB(id)
  } catch (error) {
    console.log("error fetching fb detail: ",error)
  }
}


  const fetchAuthUsers = async () => {
    try {
      const res = await axiosInstance.get("/auth/users");
      // console.log("res.da",res)
      res.data.success ? setAuthUserData(res.data.data) : setAuthUserData([]);
    } catch (error) {
      console.log("error fetching auth users data: ", error);
    }
  };

  // this is for getting less adv receipt data
  const fetchIpdMR = async (id) => {
    try {
      const res = await axiosInstance(`/moneyreceipt/admission/${id}`);
      res.data.success ? setLarDetails(res.data.data) : setLarDetails([]);
    } catch (error) {
      console.log("error fetching ipd money recipt detail by admId: ", error);
    }
  };

  const fetchAllDoctors = async () => {
    try {
      const res = await axiosInstance.get("/doctors");
      res.data.success ? setAllDoctors(res.data.data) : setAllDoctors([]);
    } catch (error) {
      console.log("error fetching doctors: ", error);
    }
  };

  // headName values: Bed Charges, Others Charges, O.T. Charges, Doctor Charges, Diagnostic Charges, Medicine Charges, Service Charges, GST Amount, Less Advance Receipt
  const renderRightSideTable = (headName) => {
    switch (headName) {
      case "Bed Charges":
        return (
          <table
            className="table table-bordered table-sm mb-0"
            style={{ fontSize: "11px" }}
          >
            <thead>
              <tr>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Bed</th>
                <th style={styles.tableHeader} className="text-end">
                  Rate
                </th>
                <th style={styles.tableHeader} className="text-end">
                  Attendant
                </th>
                <th style={styles.tableHeader} className="text-end">
                  RMO
                </th>
              </tr>
            </thead>
            <tbody>
              {fbData ? (
                fbData?.details?.finalbillbeddtl ? (
                  fbData?.details?.finalbillbeddtl.map((row, idx) => (
                    <tr key={idx} style={styles.tableRowSelected}>
                      <td>
                        {row.MyDate?.split("T")[0]
                          ?.split("-")
                          ?.reverse()
                          ?.join("/") || ""}
                      </td>
                      {/* <td>{row?.BedId}</td> */}
                      <td>
                        {bedDetails.find((item) => item.BedId == row.BedId)
                          ?.Bed || ""}
                      </td>
                      <td className="text-end">{row?.BedRate}</td>
                      <td className="text-end">
                        {bedDetails.find((item) => item.BedId == row.BedId)
                          ?.AtttndantCh || 0}
                      </td>
                      <td className="text-end">
                        {bedDetails.find((item) => item.BedId == row.BedId)
                          ?.RMOCh || 0}
                      </td>
                      {/* <td className="text-end">{row.rmo}</td> */}
                    </tr>
                  ))
                ) : (
                  <tr colSpan="2" className="text-end text-white">
                    No data found.
                  </tr>
                )
              ) : (
                <tr colSpan="2" className="text-end text-white">
                  No data found.
                </tr>
              )}
            </tbody>
          </table>
        );

      case "Others Charges":
        return (
          <table
            className="table table-bordered table-sm mb-0"
            style={{ fontSize: "11px" }}
          >
            <thead>
              <tr>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Others Head</th>
                <th style={styles.tableHeader} className="">
                  Rate
                </th>
                <th style={styles.tableHeader} className="">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {ocDeatails ? (
                ocDeatails.map((row, idx) => (
                  <tr key={idx} style={styles.tableRowSelected}>
                    <td>
                      {row.AdmitionDate?.split("T")[0]
                        ?.split("-")
                        ?.reverse()
                        ?.join("/") || ""}
                    </td>

                    <td>{row.SubHead || ""}</td>
                    <td className="">
                      {row.Particular?.trim()?.split("x")[1] || ""}
                    </td>
                    <td className="">
                      {row.Particular?.trim()?.split("x")[0] || ""}
                    </td>
                  </tr>
                ))
              ) : (
                <tr colSpan="2" className="text-end text-white">
                  No data found.
                </tr>
              )}
            </tbody>
          </table>
        );
      case "O.T. Charges":
        return (
          <table
            className="table table-bordered table-sm mb-0"
            style={{ fontSize: "11px" }}
          >
            <thead>
              <tr>
                <th style={styles.tableHeader}>OT Bill</th>
                <th style={styles.tableHeader}>Bill Date</th>
                <th style={styles.tableHeader}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* {console.log("hi: ", otcDetails)} */}
              {otcDetails ? (
                otcDetails.map((row, idx) => (
                  <tr key={idx} style={styles.tableRowSelected}>
                    <td>{row.SubHead || ""}</td>
                    <td>
                      {row.AdmitionDate?.split("T")[0]
                        ?.split("-")
                        ?.reverse()
                        ?.join("/") || ""}
                    </td>
                    <td>{row.Amount || 0}</td>
                  </tr>
                ))
              ) : (
                <tr colSpan="2" className="text-end text-white">
                  No data found.
                </tr>
              )}
            </tbody>
          </table>
        );
      case "Doctor Charges":
        return (
          <table
            className="table table-bordered table-sm mb-0"
            style={{ fontSize: "11px" }}
          >
            <thead>
              <tr>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>No Of Visit</th>
                <th style={styles.tableHeader}>Rate</th>
                <th style={styles.tableHeader}>Doctor</th>
                <th style={styles.tableHeader}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {doDetails ? (
                doDetails.map((row, idx) => (
                  <tr key={idx} style={styles.tableRowSelected}>
                    <td>
                      {row.AdmitionDate?.split("T")[0]
                        ?.split("-")
                        ?.reverse()
                        ?.join("/") || ""}
                    </td>

                    <td className="">
                      {row.Particular?.trim()?.split("/")[0] || ""}
                    </td>
                    <td className="">
                      {row.Particular?.trim()?.split("X")[1] || ""}
                    </td>
                    <td>{row.SubHead || ""}</td>
                    <td>{row.Amount || 0}</td>
                  </tr>
                ))
              ) : (
                <tr colSpan="2" className="text-end text-white">
                  No data found.
                </tr>
              )}
            </tbody>
          </table>
        );
      case "Diagnostic Charges":
         return (
          <table
            className="table table-bordered table-sm mb-0"
            style={{ fontSize: "11px" }}
          >
            <thead>
              <tr>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Case No.</th>
                <th style={styles.tableHeader}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {diagData ? (
                diagData.map((row, idx) => (
                  <tr key={idx} style={styles.tableRowSelected}>
                    <td>
                      {row.CaseDate?.split("T")[0]
                        ?.split("-")
                        ?.reverse()
                        ?.join("/") || ""}
                    </td>
                    <td>{row.CaseNo || ""}</td>
                    <td>{row.Total || 0}</td>
                  </tr>
                ))
              ) : (
                <tr colSpan="2" className="text-end text-white">
                  No data found.
                </tr>
              )}
            </tbody>
          </table>
        );
      case "Medicine Charges":
        break;
      case "Service Charges":
        return (
          <table
            className="table table-bordered table-sm mb-0"
            style={{ fontSize: "11px" }}
          >
            <thead>
              <tr>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Service Charge</th>
                <th style={styles.tableHeader}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {scDetail ? (
                scDetail.map((row, idx) => (
                  <tr key={idx} style={styles.tableRowSelected}>
                    <td>
                      {row.AdmitionDate?.split("T")[0]
                        ?.split("-")
                        ?.reverse()
                        ?.join("/") || ""}
                    </td>
                    <td>{row.SubHead || ""}</td>
                    <td>{row.Amount || 0}</td>
                  </tr>
                ))
              ) : (
                <tr colSpan="2" className="text-end text-white">
                  No data found.
                </tr>
              )}
            </tbody>
          </table>
        );
      case "GST Amount":
        break;
      case "Less Advance Receipt":
        return (
          <table
            className="table table-bordered table-sm mb-0"
            style={{ fontSize: "11px" }}
          >
            <thead>
              <tr>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Receipt No</th>
                <th style={styles.tableHeader}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {larDetails ? (
                larDetails.map((row, idx) => (
                  <tr key={idx} style={styles.tableRowSelected}>
                    <td>
                      {row.ReceiptDate?.split("T")[0]
                        ?.split("-")
                        ?.reverse()
                        ?.join("/") || ""}
                    </td>
                    <td>{row.MoneyreeciptNo || ""}</td>
                    <td>{row.Amount || 0}</td>
                  </tr>
                ))
              ) : (
                <tr colSpan="2" className="text-end text-white">
                  No data found.
                </tr>
              )}
            </tbody>
          </table>
        );
      default:
        console.log("choose correct one");
    }
  };

  // fetching cashless api
  const fetchCashLess = async () => {
    try {
      const res = await axiosInstance.get("/cashless");
      res.data.success ? setCashLessData(res.data.data) : setCashLessData([]);
    } catch (error) {
      console.log("error fetching cashless: ", error);
    }
  };


  // fetching diag charge using adm id
  const fetchDiag = async (id) => {
    try {
      const res = await axiosInstance.get(`/case01/admition/${id}`)
      console.log("Diag data: ",res.data.data)
      res.data.success? setDiagData(res.data.data): setDiagData([])
    } catch (error) {
      console.log("error fetching diago charge: ",error)
    }
  }
  

  // fetching ipd adm details
  const fetchAdm = async (id) => {
    try {
      const response = await axiosInstance.get(`/admission/${id}`);
      console.log("adm data: ", response);
      response.data.success ? setAdmData(response.data.data) : setAdmData({});
    } catch (error) {
      console.log("error fetching: ", error);
    }
  };

  // fetch ipd dept
  const fetchDept = async () => {
    try {
      const response = await axiosInstance.get(`/departmentIndoor`);
      console.log("dept data: ", response);
      response.data.success
        ? setDeptIndoor(response.data.data)
        : setDeptIndoor({});
    } catch (error) {
      console.log("error fetching dept: ", error);
    }
  };

  // fectch final bill data for a specific user
  const fetchFB = async (id) => {
      console.log("id3: ",id)

    try {
      if (!id) {
        console.log("no id presenet");
        return;
      }
      const res = await axiosInstance.get(`/fb/${id}`);
      // res.data.success?setFbData(res.data.data):setFbData({})
      console.log("Fb data: ", res.data.data);
      if (res.data.success) {
        setFbData(res.data.data);
        setBillHeadData(res.data.data.details?.finalbilldtl);

        if (res.data.data.details?.finalbillalldtl) {
          setOcDeatails(
            filterCharges(res.data.data.details?.finalbillalldtl, " "),
          );
          setDoDetails(
            filterCharges(
              res.data.data.details?.finalbillalldtl,
              "DOCTOR VISIT",
            ),
          );
          setOtcDetails(
            filterCharges(
              res.data.data.details?.finalbillalldtl,
              "O.T. CHARGES",
            ),
          );
          setScDetail(
            filterCharges(
              res.data.data.details?.finalbillalldtl,
              "SERVICE CHARGES",
            ),
          );
        }

        if (res.data.data?.ReffId) {
          fetchAdm(res.data.data?.ReffId);
          fetchIpdMR(res.data.data?.ReffId);
          fetchDiag(res.data.data?.ReffId)
        }

        if (res.data.data?.details?.finalbillbeddtl) {
          const data = await fetchBedsById(
            res.data.data?.details?.finalbillbeddtl,
          );
          // console.log("bed details: ",data)
          setBedDetails(data);
        }
      } else {
        // setFbData({});
        setFbData({
          FinalBillId: "",
          BillNo: "",
          BillDate: "",
          BillTime: "",
          ReleaseTime: "",
          BillType: "",
          ReffId: "",
          Discount: 0,
          ReciptAmt: 0,
          CB: "",
          ChequeNo: "",
          ChequeDt: "",
          BankName: "",
          CashlessId: 0,
          Rename: "",
          UserId: 0,
          MoneyreeciptId: "",
          BillAmt: 0,
          Remarks: "",
          EditBill: "",
          TDS: null,
          TDSDate: null,
          MBillNo: "",
          Approval: 0,
          ServiceTax: 0,
          TaxInc: "",
          PatiectPartyAmt: 0,
          CorpPabley: 0,
          details: {
            fbdtl: [],
            finalbillalldtl: [],
            finalbillbeddtl: [],
            finalbilldtl: [],
            finalbillitmdtl: [],
          },
        });
      }
    } catch (error) {
      console.log("error fetching fb data: ");
    }
  };

  // fetch bed detail by Id
  const fetchBedsById = async (beds) => {
    try {
      const promises = beds.map((item) =>
        axiosInstance.get(`/bedMaster/${item.BedId}`),
      );

      const results = await Promise.all(promises);

      return results.map((res) => res?.data?.data);
    } catch (err) {
      console.error("Error while fetching bed data:", err);
      throw err;
    }
  };

  // this is for filtering charges
  const filterCharges = (data, ref) => {
    const filteredData = data.filter((item) => item.PrintHead == ref);
    console.log("dd: ", filteredData);
    return filteredData;
  };

  // this is for handlePrint1
  const billData1 = {
    hospitalName: "LORDS HEALTH CARE",
    address:
      "13/3, Circular 2nd Bye Lane, Kona Expressway, Shibpur, Howrah-711 102, W.B.",
    phone: "8272904444",
    helpline: "7003378414",
    tollFree: "1800-309-0895",
    email: "patientdesk@lordshealthcare.org",
    website: "www.lordshealthcare.org",

    patient: {
      name: admData.PatientName || "",
      address: admData.Add1 || "",
      address2: admData.Add2 || "",
      address3: admData.Add3 || "",
      contact: admData.PhoneNo || "",
      age: `${admData.Age || ""} ${admData.AgeType || "Y"}`,
      sex: admData.Sex || "",
    },

    billNo: fbData?.BillNo || "",
    ipdNo: admData.AdmitionNo || "",
    admissionDate:
      `${admData?.AdmitionDate?.split("T")[0]?.split("-")?.reverse()?.join("/")} Time: ${
        admData?.AdmitionTime || ""
      }` || "",
    dischargeDate:
      `${fbData?.BillDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || ""} Time: ${fbData?.ReleaseTime || ""}` ||
      "",
    dischargeType: "Expired not known confusion",
    doctor:
      allDoctors.find((item) => item.DoctorId == admData?.UCDoctor1Id)
        ?.Doctor || "",
    bedNo: "", // At time of discharge
    billDate:
      fbData?.BillDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",

    bedCharges: {
      rows: fbData?.details?.finalbillbeddtl.map((row, idx) => [
        row.MyDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
        bedDetails.find((item) => item.BedId == row.BedId)?.Bed || "",
        "1",
        row?.BedRate || 0,
        row?.BedRate || 0,
      ]) || [["", "", "", "", ""]],
      total:
        billHeadData.find((item) => item.HeadName == "Bed Charges")?.Amount1 ||
        "0",
    },

    doctorVisits: {
      rows: doDetails.map((row, idx) => [
        row.AdmitionDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
        row.SubHead || "",
        row.Particular?.trim()?.split("/")[0] || "",
        row.Particular?.trim()?.split("X")[1] || "",
        row.Amount || 0,
      ]) || [["", "", "", "", ""]],
      total:
        billHeadData.find((item) => item.HeadName == "Doctor Charges")
          ?.Amount1 || "0",
    },

    criticalCare: {
      rows: [
        ["19/06/2023", "CRITICAL CARE DOCTOR FEES", "2", "600.00", "1,200.00"],
      ],
      total: "1,200.00",
    },

    services: {
      rows: [
        ["19/06/2023", "ATTENDANT CHARGE DAY", "3", "675.00", "2,025.00"],
        ["19/06/2023", "ATTENDANT CHARGE NIGHT", "2", "450.00", "900.00"],
        ["19/06/2023", "CATHETARIZATION CHARGE", "1", "500.00", "500.00"],
        ["19/06/2023", "CENTER LINE/LONG LINE", "1", "1,500.00", "1,500.00"],
        ["19/06/2023", "CPR", "2", "600.00", "1,200.00"],
        [
          "19/06/2023",
          "DAILY ASSESSMENT CHARGE(DIET)",
          "2",
          "200.00",
          "400.00",
        ],
        ["19/06/2023", "GLUCOMETER TEST", "8", "800.00", "6,400.00"],
        ["19/06/2023", "I.M.CHARGES", "1", "500.00", "500.00"],
        ["19/06/2023", "INFUSION PUMP PER DAY", "2", "1,200.00", "2,400.00"],
        ["19/06/2023", "INTUBATION", "1", "1,000.00", "1,000.00"],
        ["19/06/2023", "MRD FEES", "1", "300.00", "300.00"],
        ["19/06/2023", "NEBULIZATION CHARGE", "15", "1,500.00", "22,500.00"],
        ["19/06/2023", "OXYGEN PER HOUR", "35", "3,500.00", "122,500.00"],
        [
          "19/06/2023",
          "OXYGEN PER HOUR (VENTILATOR)",
          "14",
          "1,680.00",
          "23,520.00",
        ],
        ["19/06/2023", "REGISTRATION CHARGE", "1", "500.00", "500.00"],
        ["19/06/2023", "RYLES TUBE CHARGES", "1", "250.00", "250.00"],
        [
          "19/06/2023",
          "VENTILATOR CHARGE PER DAY",
          "1",
          "3,000.00",
          "3,000.00",
        ],
      ],
      total: "189,395.00",
    },

    medicine: {
      rows: [
        [
          "19/06/2023",
          "MEDICINE-LORDS PHARMACY",
          "1",
          "26,256.00",
          "26,256.00",
        ],
      ],
      total: "26,256.00",
    },

    investigations: {
      rows: [
        ["19/06/2023", "ABG TEST", "1", "1,500.00", "1,500.00"],
        ["19/06/2023", "CHEST PA VIEW (DIGITAL)", "1", "400.00", "400.00"],
        ["19/06/2023", "COMPLETE HAEMOGRAM", "1", "350.00", "350.00"],
        [
          "19/06/2023",
          "C-REACTIVE PROTEIN (CRP) QUANTATIVE",
          "1",
          "500.00",
          "500.00",
        ],
        ["19/06/2023", "ECG", "1", "250.00", "250.00"],
        ["19/06/2023", "URINE FOR C/S", "1", "400.00", "400.00"],
        ["19/06/2023", "URINE R/E", "1", "150.00", "150.00"],
        ["20/06/2023", "BLOOD GROUPING & RH FACTOR", "1", "150.00", "150.00"],
        ["20/06/2023", "ECHOCARDIOGRAPHY", "1", "1,500.00", "1,500.00"],
        ["20/06/2023", "POTASSIUM", "1", "250.00", "250.00"],
        ["20/06/2023", "SODIUM", "1", "250.00", "250.00"],
        [
          "20/06/2023",
          "USG OF WHOLE ABDOMEN (FEMALE)",
          "1",
          "1,800.00",
          "1,800.00",
        ],
        [
          "21/06/2023",
          "BLOOD CULTURE AEROBIC (ORGANISMS)",
          "1",
          "1,500.00",
          "1,500.00",
        ],
        ["21/06/2023", "MRI BRAIN 1.5", "1", "6,500.00", "6,500.00"],
        ["21/06/2023", "URINE FOR C/S", "1", "400.00", "400.00"],
        ["21/06/2023", "URINE R/E", "1", "150.00", "150.00"],
        ["22/06/2023", "ABG TEST", "1", "1,500.00", "1,500.00"],
        ["22/06/2023", "CHEST PA VIEW (DIGITAL)", "1", "400.00", "400.00"],
        ["22/06/2023", "COMPLETE HAEMOGRAM", "1", "350.00", "350.00"],
        ["22/06/2023", "CREATININE", "1", "150.00", "150.00"],
        ["22/06/2023", "ECG", "1", "250.00", "250.00"],
        ["22/06/2023", "EEG", "1", "2,000.00", "2,000.00"],
        ["22/06/2023", "POTASSIUM", "1", "250.00", "250.00"],
        ["22/06/2023", "SODIUM", "1", "250.00", "250.00"],
        ["22/06/2023", "UREA", "1", "150.00", "150.00"],
      ],
      total: "21,350.00",
    },

    serviceCharges: {
      // rows: [["-", "SERVICE CHARGES", "1", "2,743.00", "2,743.00"]],
      rows: scDetail.map((row, idx) => [
        row.AdmitionDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
        row.SubHead || "",
        "1",
        row.Amount || 0,
        row.Amount || 0,
      ]) || [["-", "", "", "", ""]],
      total:
        billHeadData.find((item) => item.HeadName == "Service Charges")
          ?.Amount1 || "0",
    },

    grandTotal: "274,544.00",
    advancePaid: "33,000.00",
    insuranceApproval: "0.00",
    nonPayable: "1725",
    billedBy: "Admin",
  };
  // this print final bill summary
  const handlePrint1 = (data) => {
    // CSS Styles to replicate the PDF look (A4, borders, fonts)
    const styles = `
    <style>
      @page { size: A4; margin: 10mm; }
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
        color: #000;
        line-height: 1.3;
        -webkit-print-color-adjust: exact;
      }
      .container { width: 100%; max-width: 210mm; margin: 0 auto; }
      
      /* Header Section */
      .header-table { width: 100%; border: none; margin-bottom: 10px; }
      .header-table td { border: none; vertical-align: top; }
      .logo-section { text-align: center; width: 15%; }
      .logo-triangle {
        width: 0; height: 0;
        border-left: 30px solid transparent;
        border-right: 30px solid transparent;
        border-bottom: 50px solid #006400; /* Dark Green */
        margin: 0 auto;
        position: relative;
      }
      .logo-text { font-size: 8px; font-weight: bold; text-align: center; margin-top: 5px; color: #006400; }
      
      .company-info { text-align: center; width: 70%; }
      .company-name { font-size: 22px; font-weight: bold; color: #000000; margin: 0; }
      .company-address { font-size: 10px; margin-bottom: 5px; }
      .company-contact { font-size: 10px; font-weight: bold; }
      
      /* Patient Info Grid */
      .info-box {margin-top:30px; width: 100%; border: 1px solid #000; padding: 4px; padding-right:2px; margin-bottom: 10px; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .info-col { width: 48%; display: flex; }
      .label { font-weight: bold; width: 120px; }
      .value { flex: 1; }
      
      /* Tables */
      .section-title { font-weight: bold; margin-top: 10px; margin-bottom: 2px; text-decoration: underline; font-size: 12px; }
      table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10px; }
      table.data-table th, table.data-table td { border: 1px solid #000; padding: 3px 5px; }
      table.data-table th { background-color: #f0f0f0; text-align: left; font-weight: bold; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      
      /* Footer Totals */
      .footer-totals { width: 100%; margin-top: 20px; border-top: 1px solid #000; padding-top: 5px; }
      .total-row { display: flex; justify-content: flex-end; font-weight: bold; font-size: 12px; margin-bottom: 5px; }
      .total-label { margin-right: 20px; }
      
      /* Signature */
      .signature-section { margin-top: 40px; text-align: right; font-size: 11px; }
      .admin-sig { margin-top: 30px; }
      
      /* Utilities */
      .page-break { page-break-before: always; }
      .urn-box { position: absolute; top: 10px; right: 10px; border: 1px solid #000; padding: 2px; font-size: 9px; }
    </style>
  `;

    // HTML Construction
    let html = `<html><head><title>Final Bill</title>${styles}</head><body><div class="container">`;

    // --- HEADER ---
    html += `
    <table class="header-table">
      <tr>
        <td >        
          <img src="/public/assets/lords.png" style="width:80px;" />
        </td>
        <td class="company-info">
          <h1 class="company-name">${data.hospitalName}</h1>
          <div class="company-address">${data.address}</div>
          <div class="company-contact">
            Phone No.: ${data.phone} HELPLINE - ${data.helpline}<br>
            Toll Free No.- ${data.tollFree} <br>
            E-mail: ${data.email}, Website: ${data.website}
          </div>
        </td>
      
     
       <td >        
          <img src="/public/assets/nabh.png" style="width:120px;" />
        </td>
      </tr>
    </table>
    <!--
    
    <div style="text-align: center; font-weight: bold; margin: 10px 0; font-size: 14px; text-decoration: underline;">BILL SUMMARY</div>
    -->
  `;

    html += `
  <div style="display:flex; align-items:center; justify-content:center; position:relative; margin:10px 0; margin-bottom:10px">

    <!-- BARCODE LEFT -->
    <img 
      src="https://barcode.tec-it.com/barcode.ashx?data=${data.ipdNo}&code=Code128&dpi=96" 
      alt="barcode"
      style="position:absolute; left:0; width:200px; height:50px; "
    />

    <!-- BILL SUMMARY TEXT -->
    <div style="font-weight:bold; font-size:14px; text-decoration:underline; text-align:center;">
      BILL SUMMARY
    </div>

  </div>
`;

    // --- PATIENT INFO ---
    html += `
    <div class="info-box" >
      <div class="info-row">
        <div class="info-col"><span class="label">COMPANY TPA</span>: <span class="value"><b></b></span></div>
        <div class="info-col"><span class="label"></span><span class="value"></span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">PATIENT NAME</span>: <span class="value"><b>${data.patient.name}</b></span></div>
        <div class="info-col"><span class="label">FINAL BILL NO.</span>: <span class="value">${data.billNo}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">ADDRESS</span>: <span class="value">${data.patient.address}</span></div>
        <div class="info-col"><span class="label">Bill Date</span>: <span class="value">${data.billDate}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label"></span> <span class="value">${data.patient.address2}</span></div>
        <div class="info-col"><span class="label">ADMISSION DATE</span>: <span class="value">${data.admissionDate}</span></div>
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label"></span> <span class="value">${data.patient.address3}</span></div>
         <div class="info-col"><span class="label">CONTACT NO</span>: <span class="value">${data.patient.contact}</span></div>
      </div>
       
      <div class="info-row">
        <div class="info-col"><span class="label">Age</span>: <span class="value">${data.patient.age}</span></div>
                <div class="info-col"><span class="label">Sex</span>: <span class="value">${data.patient.sex}</span></div>
      </div>
      <div class="info-row">
       
        <div class="info-col"><span class="label">DISCHARGE TYPE</span>: <span class="value">${data.dischargeType}</span></div>
        <div class="info-col"><span class="label">DISCHARGE DATE</span>: <span class="value">${data.dischargeDate}</span></div>
       
      </div>
      <div class="info-row">
        <div class="info-col"><span class="label">IPD NO</span>: <span class="value">${data.ipdNo}</span></div>
          <div class="info-col"><span class="label">UNDER DOCTOR</span>: <span class="value">${data.doctor}</span></div>
      </div>
       <div class="info-row">
        <div class="info-col"><span class="label">BED NO AT THE TIME OF DISCHARGE</span>: <span class="value">${data.bedNo}</span></div>
        <div class="info-col">
        <div style="border: 1px dotted black; width:100px; height:30px; display: flex; justify-content: center; ">
        <div style=" font-size: 12px; font-weight: 700;">URN NO</div>
        <div></div>
        </div>
        </div>
      </div>
    </div>
  `;

    // --- TABLE BUILDER HELPER ---
    const buildTable = (title, headers, rows, total) => {
      let tHtml = `<div class="section-title">${title}</div>`;
      tHtml += `<table class="data-table"><thead><tr>`;
      headers.forEach((h) => (tHtml += `<th>${h}</th>`));
      tHtml += `</tr></thead><tbody>`;

      rows.forEach((row) => {
        tHtml += `<tr>`;
        row.forEach((cell, index) => {
          // Align amounts to right (usually the last columns)
          const alignClass = index >= row.length - 2 ? "text-right" : "";
          tHtml += `<td class="${alignClass}">${cell}</td>`;
        });
        tHtml += `</tr>`;
      });

      if (total) {
        tHtml += `<tr><td colspan="${headers.length - 1}" class="text-right"><b>Total:</b></td><td class="text-right"><b>${total}</b></td></tr>`;
      }
      tHtml += `</tbody></table>`;
      return tHtml;
    };

    // --- RENDER SECTIONS ---

    // 1. Bed Charges
    html += buildTable(
      "BED CHARGES",
      ["DATE", "BED NO", "DAY", "BED RATE", "AMOUNT"],
      data.bedCharges.rows,
      data.bedCharges.total,
    );

    // 2. Doctor Visit
    html += buildTable(
      "DOCTOR VISIT",
      ["DATE", "DOCTOR'S VISIT", "QTY", "RATE", "AMOUNT"],
      data.doctorVisits.rows,
      data.doctorVisits.total,
    );

    // 3. Services (Split into general and medicine/investigation if needed, following PDF flow)
    // Page 1 ends roughly here in original, but we flow continuously for web print

    // AMT IN (Critical Care) section from PDF
    if (data.criticalCare && data.criticalCare.rows.length > 0) {
      html += buildTable(
        "AMT. IN (Rs.)",
        ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
        data.criticalCare.rows,
        data.criticalCare.total,
      );
    }

    // General Services (Attendant, O2, etc)
    html += buildTable(
      "OTHER SERVICES & PROCEDURES",
      ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
      data.services.rows,
      data.services.total,
    );

    // Medicine
    html += buildTable(
      "MEDICINE",
      ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
      data.medicine.rows,
      data.medicine.total,
    );

    // Investigation
    html += buildTable(
      "INVESTIGATION",
      ["DATE", "SERVICE (PATHOLOGY & RADIOLOGY)", "QTY", "RATE", "AMOUNT"],
      data.investigations.rows,
      data.investigations.total,
    );

    // Service Charges
    html += buildTable(
      "SERVICE CHARGES",
      ["DATE", "SERVICE", "QTY", "RATE", "AMOUNT"],
      data.serviceCharges.rows,
      data.serviceCharges.total,
    );

    // --- FOOTER / TOTALS ---
    html += `
    <div class="footer-totals">
      <div class="total-row">
        <span class="total-label">Grand Total :</span>
        <span>${data.grandTotal}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Less Advance Paid :</span>
        <span>${data.advancePaid}</span>
      </div>
      <div class="total-row">
        <span class="total-label">INSURANCE APPROVAL AMOUNT:</span>
        <span>${data.insuranceApproval}</span>
      </div>
       <div class="total-row" style="justify-content: flex-start; margin-top: 10px; font-weight: normal;">
        Non Payble Other Chrg: ${data.nonPayable}
      </div>
    </div>
    <!--
     <div class="signature-section">
        <div>For: <b>LORDS HEALTH CARE</b></div>
        <div style="margin-top: 5px;">E. & O. E.</div>
        <div class="admin-sig">Billed By: ${data.billedBy}</div>
    </div>
    -->
<div style="margin-top:30px; display:flex; align-items:center; gap:100px;">
  <span>For:</span>
  <span style="margin-top:0; margin-left:350px;">E. & O. E.</span>
  <span style="margin-top:0;">Billed By: ${data.billedBy}</span>
</div>


  `;

    html += `</div></body></html>`;

    // Create Window and Print
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      // Allow styles to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      alert("Pop-up blocked. Please allow pop-ups for this website to print.");
    }
  };

  // this is for handlePrint2
  const defaultInvoiceData = {
    hospital: {
      name: "LORDS HEALTH CARE",
      address:
        "13/3, Circular 2nd Bye Lane, Kona Expressway, (Near Jumanabala Balika Vidyalaya) Shibpur, Howrah-711 102, W.B.",
      phone: "8272904444",
      helpline: "7003378414",
      email: "patientdesk@lordshealthcare.org",
      website: "www.lordshealthcare.org",
    },
    patient: {
      name: admData.PatientName || "",
      address: `${admData.Add1 || ""}, ${admData.Add2 || ""}, ${admData.Add3 || ""},`,
      doctor: "ABHRA MUKHOPADHYAY",
      billNo: fbData?.BillNo || "",
      age: `${admData.Age || ""} ${admData.AgeType || "Y"}`,
      sex: admData.Sex || "",
      admDate:
        `${admData?.AdmitionDate?.split("T")[0]?.split("-")?.reverse()?.join("/")} Time: ${
          admData?.AdmitionTime || ""
        }` || "",
      disDate:
        `${fbData?.BillDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || ""} Time: ${fbData?.ReleaseTime || ""}` ||
        "",
      regdNo: admData.AdmitionNo || "",
      billDate:
        fbData?.BillDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
    },
    groups: [
      {
        caseDate: "19/06/2023",
        caseNo: "IP/2324/01892",
        subtotal: "3,550.00",
        tests: [
          {
            name: "COMPLETE HAEMOGRAM",
            deliveryDate: "20/06/2023",
            rate: "350.00",
          },
          { name: "URINE R/E", deliveryDate: "19/06/2023", rate: "150.00" },
          { name: "URINE FOR C/S", deliveryDate: "22/06/2023", rate: "400.00" },
          {
            name: "C-REACTIVE PROTEIN (CRP) QUANTITATIVE",
            deliveryDate: "20/06/2023",
            rate: "500.00",
          },
          { name: "ECG", deliveryDate: "19/06/2023", rate: "250.00" },
          {
            name: "CHEST PA VIEW (DIGITAL)",
            deliveryDate: "21/06/2023",
            rate: "400.00",
          },
          { name: "ABG TEST", deliveryDate: "19/06/2023", rate: "1,500.00" },
        ],
      },
      {
        caseDate: "20/06/2023",
        caseNo: "IP/2324/01894",
        subtotal: "500.00",
        tests: [
          { name: "SODIUM", deliveryDate: "20/06/2023", rate: "250.00" },
          { name: "POTASSIUM", deliveryDate: "20/06/2023", rate: "250.00" },
        ],
      },
      {
        caseDate: "20/06/2023",
        caseNo: "IP/2324/01896",
        subtotal: "3,300.00",
        tests: [
          {
            name: "USG OF WHOLE ABDOMEN (FEMALE)",
            deliveryDate: "21/06/2023",
            rate: "1,800.00",
          },
          {
            name: "ECHOCARDIOGRAPHY",
            deliveryDate: "21/06/2023",
            rate: "1,500.00",
          },
        ],
      },
      {
        caseDate: "20/06/2023",
        caseNo: "IP/2324/01899",
        subtotal: "150.00",
        tests: [
          {
            name: "BLOOD GROUPING & RH FACTOR",
            deliveryDate: "20/06/2023",
            rate: "150.00",
          },
        ],
      },
      {
        caseDate: "21/06/2023",
        caseNo: "IP/2324/01946",
        subtotal: "8,550.00",
        tests: [
          { name: "URINE R/E", deliveryDate: "21/06/2023", rate: "150.00" },
          { name: "URINE FOR C/S", deliveryDate: "24/06/2023", rate: "400.00" },
          {
            name: "BLOOD CULTURE AEROBIC",
            deliveryDate: "25/06/2023",
            rate: "1,500.00",
          },
          {
            name: "MRI BRAIN 1.5",
            deliveryDate: "22/06/2023",
            rate: "6,500.00",
          },
        ],
      },
      {
        caseDate: "22/06/2023",
        caseNo: "IP/2324/01969",
        subtotal: "3,050.00",
        tests: [
          {
            name: "COMPLETE HAEMOGRAM",
            deliveryDate: "23/06/2023",
            rate: "350.00",
          },
          { name: "CREATININE", deliveryDate: "22/06/2023", rate: "150.00" },
          { name: "SODIUM", deliveryDate: "22/06/2023", rate: "250.00" },
          { name: "POTASSIUM", deliveryDate: "22/06/2023", rate: "250.00" },
          { name: "UREA", deliveryDate: "22/06/2023", rate: "150.00" },
          {
            name: "CHEST PA VIEW (DIGITAL)",
            deliveryDate: "23/06/2023",
            rate: "400.00",
          },
          { name: "ABG TEST", deliveryDate: "23/06/2023", rate: "1,500.00" },
        ],
      },
    ],
    grandTotal: "19,100.00",
  };
  // this print final bill diagnosis report
  function handlePrint2(invoiceData) {
    // 1. Create a hidden iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    // 2. Define Styles (Replicating PDF Layout)
    const styles = `
        <style>
            @media print { @page { margin: 10mm; } }
            body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #000; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px; }
            .hospital-name { font-size: 20pt; font-weight: bold; margin-bottom: 2px; }
            .hospital-info { font-size: 9pt; line-height: 1.3; }

            .patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 10pt; }
            .grid-item { display: flex; }
            .label { font-weight: bold; width: 120px; }
            .separator { margin-right: 5px; }

            .title { text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 15px; font-size: 12pt; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 8px 4px; text-align: left; font-size: 9pt; }
            td { padding: 4px; vertical-align: top; font-size: 9pt; }

            .group-header-row td { border-top: 1px dashed #ccc; padding-top: 10px; font-weight: bold; }
            .amount-col { text-align: right; width: 100px; }
            .rate-col { text-align: right; width: 80px; }

            .footer { margin-top: 30px; font-size: 10pt; }
            .grand-total { text-align: right; font-weight: bold; font-size: 12pt; border-top: 1px solid #000; padding-top: 5px; }
            .footer-bottom { display: flex; justify-content: space-between; margin-top: 50px; font-size: 9pt; }
        </style>
    `;

    // 3. Generate HTML Content
    let tableRows = "";
    invoiceData.groups.forEach((group) => {
      // Group Header Row (Case Date/No)
      tableRows += `
            <tr class="group-header-row">
                <td>${group.caseDate}</td>
                <td colspan="3">${group.caseNo}</td>
                <td class="amount-col"></td>
            </tr>
        `;

      // Test Rows
      group.tests.forEach((test, index) => {
        tableRows += `
                <tr>
                    <td></td>
                    <td><small style="margin-right:3px;">${index + 1}</small>  ${test.name}</td>
                    <td>${test.deliveryDate}</td>
                    <td class="rate-col">${test.rate}</td>
                    <td class="amount-col"></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="rate-col"></td>
                    <td class="amount-col">${group.subtotal}</td>
                </tr>
            `;
      });
    });

    const htmlContent = `
        <html>
        <head>${styles}</head>
        <body>
            <div class="header">
                <div class="hospital-name">${invoiceData.hospital.name}</div>
                <div class="hospital-info">
                    ${invoiceData.hospital.address}<br>
                    Phone No.: ${invoiceData.hospital.phone} HELPLINE-${invoiceData.hospital.helpline}<br>
                    E-mail: ${invoiceData.hospital.email}, Website: ${invoiceData.hospital.website}
                </div>
            </div>

            <div class="patient-grid">
                <div>
                    <div class="grid-item"><span class="label">Patient Name</span><span class="separator">:</span> <span>${invoiceData.patient.name}</span></div>
                    <div class="grid-item"><span class="label">Address</span><span class="separator">:</span> <span>${invoiceData.patient.address}</span></div>
                    <div class="grid-item"><span class="label">Under Dr.</span><span class="separator">:</span> <span>${invoiceData.patient.doctor}</span></div>
                    <div class="grid-item"><span class="label">Final Bill No.</span><span class="separator">:</span> <span>${invoiceData.patient.billNo}</span></div>
                </div>
                <div style="padding-left: 50px;">
                    <div class="grid-item"><span class="label">Age</span><span class="separator">:</span> <span>${invoiceData.patient.age}</span></div>
                    <div class="grid-item"><span class="label">Sex</span><span class="separator">:</span> <span>${invoiceData.patient.sex}</span></div>
                    <div class="grid-item"><span class="label">Adm. Date</span><span class="separator">:</span> <span>${invoiceData.patient.admDate}</span></div>
                    <div class="grid-item"><span class="label">Dis. Date</span><span class="separator">:</span> <span>${invoiceData.patient.disDate}</span></div>
                    <div class="grid-item"><span class="label">Regd. No.</span><span class="separator">:</span> <span>${invoiceData.patient.regdNo}</span></div>
                    <div class="grid-item"><span class="label">Bill Date</span><span class="separator">:</span> <span>${invoiceData.patient.billDate}</span></div>
                </div>
            </div>

            <div class="title">DIAGNOSTIC BREAK-UP (FINAL COPY)</div>

            <table>
                <thead>
                    <tr>
                        <th>Case Date</th>
                        <th>CaseNo / Test</th>
                        <th>Delivery Date</th>
                        <th class="rate-col">Test Rate</th>
                        <th class="amount-col">AMOUNT IN (Rs.)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="grand-total">Grand Total: ${invoiceData.grandTotal}</div>

            <div class="footer-bottom">
                <div>Printed By: Admin</div>
                <div>E. & O. E.</div>
            </div>
        </body>
        </html>
    `;

    // 4. Write to iframe and print
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe); // Cleanup
    }, 500);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("name: ", name, " value:", value);
    setFbData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchAuthUsers();
    fetchFB(id);
    fetchAllDoctors();
    fetchDept();
    fetchCashLess();
  }, []);

  useEffect(() => {
    const { Approval, Discount, ReciptAmt, Remarks, CashlessId } = fbData;
    setFormData({ Approval, Discount, ReciptAmt, Remarks, CashlessId });
  }, [fbData]);

  return (
    <div className="main-content" style={styles.container}>
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center px-2 py-1 mb-1 border">
        <div className="d-flex align-items-center">
          <span
            style={{
              color: "red",
              fontWeight: "bold",
              fontStyle: "italic",
              marginRight: "5px",
            }}
          >
            <h6>e</h6>
          </span>
          <span className="fw-bold">
            <h6>Final Billing</h6>
          </span>
        </div>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              navigate("/fina-bill-list2");
            }}
          >
            <i className="fa-solid fa-arrow-left me-1"></i>Back
          </button>
        </div>
      </div>

      <div className="container-fluid p-0">
        <div className="row g-1">
          {/* LEFT MAIN PANEL */}
          <div className="col-12 col-lg-9">
            {/* 1. BILL DETAIL SECTION */}
            <div style={styles.sectionGroup}>
              <span style={styles.legend} className="bg-primary">
                Bill Detail
              </span>
              <div className="mt-2 row g-1 align-items-center mb-1">
                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Bill No</span>
                </div>
                <div className="col-md-2 col-8">
                  <input
                    type="text"
                    style={styles.input}
                    value={fbData?.BillNo || ""}
                  />
                </div>

                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Date</span>
                </div>
                <div className="col-md-2 col-8">
                  <input
                    type="date"
                    style={styles.input}
                    value={fbData?.BillDate?.split("T")[0] || ""}
                  />
                </div>

                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Bill Time</span>
                </div>
                <div className="col-md-1 col-8">
                  <input
                    type="text"
                    style={styles.input}
                    value={fbData?.BillTime || ""}
                  />
                </div>

                <div className="col-md-2 col-4 text-end">
                  <span style={styles.label}>Discharge Time</span>
                </div>
                <div className="col-md-2 col-8">
                  <input
                    type="text"
                    style={styles.input}
                    value={fbData?.ReleaseTime || ""}
                  />
                </div>
              </div>

              <div className="row g-1 align-items-center">
                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Indoor/[O].T.</span>
                </div>
                <div className="col-md-1 col-2">
                  <input
                    type="text"
                    style={styles.input}
                    value={fbData?.BillType || ""}
                  />
                </div>
                <div className="col-md-3 col-6">
                  <input
                    type="text"
                    style={styles.input}
                    value={admData.PatientName || ""}
                  />
                </div>

                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Deptment</span>
                </div>
                <div className="col-md-2 col-8">
                  <input
                    type="text"
                    style={styles.input}
                    value={
                      deptIndoor?.find(
                        (item) => item.DepartmentId == admData.DepartmentId,
                      )?.Department || ""
                    }
                  />
                </div>

                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Entry By</span>
                </div>
                <div className="col-md-1 col-8">
                  <input
                    type="text"
                    style={styles.input}
                    // defaultValue="Admin"
                    value={
                      authUserData?.find((item) => item.UserId == fbData.UserId)
                        ?.UserName || ""
                    }
                  />
                  {/* {console.log("hi: ", authUserData)} */}
                </div>

                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Current User</span>
                </div>
                <div className="col-md-1 col-8">
                  <input
                    type="text"
                    style={styles.input}
                    defaultValue="Admin"
                    value={
                      authUserData?.find((item) => item.UserId == loggedInUser)
                        ?.UserName || ""
                    }
                  />
                </div>
              </div>
            </div>

            {/* 2. PATIENT DETAIL SECTION */}
            <div style={styles.sectionGroup}>
              <span style={styles.legend} className="bg-primary">
                Patient Detail
              </span>
              <div className="mt-2 row g-1 align-items-center mb-1">
                <div className="col-md-2 col-4 text-end">
                  <span style={styles.label}>Admission No</span>
                </div>
                <div className="col-md-2 col-8">
                  <input
                    type="text"
                    style={styles.input}
                    value={admData.AdmitionNo || ""}
                  />
                </div>

                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Age</span>
                </div>
                <div className="col-md-1 col-8 d-flex gap-1">
                  <input
                    type="text"
                    style={styles.input}
                    value={admData.Age || ""}
                  />
                  <select style={styles.input} value={admData.AgeType}>
                    <option value={"Y"}>Y</option>
                    <option value={"M"}>M</option>
                    <option value={"D"}>D</option>
                  </select>
                </div>

                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Sex</span>
                </div>
                <div className="col-md-1 col-8">
                  <select style={styles.input} value={admData.Sex}>
                    <option value={"M"}>M</option>
                    <option value={"F"}>F</option>
                    <option value={"O"}>O</option>
                  </select>
                </div>

                <div className="col-md-2 col-4 text-end">
                  <span style={styles.label}>Marital Status[U/M]</span>
                </div>
                <div className="col-md-2 col-8 d-flex gap-1">
                  <select style={styles.input} value={admData.MStatus}>
                    <option value={"M"}>M</option>
                    <option value={"U"}>U</option>
                  </select>
                  <span style={styles.label}> Phone</span>
                  <input
                    type="text"
                    style={styles.input}
                    value={admData.PhoneNo}
                  />
                </div>
              </div>

              <div className="row g-1">
                {/* Address Block */}
                <div className="col-md-1 text-end pt-1">
                  <span style={styles.label}>Address</span>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    style={{ ...styles.input, marginBottom: "2px" }}
                    value={admData.Add1 || ""}
                  />
                  <input
                    type="text"
                    style={{ ...styles.input, marginBottom: "2px" }}
                    value={admData.Add2 || ""}
                  />
                  <input
                    type="text"
                    style={styles.input}
                    value={admData.Add3 || ""}
                  />
                </div>

                {/* Right side of Patient Detail */}
                <div className="col-md-7">
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-4 text-end">
                      <span style={styles.label}>Admission Date</span>
                    </div>
                    <div className="col-4">
                      <input
                        type="date"
                        style={styles.input}
                        value={admData?.AdmitionDate?.split("T")[0] || ""}
                      />
                    </div>
                    <div className="col-2 text-end">
                      <span style={styles.label}>Admission Time</span>
                    </div>
                    <div className="col-2">
                      <input
                        type="text"
                        style={styles.input}
                        value={admData?.AdmitionTime || ""}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-4 text-end">
                      <span style={styles.label}>Company</span>
                    </div>
                    <div className="col-8">
                      <input
                        type="text"
                        style={styles.input}
                        // value={admData?.CompanyId}
                        value={
                          cashLessData?.find(
                            (item) => item.CashlessId == admData?.CompanyId,
                          )?.Cashless || ""
                        }
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center">
                    <div className="col-4 text-end">
                      <span style={styles.label}>Cashless</span>
                    </div>
                    <div className="col-8">
                      <input
                        type="text"
                        style={styles.input}
                        // value={admData?.CashLessId }
                        value={
                          cashLessData?.find(
                            (item) => item.CashlessId == admData.CashlessId,
                          )?.Cashless || ""
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 & 4. TABLES (Bill Head Detail & Bed Detail) */}
            <div className="row g-1">
              {/* Bill Head Table */}
              <div className="col-md-5">
                <div style={styles.sectionGroup} className="h-100">
                  <span className="bg-primary" style={styles.legend}>
                    Bill Head Detail
                  </span>
                  <div
                    className="mt-2 table-responsive"
                    style={{ height: "150px", backgroundColor: "#dadddff6" }}
                  >
                    <table
                      className="table table-bordered table-sm mb-0"
                      style={{ fontSize: "11px" }}
                    >
                      <thead>
                        <tr>
                          <th style={styles.tableHeader}>Head</th>
                          <th style={styles.tableHeader} className="text-end">
                            Amount
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* {console.log(billHeadData)} */}
                        {billHeadData.length === 0 ? (
                          <tr>
                            <td
                              colSpan="2"
                              className="text-center py-2 text-muted"
                            >
                              No data found
                            </td>
                          </tr>
                        ) : (
                          billHeadData.map((row, idx) => (
                            <tr
                              key={idx}
                              style={
                                row.HeadName === selectedBillHead
                                  ? styles.tableRowSelected
                                  : {}
                              }
                              onClick={() => {
                                setSelectedBillHead(row.HeadName);
                              }}
                            >
                              <td>{row.HeadName}</td>
                              <td className="text-end">{row.Amount1}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* Bed Detail Table */}
              <div className="col-md-7">
                <div style={styles.sectionGroup} className="h-100">
                  {/* Legend missing in image for this box, but grouping exists */}
                  <div
                    className="table-responsive"
                    style={{ height: "150px", backgroundColor: "#444" }}
                  >
                    {selectedBillHead && renderRightSideTable(selectedBillHead)}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. TOTALS & CALCULATIONS */}
            <div style={{ ...styles.sectionGroup, padding: "5px" }}>
              <div className="row g-1">
                {/* Left Column Totals */}
                <div className="col-md-4">
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={styles.label}>Total Receipt</span>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        style={styles.input}
                        value={
                          billHeadData?.find(
                            (item) => item.HeadName == "Less Advance Receipt",
                          )?.Amount1 || ""
                        }
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={styles.label}>Net Balance</span>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        style={styles.input}
                        value={fbData?.BillAmt || 0}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={styles.label}>Approval Amt.</span>
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        style={styles.input}
                        value={Number(fbData?.Approval) || 0}
                        name="Approval"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={styles.label}>Patient Party</span>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        style={styles.input}
                        value={fbData?.PatiectPartyAmt || 0}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={styles.label}>Discount</span>
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        style={styles.input}
                        value={fbData?.Discount || 0}
                        name="Discount"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={styles.label}>Receipt Amt.</span>
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        style={styles.input}
                        value={fbData?.ReciptAmt || 0}
                        name="ReciptAmt"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center">
                    <div className="col-6 text-end">
                      <span style={{ ...styles.label, color: "red" }}>
                        Net Amount (Not found)
                      </span>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        style={{
                          ...styles.input,
                          fontWeight: "bold",
                          color: "red",
                        }}
                        defaultValue="-4800.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Middle Column Totals */}
                <div className="col-md-4">
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={styles.label}>Tax Inclusive(Y/N)</span>
                    </div>
                    <div className="col-6">
                      <select value={fbData?.TaxInc}>
                        <option value={""}>--</option>
                        <option value={"Y"}>Y</option>
                        <option value={"N"}>N</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={styles.label}>Service Tax</span>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        style={styles.input}
                        value={fbData?.ServiceTax || 0}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={styles.label}>Corp. Payble</span>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        style={styles.input}
                        value={fbData?.CorpPabley || 0}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={{ ...styles.label, color: "red" }}>
                        (Not found) Net Bill
                      </span>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        style={{
                          ...styles.input,
                          fontWeight: "bold",
                          color: "red",
                        }}
                        defaultValue="4800.00"
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={{ ...styles.label, color: "red" }}>
                        Party Payable
                      </span>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        style={styles.input}
                        value={fbData?.PatiectPartyAmt || 0}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center">
                    <div className="col-6 text-end">
                      <span style={styles.label}> (Not found) GST Amount</span>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        style={styles.input}
                        defaultValue="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column Totals */}
                <div className="col-md-4">
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-4 text-end">
                      <span style={styles.label}>Payment Party</span>
                    </div>
                    <div className="col-8">
                      <select
                        style={styles.input}
                        value={fbData?.CashlessId}
                        name="CashlessId"
                        onChange={handleChange}
                      >
                        <option value={""}>---</option>
                        {cashLessData?.map((item, indx) => (
                          <option key={indx} value={item.CashlessId}>
                            {item.Cashless}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-8 text-end">
                      <span style={styles.label}>Approval amt</span>
                    </div>
                    <div className="col-4">
                      <input
                        type="text"
                        style={styles.input}
                        value={fbData?.Approval || 0}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-8 text-end">
                      <span style={styles.label}>Patient Party</span>
                    </div>
                    <div className="col-4">
                      <input
                        type="text"
                        style={styles.input}
                        value={fbData?.PatiectPartyAmt || 0}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-3 text-end">
                      <span style={styles.label}> (Not found)CORP Disc</span>
                    </div>
                    <div className="col-3">
                      <input
                        type="text"
                        style={styles.input}
                        defaultValue="0.00"
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-3 text-end">
                      <span style={styles.label}>HOSP Disc</span>
                    </div>
                    <div className="col-3">
                      <input
                        type="number"
                        style={styles.input}
                        value={fbData?.Discount || 0}
                        name="Discount"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="row g-1">
                    <div className="col-3 text-end">
                      <span style={styles.label}>Remarks</span>
                    </div>
                    <div className="col-9">
                      <textarea
                        style={{ ...styles.input, height: "40px" }}
                        value={fbData?.Remarks || ""}
                        name="Remarks"
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. MODE OF PAYMENT */}
            <div style={styles.sectionGroup}>
              <span style={styles.legend} className="bg-primary">
                Mode of Payment (Not found)
              </span>
              <div className="mt-2 row g-1 align-items-center">
                <div className="col-md-3 col-12 d-flex align-items-center">
                  <span style={styles.label}> [C]ash/[B]ank/[R]Card</span>
                  <select value={fbData?.CB}>
                    <option value={""}>-</option>
                    <option value={"C"}>C</option>
                    <option value={"B"}>B</option>
                    <option value={"R"}>R</option>
                  </select>
                </div>
                <div className="col-md-3 col-6 d-flex align-items-center">
                  <span style={styles.label}>Chq/Card No</span>
                  <input
                    type="text"
                    style={styles.input}
                    value={fbData?.ChequeNo || ""}
                  />
                </div>
                <div className="col-md-3 col-6 d-flex align-items-center">
                  <span style={styles.label}>Date</span>
                  <input
                    type="text"
                    style={styles.input}
                    value={
                      fbData?.ChequeDt?.split("T")[0]
                        ?.split("-")
                        ?.reverse()
                        ?.join("/") || ""
                    }
                  />
                </div>
                <div className="col-md-3 col-12 d-flex align-items-center">
                  <span style={styles.label}>Bank Name</span>
                  <input
                    type="text"
                    style={styles.input}
                    value={fbData?.BankName || ""}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE PANEL */}
          <div className="col-12 col-lg-3 d-flex flex-column gap-2">
            {/* Barcode Area */}
            <div
              className="bg-primary p-2 text-center"
              style={{
                border: "1px solid white",
                minHeight: "100px",
                backgroundColor: "#0078D7",
              }}
            >
              {/* Placeholder for barcode */}
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "10px",
                  marginTop: "30px",
                }}
              >
                {admData.AdmitionNo ? (
                  <Barcode value={admData.AdmitionNo} />
                ) : null}
              </div>
            </div>

            {/* Advances */}
            <div className="row g-1 align-items-center">
              <div className="col-8 text-end">
                <span style={styles.label}>Diagnostic Adv Rcvd</span>
              </div>
              <div className="col-4">
                <input
                  type="text"
                  style={{ ...styles.input, textAlign: "right" }}
                  defaultValue="0.00"
                />
              </div>
            </div>
            <div className="row g-1 align-items-center">
              <div className="col-8 text-end">
                <span style={styles.label}>Med Adv Received</span>
              </div>
              <div className="col-4">
                <input
                  type="text"
                  style={{ ...styles.input, textAlign: "right" }}
                  defaultValue="0.00"
                />
              </div>
            </div>

            {/* Remarks Big */}
            <div>
              <span
                style={{ color: "red", fontWeight: "bold", fontSize: "14px" }}
              >
                Remarks
              </span>
              <textarea
                style={{
                  width: "100%",
                  height: "150px",
                  border: "1px solid #999",
                }}
                value={admData?.Remarks || ""}
              ></textarea>
            </div>

            {/* Side Buttons */}
            <div className="d-flex gap-1 justify-content-end">
              <button className="btn btn-sm btn-primary">
                All Money Receipt
              </button>
              <button className="btn btn-sm btn-primary">PrintMRct</button>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <input type="checkbox" />
              <span className="fw-bold bg-white px-1">Submited</span>
            </div>

            <input type="text" style={{ ...styles.input, height: "30px" }} />

            <div>
              <button className="btn btn-sm btn-primary">Update</button>
            </div>
          </div>
        </div>
      </div>

      {/* 8. FOOTER BUTTON BAR */}
      <div
        className="mt-2 p-1 d-flex justify-content-between align-items-center"
        style={{ backgroundColor: "primary", borderTop: "1px solid white" }}
      >
        <div className="d-flex flex-wrap gap-1">
          {/* <button className="btn btn-sm btn-primary">Modify</button> */}
          {/* <button className="btn btn-sm btn-primary">New</button> */}
          {/* <button className="btn btn-sm btn-primary">Edit</button> */}
          <button className="btn btn-sm btn-primary" onClick={handleSave}>
            Save
          </button>
          {/* <button className="btn btn-sm btn-primary">Delete</button> */}
          <button className="btn btn-sm btn-primary"
          onClick={handleUndo}
          >Undo</button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              handlePrint1(billData1); // this print final bill summary

              // handlePrint2(defaultInvoiceData); // this print final bill daigo
            }}
          >
            Print
          </button>
          <button className="btn btn-sm btn-primary"
          onClick={() => {
              navigate("/fina-bill-list2");
            }}
          >Exit</button>
        </div>
      </div>
    </div>
  );

  // safe copy
  // return (
  //   <div className="main-content" style={styles.container}>
  //     {/* Top Header */}
  //     <div className="d-flex justify-content-between align-items-center px-2 py-1 mb-1 border">
  //       <div className="d-flex align-items-center">
  //         <span
  //           style={{
  //             color: "red",
  //             fontWeight: "bold",
  //             fontStyle: "italic",
  //             marginRight: "5px",
  //           }}
  //         >
  //           <h6>e</h6>
  //         </span>
  //         <span className="fw-bold">
  //           <h6>Final Billing</h6>
  //         </span>
  //       </div>
  //       <div className="d-flex align-items-center">
  //         <button
  //           className="btn btn-primary btn-sm"
  //           onClick={() => {
  //             navigate("/fina-bill-list2");
  //           }}
  //         >
  //           <i className="fa-solid fa-arrow-left me-1"></i>Back
  //         </button>
  //       </div>
  //     </div>

  //     <div className="container-fluid p-0">
  //       <div className="row g-1">
  //         {/* LEFT MAIN PANEL */}
  //         <div className="col-12 col-lg-9">
  //           {/* 1. BILL DETAIL SECTION */}
  //           <div style={styles.sectionGroup}>
  //             <span style={styles.legend} className="bg-primary">
  //               Bill Detail
  //             </span>
  //             <div className="mt-2 row g-1 align-items-center mb-1">
  //               <div className="col-md-1 col-4 text-end">
  //                 <span style={styles.label}>Bill No</span>
  //               </div>
  //               <div className="col-md-2 col-8">
  //                 <input
  //                   type="text"
  //                   style={styles.input}
  //                   defaultValue="F-000220/23-24"
  //                 />
  //               </div>

  //               <div className="col-md-1 col-4 text-end">
  //                 <span style={styles.label}>Date</span>
  //               </div>
  //               <div className="col-md-2 col-8">
  //                 <input
  //                   type="date"
  //                   style={styles.input}
  //                   defaultValue="2023-04-06"
  //                 />
  //               </div>

  //               <div className="col-md-1 col-4 text-end">
  //                 <span style={styles.label}>Bill Time</span>
  //               </div>
  //               <div className="col-md-1 col-8">
  //                 <input
  //                   type="text"
  //                   style={styles.input}
  //                   defaultValue="11:50 AM"
  //                 />
  //               </div>

  //               <div className="col-md-2 col-4 text-end">
  //                 <span style={styles.label}>Discharge Time</span>
  //               </div>
  //               <div className="col-md-2 col-8">
  //                 <input
  //                   type="text"
  //                   style={styles.input}
  //                   defaultValue="08:42 PM"
  //                 />
  //               </div>
  //             </div>

  //             <div className="row g-1 align-items-center">
  //               <div className="col-md-1 col-4 text-end">
  //                 <span style={styles.label}>Indoor/[O].T.</span>
  //               </div>
  //               <div className="col-md-1 col-2">
  //                 <input type="text" style={styles.input} defaultValue="I" />
  //               </div>
  //               <div className="col-md-3 col-6">
  //                 <input
  //                   type="text"
  //                   style={styles.input}
  //                   defaultValue="JAYANTI PAL"
  //                 />
  //               </div>

  //               <div className="col-md-1 col-4 text-end">
  //                 <span style={styles.label}>Deptment</span>
  //               </div>
  //               <div className="col-md-2 col-8">
  //                 <input type="text" style={styles.input} />
  //               </div>

  //               <div className="col-md-1 col-4 text-end">
  //                 <span style={styles.label}>Entry By</span>
  //               </div>
  //               <div className="col-md-1 col-8">
  //                 <input
  //                   type="text"
  //                   style={styles.input}
  //                   defaultValue="Admin"
  //                 />
  //               </div>

  //               <div className="col-md-1 col-4 text-end">
  //                 <span style={styles.label}>Current User</span>
  //               </div>
  //               <div className="col-md-1 col-8">
  //                 <input
  //                   type="text"
  //                   style={styles.input}
  //                   defaultValue="Admin"
  //                 />
  //               </div>
  //             </div>
  //           </div>

  //           {/* 2. PATIENT DETAIL SECTION */}
  //           <div style={styles.sectionGroup}>
  //             <span style={styles.legend} className="bg-primary">
  //               Patient Detail
  //             </span>
  //             <div className="mt-2 row g-1 align-items-center mb-1">
  //               <div className="col-md-2 col-4 text-end">
  //                 <span style={styles.label}>Admission No</span>
  //               </div>
  //               <div className="col-md-2 col-8">
  //                 <input
  //                   type="text"
  //                   style={styles.input}
  //                   defaultValue="A-000006/23-24"
  //                 />
  //               </div>

  //               <div className="col-md-1 col-4 text-end">
  //                 <span style={styles.label}>Age</span>
  //               </div>
  //               <div className="col-md-1 col-8 d-flex gap-1">
  //                 <input
  //                   type="text"
  //                   style={styles.input}
  //                   defaultValue="54.00"
  //                 />
  //                 <select style={styles.input}>
  //                   <option>Y</option>
  //                 </select>
  //               </div>

  //               <div className="col-md-1 col-4 text-end">
  //                 <span style={styles.label}>Sex</span>
  //               </div>
  //               <div className="col-md-1 col-8">
  //                 <select style={styles.input}>
  //                   <option>F</option>
  //                 </select>
  //               </div>

  //               <div className="col-md-2 col-4 text-end">
  //                 <span style={styles.label}>Marital Status</span>
  //               </div>
  //               <div className="col-md-1 col-8 d-flex gap-1">
  //                 <select style={styles.input}>
  //                   <option>M</option>
  //                 </select>
  //                 <span style={styles.label}>[U/M] Phone</span>
  //                 <input
  //                   type="text"
  //                   style={styles.input}
  //                   defaultValue="6290985279"
  //                 />
  //               </div>
  //             </div>

  //             <div className="row g-1">
  //               {/* Address Block */}
  //               <div className="col-md-1 text-end pt-1">
  //                 <span style={styles.label}>Address</span>
  //               </div>
  //               <div className="col-md-4">
  //                 <input
  //                   type="text"
  //                   style={{ ...styles.input, marginBottom: "2px" }}
  //                   defaultValue="SANTOSHBATI, MAJU"
  //                 />
  //                 <input
  //                   type="text"
  //                   style={{ ...styles.input, marginBottom: "2px" }}
  //                   defaultValue="JAGATBALLAVPUR"
  //                 />
  //                 <input
  //                   type="text"
  //                   style={styles.input}
  //                   defaultValue="HOWRAH-711414"
  //                 />
  //               </div>

  //               {/* Right side of Patient Detail */}
  //               <div className="col-md-7">
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-4 text-end">
  //                     <span style={styles.label}>Admission Date</span>
  //                   </div>
  //                   <div className="col-4">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="03/Apr/2023"
  //                     />
  //                   </div>
  //                   <div className="col-2 text-end">
  //                     <span style={styles.label}>Admission Time</span>
  //                   </div>
  //                   <div className="col-2">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="11:40 AM"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-4 text-end">
  //                     <span style={styles.label}>Company</span>
  //                   </div>
  //                   <div className="col-8">
  //                     <input type="text" style={styles.input} />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center">
  //                   <div className="col-4 text-end">
  //                     <span style={styles.label}>Cashless</span>
  //                   </div>
  //                   <div className="col-8">
  //                     <input type="text" style={styles.input} />
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* 3 & 4. TABLES (Bill Head Detail & Bed Detail) */}
  //           <div className="row g-1">
  //             {/* Bill Head Table */}
  //             <div className="col-md-5">
  //               <div style={styles.sectionGroup} className="h-100">
  //                 <span className="bg-primary" style={styles.legend}>
  //                   Bill Head Detail
  //                 </span>
  //                 <div
  //                   className="mt-2 table-responsive"
  //                   style={{ height: "150px", backgroundColor: "white" }}
  //                 >
  //                   <table
  //                     className="table table-bordered table-sm mb-0"
  //                     style={{ fontSize: "11px" }}
  //                   >
  //                     <thead>
  //                       <tr>
  //                         <th style={styles.tableHeader}>Head</th>
  //                         <th style={styles.tableHeader} className="text-end">
  //                           Amount
  //                         </th>
  //                       </tr>
  //                     </thead>
  //                     <tbody>
  //                       {billHeadData.map((row, idx) => (
  //                         <tr
  //                           key={idx}
  //                           style={
  //                             row.head === "Bed Charges"
  //                               ? styles.tableRowSelected
  //                               : {}
  //                           }
  //                         >
  //                           <td>{row.head}</td>
  //                           <td className="text-end">{row.amount}</td>
  //                         </tr>
  //                       ))}
  //                     </tbody>
  //                   </table>
  //                 </div>
  //               </div>
  //             </div>
  //             {/* Bed Detail Table */}
  //             <div className="col-md-7">
  //               <div style={styles.sectionGroup} className="h-100">
  //                 {/* Legend missing in image for this box, but grouping exists */}
  //                 <div
  //                   className="table-responsive"
  //                   style={{ height: "150px", backgroundColor: "#444" }}
  //                 >
  //                   <table
  //                     className="table table-bordered table-sm mb-0"
  //                     style={{ fontSize: "11px" }}
  //                   >
  //                     <thead>
  //                       <tr>
  //                         <th style={styles.tableHeader}>Date</th>
  //                         <th style={styles.tableHeader}>Bed</th>
  //                         <th style={styles.tableHeader} className="text-end">
  //                           Rate
  //                         </th>
  //                         <th style={styles.tableHeader} className="text-end">
  //                           Attendant
  //                         </th>
  //                         <th style={styles.tableHeader} className="text-end">
  //                           RMO
  //                         </th>
  //                       </tr>
  //                     </thead>
  //                     <tbody>
  //                       {bedDetailData.map((row, idx) => (
  //                         <tr key={idx} style={styles.tableRowSelected}>
  //                           <td>{row.date}</td>
  //                           <td>{row.bed}</td>
  //                           <td className="text-end">{row.rate}</td>
  //                           <td className="text-end">{row.att}</td>
  //                           <td className="text-end">{row.rmo}</td>
  //                         </tr>
  //                       ))}
  //                     </tbody>
  //                   </table>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* 5. TOTALS & CALCULATIONS */}
  //           <div style={{ ...styles.sectionGroup, padding: "5px" }}>
  //             <div className="row g-1">
  //               {/* Left Column Totals */}
  //               <div className="col-md-4">
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-6 text-end">
  //                     <span style={styles.label}>Total Receipt</span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="4800.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-6 text-end">
  //                     <span style={styles.label}>Net Balance</span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-6 text-end">
  //                     <span style={styles.label}>Approval Amt.</span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-6 text-end">
  //                     <span style={styles.label}>Patient Party</span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-6 text-end">
  //                     <span style={styles.label}>Discount</span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-6 text-end">
  //                     <span style={styles.label}>Receipt Amt.</span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center">
  //                   <div className="col-6 text-end">
  //                     <span style={{ ...styles.label, color: "red" }}>
  //                       Net Amount
  //                     </span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={{
  //                         ...styles.input,
  //                         fontWeight: "bold",
  //                         color: "red",
  //                       }}
  //                       defaultValue="-4800.00"
  //                     />
  //                   </div>
  //                 </div>
  //               </div>

  //               {/* Middle Column Totals */}
  //               <div className="col-md-4">
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-6 text-end">
  //                     <span style={styles.label}>Tax Inclusive(Y/N)</span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={{ ...styles.input, width: "30px" }}
  //                       defaultValue="N"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-6 text-end">
  //                     <span style={styles.label}>Service Tax</span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-6 text-end">
  //                     <span style={styles.label}>Corp. Payble</span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-6 text-end">
  //                     <span style={{ ...styles.label, color: "red" }}>
  //                       Net Bill
  //                     </span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={{
  //                         ...styles.input,
  //                         fontWeight: "bold",
  //                         color: "red",
  //                       }}
  //                       defaultValue="4800.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-6 text-end">
  //                     <span style={{ ...styles.label, color: "red" }}>
  //                       Party Payable
  //                     </span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={{ ...styles.input, color: "red" }}
  //                       defaultValue="-4800.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center">
  //                   <div className="col-6 text-end">
  //                     <span style={styles.label}>GST Amount</span>
  //                   </div>
  //                   <div className="col-6">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //               </div>

  //               {/* Right Column Totals */}
  //               <div className="col-md-4">
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-4 text-end">
  //                     <span style={styles.label}>Payment Party</span>
  //                   </div>
  //                   <div className="col-8">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="DR SHASHANK SUKLA"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-8 text-end">
  //                     <span style={styles.label}>Approval amt</span>
  //                   </div>
  //                   <div className="col-4">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-8 text-end">
  //                     <span style={styles.label}>Patient Party</span>
  //                   </div>
  //                   <div className="col-4">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-3 text-end">
  //                     <span style={styles.label}>CORP Disc</span>
  //                   </div>
  //                   <div className="col-3">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1 align-items-center mb-1">
  //                   <div className="col-3 text-end">
  //                     <span style={styles.label}>HOSP Disc</span>
  //                   </div>
  //                   <div className="col-3">
  //                     <input
  //                       type="text"
  //                       style={styles.input}
  //                       defaultValue="0.00"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="row g-1">
  //                   <div className="col-3 text-end">
  //                     <span style={styles.label}>Remarks</span>
  //                   </div>
  //                   <div className="col-9">
  //                     <textarea
  //                       style={{ ...styles.input, height: "40px" }}
  //                     ></textarea>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* 6. MODE OF PAYMENT */}
  //           <div style={styles.sectionGroup}>
  //             <span style={styles.legend} className="bg-primary">
  //               Mode of Payment
  //             </span>
  //             <div className="mt-2 row g-1 align-items-center">
  //               <div className="col-md-3 col-12 d-flex align-items-center">
  //                 <span style={styles.label}>[C]ash/[B]ank/[R]Card</span>
  //                 <input
  //                   type="text"
  //                   style={{ ...styles.input, width: "30px", margin: "0 5px" }}
  //                   defaultValue="C"
  //                 />
  //               </div>
  //               <div className="col-md-3 col-6 d-flex align-items-center">
  //                 <span style={styles.label}>Chq/Card No</span>
  //                 <input type="text" style={styles.input} />
  //               </div>
  //               <div className="col-md-3 col-6 d-flex align-items-center">
  //                 <span style={styles.label}>Date</span>
  //                 <input
  //                   type="text"
  //                   style={styles.input}
  //                   defaultValue="01/Jan/2000"
  //                 />
  //               </div>
  //               <div className="col-md-3 col-12 d-flex align-items-center">
  //                 <span style={styles.label}>Bank Name</span>
  //                 <input type="text" style={styles.input} />
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         {/* RIGHT SIDE PANEL */}
  //         <div className="col-12 col-lg-3 d-flex flex-column gap-2">
  //           {/* Barcode Area */}
  //           <div
  //             className="bg-primary p-2 text-center"
  //             style={{
  //               border: "1px solid white",
  //               minHeight: "100px",
  //               backgroundColor: "#0078D7",
  //             }}
  //           >
  //             {/* Placeholder for barcode */}
  //             <div
  //               style={{
  //                 backgroundColor: "#fff",
  //                 padding: "10px",
  //                 marginTop: "30px",
  //               }}
  //             >
  //               <div
  //                 style={{
  //                   height: "30px",
  //                   background:
  //                     "repeating-linear-gradient(90deg, black 0, black 2px, white 2px, white 4px)",
  //                 }}
  //               ></div>
  //               <div className="small fw-bold">A-000006/23-24</div>
  //             </div>
  //           </div>

  //           {/* Advances */}
  //           <div className="row g-1 align-items-center">
  //             <div className="col-8 text-end">
  //               <span style={styles.label}>Diagnostic Adv Rcvd</span>
  //             </div>
  //             <div className="col-4">
  //               <input
  //                 type="text"
  //                 style={{ ...styles.input, textAlign: "right" }}
  //                 defaultValue="0.00"
  //               />
  //             </div>
  //           </div>
  //           <div className="row g-1 align-items-center">
  //             <div className="col-8 text-end">
  //               <span style={styles.label}>Med Adv Received</span>
  //             </div>
  //             <div className="col-4">
  //               <input
  //                 type="text"
  //                 style={{ ...styles.input, textAlign: "right" }}
  //                 defaultValue="0.00"
  //               />
  //             </div>
  //           </div>

  //           {/* Remarks Big */}
  //           <div>
  //             <span
  //               style={{ color: "red", fontWeight: "bold", fontSize: "14px" }}
  //             >
  //               Remarks
  //             </span>
  //             <textarea
  //               style={{
  //                 width: "100%",
  //                 height: "150px",
  //                 border: "1px solid #999",
  //               }}
  //             ></textarea>
  //           </div>

  //           {/* Side Buttons */}
  //           <div className="d-flex gap-1 justify-content-end">
  //             <button className="btn btn-sm btn-primary">
  //               All Money Receipt
  //             </button>
  //             <button className="btn btn-sm btn-primary">PrintMRct</button>
  //           </div>

  //           <div className="d-flex gap-2 align-items-center">
  //             <input type="checkbox" />
  //             <span className="fw-bold bg-white px-1">Submited</span>
  //           </div>

  //           <input type="text" style={{ ...styles.input, height: "30px" }} />

  //           <div>
  //             <button className="btn btn-sm btn-primary">Update</button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     {/* 8. FOOTER BUTTON BAR */}
  //     <div
  //       className="mt-2 p-1 d-flex justify-content-between align-items-center"
  //       style={{ backgroundColor: "primary", borderTop: "1px solid white" }}
  //     >
  //       <div className="d-flex flex-wrap gap-1">
  //         <button className="btn btn-sm btn-primary">Modify</button>
  //         <button className="btn btn-sm btn-primary">New</button>
  //         <button className="btn btn-sm btn-primary">Edit</button>
  //         <button className="btn btn-sm btn-primary">Save</button>
  //         <button className="btn btn-sm btn-primary">Delete</button>
  //         <button className="btn btn-sm btn-primary">Undo</button>
  //         <button className="btn btn-sm btn-primary">Print</button>
  //         <button className="btn btn-sm btn-primary">Exit</button>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default FinalBilling;
