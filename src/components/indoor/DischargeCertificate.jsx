import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';

const DischargeCertificate = () => {
  const { patientId, year } = useParams();
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificate();
  }, [patientId, year]);

  const fetchCertificate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/discert/${patientId}/${year}`);
      if (response.data.success) {
        setCertificateData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching discharge certificate:', err);
      setError('Failed to load discharge certificate: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="alert alert-info m-3" role="alert">
        No discharge certificate found.
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="card">
        <div className="card-header">
          <h4>Discharge Certificate</h4>
          <p className="mb-0">Patient ID: {patientId} | Year: {year}</p>
        </div>
        <div className="card-body">
          {/* Add your certificate content here based on API response */}
          <pre>{JSON.stringify(certificateData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default DischargeCertificate;
