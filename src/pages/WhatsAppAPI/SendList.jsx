import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';

const SendList = () => {
  const [formData, setFormData] = useState({
    sender: '',
    number: '',
    name: '',
    footer: '',
    title: '',
    buttontext: '',
    message: '',
    msgid: '',
    full: 0
  });
  const [sections, setSections] = useState([
    { title: '', description: '', rows: [{ title: '', rowId: '', description: '' }] }
  ]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex][field] = value;
    setSections(newSections);
  };

  const handleRowChange = (sectionIndex, rowIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].rows[rowIndex][field] = value;
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { title: '', description: '', rows: [{ title: '', rowId: '', description: '' }] }]);
  };

  const addRow = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].rows.push({ title: '', rowId: '', description: '' });
    setSections(newSections);
  };

  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const removeRow = (sectionIndex, rowIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].rows = newSections[sectionIndex].rows.filter((_, i) => i !== rowIndex);
    setSections(newSections);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        api_key: 'aelMphcuLP4caCCC4dlnWGsFaMinEs',
        ...formData,
        sections: sections.map(section => ({
          title: section.title,
          description: section.description,
          rows: section.rows.map(row => ({
            title: row.title,
            rowId: row.rowId || `id${Date.now()}`,
            description: row.description
          }))
        }))
      };
      const res = await axiosInstance.post('/whatsapp/send-list', payload);
      setResponse(res.data);
      alert('List message sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send list message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h5>Send List Message</h5>
      </div>
      <div className="panel-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Sender Number *</label>
              <input type="text" name="sender" className="form-control" value={formData.sender} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Recipient Number *</label>
              <input type="text" name="number" className="form-control" value={formData.number} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">List Name *</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Button Text *</label>
              <input type="text" name="buttontext" className="form-control" value={formData.buttontext} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Title *</label>
              <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Footer</label>
              <input type="text" name="footer" className="form-control" value={formData.footer} onChange={handleChange} />
            </div>
            <div className="col-12">
              <label className="form-label">Message *</label>
              <textarea name="message" className="form-control" rows="2" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <div className="col-12">
              <h6>Sections (Max 5)</h6>
              {sections.map((section, sIndex) => (
                <div key={sIndex} className="card mb-3 p-3">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <input type="text" className="form-control" placeholder="Section Title" value={section.title} onChange={(e) => handleSectionChange(sIndex, 'title', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <input type="text" className="form-control" placeholder="Section Description" value={section.description} onChange={(e) => handleSectionChange(sIndex, 'description', e.target.value)} />
                    </div>
                    {section.rows.map((row, rIndex) => (
                      <div key={rIndex} className="col-12 border-top pt-2">
                        <div className="row g-2">
                          <div className="col-md-4">
                            <input type="text" className="form-control form-control-sm" placeholder="Row Title" value={row.title} onChange={(e) => handleRowChange(sIndex, rIndex, 'title', e.target.value)} required />
                          </div>
                          <div className="col-md-4">
                            <input type="text" className="form-control form-control-sm" placeholder="Row Description" value={row.description} onChange={(e) => handleRowChange(sIndex, rIndex, 'description', e.target.value)} />
                          </div>
                          <div className="col-md-4">
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => removeRow(sIndex, rIndex)}>Remove Row</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="col-12">
                      <button type="button" className="btn btn-sm btn-secondary me-2" onClick={() => addRow(sIndex)}>Add Row</button>
                      {sections.length > 1 && (
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => removeSection(sIndex)}>Remove Section</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {sections.length < 5 && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={addSection}>Add Section</button>
              )}
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send List Message'}
              </button>
            </div>
          </div>
        </form>
        {response && (
          <div className="alert alert-success mt-3">
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendList;
