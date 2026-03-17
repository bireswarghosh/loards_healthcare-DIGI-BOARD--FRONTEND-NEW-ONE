import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../../axiosInstance";

const CaseView = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [caseDetails, setCaseDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driveFiles, setDriveFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const GOOGLE_DRIVE_API_KEY = "AIzaSyBKhUXvcoDeWad7YxpuRT0WXqX5SGTJ8WM";
  const FOLDER_ID = "1v6nIsjd8a2btKf0d72EPJ0vIxOXm3for";

  useEffect(() => {
    fetchCaseData();
    fetchDriveFiles();
  }, [caseId]);

  const fetchCaseData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/case01/${encodeURIComponent(caseId)}`);
      if (response.data?.success) {
        setCaseData(response.data.data);
      }

      const detailsResponse = await axiosInstance.get(`/casedtl01/${encodeURIComponent(caseId)}`);
      if (detailsResponse.data?.success) {
        setCaseDetails(detailsResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching case:", error);
      alert("Failed to load case data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDriveFiles = async () => {
    try {
      setLoadingFiles(true);
      const searchQuery = caseId.replace(/\//g, "-");
      const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+name+contains+'${searchQuery}'&key=${GOOGLE_DRIVE_API_KEY}&fields=files(id,name,mimeType,webViewLink,thumbnailLink)`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.files) {
        setDriveFiles(data.files);
      }
    } catch (error) {
      console.error("Error fetching Drive files:", error);
    } finally {
      setLoadingFiles(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="main-content">
        <div className="alert alert-danger">Case not found</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <h5>👁️ View Case - {caseData.CaseNo}</h5>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate(-1)}>
                <i className="fa-light fa-arrow-left me-2"></i>Back
              </button>
            </div>

            <div className="panel-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th>Case No</th>
                        <td>{caseData.CaseNo}</td>
                      </tr>
                      <tr>
                        <th>Case Date</th>
                        <td>{new Date(caseData.CaseDate).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <th>Patient Name</th>
                        <td className="fw-bold">{caseData.PatientName}</td>
                      </tr>
                      <tr>
                        <th>Age/Sex</th>
                        <td>{caseData.Age} {caseData.AgeType} / {caseData.Sex}</td>
                      </tr>
                      <tr>
                        <th>Phone</th>
                        <td>{caseData.Phone || caseData.MobileNo}</td>
                      </tr>
                      <tr>
                        <th>Address</th>
                        <td>{[caseData.Add1, caseData.Add2, caseData.Add3].filter(Boolean).join(", ")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="col-md-6">
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th>Total Amount</th>
                        <td>₹{caseData.Total}</td>
                      </tr>
                      <tr>
                        <th>Advance</th>
                        <td>₹{caseData.Advance}</td>
                      </tr>
                      <tr>
                        <th>Gross Amount</th>
                        <td className="fw-bold text-success">₹{caseData.GrossAmt}</td>
                      </tr>
                      <tr>
                        <th>Delivery Date</th>
                        <td>{caseData.DeliveryDate ? new Date(caseData.DeliveryDate).toLocaleDateString() : "N/A"}</td>
                      </tr>
                      <tr>
                        <th>Slip No</th>
                        <td>{caseData.SlipNo}</td>
                      </tr>
                      <tr>
                        <th>Remarks</th>
                        <td>{caseData.Remarks || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {caseDetails.length > 0 && (
                <div className="mb-4">
                  <h6 className="mb-3">Test Details</h6>
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>SL</th>
                        <th>Test ID</th>
                        <th>Rate</th>
                        <th>Delivery Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {caseDetails.map((detail, index) => (
                        <tr key={detail.CaseDtlId}>
                          <td>{index + 1}</td>
                          <td>{detail.TestId}</td>
                          <td>₹{detail.Rate}</td>
                          <td>{detail.DeliveryDate ? new Date(detail.DeliveryDate).toLocaleDateString() : "N/A"}</td>
                          <td>
                            {detail.Delivery === "Y" ? (
                              <span className="badge bg-success">Delivered</span>
                            ) : (
                              <span className="badge bg-warning">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mb-4">
                <h6 className="mb-3">📄 Case Reports (Google Drive)</h6>
                {loadingFiles ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    <span className="ms-2">Loading files...</span>
                  </div>
                ) : driveFiles.length > 0 ? (
                  <div className="row">
                    {driveFiles.map((file) => (
                      <div key={file.id} className="col-md-4 mb-3">
                        <div className="card">
                          {file.thumbnailLink && (
                            <img src={file.thumbnailLink} className="card-img-top" alt={file.name} />
                          )}
                          <div className="card-body">
                            <h6 className="card-title text-truncate" title={file.name}>{file.name}</h6>
                            <a 
                              href={file.webViewLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-primary w-100"
                            >
                              <i className="fa-light fa-eye me-2"></i>View File
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    No files found for this case in Google Drive
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseView;
