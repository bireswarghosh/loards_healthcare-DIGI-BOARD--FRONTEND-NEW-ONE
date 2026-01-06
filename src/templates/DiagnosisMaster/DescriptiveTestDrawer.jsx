// import ApiSelect from "../ApiSelect";

import { tr } from "date-fns/locale";
import ApiSelect from "./ApiSelect";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";

const DescriptiveTestDrawer = ({
  formData2,
  tests = [],
  propertyList = [],
  propertyValueMap = {},
  handlePropertyChange,
  fetchPropertyList,
  fetchPropertyValues,
}) => {
  console.log("Descriptive tests =>", tests);
  const saveProperty = async (prop) => {
    const pv = propertyValueMap[prop.TestPropertyId];
    if (!pv) return;

    const payload = {
      CaseId: formData2.CaseId,
      TestId: formData2.TestId,
      TestPropertyId: prop.TestPropertyId,
      TestProVal: pv.value,
      BarCodeNo: pv.barcode,
      LISVal: pv.lis,
      Alart: pv.alert,
    };

    try {
      {
        // await axiosInstance.put(
        //   `/testproval/${formData2.TestId}/${prop.TestPropertyId}/${formData2.CaseId}`,
        //   payload
        // );
        await axiosInstance.post(`/testproval`, payload);
        toast.success("Property saved successfully ");

        
      }
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Failed to save property ");
    }
  };
  // ========================================
  const saveAllProperties = async () => {
    if (!propertyList.length) return;

    try {
      const requests = propertyList.map((prop) => {
        const pv = propertyValueMap[prop.TestPropertyId];
        if (!pv) return null;

        const payload = {
          CaseId: formData2.CaseId,
          TestId: formData2.TestId,
          TestPropertyId: prop.TestPropertyId,
          TestProVal: pv.value,
          BarCodeNo: pv.barcode,
          LISVal: pv.lis,
          Alart: pv.alert,
        };

        return axiosInstance.put(
          `/testproval/${formData2.TestId}/${prop.TestPropertyId}/${formData2.CaseId}`,
          payload
        );
      });

      // 🔥 null remove + parallel save
      await Promise.all(requests.filter(Boolean));

      toast.success("All properties Edited successfully");
    } catch (err) {
      console.error("Save all failed", err);
      toast.error("Failed to edited all properties");
    }
  };
  //  =====================================
  const createAllProperties = async () => {
    // if (!propertyList.length) return;

    try {
      const requests = propertyList.map((prop) => {
        const pv = propertyValueMap[prop.TestPropertyId];
        if (!pv) return null;

        const payload = {
          CaseId: formData2.CaseId,
          TestId: formData2.TestId,
          TestPropertyId: prop.TestPropertyId,
          TestProVal: pv.value,
          BarCodeNo: pv.barcode,
          LISVal: pv.lis,
          Alart: pv.alert,
        };

        return axiosInstance.post(`/testproval`, payload);
      });

      // 🔥 null remove + parallel save
      await Promise.all(requests.filter(Boolean));

      toast.success("All properties created successfully");
    } catch (err) {
      console.error("Save all failed", err);
      toast.error("Failed to create all properties");
    }
  };
  // =============================
  // ====================================
  return (
    <>
      {/* BASIC INFO */}
      <div className="row g-2 mb-2 align-items-end">
        <div className="col-md-2">
          <label className="form-label mb-0">Case No.</label>
          <input
            value={formData2?.CaseNo || ""}
            readOnly
            className="form-control form-control-sm"
          />
        </div>

        <div className="col-md-2">
          <label className="form-label mb-0">Patient Id</label>
          <input
            value={formData2?.PatientId || ""}
            readOnly
            className="form-control form-control-sm"
          />
        </div>

        <div className="col-md-3">
          <label className="form-label mb-0">Patient Name</label>
          <input
            value={formData2?.PatientName || ""}
            readOnly
            className="form-control form-control-sm"
          />
        </div>

        <div className="col-md-3 ms-auto text-end">
          <div className="border px-2 py-1 fw-bold text-center">
            {formData2?.CaseNo}
          </div>
        </div>
      </div>

      {/* PATHOLOGIST */}
      <div className="row g-2 mb-2">
        <div className="col-md-4">
          <label className="form-label mb-0">Pathologist</label>
          <ApiSelect
            api="https://lords-backend.onrender.com/api/v1/pathologist"
            labelKey="Pathologist"
            valueKey="PathologistId"
            placeholder="Select Pathologist"
          />
        </div>
      </div>

      {/* TEST TABLE */}
      <div className="table-responsive mb-3">
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Pathologist</th>
              <th>Report Date</th>
              <th>Test Detail</th>
            </tr>
          </thead>
          {/* <tbody>
            <tr>
              <td>{formData2?.Test}</td>
              <td>
                <ApiSelect
                  api="https://lords-backend.onrender.com/api/v1/pathologist"
                  labelKey="Pathologist"
                  valueKey="PathologistId"
                  placeholder="Select"
                />
              </td>
              <td>
                <input type="date" className="form-control form-control-sm" />
              </td>
              <td></td>
            </tr>

            <tr>
              <td colSpan={4} style={{ height: 150 }}></td>
            </tr>
          </tbody> */}
          <tbody>
            {tests.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No tests found
                </td>
              </tr>
            ) : (
              tests.map((test, index) => (
                <tr key={index}>
                  <td>{test.Test}</td>

                  <td>
                    <ApiSelect
                      api="https://lords-backend.onrender.com/api/v1/pathologist"
                      labelKey="Pathologist"
                      valueKey="PathologistId"
                      placeholder="Select"
                      value={test?.PathologistId}
                    />
                  </td>

                  <td>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={test.ReportDate?.split("T")[0] || ""}
                      readOnly
                    />
                  </td>

                  <td></td>
                </tr>
              ))
            )}

            <tr>
              <td colSpan={4} style={{ height: 150 }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PROPERTY TABLE */}
      {/* <div className="table-responsive mb-3">
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Test Property</th>
              <th>Value</th>
              <th>UOM</th>
            </tr>
          </thead>
          <tbody>
            {propertyList.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No property found
                </td>
              </tr>
            ) : (
              propertyList.map((prop, index) => (
                <tr key={index}>
                  <td>{prop.TestProperty}</td>
                  <td className="fw-bold text-primary">
                    {propertyValueMap[prop.TestPropertyId] ?? ""}
                  </td>
                  <td>{prop.Uom}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div> */}

      {/* ======================= */}
      <div className="table-responsive mb-3">
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Test Property</th>
              <th>Descriptive Value</th>
              <th>UOM</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {propertyList.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No property found
                </td>
              </tr>
            ) : (
              propertyList.map((prop) => (
                <tr key={prop.TestPropertyId}>
                  {/* PROPERTY NAME */}
                  <td className="fw-bold">{prop.TestProperty}</td>

                  {/* DESCRIPTIVE VALUE */}
                  <td>
                    <textarea
                      rows={1}
                      className="form-control form-control-sm"
                      value={propertyValueMap[prop.TestPropertyId]?.value ?? ""}
                      onChange={(e) =>
                        handlePropertyChange(
                          prop.TestPropertyId,
                          "value",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* ✅ UOM (READ ONLY) */}
                  <td className="text-center fw-bold">{prop.Uom || "-"}</td>

                  {/* ACTION */}
                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => saveProperty(prop)}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ACTION BUTTONS */}
      <div className="d-flex justify-content-end mb-2">
        <div className="d-flex gap-2 mt-4">
          <button
            type="submit"
            className="btn btn-primary "
            onClick={createAllProperties}
          >
            create
          </button>
          {/* <button
            type="submit"
            className="btn btn-primary w-50"
            onClick={saveAllProperties}
          >
            Update
          </button> */}
        </div>
      </div>
    </>
  );
};

export default DescriptiveTestDrawer;
