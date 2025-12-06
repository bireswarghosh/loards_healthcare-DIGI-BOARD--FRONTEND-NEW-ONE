import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../axiosInstance';

const DiagnosticParameterSetup = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    CasePrefix: 'CASE',
    PatientPrefix: 'PATI',
    SaleACHead: 'CASH',
    CashPostingACHead: 'CASH',
    PurchaseACHead: 'CASH',
    InCaseEntryCompanyEnable: 'Y',
    InCaseEntryIndoorEnable: 'Y',
    InCaseEntryLabaratoryEnable: 'Y',
    InCaseEntryAgentEnable: 'Y',
    ReportPrePrintedStationary: 'N',
    RateInDepartmentSlip: 'N',
    PrePrintedBarcode: 'Y',
    PrePrintedBarcodeInCase: 'Y',
    RepeteTestInCaseEntry: 'N',
    NewDescriptFormat: 'Y',
    MoneyReceiptRemarks: '',
    HomeVisitSetup: '',
    SpecialRemarksForReport: 'If result is unexpected or alarming, please contact the Diagnostic Centre or Lab for',
    PrepheralSmearStudy: 'ERYTHROCYTES - NORMOCHROMIC NORMOCYTIC\nPLATELETS - ADEQUATE',
    BarCodePrinterName: '',
    SMSGreetings: '',
    OnDeliveryDay: '07:00 PM',
    AfterDeliveryDay: '',
    BarCodeRtSide: 'Y',
    UHID: 'Y',
    PlatlateC: 'N',
    LabSlNoInReporting: 'Y',
    ReceivePaymentForIPD: 'Y',
    MoneyReceiptHeader: 'Y',
    MoneyReceiptFooter: 'Y',
    MoneyReceiptBillFormat: 'Y',
    RateEditableInCaseEntry: 'Y',
    PathologistLoginReq: 'N',
    ZeroMoneyReceipt: 'Y',
    PicklistView: 'N',
    DiagCompanyName: '',
    CaseNoStartFrom: '0',
    EfectiveDate: '01/Apr/2007',
    ChildAge: '0',
    NoOfBillCopy2: '0',
    NoOfDepPrint: '1',
    BloodFormatForm: '0',
    Email: '',
    DiscountACHead: 'CASH',
    VatACHead: 'CASH',
    CaseDetailEdit: 'N',
    BaeCodePrint: 'Y',
    MoneyReceiptLedgerUSERWISE: 'Y',
    CaseEntryForm: '0',
    DisDiscountFormatDisable: '',
    MoneyReceiptFormat: 'A',
    MoneyReceiptDosPrint: 'N',
    OutSource: 'Y',
    ManualCaseNo: 'N',
    AgentCommition: '',
    SingleDoctorForCommition: 'Y',
    CasePrefix: 'Y',
    TotalRecvInLabQuery: 'N',
    TestCodeWiseSearch: 'N',
    TRFDepartmentWise: '',
    TRFSubDepartmentWise: 'y',
    Doctor: '',
    CaseNoGenForEye: 'N',
    ProfileAndTestAllInCaseEntry: 'N',
    NoColourInLabquery: 'N',
    ReportPrint2ndWithoutAdmin: 'Y',
    BSSTYPE: 'N',
    DrCommissionWithoutIPD: 'N',
    EditInCaseEntry: 'Y',
    CaseNoIPDOPDwise: 'Y',
    OpeningBalance: '0',
    StartingDate: '01/Jan/2000',
    DefaultOPD: 'Y',
    AgentCommitionInCaseEntry: 'N',
    HealthCard: 'N',
    healthfees: '0',
    FullPaymentInCaseEntry: 'N',
    MedicineReceiptMailNotification: 'Y',
    CashRegisterRpt: 'Y',
    ProfileReportShowWithTest: 'N',
    DepartmentPrintAutometically: 'N',
    LeucocytesInLakh: 'Y'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/dparamitersetup');
      if (response.data.success && response.data.data.length > 0) {
        setFormData(response.data.data[0]);
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
      await axiosInstance.post('/dparamitersetup', formData);
      alert('Saved successfully!');
    } catch (error) {
      alert('Error saving');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', options }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
      <label style={{ width: '180px', fontSize: '11px', fontWeight: 'bold', color: '#000' }}>{label}</label>
      {options ? (
        <select name={name} value={formData[name]} onChange={handleChange} style={{ width: '120px', padding: '1px 3px', fontSize: '11px', border: '1px solid #000' }}>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={formData[name]} onChange={handleChange} style={{ width: '120px', padding: '1px 3px', fontSize: '11px', border: '1px solid #000' }} />
      )}
    </div>
  );

  return (
    <div style={{ backgroundColor: '#8080ff', padding: '8px', minHeight: '100vh', fontFamily: 'Arial' }}>
      <div style={{ border: '2px solid #000', padding: '8px', backgroundColor: '#8080ff' }}>
        <h6 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '13px' }}>⚙ Diagnostic Paramiter Setup</h6>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          
          <div>
            <Field label="Case Prefix" name="CasePrefix" />
            <Field label="Patient Prefix" name="PatientPrefix" />
            <Field label="Sale A/c Head" name="SaleACHead" />
            <Field label="Cash/Posting A/c Head" name="CashPostingACHead" />
            <Field label="Purchase A/c Head" name="PurchaseACHead" />
            <Field label="In Case Entry Company Enable" name="InCaseEntryCompanyEnable" options={['Y', 'N']} />
            <Field label="In Case Entry Indoor Enable" name="InCaseEntryIndoorEnable" options={['Y', 'N']} />
            <Field label="In Case Entry Labaratory Enable" name="InCaseEntryLabaratoryEnable" options={['Y', 'N']} />
            <Field label="In Case Entry Agent Enable" name="InCaseEntryAgentEnable" options={['Y', 'N']} />
            <Field label="Report pre-printed stationary" name="ReportPrePrintedStationary" options={['Y', 'N']} />
            <Field label="Rate In Department Slip" name="RateInDepartmentSlip" options={['Y', 'N']} />
            <Field label="Pre-Printed Barcode" name="PrePrintedBarcode" options={['Y', 'N']} />
            <Field label="Pre-Printed Barcode in Case" name="PrePrintedBarcodeInCase" options={['Y', 'N']} />
            <Field label="Repete Test in Case Entry" name="RepeteTestInCaseEntry" options={['Y', 'N']} />
            <Field label="New Descript Format" name="NewDescriptFormat" options={['Y', 'N']} />
          </div>

          <div>
            <Field label="Un Delivery Day" name="OnDeliveryDay" />
            <Field label="After Delivery Day" name="AfterDeliveryDay" />
            <Field label="Bar Code Rt Side" name="BarCodeRtSide" options={['Y', 'N']} />
            <Field label="UHID REQUIRED" name="UHID" options={['Y', 'N']} />
            <Field label="Platlete C in Lakh" name="PlatlateC" options={['Y', 'N']} />
            <Field label="Case Entry Form" name="CaseEntryForm" />
            <Field label="Dis Discount Format Disable" name="DisDiscountFormatDisable" />
            <Field label="Lab Sl. No. In Reporting" name="LabSlNoInReporting" options={['Y', 'N']} />
            <Field label="Receive Payment for IPD" name="ReceivePaymentForIPD" options={['Y', 'N']} />
            <Field label="Money Receipt Header" name="MoneyReceiptHeader" options={['Y', 'N']} />
            <Field label="Money Receipt Footer" name="MoneyReceiptFooter" options={['Y', 'N']} />
            <Field label="Money Receipt Bill Format" name="MoneyReceiptBillFormat" options={['Y', 'N']} />
            <Field label="Rate Editable in Case Entry" name="RateEditableInCaseEntry" options={['Y', 'N']} />
            <Field label="Pathologist Login Req." name="PathologistLoginReq" options={['Y', 'N']} />
            <Field label="Zero Money Receipt" name="ZeroMoneyReceipt" options={['Y', 'N']} />
            <Field label="Picklist View" name="PicklistView" options={['Y', 'N']} />
          </div>

          <div>
            <Field label="Email" name="Email" />
            <Field label="Discount A/c Head" name="DiscountACHead" />
            <Field label="Vat A/c Head" name="VatACHead" />
            <Field label="Case Detail Edit" name="CaseDetailEdit" options={['Y', 'N']} />
            <Field label="Bae Code Print" name="BaeCodePrint" options={['Y', 'N']} />
            <Field label="Money Receipt Ledger-USERWISE [ALL]" name="MoneyReceiptLedgerUSERWISE" options={['Y', 'N']} />
            <Field label="Money Receipt Header Box" name="MoneyReceiptFormat" />
            <Field label="Money Receipt Format" name="MoneyReceiptFormat" />
            <Field label="Money Receipt Dos Print" name="MoneyReceiptDosPrint" options={['Y', 'N']} />
            <Field label="Out source" name="OutSource" options={['Y', 'N']} />
            <Field label="Manual Case No." name="ManualCaseNo" options={['Y', 'N']} />
            <Field label="Agent Commition In Case" name="AgentCommition" />
            <Field label="Case Prefix Agent Short Name Wise" name="CasePrefix" options={['Y', 'N']} />
            <Field label="Agent Prifix Id" name="SingleDoctorForCommition" options={['Y', 'N']} />
            <Field label="Single Doctor For Commition" name="SingleDoctorForCommition" options={['Y', 'N']} />
            <Field label="TRF DepartmentWise" name="TRFDepartmentWise" />
            <Field label="TRF SubDepartmentWise" name="TRFSubDepartmentWise" />
          </div>
        </div>

        <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <Field label="Opening Balance" name="OpeningBalance" />
            <Field label="Starting Date" name="StartingDate" />
          </div>
          <div>
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
          <div>
            <Field label="Leucocytes in Lakh" name="LeucocytesInLakh" options={['Y', 'N']} />
            <Field label="Profile Report Show With Test" name="ProfileReportShowWithTest" options={['Y', 'N']} />
            <Field label="Department print autometically" name="DepartmentPrintAutometically" options={['Y', 'N']} />
            <Field label="Case No gen for Eye" name="CaseNoGenForEye" options={['Y', 'N']} />
            <Field label="Profile and test all in case entry" name="ProfileAndTestAllInCaseEntry" options={['Y', 'N']} />
            <Field label="No colour in labquery" name="NoColourInLabquery" options={['Y', 'N']} />
            <Field label="Report Print 2 nd Without Admin" name="ReportPrint2ndWithoutAdmin" options={['Y', 'N']} />
            <Field label="BSS TYPE" name="BSSTYPE" options={['Y', 'N']} />
            <Field label="Dr. Commission without IPD" name="DrCommissionWithoutIPD" options={['Y', 'N']} />
            <Field label="Edit in  Case entry" name="EditInCaseEntry" options={['Y', 'N']} />
            <Field label="Case No IPD OPd wise" name="CaseNoIPDOPDwise" options={['Y', 'N']} />
          </div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <div style={{ marginBottom: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', display: 'block' }}>Money Receipt Remarks</label>
            <input type="text" name="MoneyReceiptRemarks" value={formData.MoneyReceiptRemarks} onChange={handleChange} style={{ width: '100%', padding: '2px', fontSize: '11px', border: '1px solid #000' }} />
          </div>
          <div style={{ marginBottom: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', display: 'block' }}>Home Visit Setup</label>
            <input type="text" name="HomeVisitSetup" value={formData.HomeVisitSetup} onChange={handleChange} style={{ width: '100%', padding: '2px', fontSize: '11px', border: '1px solid #000' }} />
          </div>
          <div style={{ marginBottom: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', display: 'block' }}>Diag. Company Name</label>
            <input type="text" name="DiagCompanyName" value={formData.DiagCompanyName} onChange={handleChange} style={{ width: '100%', padding: '2px', fontSize: '11px', border: '1px solid #000' }} />
          </div>
          <div style={{ marginBottom: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', display: 'block' }}>Special Remarks For Report</label>
            <textarea name="SpecialRemarksForReport" value={formData.SpecialRemarksForReport} onChange={handleChange} rows="2" style={{ width: '100%', padding: '2px', fontSize: '11px', border: '1px solid #000' }} />
          </div>
          <div style={{ marginBottom: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', display: 'block' }}>Prepheral Smear Study</label>
            <textarea name="PrepheralSmearStudy" value={formData.PrepheralSmearStudy} onChange={handleChange} rows="2" style={{ width: '100%', padding: '2px', fontSize: '11px', border: '1px solid #000' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', display: 'block' }}>Bar Code Printer Name</label>
              <input type="text" name="BarCodePrinterName" value={formData.BarCodePrinterName} onChange={handleChange} style={{ width: '100%', padding: '2px', fontSize: '11px', border: '1px solid #000' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', display: 'block' }}>SMS GREETINGS</label>
              <input type="text" name="SMSGreetings" value={formData.SMSGreetings} onChange={handleChange} style={{ width: '100%', padding: '2px', fontSize: '11px', border: '1px solid #000' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginTop: '5px' }}>
            <Field label="Case No. Start From" name="CaseNoStartFrom" />
            <Field label="Efective Date" name="EfectiveDate" />
            <Field label="Child Age" name="ChildAge" />
            <Field label="Blood Format Form" name="BloodFormatForm" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
            <Field label="No of Bill Copy 2" name="NoOfBillCopy2" />
            <Field label="No of Dep Print" name="NoOfDepPrint" />
          </div>
        </div>

        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={handleSave} disabled={loading} style={{ padding: '5px 30px', backgroundColor: '#c0c0c0', border: '2px outset #fff', fontSize: '12px', cursor: 'pointer' }}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => window.close()} style={{ padding: '5px 30px', backgroundColor: '#c0c0c0', border: '2px outset #fff', fontSize: '12px', cursor: 'pointer' }}>
            Close
          </button>
          <button onClick={() => setFormData({})} style={{ padding: '5px 30px', backgroundColor: '#c0c0c0', border: '2px outset #fff', fontSize: '12px', cursor: 'pointer' }}>
            Delete Case
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticParameterSetup;
