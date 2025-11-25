import { useState, useEffect } from "react"
import axiosInstance from '../../axiosInstance'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import Footer from '../../components/footer/Footer'


const OutdoorParameterSetup = () => {
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchParameters = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/parameters-outdoor')
      if (response.data.success && response.data.data) {
        setConfig(response.data.data)
      } else {
        setConfig({
          RegCh: 0,
          RegValid: 365,
          ValidType: 'M',
          Registration: 'Y',
          MRDosYN: 'N',
          SrvChYN: 'Y',
          DocChYN: 'Y',
          SvcChYN: 'Y',
          UserYN: 'Y',
          AsstYN: 'N',
          adminyn: 'N',
          backdateentryyn: 'N',
          cregno: 'Y'
        })
      }
    } catch (error) {
      console.error("Error fetching parameters:", error)
    }
    setLoading(false)
  }

  const saveParameters = async () => {
    setSaving(true)
    try {
      const response = await axiosInstance.put('/parameters-outdoor', config)
      if (response.data.success) {
        alert("Parameters saved successfully!")
      }
    } catch (error) {
      console.error("Error saving parameters:", error)
      alert("Error saving parameters")
    }
    setSaving(false)
  }

  const updateParameter = async (field, value) => {
    try {
      await axiosInstance.put(`/parameters-outdoor/${field}`, { value })
    } catch (error) {
      console.error("Error updating parameter:", error)
    }
  }

  useEffect(() => {
    fetchParameters()
  }, [])

  const handleToggle = (key) => {
    const newValue = config[key] === 'Y' ? 'N' : 'Y'
    setConfig(prev => ({ ...prev, [key]: newValue }))
    updateParameter(key, newValue)
  }

  const handleInputChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    updateParameter(key, value)
  }

  const configSections = [
    {
      title: "🏥 Registration Configuration",
      items: [
        { key: "Registration", label: "Registration Required", type: "toggle" },
        { key: "RegCh", label: "Registration Charge", type: "number", suffix: "₹" },
        { key: "RegValid", label: "Registration Validity", type: "number", suffix: "Days" },
        { key: "ValidType", label: "Validity Type", type: "select", options: [
          { value: 'D', label: 'Days' },
          { value: 'M', label: 'Months' },
          { value: 'Y', label: 'Years' }
        ]},
        { key: "cregno", label: "Custom Registration Number", type: "toggle" },
      ],
    },
    {
      title: "💊 Service & Charges",
      items: [
        { key: "SrvChYN", label: "Service Charge Required", type: "toggle" },
        { key: "DocChYN", label: "Doctor Charge Required", type: "toggle" },
        { key: "SvcChYN", label: "Service Charge in Bill", type: "toggle" },
        { key: "MRDosYN", label: "MR DOS Required", type: "toggle" },
      ],
    },
    {
      title: "👥 User & Access Control",
      items: [
        { key: "UserYN", label: "User Validation Required", type: "toggle" },
        { key: "AsstYN", label: "Assistant Access", type: "toggle" },
        { key: "adminyn", label: "Admin Override", type: "toggle" },
      ],
    },
    {
      title: "⚙️ Advanced Settings",
      items: [
        { key: "backdateentryyn", label: "Back Date Entry Allowed", type: "toggle" },
      ],
    },
  ]

  if (loading) {
    return (
      <div className="main-content">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3">Loading parameters...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center">
          <h5>🏥 Outdoor Parameter Setup</h5>
          <button
            className="btn btn-primary"
            onClick={saveParameters}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </>
            ) : (
              <>💾 Save All</>
            )}
          </button>
        </div>

        <div className="panel-body">
          <OverlayScrollbarsComponent>
            <div className="row g-4">
              {configSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="col-lg-6">
                  <div className="card h-100">
                    <div className="card-header">
                      <h6 className="mb-0">{section.title}</h6>
                    </div>
                    <div className="card-body">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="mb-3 d-flex justify-content-between align-items-center">
                          <label className="form-label mb-0">{item.label}</label>
                          <div>
                            {item.type === "toggle" ? (
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={config[item.key] === 'Y'}
                                  onChange={() => handleToggle(item.key)}
                                  style={{ width: "3rem", height: "1.5rem" }}
                                />
                              </div>
                            ) : item.type === "number" ? (
                              <div className="input-group" style={{ width: "150px" }}>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={config[item.key] || 0}
                                  onChange={(e) => handleInputChange(item.key, parseFloat(e.target.value) || 0)}
                                />
                                {item.suffix && (
                                  <span className="input-group-text">{item.suffix}</span>
                                )}
                              </div>
                            ) : item.type === "select" ? (
                              <select
                                className="form-select form-select-sm"
                                value={config[item.key] || ""}
                                onChange={(e) => handleInputChange(item.key, e.target.value)}
                                style={{ width: "150px" }}
                              >
                                {item.options.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={config[item.key] || ""}
                                onChange={(e) => handleInputChange(item.key, e.target.value)}
                                style={{ width: "150px" }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </OverlayScrollbarsComponent>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default OutdoorParameterSetup
