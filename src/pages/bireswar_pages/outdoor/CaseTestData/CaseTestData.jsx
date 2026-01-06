import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axiosInstance from '../../../../axiosInstance';

const CaseTestData = () => {
  const [formData, setFormData] = useState({
    caseId: '',
    testId: '',
    htmlContent: '',
    document: null
  });
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axiosInstance.get('/case-test-data');
      setRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, document: e.target.files[0] }));
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setFormData(prev => ({ ...prev, htmlContent: data }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('caseId', formData.caseId);
      data.append('testId', formData.testId);
      data.append('htmlContent', formData.htmlContent);
      if (formData.document) {
        data.append('document', formData.document);
      }

      if (editMode) {
        await axiosInstance.put(`/case-test-data/${editId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Record updated successfully!');
      } else {
        await axiosInstance.post('/case-test-data', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Record created successfully!');
      }

      resetForm();
      fetchRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save record: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setFormData({
      caseId: record.case_id,
      testId: record.test_id,
      htmlContent: record.html_content || '',
      document: null
    });
    setEditMode(true);
    setEditId(record.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await axiosInstance.delete(`/case-test-data/${id}`);
      alert('Record deleted successfully!');
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record');
    }
  };

  const resetForm = () => {
    setFormData({
      caseId: '',
      testId: '',
      htmlContent: '',
      document: null
    });
    setEditMode(false);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="container-fluid py-4">
      {showForm && (
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">{editMode ? '✏️ Edit' : '➕ Add'} Case Test Data</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Case ID <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="caseId"
                      value={formData.caseId}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                      disabled={editMode}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Test ID <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="testId"
                      value={formData.testId}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                      disabled={editMode}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">HTML Content (Rich Text Editor)</label>
                  <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.htmlContent}
                      onChange={handleEditorChange}
                      config={{
                        toolbar: [
                          'heading', '|',
                          'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
                          'blockQuote', 'insertTable', '|',
                          'undo', 'redo'
                        ]
                      }}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Upload Document (Optional)</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="form-control"
                    accept=".doc,.docx,.pdf,.txt"
                  />
                  <small className="text-muted">Allowed: .doc, .docx, .pdf, .txt (Max 10MB)</small>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : editMode ? 'Update' : 'Save'}
                  </button>
                  {editMode && (
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">📋 Case Test Data Records</h4>
              <button className="btn btn-light btn-sm" onClick={() => setShowForm(true)}>
                ➕ Add New
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Case ID</th>
                      <th>Test ID</th>
                      <th>HTML Content</th>
                      <th>File Location</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? (
                      records.map((record) => (
                        <tr key={record.id}>
                          <td>{record.id}</td>
                          <td>{record.case_id}</td>
                          <td>{record.test_id}</td>
                          <td>
                            <div
                              dangerouslySetInnerHTML={{ __html: record.html_content?.substring(0, 100) + '...' }}
                              style={{ maxWidth: '300px' }}
                            />
                          </td>
                          <td>
                            {record.file_location ? (
                              <a href={record.file_location} target="_blank" rel="noopener noreferrer">
                                📄 View File
                              </a>
                            ) : (
                              'No file'
                            )}
                          </td>
                          <td>{new Date(record.created_at).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleEdit(record)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(record.id)}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseTestData;
