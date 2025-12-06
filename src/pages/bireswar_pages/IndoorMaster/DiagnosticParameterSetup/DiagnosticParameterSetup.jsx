import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../axiosInstance';

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
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
      <label style={{ width: '180px', fontSize: '11px', fontWeight: 'bold', color: '#000' }}>{label}</label>
      {options ? (
        <select name={name} value={value} onChange={handleChange} style={{ width: '120px', padding: '1px 3px', fontSize: '11px', border: '1px solid #000' }}>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={handleChange} style={{ width: '120px', padding: '1px 3px', fontSize: '11px', border: '1px solid #000' }} />
      )}
    </div>
    );
  };

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

          <div>
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

          <div>
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
