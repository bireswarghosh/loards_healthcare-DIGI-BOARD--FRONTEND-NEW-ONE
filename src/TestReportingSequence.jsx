import React, { useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Footer from "./components/footer/Footer";

const TestReportingSequence = () => {
  // Initial data sorted by sequence
  const initialData = [
    { id: 1, name: "SUGAR FASTING", sequence: 1 },
    { id: 2, name: "SUGAR P.P", sequence: 2 },
    { id: 3, name: "SUGAR RANDOM", sequence: 3 },
    { id: 4, name: "BUN (BLOOD UREA NITROGEN)", sequence: 4 },
    { id: 5, name: "UREA", sequence: 4 }, // Duplicate sequence allowed as per image
    { id: 6, name: "CREATININE", sequence: 5 },
    { id: 7, name: "CHOLESTEROL", sequence: 6 },
    { id: 8, name: "HDL CHOLESTEROL", sequence: 7 },
    { id: 9, name: "VLDL CHOLESTEROL", sequence: 8 },
    { id: 10, name: "TRIGLYCERIDES", sequence: 9 },
    { id: 11, name: "URIC ACID", sequence: 10 },
    { id: 12, name: "BILIRUBIN (DIRECT & INDIRECT)", sequence: 11 },
    { id: 13, name: "SGOT (AST)", sequence: 12 },
    { id: 14, name: "SGPT (ALT)", sequence: 13 },
    { id: 15, name: "TOTAL PROTEIN", sequence: 14 },
    { id: 16, name: "ALKALINE PHOSPHATASE", sequence: 15 },
    { id: 17, name: "LIPID PROFILE", sequence: 17 },
  ];

  const [tests, setTests] = useState(initialData);

  // Handle sequence change and re-sort rows
  const handleSequenceChange = (id, newSequence) => {
    const updatedTests = tests.map((test) =>
      test.id === id ? { ...test, sequence: parseInt(newSequence) || 0 } : test
    );

    // Sort by sequence immediately
    updatedTests.sort((a, b) => a.sequence - b.sequence);

    setTests(updatedTests);
  };

  return (
    <div className="main-content">
      <div className="row">
        <div className="col-12">
          <div className="panel">
            {/* Header Design from Table.jsx */}
            <div className="panel-header">
              <h5>Test Reporting Sequence</h5>
            </div>

            <div className="panel-body">
              {/* Table Section */}
              <div className="table-responsive mb-3" style={{ height: "60vh" }}>
                <OverlayScrollbarsComponent
                    style={{ height: "100%", width: "100%" }}
                    options={{ scrollbars: { autoHide: "scroll" } }}
                >
                  <table className="table  table-hover table-bordered table-dashed">
                    <thead style={{ position: "sticky", top: 0, zIndex: 10,  }}>
                      <tr>
                        {/* Using style from legacy image for header background */}
                        <th  >Test Name</th>
                        <th className="text-end" style={{ width: "150px",   }}>Sequence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((row) => (
                        <tr key={row.id}>
                          <td className="align-middle">{row.name}</td>
                          <td className="text-end">
                            <input
                              type="number"
                              className="form-control form-control-sm text-end border-0 bg-transparent"
                              value={row.sequence}
                              onChange={(e) =>
                                handleSequenceChange(row.id, e.target.value)
                              }
                              style={{ 
                                boxShadow: 'none', 
                                padding: '0', 
                                height: 'auto' 
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </OverlayScrollbarsComponent>
              </div>

              {/* Action Buttons (Legacy Footer Style) */}
              <div className="panel border rounded p-3 bg----rt-color-dark" >
                <div className="d-flex justify-content-center flex-wrap gap-2">
                     
         
            <button className="btn btn-sm btn-primary" >New</button>
            <button className="btn btn-sm btn-primary" >Edit</button>
            <button className="btn btn-sm btn-primary">Save</button>
            <button className="btn btn-sm btn-primary" >Delete</button>
            <button className="btn btn-sm btn-primary">Undo</button>
            <button className="btn btn-sm btn-primary" >Find</button>
            <button className="btn btn-sm btn-primary" >Print</button>
            <button className="btn btn-sm btn-primary">Exit</button>
       
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

export default TestReportingSequence;