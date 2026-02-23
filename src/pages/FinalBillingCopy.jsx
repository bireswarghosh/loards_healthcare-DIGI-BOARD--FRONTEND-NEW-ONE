import React, { useEffect, useRef, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import JsBarcode from "jsbarcode";
import { toast } from "react-toastify";
import RetroModal from "./FinalBillPrintPopUp";

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
      minHeight: "100vh",
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
      padding: "1px 2px",
      fontSize: "11px",
      height: "30%",
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
  console.log("moe", mode_type);
  // console.log("id1: ",id)
  id = encodeURIComponent(id || "");
  const navigate = useNavigate();
  const [mode, setMode] = useState(mode_type ? mode_type : "add");

  const [fbMode, setFbMode] = useState("estimate"); // 'final or estimate'

  const [printType, setPrintType] = useState(""); // this will decide will which pdf will be print

  // const [fbData, setFbData] = useState({});
  const [showPrintModal, setShowPrintModal] = useState(false);

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

  const [allDiagWithTest, setAllDiagWithTest] = useState([]);

  const [diagData, setDiagData] = useState([]);

  const [formData, setFormData] = useState({
    Approval: "",
    Discount: "",
    ReciptAmt: "",
    Remarks: "",
    CashlessId: "",
  });

  const [totalReceipt, setTotalReceipt] = useState(0);
  const [netBal, setNetBal] = useState(0);

  const [btnLoading, setBtnLoading] = useState(false);

  const handleSave = async () => {
    console.log("update: ", formData);
    console.log(mode);
    console.log(mode_type);
    if (mode_type == "edit") {
      try {
        setBtnLoading(true);
        console.log("update: ", formData);
        const res = await axiosInstance.put(
          `/fb/${fbData.FinalBillId}`,
          formData,
        );
        if (res.data.success) {
          fetchFB(id);
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log("error updating form: ", error);
      } finally {
        setBtnLoading(false);
      }
    }
  };

  const handleUndo = async () => {
    try {
      fetchFB(id);
    } catch (error) {
      console.log("error fetching fb detail: ", error);
    }
  };

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
      const res = await axiosInstance.get(`/case01/admition/${id}`);
      console.log("Diag data: ", res.data.data);
      res.data.success ? setDiagData(res.data.data.reverse()) : setDiagData([]);
    } catch (error) {
      console.log("error fetching diago charge: ", error);
    }
  };

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
    console.log("id3: ", id);

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

        const total = res.data.data.details?.finalbilldtl?.reduce(
          (sum, item) => sum + Number(item.Amount1 || 0),
          0,
        );

        setNetBal(
          total -
            res.data.data.details?.finalbilldtl?.find((item) => item.SlNo == 9)
              ?.Amount1 || 0,
        );
        setTotalReceipt(total);
        if (res.data.data.details?.finalbillalldtl) {
          setOcDeatails(
            filterCharges(res.data.data.details?.finalbillalldtl, " "),
          );

          // setDiagData(
          //   filterCharges(
          //     res.data.data.details?.finalbillalldtl,
          //     "Diagnostic Charges",
          //   ),
          // );

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
          fetchAllDiadWithTest(res.data.data?.ReffId);
          fetchDiag(res.data.data?.ReffId);
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

  // this is for fetching all diag data with the tests by the admId
  const fetchAllDiadWithTest = async (id) => {
    try {
      const res = await axiosInstance.get(`/case01/admition-with-tests/${id}`);

      res.data.success
        ? setAllDiagWithTest(res.data.data)
        : setAllDiagWithTest([]);
    } catch (error) {
      console.log("Error fetching all diag with test by adm id: ", error);
    }
  };

  // this is for handlePrint1
  // this print final bill summary
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
      rows: doDetails.map((row) => [
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

    // criticalCare: {
    //   rows: [
    //     ["19/06/2023", "CRITICAL CARE DOCTOR FEES", "2", "600.00", "1,200.00"],
    //   ],
    //   total: "1,200.00",
    // },

    services: {
      rows: ocDeatails.map((row) => [
        row.AdmitionDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
        row.SubHead || "",
        row.Particular?.trim()?.split("x")[0] || "",
        row.Particular?.trim()?.split("x")[1] || "",
        row.Amount || "",
      ]),

      total:
        billHeadData.find((item) => item.HeadName == "Others Charges")
          ?.Amount1 || "0",
    },

    // medicine: {
    //   rows: [
    //     [
    //       "19/06/2023",
    //       "MEDICINE-LORDS PHARMACY",
    //       "1",
    //       "26,256.00",
    //       "26,256.00",
    //     ],
    //   ],
    //   total: "26,256.00",
    // },

    investigations: {
      rows: diagData.map((row) => [
        row.CaseDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
        row.CaseNo || "",
        // row.Particular?.trim()?.split("x")[0] || "",
        // row.Particular?.trim()?.split("x")[1] || "",
        row.Total || "",
      ]),
      total:
        billHeadData.find((item) => item.HeadName == "Diagnostic Charges")
          ?.Amount1 || "0",
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

    // grandTotal: "274,544.00",
    grandTotal:
      billHeadData.reduce((acc, cur) => acc + Number(cur.Amount1), 0) -
      larDetails.reduce((acc, curr) => acc + Number(curr.Amount), 0),
    // advancePaid: "33,000.00",
    advancePaid: larDetails.reduce((acc, curr) => acc + Number(curr.Amount), 0),
    insuranceApproval: Number(fbData?.Approval),
    nonPayable: "",
    // nonPayable: "1725", // not found
    billedBy: "Admin",
  };

  // this is for handlePrint2
  // this print final bill diagnosis report
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
      doctor:
        allDoctors.find((item) => item.DoctorId == admData?.UCDoctor1Id)
          ?.Doctor || "",
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
    // groups: [
    //   {
    //     caseDate: "19/06/2023",
    //     caseNo: "IP/2324/01892",
    //     subtotal: "3,550.00",
    //     tests: [
    //       {
    //         name: "COMPLETE HAEMOGRAM",
    //         deliveryDate: "20/06/2023",
    //         rate: "350.00",
    //       },
    //       { name: "URINE R/E", deliveryDate: "19/06/2023", rate: "150.00" },
    //       { name: "URINE FOR C/S", deliveryDate: "22/06/2023", rate: "400.00" },
    //       {
    //         name: "C-REACTIVE PROTEIN (CRP) QUANTITATIVE",
    //         deliveryDate: "20/06/2023",
    //         rate: "500.00",
    //       },
    //       { name: "ECG", deliveryDate: "19/06/2023", rate: "250.00" },
    //       {
    //         name: "CHEST PA VIEW (DIGITAL)",
    //         deliveryDate: "21/06/2023",
    //         rate: "400.00",
    //       },
    //       { name: "ABG TEST", deliveryDate: "19/06/2023", rate: "1,500.00" },
    //     ],
    //   },
    //   {
    //     caseDate: "20/06/2023",
    //     caseNo: "IP/2324/01894",
    //     subtotal: "500.00",
    //     tests: [
    //       { name: "SODIUM", deliveryDate: "20/06/2023", rate: "250.00" },
    //       { name: "POTASSIUM", deliveryDate: "20/06/2023", rate: "250.00" },
    //     ],
    //   },
    //   {
    //     caseDate: "20/06/2023",
    //     caseNo: "IP/2324/01896",
    //     subtotal: "3,300.00",
    //     tests: [
    //       {
    //         name: "USG OF WHOLE ABDOMEN (FEMALE)",
    //         deliveryDate: "21/06/2023",
    //         rate: "1,800.00",
    //       },
    //       {
    //         name: "ECHOCARDIOGRAPHY",
    //         deliveryDate: "21/06/2023",
    //         rate: "1,500.00",
    //       },
    //     ],
    //   },
    //   {
    //     caseDate: "20/06/2023",
    //     caseNo: "IP/2324/01899",
    //     subtotal: "150.00",
    //     tests: [
    //       {
    //         name: "BLOOD GROUPING & RH FACTOR",
    //         deliveryDate: "20/06/2023",
    //         rate: "150.00",
    //       },
    //     ],
    //   },
    //   {
    //     caseDate: "21/06/2023",
    //     caseNo: "IP/2324/01946",
    //     subtotal: "8,550.00",
    //     tests: [
    //       { name: "URINE R/E", deliveryDate: "21/06/2023", rate: "150.00" },
    //       { name: "URINE FOR C/S", deliveryDate: "24/06/2023", rate: "400.00" },
    //       {
    //         name: "BLOOD CULTURE AEROBIC",
    //         deliveryDate: "25/06/2023",
    //         rate: "1,500.00",
    //       },
    //       {
    //         name: "MRI BRAIN 1.5",
    //         deliveryDate: "22/06/2023",
    //         rate: "6,500.00",
    //       },
    //     ],
    //   },
    //   {
    //     caseDate: "22/06/2023",
    //     caseNo: "IP/2324/01969",
    //     subtotal: "3,050.00",
    //     tests: [
    //       {
    //         name: "COMPLETE HAEMOGRAM",
    //         deliveryDate: "23/06/2023",
    //         rate: "350.00",
    //       },
    //       { name: "CREATININE", deliveryDate: "22/06/2023", rate: "150.00" },
    //       { name: "SODIUM", deliveryDate: "22/06/2023", rate: "250.00" },
    //       { name: "POTASSIUM", deliveryDate: "22/06/2023", rate: "250.00" },
    //       { name: "UREA", deliveryDate: "22/06/2023", rate: "150.00" },
    //       {
    //         name: "CHEST PA VIEW (DIGITAL)",
    //         deliveryDate: "23/06/2023",
    //         rate: "400.00",
    //       },
    //       { name: "ABG TEST", deliveryDate: "23/06/2023", rate: "1,500.00" },
    //     ],
    //   },
    // ],
    printBy:
      authUserData?.find((item) => item.UserId == fbData.UserId)?.UserName ||
      "",
    groups: allDiagWithTest,
    // grandTotal: "19,100.00",
  };

  // this is for handlePrint3
  // this print final bill patient copy
  const billData2 = {
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
      rows: doDetails.map((row) => [
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

    // criticalCare: {
    //   rows: [
    //     ["19/06/2023", "CRITICAL CARE DOCTOR FEES", "2", "600.00", "1,200.00"],
    //   ],
    //   total: "1,200.00",
    // },

    services: {
      rows: ocDeatails.map((row) => [
        row.AdmitionDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
        row.SubHead || "",
        row.Particular?.trim()?.split("x")[0] || "",
        row.Particular?.trim()?.split("x")[1] || "",
        row.Amount || "",
      ]),

      total:
        billHeadData.find((item) => item.HeadName == "Others Charges")
          ?.Amount1 || "0",
    },

    // medicine: {
    //   rows: [
    //     [
    //       "19/06/2023",
    //       "MEDICINE-LORDS PHARMACY",
    //       "1",
    //       "26,256.00",
    //       "26,256.00",
    //     ],
    //   ],
    //   total: "26,256.00",
    // },

    investigations: {
      rows: diagData.map((row) => [
        row.CaseDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
        row.CaseNo || "",
        // row.Particular?.trim()?.split("x")[0] || "",
        // row.Particular?.trim()?.split("x")[1] || "",
        row.Total || "",
      ]),
      total:
        billHeadData.find((item) => item.HeadName == "Diagnostic Charges")
          ?.Amount1 || "0",
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

    // grandTotal: "274,544.00",
    grandTotal:
      billHeadData.reduce((acc, cur) => acc + Number(cur.Amount1), 0) -
      larDetails.reduce((acc, curr) => acc + Number(curr.Amount), 0),
    // advancePaid: "33,000.00",
    advancePaid: larDetails.reduce((acc, curr) => acc + Number(curr.Amount), 0),
    insuranceApproval: Number(fbData?.Approval),
    nonPayable: "",
    // nonPayable: "1725", // not found
    billedBy: "Admin",
  };

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
    // const { Approval, Discount, ReciptAmt, Remarks, CashlessId } = fbData;
    setFormData(fbData);
  }, [fbData]);

  useEffect(() => {
    setFbData((prev) => ({
      ...prev,
      PatiectPartyAmt: netBal - fbData.Approval,
    }));

    setFbData((prev) => ({
      ...prev,
      ReciptAmt: netBal - fbData.Approval - fbData.Discount,
    }));
  }, [fbData.Approval, netBal]);

  useEffect(() => {
    setFbData((prev) => ({
      ...prev,
      ReciptAmt: fbData.PatiectPartyAmt - fbData.Discount,
    }));
    // console.log("Hi dis: ",formData.Discount)
  }, [fbData.Discount]);

  return (
    <div className="min-vh-100 ">
      {" "}
      {/* Top Header */}
      <div className=" d-flex justify-content-between align-items-center px-2 py-3 mb-1 border">
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
        <div className="d-flex align-items-center gap-2">
          <button
            className={`btn ${fbMode === "estimate" ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={() => {
              setFbMode("estimate");
            }}
          >
            Estimate
          </button>
          <button
            className={`btn ${fbMode !== "estimate" ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={() => {
              setFbMode("final");
            }}
          >
            Final
          </button>
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
      <div className="min-vh-80 container-fluid p-0">
        <div className="row g-1 min-vh-80 ms-2">
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
                        value={totalReceipt}
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
                        value={netBal || 0}
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
                        // onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="row g-1 align-items-center">
                    <div className="col-6 text-end">
                      <span style={{ ...styles.label, color: "red" }}>
                        Net Amount
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
                        value={fbData?.ReciptAmt || 0}
                      />
                    </div>
                  </div>
                </div>

                {/* Middle Column Totals */}
                <div className="col-md-4">
                  {/* <div className="row g-1 align-items-center mb-1">
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
                  </div> */}
                  {/* <div className="row g-1 align-items-center mb-1">
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
                  </div> */}
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col-6 text-end">
                      <span style={styles.label}>Corp. Payble</span>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        style={styles.input}
                        value={fbData?.Approval || 0}
                      />
                    </div>
                  </div>
                  {/* <div className="row g-1 align-items-center mb-1">
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
                  </div> */}
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
                  {/* <div className="row g-1 align-items-center">
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
                  </div> */}
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
                      <span style={styles.label}>CORP Disc</span>
                    </div>
                    <div className="col-3">
                      <input
                        type="text"
                        style={styles.input}
                        value={fbData?.Approval || 0}
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

            {/* <div>
              <button className="btn btn-sm btn-primary">Update</button>
            </div> */}
          </div>
        </div>
      </div>
      {/* 8. FOOTER BUTTON BAR */}
      <div
        className="mt-4 p-1 d-flex justify-content-between align-items-center"
        style={{ backgroundColor: "primary", borderTop: "1px solid white" }}
      >
        <div className="d-flex flex-wrap gap-1">
          {/* <button className="btn btn-sm btn-primary">Modify</button> */}
          {/* <button className="btn btn-sm btn-primary">New</button> */}
          {/* <button className="btn btn-sm btn-primary">Edit</button> */}
          {fbMode === "final" && (
            <>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleSave}
                disabled={mode_type === "view" || btnLoading}
              >
                Save
              </button>
              {/* <button className="btn btn-sm btn-primary">Delete</button> */}
              <button
                className="btn btn-sm btn-primary"
                onClick={handleUndo}
                disabled={mode_type === "view"}
              >
                Undo
              </button>

              {/* this is print type selection modal */}
              {showPrintModal && (
                <RetroModal
                  showModal={showPrintModal}
                  setShowModal={setShowPrintModal}
                  printType={printType}
                  setPrintType={setPrintType}
                  billData1={billData1}
                  defaultInvoiceData={defaultInvoiceData}
                  billData2={billData2}
                />
              )}

              {console.log("Print type: ", printType)}
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setShowPrintModal((prev) => !prev);
                }}
              >
                Print
              </button>
            </>
          )}
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              navigate("/fina-bill-list2");
            }}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalBilling;