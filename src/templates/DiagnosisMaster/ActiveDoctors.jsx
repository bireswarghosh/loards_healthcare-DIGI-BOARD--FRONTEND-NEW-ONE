import React, { useState, useEffect } from 'react';
// import MasterLayout from '../../MasterLayout';
// import Breadcrumb from '../../Breadcrumb';
import {
  Table, Button, Card, Badge, Alert, Spinner, Form,
  InputGroup, Row, Col, Container
} from 'react-bootstrap';
import { FaUserMd, FaEdit, FaSearch } from 'react-icons/fa';

import Modal from 'react-bootstrap/Modal';
import axiosInstance from '../../axiosInstance';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ActiveDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [specialities, setSpecialities] = useState([]);
  const [groupBySpeciality, setGroupBySpeciality] = useState(true);
  const [selectedSpecialityFilter, setSelectedSpecialityFilter] = useState('');

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [editForm, setEditForm] = useState({
    Doctor: '',
    Qualification: '',
    Phone: '',
    SpecialityId: '',
    IndoorYN: '',
    RMO: '',
    Email: '',
    Password: ''
  });

  const handleEditClick = (doctor) => {
    setEditDoctor(doctor);
    setEditForm({
      Doctor: doctor.Doctor || '',
      Qualification: doctor.Qualification || '',
      Phone: doctor.Phone || '',
      SpecialityId: doctor.SpecialityId || '',
      IndoorYN: doctor.IndoorYN || '',
      RMO: doctor.RMO || '',
      Email: doctor.Email || '',
      Password: ''
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!editDoctor) return;
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const payload = { ...editForm };
      if (!payload.Password) delete payload.Password;

      const response = await axiosInstance.put(
        `/doctormaster/${editDoctor.DoctorId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        toast.success("Updated successfully!", { autoClose: 1000 });
        setShowEditModal(false);
        fetchActiveDoctors();
      } else {
         toast.error("Failed to save");
      }
    } catch {
       toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditDoctor(null);
  };

  useEffect(() => {
    fetchActiveDoctors();
    fetchSpecialities();
  }, []);

  const fetchActiveDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axiosInstance.get('/doctormaster/active', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search }
      });

      if (response.data?.success) {
        setDoctors(response.data.data || []);
      }
    } catch (err) {
      setError("Failed to load active doctors.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/speciality', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success) setSpecialities(response.data.data || []);
    } catch {}
  };

  const filteredDoctors = () => {
    if (!selectedSpecialityFilter) return doctors;
    return doctors.filter((d) => d.SpecialityId == selectedSpecialityFilter);
  };

  const groupedDoctors = () => {
    const list = filteredDoctors();
    if (!groupBySpeciality) return { "All Active Doctors": list };
    const data = {};
    list.forEach((doc) => {
      const spec = specialities.find((s) => s.SpecialityId === doc.SpecialityId)?.Speciality || "Not specified";
      if (!data[spec]) data[spec] = [];
      data[spec].push(doc);
    });
    return data;
  };

  return (
    <>
      

      <Container fluid className="py-4">
<ToastContainer />
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Card className="shadow-lg border-0 rounded-4">
          <div className="card-header border-0 rounded-top-4 bg-gradient-primary text-white p-3">
            <h5 className="mb-0 d-flex align-items-center">
              <FaUserMd className="me-2" size={24} />
              Active Doctors
            </h5>
          </div>

          <Card.Body>

            {/* Search + Filter */}
            <Row className="mb-3">
              <Col md={6}>
                <Form onSubmit={(e) => { e.preventDefault(); fetchActiveDoctors(); }}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Search doctor..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button variant="primary" type="submit" className="rounded-pill px-4">
                      <FaSearch className="me-2" /> Search
                    </Button>
                  </InputGroup>
                </Form>
              </Col>
              <Col md={6}>
                <Form.Select
                  className="rounded-pill"
                  value={selectedSpecialityFilter}
                  onChange={(e) => setSelectedSpecialityFilter(e.target.value)}
                >
                  <option value="">All Specialities</option>
                  {specialities.map((s) => (
                    <option key={s.SpecialityId} value={s.SpecialityId}>{s.Speciality}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading...</p>
              </div>
            ) : (
              Object.entries(groupedDoctors()).map(([spec, list]) => (
                <div key={spec} className="mb-4">

                  {groupBySpeciality && (
                    <h6 className="text-primary fw-bold border-bottom pb-2">
                      <FaUserMd className="me-2" /> {spec} ({list.length})
                    </h6>
                  )}

                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead className="">
                        <tr>
                          <th>Name</th>
                          <th>Qualification</th>
                          <th>Contact</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Email</th>
                          <th>Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((doctor) => (
                          <tr key={doctor.DoctorId}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2"
                                  >
                                  
                                </div>
                                <span>{doctor.Doctor}</span>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="ms-2 rounded-pill"
                                  onClick={() => handleEditClick(doctor)}
                                >
                                  <FaEdit />
                                </Button>
                              </div>
                            </td>

                            <td>{doctor.Qualification}</td>
                            <td>{doctor.Phone || "-"}</td>
                            <td>
                              <Badge bg={doctor.IndoorYN === "Y" ? "success" : "secondary"}>
                                {doctor.IndoorYN === "Y" ? "Indoor" : "Outdoor"}
                              </Badge>
                              {doctor.RMO === "Y" && <Badge bg="info" className="ms-1">RMO</Badge>}
                            </td>
                            <td><Badge bg="success">Active</Badge></td>
                            <td>{doctor.Email || "-"}</td>
                            <td>{doctor.Password || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                </div>
              ))
            )}

          </Card.Body>
        </Card>

        {/* EDIT MODAL */}
       {/* BACKDROP BELOW NAVBAR */}
{showEditModal && (
  <div
    className="position-fixed start-0 w-100"
    style={{
      top: "56px",  
      height: "calc(100vh - 56px)", 
      background: "rgba(0,0,0,0.35)",
      zIndex: 1020,
    }}
    onClick={handleEditModalClose}
  ></div>
)}

{/* RIGHT SIDEBAR BELOW NAVBAR */}
<div
  className="position-fixed profile-right-sidebar active shadow-lg border-start"
  style={{
    width: "380px",
    height: "calc(100vh - 56px)",
    top: "56px",  
    right: showEditModal ? "0px" : "-400px",
    transition: "right 0.35s ease",
    zIndex: 1030,
    overflowY: "hidden",
  }}
>
  {/* HEADER */}
  <div
    className="d-flex justify-content-between align-items-center p-3 "
   
  >
    <h5 className="mb-0 d-flex align-items-center">
      <FaUserMd className="me-2" /> Edit Doctor
    </h5>
    <button className="btn-close btn-close-white" onClick={handleEditModalClose}></button>
  </div>

  {/* BODY */}
  <div className="p-3">
    <Form onSubmit={handleEditFormSubmit}>
      {/* Inputs unchanged */}
      {[
        ['Doctor', 'Name'],
        ['Qualification', 'Qualification'],
        ['Phone', 'Phone'],
        ['Email', 'Email'],
        ['Password', 'Password']
      ].map(([field, label]) => (
        <Form.Group className="mb-3" key={field}>
          <Form.Label>{label}</Form.Label>
          <Form.Control
            name={field}
            type={field === "Email" ? "email" : "text"}
            value={editForm[field]}
            onChange={handleEditFormChange}
          />
        </Form.Group>
      ))}

      <Form.Group className="mb-3">
        <Form.Label>Speciality</Form.Label>
        <Form.Select
          name="SpecialityId"
          value={editForm.SpecialityId}
          onChange={handleEditFormChange}
        >
          <option value="">Select Speciality</option>
          {specialities.map((s) => (
            <option key={s.SpecialityId} value={s.SpecialityId}>{s.Speciality}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-end mt-4">
        <Button variant="secondary" className="me-2 rounded-pill" onClick={handleEditModalClose}>
          Cancel
        </Button>
        <Button disabled={loading} type="submit" variant="primary" className="rounded-pill">
          Update
        </Button>
      </div>
    </Form>
  </div>
</div>


      </Container>

      {/* Style from EMR Theme */}
     
    </>
  );
};

export default ActiveDoctors;