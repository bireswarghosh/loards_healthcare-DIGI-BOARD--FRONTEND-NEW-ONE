import { useState, useContext } from "react";
import Footer from "../components/footer/Footer";
import { getUserTimezone } from "../lib/utils";
import { DigiContext } from "../context/DigiContext";
import { toast } from "react-toastify";

const AiSettings = () => {
  const { aiState, updateAiSettings } = useContext(DigiContext);

  const [showApiKey, setShowApiKey] = useState(false);
  const userTimezone = getUserTimezone();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue =
      name === "maxTokens" ? parseInt(value, 10) || 1000 : value;
    updateAiSettings({ [name]: parsedValue });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/ai/settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-timezone": userTimezone,
          },
          body: JSON.stringify({
            apiKey: aiState.aiSettings.apiKey,
            defaultModel: aiState.aiSettings.model,
            maxTokens: aiState.aiSettings.maxTokens,
            showApiKey: false,
            preferences: {
              temperature: aiState.aiSettings.temperature,
              systemPrompt: aiState.aiSettings.systemPrompt,
            },
            organization: {
              logoUrl: aiState.aiSettings.orgLogoUrl,
              name: aiState.aiSettings.orgName,
              address: aiState.aiSettings.orgAddress,
              phone: aiState.aiSettings.orgPhone,
              email: aiState.aiSettings.orgEmail,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast.success("AI settings saved successfully.");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save AI settings.");
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      apiKey: "",
      model: "gpt-5-mini",
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt:
        "You are a medical AI assistant. Provide accurate, evidence-based, and concise medical information. Do not speculate, guess, or invent facts. If you do not know the answer, clearly state that you don't know. Respond only to medical-related content; politely decline any non-medical or irrelevant requests. Maintain a professional, neutral, and supportive tone. Use information from previous messages only when medically relevant. When medical images are provided, analyze them carefully within your capabilities. Prioritize clarity, safety, and accuracy in every response.",
      orgLogoUrl: "",
      orgName: "",
      orgAddress: "",
      orgPhone: "",
      orgEmail: "",
    };
    updateAiSettings(defaultSettings);
  };

  return (
    <div className="main-content">
      <div className="dashboard-breadcrumb dashboard-panel-header mb-30">
        <h2>AI Settings</h2>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="panel">
            <div className="panel-header">
              <h5>
                <i className="fa-light fa-cog me-2"></i>
                AI Configuration
              </h5>
            </div>
            <div className="panel-body">
              <div>
                <div className="row g-3">
                  <div className="col-12">
                    <div>
                      <label htmlFor="apiKey" className="form-label">
                        API Key
                      </label>
                      <div className="input-group-with-icon">
                        <span className="input-icon">
                          <i className="fa-light fa-key"></i>
                        </span>
                        <input
                          type={showApiKey ? "text" : "password"}
                          id="apiKey"
                          name="apiKey"
                          value={aiState.aiSettings.apiKey}
                          onChange={handleInputChange}
                          placeholder="Enter your OpenAI API key"
                          className="form-control ps-0"
                        />
                        <button
                          type="button"
                          className="btn btn-link p-0 ms-2"
                          onClick={() => setShowApiKey(!showApiKey)}
                          style={{ border: "none", background: "none" }}
                        >
                          <i
                            className={`fa-light ${
                              showApiKey ? "fa-eye-slash" : "fa-eye"
                            }`}
                          ></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div>
                      <label htmlFor="model" className="form-label">
                        Model
                      </label>
                      <div className="input-group-with-icon">
                        <span className="input-icon">
                          <i className="fa-light fa-brain"></i>
                        </span>
                        <select
                          id="model"
                          name="model"
                          value={aiState.aiSettings.model}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="gpt-5.2">
                            GPT-5.2 (Most powerful)
                          </option>
                          <option value="gpt-5.1">GPT-5.1 (Advanced)</option>
                          <option value="gpt-5">GPT-5 (Powerful)</option>
                          <option value="gpt-5-mini">
                            GPT-5 Mini (Recommended)
                          </option>
                          <option value="gpt-5-nano">
                            GPT-5 Nano (Fast & Cheap)
                          </option>
                          <option value="gpt-4.1">GPT-4.1</option>
                          <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gpt-4o-mini">GPT-4o Mini</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {aiState.aiSettings.model &&
                    !aiState.aiSettings.model.startsWith("gpt-5") && (
                      <div className="col-sm-6">
                        <div>
                          <label htmlFor="temperature" className="form-label">
                            Temperature
                          </label>
                          <div className="input-group-with-icon">
                            <span className="input-icon">
                              <i className="fa-light fa-temperature-half"></i>
                            </span>
                            <input
                              type="number"
                              id="temperature"
                              name="temperature"
                              value={aiState.aiSettings.temperature}
                              onChange={handleInputChange}
                              min="0"
                              max="2"
                              step="0.1"
                              className="form-control ps-0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  {aiState.aiSettings.model &&
                    aiState.aiSettings.model.startsWith("gpt-5") && (
                      <div className="col-sm-6">
                        <div className="alert alert-info">
                          <i className="fa-light fa-info-circle me-2"></i>
                          GPT-5 models do not use temperature parameter
                        </div>
                      </div>
                    )}
                  <div className="col-sm-6">
                    <div>
                      <label htmlFor="maxTokens" className="form-label">
                        Max Tokens
                      </label>
                      <div className="input-group-with-icon">
                        <span className="input-icon">
                          <i className="fa-light fa-hashtag"></i>
                        </span>
                        <input
                          type="number"
                          id="maxTokens"
                          name="maxTokens"
                          value={aiState.aiSettings.maxTokens}
                          onChange={handleInputChange}
                          min="1"
                          max="8192"
                          className="form-control ps-0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div>
                      <label htmlFor="systemPrompt" className="form-label">
                        System Prompt
                      </label>
                      <div className="input-group-with-icon">
                        <span className="input-icon">
                          <i className="fa-light fa-message"></i>
                        </span>
                        <textarea
                          id="systemPrompt"
                          name="systemPrompt"
                          value={aiState.aiSettings.systemPrompt}
                          onChange={handleInputChange}
                          rows="4"
                          placeholder="Enter system prompt for AI conversations"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <h6>Organization Details (for PDF Export)</h6>
                  </div>
                  <div className="col-sm-6">
                    <div>
                      <label htmlFor="orgLogoUrl" className="form-label">
                        Organization Logo URL
                      </label>
                      <div className="input-group-with-icon">
                        <span className="input-icon">
                          <i className="fa-light fa-image"></i>
                        </span>
                        <input
                          type="url"
                          id="orgLogoUrl"
                          name="orgLogoUrl"
                          value={aiState.aiSettings.orgLogoUrl || ""}
                          onChange={handleInputChange}
                          placeholder="https://example.com/logo.png"
                          className="form-control ps-0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div>
                      <label htmlFor="orgName" className="form-label">
                        Organization Name
                      </label>
                      <div className="input-group-with-icon">
                        <span className="input-icon">
                          <i className="fa-light fa-building"></i>
                        </span>
                        <input
                          type="text"
                          id="orgName"
                          name="orgName"
                          value={aiState.aiSettings.orgName || ""}
                          onChange={handleInputChange}
                          placeholder="Enter organization name"
                          className="form-control ps-0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div>
                      <label htmlFor="orgAddress" className="form-label">
                        Organization Address
                      </label>
                      <div className="input-group-with-icon">
                        <span className="input-icon">
                          <i className="fa-light fa-map-marker-alt"></i>
                        </span>
                        <textarea
                          id="orgAddress"
                          name="orgAddress"
                          value={aiState.aiSettings.orgAddress || ""}
                          onChange={handleInputChange}
                          rows="2"
                          placeholder="Enter organization address"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div>
                      <label htmlFor="orgPhone" className="form-label">
                        Phone Number
                      </label>
                      <div className="input-group-with-icon">
                        <span className="input-icon">
                          <i className="fa-light fa-phone"></i>
                        </span>
                        <input
                          type="tel"
                          id="orgPhone"
                          name="orgPhone"
                          value={aiState.aiSettings.orgPhone || ""}
                          onChange={handleInputChange}
                          placeholder="+1-123-456-7890"
                          className="form-control ps-0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div>
                      <label htmlFor="orgEmail" className="form-label">
                        Email ID
                      </label>
                      <div className="input-group-with-icon">
                        <span className="input-icon">
                          <i className="fa-light fa-envelope"></i>
                        </span>
                        <input
                          type="email"
                          id="orgEmail"
                          name="orgEmail"
                          value={aiState.aiSettings.orgEmail || ""}
                          onChange={handleInputChange}
                          placeholder="contact@example.com"
                          className="form-control ps-0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-primary me-2"
                      onClick={handleSave}
                    >
                      <i className="fa-light fa-save me-1"></i>
                      Save Settings
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleReset}
                    >
                      <i className="fa-light fa-rotate-left me-1"></i>
                      Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AiSettings;
