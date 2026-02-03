import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';

const DeviceManagement = () => {
  const [device, setDevice] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/whatsapp/generate-qr', {
        api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
        device,
        force: true
      });
      setQrCode(res.data.qrcode);
      alert(res.data.message || 'QR Generated');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate QR');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceInfo = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/whatsapp/info-devices', {
        params: {
          api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
          number: device
        }
      });
      setDeviceInfo(res.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get device info');
    } finally {
      setLoading(false);
    }
  };

  const logoutDevice = async () => {
    if (!window.confirm('Logout this device?')) return;
    setLoading(true);
    try {
      await axiosInstance.post('/whatsapp/logout-device', {
        api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
        sender: device
      });
      alert('Device logged out successfully');
      setQrCode(null);
      setDeviceInfo(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to logout device');
    } finally {
      setLoading(false);
    }
  };

  const deleteDevice = async () => {
    if (!window.confirm('Delete this device permanently?')) return;
    setLoading(true);
    try {
      await axiosInstance.post('/whatsapp/delete-device', {
        api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
        sender: device
      });
      alert('Device deleted successfully');
      setDevice('');
      setQrCode(null);
      setDeviceInfo(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h5>Device Management</h5>
      </div>
      <div className="panel-body">
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Device Number</label>
            <input type="text" className="form-control" value={device} onChange={(e) => setDevice(e.target.value)} placeholder="e.g., 91888xxxx" />
          </div>
          <div className="col-12">
            <div className="btn-group gap-2">
              <button className="btn btn-primary" onClick={generateQR} disabled={loading || !device}>Generate QR</button>
              <button className="btn btn-info" onClick={getDeviceInfo} disabled={loading || !device}>Get Info</button>
              <button className="btn btn-warning" onClick={logoutDevice} disabled={loading || !device}>Logout</button>
              <button className="btn btn-danger" onClick={deleteDevice} disabled={loading || !device}>Delete</button>
            </div>
          </div>
          {qrCode && (
            <div className="col-12 text-center">
              <h6>Scan QR Code</h6>
              <img src={qrCode} alt="QR Code" className="img-fluid" style={{ maxWidth: '300px' }} />
            </div>
          )}
          {deviceInfo && (
            <div className="col-12">
              <h6>Device Information</h6>
              <div className="alert alert-info">
                <pre>{JSON.stringify(deviceInfo, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceManagement;
