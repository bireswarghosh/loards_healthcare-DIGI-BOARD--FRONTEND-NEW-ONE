import React, { useEffect, useRef, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import JsBarcode from "jsbarcode";
import { toast } from "react-toastify";
import AsyncSelect from "react-select/async";
import { fi } from "date-fns/locale";

function AsyncApiSelect({
  api,
  value,
  onChange,
  placeholder = "Search...",
  labelKey = "label",
  valueKey = "value",
  searchKey = "admissionId",
  pageKey = "page",
  defaultPage = 1,
  isDisabled = false,
}) {
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (!value) return;

    // 🔥 value can be string OR object
    const q = typeof value === "string" ? value : value?.value;

    if (!q) return;

    // fetch(`${api}?${searchKey}=${encodeURIComponent(q)}`)
    fetch(`${api}?${searchKey}=${q}`)
      .then((res) => res.json())
      .then((res) => {
        const item = res?.data?.[0];
        if (!item) return;

        setSelectedOption({
          value: item[valueKey],
          label: item[labelKey],
          // label: "d",
        });
      });
  }, [value]);

  // ------------------------------------------------
  // 🔹 SEARCH
  // ------------------------------------------------
  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];

    const url = `${api}/search?${searchKey}=${inputValue}`;

    try {
      const res = await fetch(url);
      const result = await res.json();

      const list = result?.data || [];

      return list.map((item) => ({
        value: item[valueKey],
        // label: item[labelKey],
        label: `${item["PatientName"]} ----- ${item["AdmitionNo"]}`,
      }));
    } catch (err) {
      console.error("Search error:", err);
      return [];
    }
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "23px",
      height: "23px",
      fontSize: "2 px",
      backgroundColor: "rgb(253, 250, 250)",

      borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 .2rem rgba(13,110,253,.25)" : "none",
      "&:hover": {
        borderColor: "#86b7fe",
      },
    }),

    /* 🔥 DROPDOWN MENU */
    menu: (base) => ({
      ...base,
      backgroundColor: "primary", // black dropdown
      color: "#fff",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    menuList: (base) => ({
      ...base,
      padding: 0,
      zIndex: 9999,
    }),

    /* 🔥 EACH OPTION */
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#0d6efd" // selected = bootstrap blue
        : state.isFocused
          ? "#212529" // hover = dark gray
          : "#000", // normal = black
      color: "#fff",
      cursor: "pointer",
      fontSize: "0.875rem",
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "0 8px",
    }),

    indicatorsContainer: (base) => ({
      ...base,
      height: "31px",
    }),

    dropdownIndicator: (base) => ({
      ...base,
      padding: "2px",
    }),

    clearIndicator: (base) => ({
      ...base,
      padding: "2px",
    }),
  };
  return (
    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      // value={selectedOption}
      value={value ?? selectedOption}
      onChange={(opt) => {
        setSelectedOption(opt);
        onChange(opt ? opt : null);
      }}
      placeholder={placeholder}
      isClearable
      menuPortalTarget={document.body}
      menuPosition="fixed"
      styles={customStyles}
      isDisabled={isDisabled}
    />
  );
}

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

