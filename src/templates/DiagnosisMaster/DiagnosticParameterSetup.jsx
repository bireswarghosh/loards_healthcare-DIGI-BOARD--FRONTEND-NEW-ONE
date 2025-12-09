import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';

const DiagnosticParameterSetup = () => {
  const [loading, setLoading] = useState(false);
  const [paramId, setParamId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/dparamitersetup');
      if (response.data.success && response.data.data.length > 0) {
        setFormData(response.data.data[0]);
        setParamId(response.data.data[0].ParamiterId);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (paramId) {
        await axiosInstance.put(`/dparamitersetup/${paramId}`, formData);
      } else {
        const response = await axiosInstance.post('/dparamitersetup', formData);
        setParamId(response.data.data.id);
      }
      alert('Saved successfully!');
      fetchData();
    } catch (error) {
      alert('Error saving');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', options }) => {
    const value = formData[name] !== undefined ? formData[name] : '';
    return (
    // Replaced inline style with Bootstrap d-flex, align-items-center, and mb-2 for spacing
    <div className="d-flex align-items-center mb-2">
      {/* Replaced inline style with form-label small fw-bold */}
      <label className="form-label small fw-bold " style={{ width: '180px' }}>{label}</label>
      {options ? (
        // Replaced inline style with form-select form-select-sm
        <select name={name} value={value} onChange={handleChange} className="form-select form-select-sm" style={{ width: '120px' }}>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        // Replaced inline style with form-control form-control-sm
        <input type={type} name={name} value={value} onChange={handleChange} className="form-control form-control-sm" style={{ width: '120px' }} />
      )}
    </div>
    );
  };

  return (
    // Outer container with padding
    <div className="container-fluid py-4 px-lg-4 text-small">
      <div className="panel border-2 border-dark"> {/* Adjusted panel for border */}
        {/* ================== HEADER (Panel-Header Style) ================== */}
        {/* Adopted panel-header style, using bg-primary for a distinct header color as seen in PatientRegistrationDetail */}
        <div className="panel-header  p-2">
          <div className="panel-title fw-bold">
            <i className="fas fa-cog me-2"></i> Diagnostic Parameter Setup
          </div>
        </div>

        {/* ================== BODY (Panel-Body Style) ================== */}
        <div className="panel-body p-3 "> {/* Using light background for the body */}
          
          {/* Main three-column layout - Replaced inline grid with Bootstrap row and columns */}
          <div className="row g-3">
            
            <div className="col-lg-4">
              <Field label="Case Prefix" name="CasePrefix" />
              <Field label="Patient Prefix" name="PatientPrefix" />
              <Field label="Sale A/c Head" name="SaleACHead" />
              <Field label="Cash/Posting A/c Head" name="CashPostingACHead" />
              <Field label="Purchase A/c Head" name="PurchaseACHead" />
              <Field label="In Case Entry Company Enable" name="Company" options={['Y', 'N']} />
              <Field label="In Case Entry Indoor Enable" name="Indoor" options={['Y', 'N']} />
              <Field label="In Case Entry Labaratory Enable" name="Labaratory" options={['Y', 'N']} />
              <Field label="In Case Entry Agent Enable" name="Agent" options={['Y', 'N']} />
              <Field label="Report pre-printed stationary" name="PrePrented" options={['Y', 'N']} />
              <Field label="Rate In Department Slip" name="DepRateYN" options={['Y', 'N']} />
              <Field label="Pre-Printed Barcode" name="PPBarCodeYN" options={['Y', 'N']} />
              <Field label="Pre-Printed Barcode in Case" name="PPBarCodeCaseYN" options={['Y', 'N']} />
              <Field label="Repete Test in Case Entry" name="ReptTest" options={['Y', 'N']} />
              <Field label="New Descript Format" name="DscriptFrmt" options={['Y', 'N']} />
            </div>

            <div className="col-lg-4">
              <Field label="Un Delivery Day" name="OnDeliveryDay" />
              <Field label="After Delivery Day" name="AfterDeliveryDay" />
              <Field label="Bar Code Rt Side" name="BarRT" options={['Y', 'N']} />
              <Field label="UHID REQUIRED" name="UHID" options={['Y', 'N']} />
              <Field label="Platlete C in Lakh" name="PlatlateC" options={['Y', 'N']} />
              <Field label="Case Entry Form" name="CaseEntryWindow" />
              <Field label="Dis Discount Format Disable" name="CaseDiscYN" />
              <Field label="Lab Sl. No. In Reporting" name="LabSlNo" options={['Y', 'N']} />
              <Field label="Receive Payment for IPD" name="IPDRec" options={['Y', 'N']} />
              <Field label="Money Receipt Header" name="BillHeader" options={['Y', 'N']} />
              <Field label="Money Receipt Footer" name="Footer" options={['Y', 'N']} />
              <Field label="Money Receipt Bill Format" name="MoneyReceipt" options={['Y', 'N']} />
              <Field label="Rate Editable in Case Entry" name="RateEdiyYN" options={['Y', 'N']} />
              <Field label="Pathologist Login Req." name="PLoginYN" options={['Y', 'N']} />
              <Field label="Zero Money Receipt" name="ZeroMR" options={['Y', 'N']} />
              <Field label="Picklist View" name="PView" options={['Y', 'N']} />
            </div>

            <div className="col-lg-4">
              <Field label="Email" name="EMail" />
              <Field label="Discount A/c Head" name="DisdAcId" />
              <Field label="Vat A/c Head" name="VatAC" />
              <Field label="Case Detail Edit" name="CaseDtlEdit" options={['Y', 'N']} />
              <Field label="Bae Code Print" name="BarCodeYN" options={['Y', 'N']} />
              <Field label="Money Receipt Ledger-USERWISE [ALL]" name="MRLAllYN" options={['Y', 'N']} />
              <Field label="Money Receipt Header Box" name="HeaderBox" />
              <Field label="Money Receipt Format" name="MFormatId" />
              <Field label="Money Receipt Dos Print" name="BillDos" options={['Y', 'N']} />
              <Field label="Out source" name="OutSource" options={['Y', 'N']} />
              <Field label="Manual Case No." name="ManualCace" options={['Y', 'N']} />
              <Field label="Agent Commition In Case" name="AgentRr" />
              <Field label="Case Prefix Agent Short Name Wise" name="AgentCase" options={['Y', 'N']} />
              <Field label="Agent Prifix Id" name="SingleDoctorForCommition" options={['Y', 'N']} />
              <Field label="Single Doctor For Commition" name="SingleDoctorForCommition" options={['Y', 'N']} />
              <Field label="TRF DepartmentWise" name="TRFDepartmentWise" />
              <Field label="TRF SubDepartmentWise" name="TRFSubDepartmentWise" />
            </div>
          </div>
          
          {/* Section 2: Bottom fields - Replaced inline grid with Bootstrap row and columns */}
          <div className="row g-3 mt-2">
            <div className="col-lg-4">
              <Field label="Opening Balance" name="OpeningBalance" />
              <Field label="Starting Date" name="StartingDate" />
            </div>
            <div className="col-lg-4">
              <Field label="Default OPD" name="DefaultOPD" options={['Y', 'N']} />
              <Field label="Agent Commition In Case Entry" name="AgentCommitionInCaseEntry" options={['Y', 'N']} />
              <Field label="Health Card" name="HealthCard" options={['Y', 'N']} />
              <Field label="Health Card fees" name="healthfees" />
              <Field label="Full Payment In Case Entry" name="FullPaymentInCaseEntry" options={['Y', 'N']} />
              <Field label="Medicine Receipt Mail Notification" name="MedicineReceiptMailNotification" options={['Y', 'N']} />
              <Field label="Cash Register Rpt" name="CashRegisterRpt" options={['Y', 'N']} />
              <Field label="Total Recv In Lab Query" name="TotalRecvInLabQuery" options={['Y', 'N']} />
              <Field label="Test code wise search" name="TestCodeWiseSearch" options={['Y', 'N']} />
            </div>
            <div className="col-lg-4">
              <Field label="Leucocytes in Lakh" name="LeucocytesInLakh" options={['Y', 'N']} />
              <Field label="Profile Report Show With Test" name="ProfileReportShowWithTest" options={['Y', 'N']} />
              <Field label="Department print autometically" name="DepartmentPrintAutometically" options={['Y', 'N']} />
              <Field label="Case No gen for Eye" name="CaseNoGenForEye" options={['Y', 'N']} />
              <Field label="Profile and test all in case entry" name="ProfileAndTestAllInCaseEntry" options={['Y', 'N']} />
              <Field label="No colour in labquery" name="NoColourInLabquery" options={['Y', 'N']} />
              <Field label="Report Print 2 nd Without Admin" name="ReportPrint2ndWithoutAdmin" options={['Y', 'N']} />
              <Field label="BSS TYPE" name="BSSTYPE" options={['Y', 'N']} />
              <Field label="Dr. Commission without IPD" name="DrCommissionWithoutIPD" options={['Y', 'N']} />
              <Field label="Edit in Case entry" name="EditInCaseEntry" options={['Y', 'N']} />
              <Field label="Case No IPD OPd wise" name="CaseNoIPDOPDwise" options={['Y', 'N']} />
            </div>
          </div>

          {/* Textarea fields section */}
          <div className="mt-3">
            <div className="mb-2">
              <label className="form-label small fw-bold ">Money Receipt Remarks</label>
              <input type="text" name="MoneyReceiptRemarks" value={formData.MoneyReceiptRemarks || ''} onChange={handleChange} className="form-control form-control-sm" />
            </div>
            <div className="mb-2">
              <label className="form-label small fw-bold ">Home Visit Setup</label>
              <input type="text" name="HomeVisitSetup" value={formData.HomeVisitSetup || ''} onChange={handleChange} className="form-control form-control-sm" />
            </div>
            <div className="mb-2">
              <label className="form-label small fw-bold ">Diag. Company Name</label>
              <input type="text" name="DiagCompanyName" value={formData.DiagCompanyName || ''} onChange={handleChange} className="form-control form-control-sm" />
            </div>
            <div className="mb-2">
              <label className="form-label small fw-bold ">Special Remarks For Report</label>
              <textarea name="SpecialRemarksForReport" value={formData.SpecialRemarksForReport || ''} onChange={handleChange} rows="2" className="form-control form-control-sm" />
            </div>
            <div className="mb-2">
              <label className="form-label small fw-bold ">Prepheral Smear Study</label>
              <textarea name="PrepheralSmearStudy" value={formData.PrepheralSmearStudy || ''} onChange={handleChange} rows="2" className="form-control form-control-sm" />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold ">Bar Code Printer Name</label>
                <input type="text" name="BarCodePrinterName" value={formData.BarCodePrinterName || ''} onChange={handleChange} className="form-control form-control-sm" />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold ">SMS GREETINGS</label>
                <input type="text" name="SMSGreetings" value={formData.SMSGreetings || ''} onChange={handleChange} className="form-control form-control-sm" />
              </div>
            </div>
            <div className="row g-3 mt-1">
              <div className="col-md-3">
                <Field label="Case No. Start From" name="CaseNoStartFrom" />
              </div>
              <div className="col-md-3">
                <Field label="Efective Date" name="EfectiveDate" />
              </div>
              <div className="col-md-3">
                <Field label="Child Age" name="ChildAge" />
              </div>
              <div className="col-md-3">
                <Field label="Blood Format Form" name="BloodFormatForm" />
              </div>
            </div>
            <div className="row g-3 mt-1">
              <div className="col-md-6">
                <Field label="No of Bill Copy 2" name="NoOfBillCopy2" />
              </div>
              <div className="col-md-6">
                <Field label="No of Dep Print" name="NoOfDepPrint" />
              </div>
            </div>
          </div>
        </div>

        {/* ================== FOOTER (Panel-Footer Style) ================== */}
        <div className="panel-footer d-flex justify-content-center flex-wrap gap-2 p-3 border-top">
          <button onClick={handleSave} disabled={loading} className="btn btn-primary btn-sm" >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => window.close()} className="btn btn-secondary btn-sm" >
            Close
          </button>
          <button onClick={() => setFormData({})} className="btn btn-danger btn-sm" >
            Delete Case
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticParameterSetup;