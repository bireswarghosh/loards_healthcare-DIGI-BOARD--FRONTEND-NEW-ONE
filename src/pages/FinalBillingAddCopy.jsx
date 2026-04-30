
import React, { useEffect, useRef, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import JsBarcode from "jsbarcode";
import { toast } from "react-toastify";
import AsyncSelect from "react-select/async";
import { fi } from "date-fns/locale";
import { handlePrint5 } from "./FinalBillPrintFunc";
import RetroModal from "./FinalBillPrintPopUp";

const CustomModal = ({ show = true, setShow, setOk }) => {
  if (!show) return null; // hide modal if not open

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">Indoor</h5>
            </div>

            {/* Body */}
            <div className="modal-body">
              <p>Bill due Payment Party can not be left Blank</p>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShow(false);
                  setOk(false);
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setOk(true);
                  setShow(false);
                }}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

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

  // useEffect(() => {
  //   if (!value) return;

  //   // 🔥 value can be string OR object
  //   const q = typeof value === "string" ? value : value?.value;

  //   if (!q) return;

  //   // fetch(`${api}?${searchKey}=${encodeURIComponent(q)}`)

  //   axiosInstance.get(`${api}?${searchKey}=${q}`)
  //     .then((res) => res.json())
  //     .then((res) => {
  //       const item = res?.data?.[0];
  //       if (!item) return;

  //       setSelectedOption({
  //         value: item[valueKey],
  //         label: item[labelKey],
  //         // label: "d",
  //       });
  //     });
  // }, [value]);

  useEffect(() => {
    if (!value) return;

    const q = typeof value === "string" ? value : value?.value;
    if (!q) return;

    axiosInstance
      .get(`${api}?${searchKey}=${q}`)
      .then((res) => {
        const item = res?.data?.data?.[0];
        if (!item) return;

        setSelectedOption({
          value: item[valueKey],
          label: item[labelKey],
        });
      })
      .catch(console.error);
  }, [value]);

  // ------------------------------------------------
  // 🔹 SEARCH
  // ------------------------------------------------
  // const loadOptions = async (inputValue) => {
  //   if (!inputValue) return [];

  //   const url = `${api}/search?${searchKey}=${inputValue}`;

  //   try {
  //     const res = await fetch(url);
  //     const result = await res.json();

  //     const list = result?.data || [];

  //     return list.map((item) => ({
  //       value: item[valueKey],
  //       // label: item[labelKey],
  //       label: `${item["PatientName"]} ----- ${item["AdmitionNo"]}`,
  //     }));
  //   } catch (err) {
  //     console.error("Search error:", err);
  //     return [];
  //   }
  // };

  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];

    try {
      const res = await axiosInstance.get(
        `${api}/search?${searchKey}=${inputValue}`,
      );

      const list = res?.data?.data || [];

      return list.map((item) => ({
        value: item[valueKey],
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
    if (!time12) return "00:00";
    const normalized = time12.trim().replace(/(\d)(AM|PM)/i, "$1 $2");
    const [time, modifier] = normalized.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);
    if (modifier?.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // Convert UTC ISO string to local YYYY-MM-DD
  function toLocalDateStr(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  const [firstBedRate, setFirstBedRate] = useState(null);
  const [fetchedAdmBedDetail, setFetchedAdmBedDetail] = useState([]);

  const [allOtherCharges, setAllOtherCharges] = useState([]);
  const [allOtherCharges1, setAllOtherCharges1] = useState({});

  const [otherChargesByAdmId, setOtherChargesByAdmId] = useState([]);
  const [otherChargesData, setOtherChargesData] = useState([]);

  const [docVisit, setDocVisit] = useState([]);
  const [diagData, setDiagData] = useState([]);
  const [diagDtl, setDiagDtl] = useState([]);
  const [lessAdvData, setLessAdvData] = useState([]);

  const [btnLoading, setBtnLoading] = useState(true);

  const [serviceCharge, setServiceCharge] = useState(0); // this is for discount
  const [serviceChrgCalculated, setServiceChrgCalculated] = useState(0); // this will be calculated by the discounted values of the beds and other charges master in which service charges is on
  const [bedServiceChrg, setBedServiceChrg] = useState(0);
  const [ocServiceChrg, setOcServiceChrg] = useState(0);

  const [allTests, setAllTests] = useState({});

  const [larAlertShow, setLarAlertShow] = useState(false);
  const [larAlertOk, setLarAlertOk] = useState(false);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printType, setPrintType] = useState("");
  const [allDiagWithTest, setAllDiagWithTest] = useState([]);
  const [dischrgType, setDischrgType] = useState("");
  const [isPatientSelected, setIsPatientSelected] = useState(false);
  const [selectedPatientOption, setSelectedPatientOption] = useState(null);

  const handleClearPatient = () => {
    window.location.href = window.location.pathname;
  };

  const [otObjDetails, setOtObjDetails] = useState({});
  const [otChargeDetails, setOtChargeDetails] = useState([]);

  useEffect(() => {
    if (larAlertOk) {
      handleSave();
    }
  }, [larAlertOk]);

  useEffect(() => {
    setServiceChrgCalculated(bedServiceChrg + ocServiceChrg);
  }, [bedServiceChrg, ocServiceChrg]);

  // this will fetch all test data
  const fetchAllTests = async () => {
    try {
      const res = await axiosInstance.get(
        "/tests/search/advanced?page=1&limit=2000",
      );
      let data = {};
      if (res.data.success) {
        const arr = res.data.data;
        for (let i = 0; i < arr.length; i++) {
          data[arr[i].TestId] = arr[i];
        }
      }
      setAllTests(data);

      // console.log("All test data: ", data);
    } catch (error) {
      console.log("error fetching test: ", error);
    }
  };

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

        // console.log("all bed details: ", bedChargesData);
        const ele = bedChargesData[bedChargesData.length - 1];
        const res1 = await axiosInstance.put(
          `/admitionbeds?admitionid=${admData?.AdmitionId}&slno=${ele.SlNo}`,
          {
            ...ele,
            Release: "Y",
            ReleaseDate:
              new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
            ReleaseTime: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        );

        // Mark bed as Vacant in bedmaster
        await axiosInstance.patch(`/bedMaster/Vacant/${ele.BedId}`);

        navigate("/fina-bill-list2");
      } else if (mode === "edit") {
        const res = await axiosInstance.put(`/fb/${id}`, formData);
        if (res.data.success) {
          toast.success("Final Bill updated successfully.");
        }
        navigate("/fina-bill-list2");
      }
    } catch (error) {
      console.log("error submitting the form data: ", error);
    } finally {
      setLarAlertOk(false);
      setTimeout(() => {
        setBtnLoading(false);
      }, 3000);
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

  const fetchDischargeType = async (id) => {
    try {
      const res = await axiosInstance.get(
        `/discert/adm/${encodeURIComponent(id)}`,
      );
      if (res.data.success) {
        const disc = res.data.data?.DiscType || "";
        const map = {
          0: "Normal Discharge",
          1: "Discharge on Request",
          2: "Discharge on Risk Bond",
          3: "Expired",
          4: "Referred",
          5: "LAMA",
          6: "Discharge Against Medical Service",
          7: "Left Against Discharge Advice",
        };
        setDischrgType(map[disc] || "");
      } else {
        setDischrgType("");
      }
    } catch (error) {
      console.log("error fetching discharge type: ", error);
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
      res.data.success ? setOtcDetails(res.data.data) : setOtcDetails([]);

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

      setOcDeatails(filteredOC);

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
      let caseId = "";
      const res = await axiosInstance.get(`/case01/admition/${id}`);
      // console.log("Diag data or: ", res.data.data);

      res.data.success ? setDiagData(res.data.data) : setDiagData([]);
      caseId = res.data.data[0]?.CaseId || "";

      let allMrData = [];
      let totalMr = 0;
      let totalDiscount = 0;

      if (res.data.success && caseId) {
        const mrResult = await axiosInstance.get(
          `/money-receipt01/search?ReffId=${caseId}`,
        );
        if (mrResult.data.success) {
          allMrData = mrResult.data.data;
          if (allMrData.length != 0) {
            totalMr = allMrData.reduce(
              (acc, item) => acc + Number(item?.Amount || 0),
              0,
            );
            let n = allMrData.length;
            if (n > 1) {
              for (let i = 0; i < n - 1; i++) {
                totalDiscount += Number(allMrData[i].DiscAmt || 0);
              }
            }
          }
        }
      }

      const arr = res.data.data;
      // console.log("arr is", arr);
      if (arr.length) {
        const totalCancelTest = arr.reduce(
          (sum, item) => sum + Number(item.CTestAmt || 0),
          0,
        );
        // console.log("total ctest:", totalCancelTest);
        let totalDiag = arr.reduce(
          (sum, item) => sum + Number(item.GrossAmt || 0),
          0,
        );

        // console.log("totalDiag:", totalDiag);
        // console.log("totalCancelTest:", totalCancelTest);
        // console.log("totalMr:", totalMr);
        // console.log("total discount:", totalDiscount);

        totalDiag = arr.reduce(
          (sum, item) => {
            const total = Number(item.GrossAmt || 0);
            const payment = total - Number(item.Balance || 0);
            // payment < 0 means refund/overpaid → already settled, due = 0
            const due = payment < 0 ? 0 : total - payment;
            return sum + due;
          },
          0,
        );
        // const totalDiag = arr.reduce(
        //   (sum, item) =>
        //     sum +
        //     (Number(item.Balance || 0) -
        //       Number(item.CTestAmt || 0) -
        //       Number(totalMr || 0)),
        //   0,
        // );
        // console.log("total diag chrgs; ", totalDiag);

        let diagObj = {};
        for (let i = 0; i < arr.length; i++) {
          diagObj[arr[i].CaseId] = arr[i];
        }

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

        const caseIdArr = res.data.data.map((item) => item.CaseId);
        // console.log("case Id", caseIdArr);

        const resCaseDtl = caseIdArr.map((item) =>
          axiosInstance(`/case-dtl-01/case/${item}`),
        );

        const resCaseDtlPromises = await Promise.all(resCaseDtl);
        let caseDtlData = resCaseDtlPromises
          .map((item) => item.data.data)
          .flat();
        // console.log("case dtls: ", caseDtlData);

        // this describes all tests present in the diag
        // const dtls = caseDtlData.map((item) => [
        //   diagObj[item.CaseId]?.CaseDate?.split("T")[0]
        //     ?.split("-")
        //     ?.reverse()
        //     ?.join("/") || "",
        //   allTests[item.TestId].Test || "",
        //   1,
        //   item.Rate || 0,
        //   item.Rate || 0,
        // ]);

        // this is only breif data
        // console.log("diagData:", arr);
        const dtls = arr.map((item) => [
          item.CaseDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
          item.CaseNo || "",
          // 0,
          // 0,
          item.GrossAmt || 0,
        ]);

        setDiagDtl(dtls);
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
                      {row.MyDateFrom?.split("-")?.reverse()?.join("/") || ""}
                      {" 12PM → "}
                      {row.MyDateTo?.split("-")?.reverse()?.join("/") || ""}
                      {" 12PM"}
                    </td>
                    <td>
                      {fetchedAdmBedDetail.find(
                        (item) => item.BedId == row.BedId,
                      )?.Bed || ""}
                    </td>
                    <td className="text-end">
                      {row?.BedRate || row?.ToDayRate || 0}
                    </td>
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

      case "Others Charges": {
        const scTotal = otherChargesData
          ? otherChargesData
              .filter((row) => row.scharge === 1)
              .reduce((sum, row) => sum + Number(row.Amount || 0), 0)
          : 0;
        return (
          <table
            className="table table-bordered table-sm mb-0"
            style={{ fontSize: "11px" }}
          >
            <thead>
              <tr>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Others Head</th>
                <th style={styles.tableHeader}>Rate</th>
                <th style={styles.tableHeader}>Qty</th>
                <th style={styles.tableHeader} className="text-end">
                  Total
                </th>
                <th style={styles.tableHeader}>SC</th>
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
                    <td>{row.Particular?.trim()?.split("x")[1] || ""}</td>
                    <td>{row.Particular?.trim()?.split("x")[0] || ""}</td>
                    <td className="text-end">
                      {Number(row.Amount || 0).toFixed(2)}
                    </td>
                    <td className="text-center">
                      {row.scharge === 1 ? "Y" : "N"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-end text-white">
                    No data found.
                  </td>
                </tr>
              )}
              {otherChargesData && (
                <>
                  <tr style={{ fontWeight: "bold", background: "#e0e0e0" }}>
                    <td colSpan={4} className="text-end">
                      Others Total:
                    </td>
                    <td className="text-end">
                      {otherChargesData
                        .reduce((sum, row) => sum + Number(row.Amount || 0), 0)
                        .toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                  <tr style={{ fontWeight: "bold", background: "#ffe0b2" }}>
                    <td colSpan={4} className="text-end">
                      SC Items Total:
                    </td>
                    <td className="text-end">{scTotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        );
      }
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
                <th style={styles.tableHeader}>Total</th>
                <th style={styles.tableHeader}>Payment</th>
                <th style={styles.tableHeader}>Due</th>
              </tr>
            </thead>
            <tbody>
              {diagData ? (
                diagData.map((row, idx) => {
                  const total = Number(row.GrossAmt || 0);
                  const payment = total - Number(row.Balance || 0);
                  const due = payment < 0 ? 0 : total - payment;
                  return (
                    <tr key={idx} style={styles.tableRowSelected}>
                      <td>
                        {row.CaseDate?.split("T")[0]
                          ?.split("-")
                          ?.reverse()
                          ?.join("/") || ""}
                      </td>
                      <td>{row.CaseNo || ""}</td>
                      <td className="text-end">{total}</td>
                      <td className="text-end">{payment}</td>
                      <td className="text-end">{due}</td>
                    </tr>
                  );
                })
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
      case "Service Charges": {
        const ocScTotal = otherChargesData
          ? otherChargesData
              .filter((row) => row.scharge === 1)
              .reduce((sum, row) => sum + Number(row.Amount || 0), 0)
          : 0;
        const bedScTotal = bedChargesData
          ? bedChargesData
              .filter(
                (row) =>
                  fetchedAdmBedDetail.find((b) => b.BedId == row.BedId)
                    ?.ServiceCh === "Y",
              )
              .reduce(
                (sum, row) => sum + Number(row.BedRate || row.ToDayRate || 0),
                0,
              )
          : 0;
        const scPercent = Number(serviceCharge) || 0;
        const ocScAmt = ocScTotal * (scPercent / 100);
        const bedScAmt = bedScTotal * (scPercent / 100);
        return (
          <table
            className="table table-bordered table-sm mb-0"
            style={{ fontSize: "11px" }}
          >
            <thead>
              <tr>
                <th style={styles.tableHeader}>Description</th>
                <th style={styles.tableHeader} className="text-end">
                  Eligible Amt
                </th>
                <th style={styles.tableHeader} className="text-end">
                  SC ({scPercent}%)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={styles.tableRowSelected}>
                <td>Bed Charges (SC=Y)</td>
                <td className="text-end">{bedScTotal.toFixed(2)}</td>
                <td className="text-end">{bedScAmt.toFixed(2)}</td>
              </tr>
              <tr style={styles.tableRowSelected}>
                <td>Others Charges (SC=Y)</td>
                <td className="text-end">{ocScTotal.toFixed(2)}</td>
                <td className="text-end">{ocScAmt.toFixed(2)}</td>
              </tr>
              <tr style={{ fontWeight: "bold", background: "#e0e0e0" }}>
                <td className="text-end">Total</td>
                <td className="text-end">
                  {(bedScTotal + ocScTotal).toFixed(2)}
                </td>
                <td className="text-end">{(bedScAmt + ocScAmt).toFixed(2)}</td>
              </tr>
              <tr style={{ fontWeight: "bold", background: "#c8e6c9" }}>
                <td colSpan={2} className="text-end">
                  Service Charges (Calculated):
                </td>
                <td className="text-end">{serviceChrgCalculated}</td>
              </tr>
            </tbody>
          </table>
        );
      }
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

// const fetch all otslots
const fetchOtSlots = async () => {
     try {
      const res = await axiosInstance.get("/otSlot");
      if (res.data.success) {
        return res.data.data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.log("error fetching all ot slots:", error);
      return [];
    }
}


  // fetch all ot-master
  const fetchOtMasters = async () => {
    try {
      const res = await axiosInstance.get("/otMaster");
      if (res.data.success) {
        return res.data.data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.log("error fetching all ot masters:", error);
      return [];
    }
  };

  // fetch all ot-items
  const fetchOtItems = async () => {
    try {
      const res = await axiosInstance.get("/otItem");
      if (res.data.success) {
        return res.data.data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.log("error fetching all ot items:", error);
      return [];
    }
  };

  // fetching o.t. charges in details for ot pdf
  const fetchOTchargesDetail = async (id) => {
    if (!id) return;

    try {
      let allOtMasters = await fetchOtMasters();
      let allOTitems = await fetchOtItems();
      let allOtSlots = await fetchOtSlots()
      let allOtSlotsMap = {}
      let allOTitemsMap = {};
      let allOtMastersMap = {};

      if (allOtSlots.length != 0) {
        for (let i = 0; i < allOtSlots.length; i++) {
          allOtSlotsMap[allOtSlots[i]?.OTSlotId || ""] = allOtSlots[i];
        }
      }
      if (allOtMasters.length != 0) {
        for (let i = 0; i < allOtMasters.length; i++) {
          allOtMastersMap[allOtMasters[i]?.OtMasterId || ""] = allOtMasters[i];
        }
      }

      if (allOTitems.length != 0) {
        for (let i = 0; i < allOTitems.length; i++) {
          allOTitemsMap[allOTitems[i]?.OtItemId || ""] = allOTitems[i];
        }
      }

      let x = String(id.split("-")[1]) + "-" + String(id.split("-")[2]);
      const res = await axiosInstance.get(`/ot-bills/${encodeURIComponent(x)}`);
      if (res.data.success) {
        let data = res.data.data;
        let { otBillDetails, ...rest } = data;
        rest = {
          ...rest,
          OTname: allOtMastersMap[rest?.OTId || ""]?.OtMaster || "",
          OTslotName: allOtSlotsMap[rest?.OTSlotId || ""]?.OTSlot || "",
        };
        console.log("Rest is ", rest)
        setOtObjDetails(rest || {});
        if (data?.otBillDetails.length > 0) {
          let arr = data?.otBillDetails.map((item) => ({
            ...item,
            name: allOTitemsMap[item.OtItemId]?.OtItem || "",
            category: allOTitemsMap[item.OtItemId]?.OtCategory || "",
          }));
          console.log("obj is", rest);
          console.log("arr is", arr);
          setOtChargeDetails(arr);
        } else {
          setOtChargeDetails([]);
        }
      } else {
        setOtObjDetails({});
        setOtChargeDetails([]);
      }
    } catch (error) {
      setOtObjDetails({});
      setOtChargeDetails([]);
      console.log("error fetching: ", error);
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
      fetchAllDiadWithTest(id);
      fetchDischargeType(id);
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

  // this will design the entire bed details according 12.00pm to 11.59 am = 1 day bed count
  // handles bed transfer — if 2 beds overlap in same window, last transferred bed wins
  function splitBedHistoryDateWise(history, dischargeDate, dischargeTime) {
    const DAY_START_HOUR = 12; // 12:00 PM
    const DAY_START_MIN = 0;

    // build discharge datetime from form fields — NEVER fall back to current date/time
    if (!dischargeDate || !dischargeTime) {
      return [];
    }
    const dischargeDT = new Date(
      `${dischargeDate.split("T")[0]}T${convertTo24Hour(dischargeTime)}`,
    );

    // windowKey → entry map (last bed in window wins)
    const windowMap = {};

    function getDayWindowStart(dateObj) {
      const d = new Date(dateObj);
      d.setHours(DAY_START_HOUR, DAY_START_MIN, 0, 0);
      return d;
    }

    function nextWindowStart(dateObj) {
      const d = new Date(dateObj);
      d.setDate(d.getDate() + 1);
      d.setHours(DAY_START_HOUR, DAY_START_MIN, 0, 0);
      return d;
    }

    // sort history by admit time so latest transfer comes last
    const sorted = [...history].sort((a, b) => {
      const tA = new Date(
        `${toLocalDateStr(a.AdmitionDate)}T${convertTo24Hour(a.AdmitionTime)}`,
      );
      const tB = new Date(
        `${toLocalDateStr(b.AdmitionDate)}T${convertTo24Hour(b.AdmitionTime)}`,
      );
      return tA - tB;
    });

    sorted.forEach((entry, idx) => {
      const admDateTime = new Date(
        `${toLocalDateStr(entry.AdmitionDate)}T${convertTo24Hour(entry.AdmitionTime)}`,
      );
      const isLastBed = idx === sorted.length - 1;
      // Last bed always uses form's discharge date/time, not bed record's release date
      const relDateTime = isLastBed
        ? dischargeDT
        : entry.Release === "Y"
          ? new Date(
              `${toLocalDateStr(entry.ReleaseDate)}T${convertTo24Hour(entry.ReleaseTime)}`,
            )
          : dischargeDT;

      let currentWindowStart = getDayWindowStart(admDateTime);

      if (admDateTime < currentWindowStart) {
        currentWindowStart.setDate(currentWindowStart.getDate() - 1);
      }

      while (currentWindowStart <= relDateTime) {
        const nextStart = nextWindowStart(currentWindowStart);

        if (relDateTime > currentWindowStart) {
          const fromDate = currentWindowStart.toISOString().split("T")[0];
          const toDate = nextStart.toISOString().split("T")[0];
          const windowKey = fromDate;

          // last bed transfer in this window overwrites previous
          windowMap[windowKey] = {
            MyDate: fromDate,
            MyDateFrom: fromDate,
            MyDateTo: toDate,
            ...entry,
            ServiceCh: entry.ServiceCh,
            BedRate:
              (entry.Rate && entry.Rate !== "NA" ? Number(entry.Rate) : 0) ||
              Number(entry.BedRate || 0) ||
              Number(entry.ToDayRate || 0),
          };
        }

        currentWindowStart = nextStart;
      }
    });

    // sort by date and return
    return Object.values(windowMap).sort((a, b) =>
      a.MyDate.localeCompare(b.MyDate),
    );
  }

  // fetch bed detail by Id
  const fetchBedsById = async (admId, billDate, releaseTime) => {
    try {
      const res1 = await axiosInstance.get(`/admissions/${admId}`);

      const arr = res1.data.data.bedData;

      // sort by admit time so 1st bed is first
      const sortedArr = [...arr].sort((a, b) => {
        const tA = new Date(
          `${toLocalDateStr(a.AdmitionDate)}T${convertTo24Hour(a.AdmitionTime)}`,
        );
        const tB = new Date(
          `${toLocalDateStr(b.AdmitionDate)}T${convertTo24Hour(b.AdmitionTime)}`,
        );
        return tA - tB;
      });

      // 1st bed rate from admission BedRate (set once on load)
      if (firstBedRate === null && sortedArr.length > 0) {
        setFirstBedRate(
          Number(
            admData?.BedRate ||
              sortedArr[0].ToDayRate ||
              sortedArr[0].Rate ||
              0,
          ),
        );
      }

      // override 1st bed rate with editable firstBedRate
      const rateToUse =
        firstBedRate ??
        Number(sortedArr[0]?.ToDayRate || sortedArr[0]?.Rate || 0);
      if (sortedArr.length > 0) {
        sortedArr[0] = {
          ...sortedArr[0],
          Rate: rateToUse,
          ToDayRate: rateToUse,
        };
      }

      const promises = sortedArr.map((item) =>
        axiosInstance.get(`/bedMaster/${item.BedId}`),
      );

      const results = await Promise.all(promises);

      setFetchedAdmBedDetail(results.map((res) => res?.data?.data));

      const allBedsData = results.map((res) => res?.data?.data);

      let allBedsDataMap = {};
      for (let i = 0; i < allBedsData.length; i++) {
        allBedsDataMap[allBedsData[i].BedId] = allBedsData[i];
      }

      const newBedArr = splitBedHistoryDateWise(
        sortedArr,
        billDate,
        releaseTime,
      );
      console.log("Calculated bed array: ", newBedArr);
      const totalBedRate = newBedArr.reduce(
        (sum, item) => sum + Number(item.ToDayRate),
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
          finalbillbeddtl: newBedArr,
        },
      }));

      setBedChargesData(newBedArr);

      let totalBedServiceChrg = 0;

      for (let j = 0; j < newBedArr.length; j++) {
        totalBedServiceChrg +=
          (allBedsDataMap[newBedArr[j].BedId]?.ServiceCh == "Y" ? 1 : 0) *
          Number(newBedArr[j].ToDayRate) *
          (Number(serviceCharge) / 100);
      }
      totalBedServiceChrg = Number(totalBedServiceChrg).toFixed(2);
      // console.log("Final bed service charge: ", totalBedServiceChrg);
      setBedServiceChrg(Number(totalBedServiceChrg));
    } catch (err) {
      console.error("Error while fetching bed data:", err);
      throw err;
    }
  };

  const onChange = (e) => {
    if (e) {
      fetchAdm(e.value);
      setSelectedPatientOption(e);
      setIsPatientSelected(true);
    }
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

    // console.log("otherChargesByAdmId", otherChargesByAdmId);
    // console.log("allOtherCharges", allOtherCharges);
    // console.log("allOtherCharges1", allOtherCharges1);

    const ocWithFullDetails = otherChargesByAdmId.map((item) => ({
      ...allOtherCharges1[item.OtherChargesId],
      calAmount: item.Amount,
    }));
    // const ocWithFullDetails = otherChargesByAdmId
    const ocWithServiceChrgOn = ocWithFullDetails.filter(
      (item) => item.ServiceCh === "Y",
    );

    // console.log("oc with service chrg on: ", ocWithServiceChrgOn);

    let ocServiceChargeCalculated = ocWithServiceChrgOn.reduce(
      (sum, item) =>
        sum + Number(item.calAmount) * (Number(serviceCharge) / 100),
      0,
    );

    // console.log("filterd oc with service charge on: ", ocWithServiceChrgOn);
    // console.log("Calculated oc service charge: ", ocServiceChargeCalculated);
    ocServiceChargeCalculated = Number(ocServiceChargeCalculated).toFixed(2);
    setOcServiceChrg(Number(ocServiceChargeCalculated));
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

  // this is for handlePrint5
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

    billNo: formData?.BillNo || "",
    ipdNo: admData.AdmitionNo || "",
    admissionDate:
      `${admData?.AdmitionDate?.split("T")[0]?.split("-")?.reverse()?.join("/")} Time: ${
        admData?.AdmitionTime || ""
      }` || "",
    dischargeDate:
      `${formData?.BillDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || ""} Time: ${formData?.ReleaseTime || ""}` ||
      "",
    dischargeType: dischrgType || "",
    doctor:
      allDoctors.find((item) => item.DoctorId == admData?.UCDoctor1Id)
        ?.Doctor || "",
    bedNo: "", // At time of discharge
    billDate:
      formData?.BillDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",

    bedCharges: {
      rows: formData?.details?.finalbillbeddtl.map((row, idx) => [
        row.MyDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
        fetchedAdmBedDetail.find((item) => item.BedId == row.BedId)?.Bed || "",
        "1",
        row?.BedRate || row?.ToDayRate || 0,
        row?.BedRate || row?.ToDayRate || 0,
      ]) || [["", "", "", "", ""]],
      total:
        finalBillDetail.find((item) => item.HeadName == "Bed Charges")
          ?.Amount1 || "0",
    },

    otCharges: {
      rows: otcDetails?.map((row, idx) => [
        row.BillDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
        row.OtBillNo || "",
        row.TotalAmt || 0,
      ]) || [["", "", ""]],
      total:
        finalBillDetail.find((item) => item.HeadName == "O.T. Charges")
          ?.Amount1 || "0",
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
        finalBillDetail.find((item) => item.HeadName == "Doctor Charges")
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
        row.Amount || 0,
      ]),

      total:
        finalBillDetail.find((item) => item.HeadName == "Others Charges")
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
      // rows: diagData.map((row) => [
      //   row.CaseDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || "",
      //   row.CaseNo || "",
      //   // row.Particular?.trim()?.split("x")[0] || "",
      //   // row.Particular?.trim()?.split("x")[1] || "",
      //   row.Total || "",
      // ]),
      rows: diagDtl,
      total:
        finalBillDetail.find((item) => item.HeadName == "Diagnostic Charges")
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
        finalBillDetail.find((item) => item.HeadName == "Service Charges")
          ?.Amount1 || "0",
    },

    // grandTotal: "274,544.00",
    grandTotal:
      finalBillDetail.reduce((acc, cur) => acc + Number(cur.Amount1), 0) -
      finalBillDetail?.find((item) => item.SlNo == 9)?.Amount1,
    // advancePaid: "33,000.00",
    advancePaid: finalBillDetail?.find((item) => item.SlNo == 9)?.Amount1,
    insuranceApproval: Number(formData?.Approval),
    nonPayable: "",
    // nonPayable: "1725", // not found
    billedBy: "Admin",
    discount: formData?.Discount || 0,
    due: formData?.ReciptAmt || 0,
  };

  useEffect(() => {
    console.log("ot charge:", otcDetails);
  }, [otcDetails]);

  // re-run bed calculation when discharge date/time or 1st bed rate changes
  useEffect(() => {
    if (
      Object.keys(admData).length &&
      formData.BillDate &&
      formData.ReleaseTime
    ) {
      fetchBedsById(
        admData?.AdmitionId,
        formData.BillDate,
        formData.ReleaseTime,
      );
    }
  }, [formData.BillDate, formData.ReleaseTime, firstBedRate]);

  useEffect(() => {
    if (Object.keys(admData).length) {
      fetchBedsById(
        admData?.AdmitionId,
        formData.BillDate,
        formData.ReleaseTime,
      );
      fetchOTC(admData?.AdmitionId);
      fetchIPDOtherChargesByAdmId(admData?.AdmitionId);
      fetchDoctVisitByAdmId(admData?.AdmitionId);

      setTimeout(() => {
        setBtnLoading(false);
      }, 9000);
    }
  }, [admData]);

  useEffect(() => {
    fetchAllTests();
    fetchServiceChargeValue();
    fetchAuthUsers();
    // fetchFB(id);
    fetchAllIPDOtherCharges();
    fetchAllDoctors();
    fetchDept();
    fetchCashLess();

    // Edit mode: load saved bill then trigger live re-calculation
    if ((mode === "edit" || mode === "view") && id) {
      (async () => {
        try {
          const res = await axiosInstance.get(`/fb/${id}`);
          if (res.data.success) {
            const bill = res.data.data;
            const syncTime =
              bill.ReleaseTime || bill.BillTime || prev.ReleaseTime;
            setFormData((prev) => ({
              ...prev,
              BillNo: bill.BillNo || "",
              BillDate: bill.BillDate?.split("T")[0] || prev.BillDate,
              BillTime: syncTime,
              ReleaseTime: syncTime,
              BillType: bill.BillType || "I",
              ReffId: bill.ReffId || "",
              Discount: bill.Discount || 0,
              ReciptAmt: bill.ReciptAmt || 0,
              CB: bill.CB || "",
              ChequeNo: bill.ChequeNo || "",
              ChequeDt: bill.ChequeDt?.split("T")[0] || prev.ChequeDt,
              BankName: bill.BankName || "",
              CashlessId: bill.CashlessId || 0,
              Approval: bill.Approval || 0,
              Remarks: bill.Remarks || "",
              PatiectPartyAmt: bill.PatiectPartyAmt || 0,
            }));
            if (bill.ReffId) fetchAdm(bill.ReffId);

            if (Object.keys(bill?.details).length > 0) {
              let data = bill?.details;
              if (data.finalbillalldtl.length > 0) {
                let otBillNo = data.finalbillalldtl.find(
                  (item) => item.PrintHead == "O.T. CHARGES",
                )?.SubHead;
                fetchOTchargesDetail(otBillNo);
              }
            }
          }
        } catch (err) {
          console.error("Error loading bill for edit:", err);
        }
      })();
    }
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
      total - 2 * finalBillDetail.find((item) => item.SlNo == 9)?.Amount1 || 0,
    );

    setTotalReceipt(total);
  }, [finalBillDetail]);

  useEffect(() => {
    let val = Number(netBal) - Number(formData.Approval);
    // -Number(finalBillDetail.find((item) => item.SlNo == 9)?.Amount1 || 0);

    // if (val < 0) {
    //   val = val * -1;
    // }

    setFormData((prev) => ({
      ...prev,
      PatiectPartyAmt: val,
    }));

    setFormData((prev) => ({
      ...prev,
      ReciptAmt: netBal - formData.Approval - formData.Discount,
    }));
  }, [formData.Approval, netBal, finalBillDetail]);

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

    setScDetail([p]);

    const RemoveDuplicateSC = formData.details.finalbillalldtl.filter(
      (item) => item.slno != 999999999999999,
    );

    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        finalbillalldtl: [...RemoveDuplicateSC, p],
      },
    }));

    setFinalBillDetail((prev) =>
      prev.map((item) =>
        item.SlNo === 7 ? { ...item, Amount1: serviceChrgCalculated } : item,
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
              setOtObjDetails({});
              setOtChargeDetails([]);
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
                      const t = convertTo12Hour(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        BillTime: t,
                        ReleaseTime: t,
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
                      const t = convertTo12Hour(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        ReleaseTime: t,
                        BillTime: t,
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
                <div className="col-md-3 col-6 d-flex gap-1 align-items-center">
                  <div style={{ flex: 1 }}>
                    <AsyncApiSelect
                      api={"/admission"}
                      searchKey={"name"}
                      labelKey="PatientName"
                      valueKey="AdmitionId"
                      onChange={onChange}
                      value={selectedPatientOption}
                      isDisabled={isPatientSelected}
                    />
                  </div>
                  {isPatientSelected && (
                    <button
                      className="btn btn-sm btn-danger"
                      title="Clear patient & search again"
                      onClick={handleClearPatient}
                      style={{ whiteSpace: "nowrap", height: "23px", fontSize: "10px", padding: "1px 6px" }}
                    >
                      ✕ Clear
                    </button>
                  )}
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
                        value={
                          finalBillDetail.find((item) => item.SlNo == 9)
                            ?.Amount1 || 0
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
                        value={netBal.toFixed(2) || 0}
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
                  {/* <div className="row g-1 align-items-center mb-1">
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
                  </div> */}
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
                        style={{
                          ...styles.input,
                          fontWeight: "bold",
                          color: "red",
                        }}
                        value={formData?.ReciptAmt || 0}
                      />

                      {/* <input
                        type="text"
                        style={styles.input}
                        value={formData?.PatiectPartyAmt || 0}
                      /> */}
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
                        type="number"
                        style={styles.input}
                        value={Number(formData?.Approval) || 0}
                        name="Approval"
                        onChange={handleChange}
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
          {(fbMode === "final" || mode === "edit") && mode !== "view" && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                let totalLar = lessAdvData.reduce(
                  (acc, item) => acc + Number(item.Amount || 0),
                  0,
                );
                // console.log("total lar:", totalLar);
                if (totalLar == 0) {
                  setLarAlertShow(true);
                } else {
                  handleSave();
                }
              }}
              disabled={btnLoading}
            >
              Save
            </button>
          )}

          {showPrintModal && (
            <RetroModal
              showModal={showPrintModal}
              setShowModal={setShowPrintModal}
              printType={printType}
              setPrintType={setPrintType}
              billData1={billData1}
              defaultInvoiceData={{
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
                    allDoctors.find(
                      (item) => item.DoctorId == admData?.UCDoctor1Id,
                    )?.Doctor || "",
                  billNo: formData?.BillNo || "",
                  age: `${admData.Age || ""} ${admData.AgeType || "Y"}`,
                  sex: admData.Sex || "",
                  admDate:
                    `${admData?.AdmitionDate?.split("T")[0]?.split("-")?.reverse()?.join("/")} Time: ${admData?.AdmitionTime || ""}` ||
                    "",
                  disDate:
                    `${formData?.BillDate?.split("T")[0]?.split("-")?.reverse()?.join("/") || ""} Time: ${formData?.ReleaseTime || ""}` ||
                    "",
                  regdNo: admData.AdmitionNo || "",
                  billDate:
                    formData?.BillDate?.split("T")[0]
                      ?.split("-")
                      ?.reverse()
                      ?.join("/") || "",
                },
                printBy:
                  authUserData?.find((item) => item.UserId == loggedInUser)
                    ?.UserName || "",
                groups: allDiagWithTest,
              }}
              billData2={billData1}
              otObjDetails={otObjDetails}
              otChargeDetails={otChargeDetails}
              fbMode={fbMode}
            />
          )}
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setShowPrintModal((prev) => !prev);
            }}
            disabled={btnLoading}
          >
            Print
          </button>
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

      <CustomModal
        show={larAlertShow}
        setShow={setLarAlertShow}
        setOk={setLarAlertOk}
      />
    </div>
  );
};

export default FinalBillingAdd;
