import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import GeneralTestDrawer from "./GeneralTestDrawer";
import DescriptiveTestDrawer from "./DescriptiveTestDrawer";

const TestDrawer = ({
  open,
  onClose,
  type, // "descriptive" | "general"
  tests = [],
  formData2,
  propertyList,
  propertyValueMap,
  handlePropertyChange,
  fetchPropertyList,
  fetchPropertyValues,
  htmlContent,
  fetchTestDetails
}) => {
  if (!open) return null;
console.log("ttttttt", htmlContent)
  return (
    <>
      {/* BACKDROP (click to close) */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      />

      {/* DRAWER – SAME */}
      <div
        style={{
          zIndex: 99999,
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "80%",
          backgroundColor: "#fff",
          overflowY: "auto",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.2)",
        }}
      >
        {/* CLOSE BUTTON */}

        {/* HEADER */}
        <div
          className="d-flex justify-content-between align-items-center fw-bold border-bottom"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            padding: "10px 16px",
            backgroundColor: "#fff",
          }}
        >
          <span>{type === "descriptive" ? "🧪 Descriptive Test" : "🧪 General Test"}</span>
          <button className="btn btn-sm btn-danger" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {/* BODY */}
        <OverlayScrollbarsComponent style={{ height: "calc(100% - 50px)" }}>
          <div className="p-3">
            {type === "descriptive" && (
              <DescriptiveTestDrawer
                formData2={formData2}
                tests={tests}
                propertyList={propertyList}
                propertyValueMap={propertyValueMap}
                handlePropertyChange={handlePropertyChange}
                fetchPropertyList={fetchPropertyList}
                fetchPropertyValues={fetchPropertyValues}
                htmlContent={htmlContent}
              />
            )}

            {type === "general" && (
              <GeneralTestDrawer
                formData2={formData2}
                tests={tests}
                propertyList={propertyList}
                propertyValueMap={propertyValueMap}
                handlePropertyChange={handlePropertyChange}
                fetchPropertyList={fetchPropertyList}
                fetchPropertyValues={fetchPropertyValues}
                fetchTestDetails={fetchTestDetails}
              />
            )}
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </>
  );
};

export default TestDrawer;
