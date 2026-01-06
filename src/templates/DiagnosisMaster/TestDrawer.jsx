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
}) => {
  if (!open) return null;

  return (
    <>
      {/* BACKDROP – SAME */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* DRAWER – SAME */}
      <div
        className="profile-right-sidebar active"
        style={{
          zIndex: 9999,
          width: "100%",
          maxWidth: "900px",
          top: "70px",
          height: "calc(100vh - 70px)",
        }}
      >
        {/* CLOSE BUTTON */}
        <button className="right-bar-close" onClick={onClose}>
          <i className="fa-light fa-angle-right"></i>
        </button>

        {/* HEADER */}
        <div
          className="dropdown-txt fw-bold"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            padding: "10px",
          }}
        >
          {type === "descriptive" ? "🧪 Descriptive Test" : "🧪 General Test"}
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
              />
            )}
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </>
  );
};

export default TestDrawer;