const FinalBillingAdd = () => {
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
  const navigate = useNavigate();
  const [mode, setMode] = useState(mode_type ? mode_type : "add");

  // convert time from 24 hours to 12 hours format
  function convertTo12Hour(timeString) {
    // timeString can be "14:30" or "14:30:55"
    const [hoursStr, minutesStr] = timeString.split(":");

    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr;

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 → 12

    return `${hours}:${minutes} ${ampm}`;
  }

  // convert time from 12 hours to 24 hours format
  function convertTo24Hour(time12) {
    // Example input: "2:35 PM"

    const [time, modifier] = time12.split(" "); // "2:35" , "PM"
    let [hours, minutes] = time.split(":");

    hours = parseInt(hours, 10);

    if (modifier === "PM" && hours !== 12) {
      hours = hours + 12;
    }

    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    // Format to HH:MM
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");

    return `${hh}:${mm}`;
  }

  const [fbMode, setFbMode] = useState("estimate"); // 'final or estimate'

  const [loggedInUser, setLoggedInUser] = useState(
    localStorage.getItem("userId") || "",
  );
  const [formData, setFormData] = useState({
    // FinalBillId: "",
    BillNo: "",
    // BillDate: "",
    BillDate: new Date().toISOString().split("T")[0],
    // BillTime: "",
    BillTime: convertTo12Hour(new Date().toTimeString().slice(0, 5)),
    ReleaseTime: convertTo12Hour(new Date().toTimeString().slice(0, 5)),
    BillType: "I",
    ReffId: "",
    Discount: 0,
    ReciptAmt: 0,
    CB: "",
    ChequeNo: "",
    ChequeDt: new Date().toISOString().split("T")[0],
    BankName: "",
    CashlessId: 0,
    Rename: "",
    UserId: loggedInUser || 0,
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

  const [finalBillDetail, setFinalBillDetail] = useState([
    {
      SlNo: 1,
      HeadName: "Bed Charges",
      Amount1: 0,
      Amount2: null,
      Amount3: 0,
    },
    {
      SlNo: 2,
      HeadName: "Others Charges",
      Amount1: 0,
      Amount2: null,
      Amount3: 0,
    },
    {
      SlNo: 3,
      HeadName: "O.T. Charges",
      Amount1: 0,
      Amount2: null,
      Amount3: 0,
    },
    {
      SlNo: 4,
      HeadName: "Doctor Charges",
      Amount1: 0,
      Amount2: null,
      Amount3: 0,
    },
    {
      SlNo: 5,
      HeadName: "Diagnostic Charges",
      Amount1: 0,
      Amount2: null,
      Amount3: 0,
    },
    {
      SlNo: 6,
      HeadName: "Medicine Charges",
      Amount1: 0,
      Amount2: null,
      Amount3: 0,
    },
    {
      SlNo: 7,
      HeadName: "Service Charges",
      Amount1: 0,
      Amount2: null,
      Amount3: 0,
    },
    {
      SlNo: 8,
      HeadName: "GST Amount",
      Amount1: 0,
      Amount2: null,
      Amount3: 0,
    },
    {
      SlNo: 9,
      HeadName: "Less Advance Receipt",
      Amount1: 0,
      Amount2: null,
      Amount3: 0,
    },
  ]);

  const [totalReceipt, setTotalReceipt] = useState(0);
  const [netBal, setNetBal] = useState(0);

  const [bedChargesData, setBedChargesData] = useState([]);
  const [fetchedAdmBedDetail, setFetchedAdmBedDetail] = useState([]);

  const [allOtherCharges, setAllOtherCharges] = useState([]);
  const [allOtherCharges1, setAllOtherCharges1] = useState({});

  const [otherChargesByAdmId, setOtherChargesByAdmId] = useState([]);
  const [otherChargesData, setOtherChargesData] = useState([]);

  const [docVisit, setDocVisit] = useState([]);
  const [diagData, setDiagData] = useState([]);
  const [lessAdvData, setLessAdvData] = useState([]);

  const [btnLoading, setBtnLoading] = useState(true);

  const [serviceCharge, setServiceCharge] = useState(0); // this is for discount
  const [serviceChrgCalculated, setServiceChrgCalculated] = useState(0); // this will be calculated by the discounted values of the beds and other charges master in which service charges is on

  const fetchServiceChargeValue = async () => {
    try {
      const res = await axiosInstance.get("/parameters");
      if (res.data.success) {
        const servChrg = res.data.data.DagP;
        setServiceCharge(servChrg);
      } else {
        setServiceCharge(0);
      }
    } catch (error) {
      console.log("error fetching paramete setup data: ", error);
    }
  };

  const handleSave = async () => {
    // console.log(mode);
    console.log("add: ", formData);
    setBtnLoading(true);
    try {
      if (mode === "add") {
        const res = await axiosInstance.post("/fb", formData);
        // console.log("Res after submit: ", res);
        if (res.data.success) {
          toast.success("Final Bill added successfully.");
        }
        await new Promise((resolve) => {
          setTimeout(resolve, 400);
        });
        navigate("/fina-bill-list2");
      }
    } catch (error) {
      console.log("error submitting the form data: ", error);
    } finally {
      setBtnLoading(false);
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
  // const fetchIpdMR = async (id) => {
  //   try {
  //     const res = await axiosInstance(`/moneyreceipt/admission/${id}`);
  //     res.data.success ? setLarDetails(res.data.data) : setLarDetails([]);
  //   } catch (error) {
  //     console.log("error fetching ipd money recipt detail by admId: ", error);
  //   }
  // };

  const fetchAllDoctors = async () => {
    try {
      const res = await axiosInstance.get("/doctors");
      res.data.success ? setAllDoctors(res.data.data) : setAllDoctors([]);
    } catch (error) {
      console.log("error fetching doctors: ", error);
    }
  };

  // this will fetch all the ipd other charges
  const fetchAllIPDOtherCharges = async () => {
    try {
      const res = await axiosInstance.get("/otherCharges");
      res.data.success
        ? setAllOtherCharges(res.data.data)
        : setAllOtherCharges([]);
      // console.log("All ipd oc: ", res.data.data);
    } catch (error) {
      console.log("Error fetching all ipd other charges: ", error);
    }
  };

  // this will fetch ot bill details by adm id
  const fetchOTC = async (id) => {
    try {
      const res = await axiosInstance.get(
        `/ot-bills/search/admission?admissionId=${id}`,
      );
      res.data.success ? setOtcDetails(res.data.data) : setOcDeatails([]);

      if (res.data.data.length != 0) {
        const arr = res.data.data;
        const newArr = arr.map((item) => ({
          slno: 400,
          PatientName: item.PatientName,
          Diseasecode: "",
          Disease: ".",
          Add1: "",
          Add2: "",
          Add3: "",
          Age: item.Age,
          AgeType: "",
          Sex: item.Sex,
          AdmitionDate: item.BillDate,
          PrintHead: "O.T. CHARGES",
          SubHead: item.OtBillNo,
          Particular: "",
          Amount: item.TotalAmt,
          TotAmount: item.TotalAmt,
          MyPic: "",
          scharge: 0,
        }));

        const totalOTCAmt = newArr.reduce((sum, item) => sum + item.Amount, 0);

        setFinalBillDetail((prev) =>
          prev.map((item) =>
            item.SlNo === 3 ? { ...item, Amount1: totalOTCAmt } : item,
          ),
        );

        setFormData((prev) => ({
          ...prev,
          details: {
            ...prev.details,
            finalbillalldtl: [...prev.details.finalbillalldtl, ...newArr],
          },
        }));
      }
    } catch (error) {
      console.log("error fetching otc by id:", error);
    }
  };

  // this will fetch the other charges details of particular patient by adm Id
  const fetchIPDOtherChargesByAdmId = async (id) => {
    try {
      const res = await axiosInstance.get(`/admission-charges/${id}`);
      res.data.success
        ? setOtherChargesByAdmId(res.data.data)
        : setOtherChargesByAdmId([]);
      // console.log("ipd oc by id: ", res.data.data);
      const filteredOC = transformOtherCharges(
        res.data.data,
        allOtherCharges,
        admData,
      );
      // console.log("hi: ", filteredOC);
      setOtherChargesData(filteredOC);
      const totalOtherCharges = filteredOC.reduce(
        (sum, item) => sum + item.Amount,
        0,
      );
      setFinalBillDetail((prev) =>
        prev.map((item) =>
          item.SlNo === 2 ? { ...item, Amount1: totalOtherCharges } : item,
        ),
      );

      setFormData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          finalbillalldtl: [...prev.details.finalbillalldtl, ...filteredOC],
        },
      }));

      // console.log("total oc :",totalOtherCharges)
    } catch (error) {
      console.log("Error fetching all ipd other charges: ", error);
    }
  };

  // fetching less adv using adm id
  const fetchLessAdv = async (id) => {
    try {
      const res = await axiosInstance.get(`/moneyreceipt/admission/${id}`);
      res.data.success ? setLessAdvData(res.data.data) : setLessAdvData([]);

      const arr = res.data.data;
      if (arr.length) {
        const totalLessAdv = arr.reduce((sum, item) => sum + item.Amount, 0);
        // console.log("totalLessAdv chrgs; ", totalLessAdv);
        const newArr = arr.map((item) => ({
          ...item,
          PrintHead: "Less Advance Receipt",
        }));

        // console.log("less adv data: ", newArr);

        setFormData((prev) => ({
          ...prev,
          details: {
            ...prev.details,
            finalbillalldtl: [...prev.details.finalbillalldtl, ...newArr],
          },
        }));

        setFinalBillDetail((prev) =>
          prev.map((item) =>
            item.SlNo === 9 ? { ...item, Amount1: totalLessAdv } : item,
          ),
        );
      }
    } catch (error) {
      console.log("error fetching less adv by admi id: ", error);
    }
  };

  // fetching diag charge using adm id
  const fetchDiag = async (id) => {
    try {
      const res = await axiosInstance.get(`/case01/admition/${id}`);
      // console.log("Diag data: ", res.data.data);

      res.data.success ? setDiagData(res.data.data) : setDiagData([]);

      const arr = res.data.data;
      if (arr.length) {
        const totalDiag = arr.reduce((sum, item) => sum + item.Total, 0);
        // console.log("total diag chrgs; ", totalDiag);

        const newArr = arr.map((item) => {
          // console.log("tie: ", item);
          const {
            PatientName,
            Diseasecode,
            Disease,
            Add1,
            Add2,
            Add3,
            Age,
            AgeType,
            Sex,
            Amount,
            TotAmount,
            MyPic,
            scharge,
            CaseDate,
          } = item;

          return {
            AdmitionDate: CaseDate,
            PatientName,
            Diseasecode,
            Disease,
            Add1,
            Add2,
            Add3,
            Age,
            AgeType,
            Sex,
            SubHead: item.CaseNo,
            Amount,
            TotAmount,
            MyPic,
            scharge,
            PrintHead: "Diagnostic Charges",
          };
        });

        setFormData((prev) => ({
          ...prev,
          details: {
            ...prev.details,
            finalbillalldtl: [...prev.details.finalbillalldtl, ...newArr],
          },
        }));

        setFinalBillDetail((prev) =>
          prev.map((item) =>
            item.SlNo === 5 ? { ...item, Amount1: totalDiag } : item,
          ),
        );
      }
    } catch (error) {
      console.log("error fetching diago charge: ", error);
    }
  };

  // fetch doctor visit by adm Id
  const fetchDoctVisitByAdmId = async (id) => {
    try {
      const res = await axiosInstance.get(
        `/doctor-visits/search/admission?admissionId=${id}`,
      );
      // console.log("doc visit: ", res.data.data);
      res.data.success ? setDocVisit(res.data.data) : setDocVisit([]);
      const data = res.data.data;

      const updatedDOC = data.map((item) => ({
        // FinalBillId: "",
        slno: 500,
        PatientName: admData?.PatientName,
        Diseasecode: "",
        Disease: ".",
        Add1: admData?.Add1,
        Add2: admData?.Add2,
        Add3: admData?.Add3,
        Age: admData?.Age,
        AgeType: admData?.AgeType,
        Sex: admData?.Sex,
        AdmitionDate: admData?.AdmitionDate,
        PrintHead: "DOCTOR VISIT",
        SubHead:
          allDoctors.find((d) => d.DoctorId == item.DoctorId)?.Doctor || "",
        Particular: `${item.NoOfVisit}   /VISIT X Rs. ${item.Rate}`,
        Amount: item.Amount,
        TotAmount: 0,
        MyPic: "",
        scharge: 0,
      }));
      const totalDOC = updatedDOC.reduce((sum, item) => sum + item.Amount, 0);

      setDoDetails(updatedDOC);
      // console.log("Update doc array: ",updatedDOC)
      // console.log("total doc : ",totalDOC)
      // console.log("hdihfdioh: ",finalBillDetail)

      setFinalBillDetail((prev) =>
        prev.map((item) =>
          item.SlNo === 4 ? { ...item, Amount1: totalDOC } : item,
        ),
      );

      setFormData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          finalbillalldtl: [...prev.details.finalbillalldtl, ...updatedDOC],
        },
      }));
    } catch (error) {
      console.log("error fetching doctor visit by adm id: ", error);
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
              {bedChargesData ? (
                bedChargesData.map((row, idx) => (
                  <tr key={idx} style={styles.tableRowSelected}>
                    <td>
                      {row.MyDate?.split("T")[0]
                        ?.split("-")
                        ?.reverse()
                        ?.join("/") || ""}
                    </td>
                    {/* <td>{row?.BedId}</td> */}
                    <td>
                      {fetchedAdmBedDetail.find(
                        (item) => item.BedId == row.BedId,
                      )?.Bed || ""}
                    </td>
                    <td className="text-end">{row?.BedRate}</td>
                    <td className="text-end">
                      {bedDetails.find((item) => item.BedId == row.BedId)
                        ?.AtttndantCh || 0}
                    </td>
                    <td className="text-end">
                      {fetchedAdmBedDetail.find(
                        (item) => item.BedId == row.BedId,
                      )?.RMOCh || 0}
                    </td>
                    {/* <td className="text-end">{row.rmo}</td> */}
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
              {otherChargesData ? (
                otherChargesData.map((row, idx) => (
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
                    <td>{row.OtBillNo || ""}</td>
                    <td>
                      {row.BillDate?.split("T")[0]
                        ?.split("-")
                        ?.reverse()
                        ?.join("/") || ""}
                    </td>
                    <td>{row.TotalAmt || 0}</td>
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
              {lessAdvData ? (
                lessAdvData.map((row, idx) => (
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

  // fetching ipd adm details
  const fetchAdm = async (id) => {
    if (!id) {
      return;
    }
    try {
      const response = await axiosInstance.get(`/admission/${id}`);
      // console.log("adm data: ", response.data.data);
      response.data.success ? setAdmData(response.data.data) : setAdmData({});
      setFormData((prev) => ({
        ...prev,
        ReffId: response.data.data?.AdmitionId,
      }));

      fetchDiag(id);
      fetchLessAdv(id);
    } catch (error) {
      console.log("error fetching: ", error);
    }
  };

  // fetch ipd dept
  const fetchDept = async () => {
    try {
      const response = await axiosInstance.get(`/departmentIndoor`);
      // console.log("dept data: ", response);
      response.data.success
        ? setDeptIndoor(response.data.data)
        : setDeptIndoor({});
    } catch (error) {
      console.log("error fetching dept: ", error);
    }
  };

  // day difference count
  function getDayDifference(startDate, endDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return Math.abs(diffDays);
  }

  // this create duplicate objects
  // function multiplyObject(obj, count) {
  //   return Array.from({ length: count }, () => ({
  //     ...obj, // shallow copy
  //   }));
  // }
  function multiplyObject(obj, count) {
    // console.log("tds1: ", obj);
    // console.log("tds: ", obj.MyDate);
    const baseDate = new Date(obj.MyDate);
    // console.log("td: ", baseDate);
    return Array.from({ length: count }, (_, index) => {
      const newDate = new Date(baseDate);
      newDate.setDate(baseDate.getDate() + index); // + index দিন

      return {
        ...obj,
        MyDate: newDate.toISOString(), // updated date
      };
    });
  }

  // fetch bed detail by Id
  const fetchBedsById = async (admId) => {
    try {
      // const promises = beds.map((item) =>
      //   axiosInstance.get(`/bedMaster/${item.BedId}`),
      // );

      // const results = await Promise.all(promises);

      // return results.map((res) => res?.data?.data);
      const res1 = await axiosInstance.get(`/admissions/${admId}`);
      // console.log("fethed bed by admid: ", res1.data.data.bedData);

      const arr = res1.data.data.bedData; // this all fetched bed by admId
      // console.log("hi bed: ", arr);
      const promises = arr.map((item) =>
        axiosInstance.get(`/bedMaster/${item.BedId}`),
      );

      const results = await Promise.all(promises);

      setFetchedAdmBedDetail(results.map((res) => res?.data?.data));
      // console.log(
      //   "res bed: ",
      //   results.map((res) => res?.data?.data),
      // );

      // filter the beds where service charge is Y

      const allBedsData = results.map((res) => res?.data?.data);

      const filterBedByServiceChrg = allBedsData.filter(
        (data) => data.ServiceCh === "Y",
      );

      // bed service chrg
      const bedServiceChrg = filterBedByServiceChrg.reduce(
        (sum, item) =>
          sum + Number(item.TotalCh) * (Number(serviceCharge) / 100),
        0,
      );
      setServiceChrgCalculated((prev) => prev + bedServiceChrg);
      // console.log("Beds with service charge on : ", filterBedByServiceChrg);

      const newA = arr.map((item) =>
        getDayDifference(item.AdmitionDate, item.ReleaseDate),
      ); // this is the all bed count with respect to adm and release date

      // console.log("newa : ", newA);
      let allBedsUpTodayDate = arr.map((item, index) =>
        multiplyObject(
          {
            AdmitionId: item?.AdmitionId,
            NoofDays: 1,
            MyDate: item?.AdmitionDate,
            ReleaseDate: item?.ReleaseDate,
            BedId: item.BedId,
            BedRate: item.ToDayRate,
            CGST: 0,
            SGST: 0,
          },
          newA[index],
        ),
      );

      const singleArray = allBedsUpTodayDate.flat();
      // console.log("all bed uptoday1 : ", singleArray);
      const totalBedRate = singleArray.reduce(
        (sum, item) => sum + item.BedRate,
        0,
      );
      // console.log("total bed rate: ", totalBedRate);
      setFinalBillDetail((prev) =>
        prev.map((item) =>
          item.SlNo === 1 ? { ...item, Amount1: totalBedRate } : item,
        ),
      );

      setFormData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          finalbillbeddtl: [...prev.details.finalbillbeddtl, ...singleArray],
        },
      }));

      setBedChargesData(singleArray);
    } catch (err) {
      console.error("Error while fetching bed data:", err);
      throw err;
    }
  };

  const onChange = (e) => {
    // console.log("hi I am on change", e);
    fetchAdm(e.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log("name: ", name, " value:", value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // this function will filter the ipd other charges details by id from all ipd other charges and make the structure as required
  function transformOtherCharges(
    otherChargesByAdmId,
    allOtherCharges,
    patientInfo,
  ) {
    // filtering other charges which have service charge on

    const ocWithFullDetails = otherChargesByAdmId.map(
      (item) => allOtherCharges1[item.OtherChargesId],
    );
    // const ocWithFullDetails = otherChargesByAdmId
    const ocWithServiceChrgOn = ocWithFullDetails.filter(
      (item) => item.ServiceCh === "Y",
    );

    const ocServiceChargeCalculated = ocWithServiceChrgOn.reduce(
      (sum, item) => sum + Number(item.Rate) * (Number(serviceCharge) / 100),
      0,
    );

    // console.log("filterd oc with service charge on: ", ocWithServiceChrgOn);
    // console.log("Calculated oc service charge: ", ocServiceChargeCalculated);

    setServiceChrgCalculated((prev) => prev + ocServiceChargeCalculated);
    return otherChargesByAdmId.map((item, index) => {
      // const matched = allOtherCharges.find(
      //   (oc) => oc.OtherChargesId == item.OtherChargesId,
      // );

      // console.log("matched", matched);
      return {
        slno: index + 1,
        PatientName: patientInfo?.PatientName || "",
        Diseasecode: patientInfo?.Diseasecode || "",
        // Disease: patientInfo?.DiseaseId|| ".",
        Disease: "",
        Add1: patientInfo?.Add1 || "",
        Add2: patientInfo?.Add2 || "",
        Add3: patientInfo?.Add3 || "",
        Age: patientInfo?.Age || "",
        AgeType: patientInfo?.AgeType || "",
        Sex: patientInfo?.Sex || "",
        AdmitionDate: patientInfo?.AdmitionDate || "",
        PrintHead: " ",
        // SubHead: matched?.OtherCharges || "",
        SubHead: allOtherCharges1[item.OtherChargesId]?.OtherCharges || "",
        Particular: `   ${item.Qty} x Rs. ${item.Rate.toFixed(2)} `,
        Amount: item.Amount,
        TotAmount: 0,
        MyPic: "",
        scharge:
          allOtherCharges1[item.OtherChargesId]?.ServiceCh === "Y" ? 1 : 0,
        // scharge: matched?.ServiceCh === "Y" ? 1 : 0,
      };
    });
  }

  useEffect(() => {
    if (Object.keys(admData).length) {
      // console.log("adm data1: ", admData);

      fetchBedsById(admData?.AdmitionId, admData?.BedId);
      // console.log("Adm date:", admData?.AdmitionDate);
      fetchOTC(admData?.AdmitionId);
      fetchIPDOtherChargesByAdmId(admData?.AdmitionId);

      fetchDoctVisitByAdmId(admData?.AdmitionId);

      setTimeout(() => {
        setBtnLoading(false);
      }, 5000);
    }
  }, [admData]);

  useEffect(() => {
    fetchServiceChargeValue();
    fetchAuthUsers();
    // fetchFB(id);
    fetchAllIPDOtherCharges();
    fetchAllDoctors();
    fetchDept();
    fetchCashLess();
  }, []);

  useEffect(() => {
    if (allOtherCharges.length) {
      const obj = allOtherCharges.reduce((acc, item) => {
        acc[item.OtherChargesId] = item;
        return acc;
      }, {});
      // console.log("objd: ", obj);
      setAllOtherCharges1(obj);
    }
  }, [allOtherCharges]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...formData.details,
        finalbilldtl: finalBillDetail,
      },
    }));
  }, [finalBillDetail]);

  useEffect(() => {
    // console.log("Final Bill detail testing: ", finalBillDetail);
    const total = finalBillDetail.reduce(
      (sum, item) => sum + Number(item.Amount1 || 0),
      0,
    );
    // console.log("Total final bill is : ", total);
    setNetBal(
      total - finalBillDetail.find((item) => item.SlNo == 9)?.Amount1 || 0,
    );

    setTotalReceipt(total);
  }, [finalBillDetail]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      PatiectPartyAmt: netBal - formData.Approval,
    }));

    setFormData((prev) => ({
      ...prev,
      ReciptAmt: netBal - formData.Approval - formData.Discount,
    }));
  }, [formData.Approval, netBal]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ReciptAmt: formData.PatiectPartyAmt - formData.Discount,
    }));
    // console.log("Hi dis: ", formData.Discount);
  }, [formData.Discount]);

  useEffect(() => {
    // console.log("Service charge calculated", serviceChrgCalculated);

    if (serviceChrgCalculated == 0) {
      return;
    }

    const p = {
      slno: 999999999999999,
      PatientName: admData?.PatientName || "",
      Diseasecode: admData?.Diseasecode || "",
      // Disease: patientInfo?.DiseaseId|| ".",
      Disease: "",
      Add1: admData?.Add1 || "",
      Add2: admData?.Add2 || "",
      Add3: admData?.Add3 || "",
      Age: admData?.Age || "",
      AgeType: admData?.AgeType || "",
      Sex: admData?.Sex || "",
      AdmitionDate: admData?.AdmitionDate || "",
      PrintHead: "SERVICE CHARGES",
      SubHead: "SERVICE CHARGES",
      Particular: "",
      Amount: serviceChrgCalculated,
      TotAmount: 0,
      MyPic: "",
      scharge: 0,
    };

    setScDetail([p])

    const RemoveDuplicateSC = formData.details.finalbillalldtl.filter(item=>item.slno!=999999999999999)

     setFormData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          finalbillalldtl: [...RemoveDuplicateSC, p],
        },
      }));

      setFinalBillDetail((prev) =>
          prev.map((item) =>
            item.SlNo === 7 ? { ...item, Amount1:serviceChrgCalculated } : item,
          ),
        );

  }, [serviceChrgCalculated]);

  return (
    <div className="min-vh-100 ">
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
          <div className="col-12 col-lg-9 ">
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
                    // value={formData?.BillNo || ""}
                    value={formData?.BillNo || ""}
                  />
                </div>

                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Date</span>
                </div>
                <div className="col-md-2 col-8">
                  <input
                    type="date"
                    style={styles.input}
                    // value={formData?.BillDate?.split("T")[0] || ""}
                    name="BillDate"
                    value={formData?.BillDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Bill Time</span>
                </div>
                <div className="col-md-2 col-8">
                  <input
                    type="time"
                    style={styles.input}
                    name="BillTime"
                    // value={formData?.BillTime || ""}
                    value={convertTo24Hour(formData?.BillTime) || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        BillTime: convertTo12Hour(e.target.value),
                      }));
                    }}
                  />
                </div>

                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Discharge Time</span>
                </div>
                <div className="col-md-2 col-8">
                  <input
                    type="time"
                    style={styles.input}
                    name="ReleaseTime"
                    // value={formData?.ReleaseTime || ""}
                    value={convertTo24Hour(formData?.ReleaseTime) || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        ReleaseTime: convertTo12Hour(e.target.value),
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="row g-1 align-items-center mb-2">
                <div className="col-md-1 col-4 text-end">
                  <span style={styles.label}>Indoor/[O].T.</span>
                </div>
                <div className="col-md-1 col-2">
                  <input
                    type="text"
                    style={styles.input}
                    value={formData?.BillType || ""}
                  />
                </div>
                <div className="col-md-3 col-6">
                  {/* <input
                    type="text"
                    style={styles.input}
                    value={admData.PatientName || ""}
                  /> */}

                  <AsyncApiSelect
                    api={"https://lords-backend.onrender.com/api/v1/admission"}
                    searchKey={"name"}
                    labelKey="PatientName"
                    valueKey="AdmitionId"
                    onChange={onChange}
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
                      authUserData?.find((item) => item.UserId == loggedInUser)
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
                    // defaultValue="Admin"
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

              <div className="row g-1 mb-2">
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
                        {/* {billHeadData.length === 0 ? ( */}
                        {finalBillDetail.length === 0 ? (
                          <tr>
                            <td
                              colSpan="2"
                              className="text-center py-2 text-muted"
                            >
                              No data found
                            </td>
                          </tr>
                        ) : (
                          // billHeadData.map((row, idx) => (
                          finalBillDetail.map((row, idx) => (
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
            <div
              style={{ ...styles.sectionGroup, padding: "5px" }}
              className=""
            >
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
                        // value={totalReceipt}
                        value={finalBillDetail.find(item=>item.SlNo==9)?.Amount1 || 0}
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
                        value={Number(formData?.Approval) || 0}
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
                        value={formData?.PatiectPartyAmt || 0}
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
                        value={formData?.Discount || 0}
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
                        value={formData?.ReciptAmt || 0}
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
                        value={formData?.ReciptAmt || 0}
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
                      <select
                        value={formData?.TaxInc}
                        name="TaxInc"
                        onChange={handleChange}
                      >
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
                        value={formData?.ServiceTax || 0}
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
                        value={formData?.Approval || 0}
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
                        value={formData?.PatiectPartyAmt || 0}
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
                        value={formData?.CashlessId}
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
                        value={formData?.Approval || 0}
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
                        value={formData?.PatiectPartyAmt || 0}
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
                        value={formData?.Approval || 0}
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
                        value={formData?.Discount || 0}
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
                        value={formData?.Remarks || ""}
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
                  <select
                    value={formData?.CB}
                    name="CB"
                    onChange={handleChange}
                  >
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
                    value={formData?.ChequeNo || ""}
                    name="ChequeNo"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 col-6 d-flex align-items-center">
                  <span style={styles.label}>Date</span>
                  <input
                    type="date"
                    style={styles.input}
                    value={formData?.ChequeDt}
                    name="ChequeDt"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 col-12 d-flex align-items-center">
                  <span style={styles.label}>Bank Name</span>
                  <input
                    type="text"
                    style={styles.input}
                    value={formData?.BankName || ""}
                    name="BankName"
                    onChange={handleChange}
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
                minHeight: "30%",
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
                  height: "25vh",
                  border: "1px solid #999",
                }}
                value={admData?.Remarks || ""}
              ></textarea>
            </div>
            {/* Side Buttons */}
            {/* <div className="d-flex gap-1 justify-content-end mt-2">
              <button className="btn btn-sm btn-primary">
                All Money Receipt
              </button>
              <button className="btn btn-sm btn-primary">PrintMRct</button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <input type="checkbox" />
              <span className="fw-bold bg-white px-1">Submited</span>
            </div> */}
            {/* <input type="text" style={{ ...styles.input, height: "20%" }} /> */}
            {/* <textarea
              style={{
                width: "100%",
                height: "30%",
                border: "1px solid #999",
              }}
              // value={admData?.Remarks || ""}
            ></textarea> */}
            <div>
              {/* <button className="btn btn-sm btn-primary">Update</button> */}
            </div>
          </div>
        </div>
      </div>
      {/* 8. FOOTER BUTTON BAR */}
      <div
        className=" mt-4 p-1 d-flex justify-content-between align-items-center"
        style={{ backgroundColor: "primary", borderTop: "1px solid white" }}
      >
        <div className="d-flex flex-wrap gap-1">
        { fbMode === "final" && <button
            className="btn btn-sm btn-primary"
            onClick={handleSave}
            disabled={btnLoading}
          >
            Save
          </button>}

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

export default FinalBillingAdd;
