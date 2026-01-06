import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const BookingTable = ({ bookingList = [], onRowClick }) => {
  const navigate = useNavigate();
  return (
    <div
      className="flex-grow-1 border bg-secondary bg-opacity-25 mb-1"
      style={{ minHeight: "150px" }}
    >
      <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
        <table
          className="table table-sm table-bordered table-striped mb-0"
          style={{ fontSize: "0.8rem" }}
        >
          <thead
            className="bg-primary text-white"
            style={{ position: "sticky", top: 0, zIndex: 10 }}
          >
            <tr>
              <th>Case No.</th>
              <th>Slip No.</th>
              <th>Date</th>
              <th>Patient Name</th>
              <th>Doctor Name</th>
              <th>Bill Amount</th>
              <th>Clear Date</th>
              <th>Agent Id</th>
              <th className="text-center">Cancel</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {bookingList.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-muted">
                  No records found
                </td>
              </tr>
            ) : (
              bookingList.map((item, index) => (
                <tr key={index} style={{ cursor: "pointer" }}>
                  <td onClick={() => onRowClick(item)}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{item.CaseNo}</span>⤵️{" "}
                    </div>
                  </td>
                  <td>{item.SlipNo}</td>
                  <td>{item.Date}</td>

                  <td>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{item.PatientName}</span>
                      <button
                        type="button"
                        className="btn btn-sm px-1"
                        onClick={(e) => {
                          e.stopPropagation(); // 👈 row click block
                          // future: open patient preview
                          navigate("https://loards-healthcare-digi-board-fronte.vercel.app/CaseEntry/000003%2F25-26/edit")
                        }}
                      >
                        <i className="fa fa-eye"></i>
                      </button>
                    </div>
                  </td>

                  <td>{item.DoctorId}</td>
                  <td>{item.Amount}</td>
                  <td>{item.ClearingDate?.split("T")[0]}</td>
                  <td>{item.AgentId}</td>

                  <td className="text-center">
                    <input
                      type="checkbox"
                      // checked={item.Cancel === 1}
                      onChange={(e) => {
                        console.log("Cancel changed:", e.target.checked);
                      }}
                    />
                  </td>

                  <td>{item.Date}</td>
                </tr>
              ))
            )}

            {/* Empty filler row (same as your code) */}
            <tr style={{ height: "100%" }}>
              <td colSpan={10} className="p-0 border-0"></td>
            </tr>
          </tbody>
        </table>
      </OverlayScrollbarsComponent>
    </div>
  );
};

export default BookingTable;

// original------
{
  /* <div
            className="flex-grow-1 border bg-secondary bg-opacity-25 mb-1"
            style={{ minHeight: "150px" }}
          >
            <OverlayScrollbarsComponent
              style={{ height: "100%", width: "100%" }}
            >
              <table
                className="table table-sm table-bordered table-striped mb-0"
                style={{ fontSize: "0.8rem" }}
              >
                <thead
                  className="bg-primary text-white"
                  style={{ position: "sticky", top: 0, zIndex: 10 }}
                >
                  <tr>
                    <th>Case No.</th>
                    <th>Slip No.</th>
                    <th>Date</th>
                    <th>Patient Name </th>
                    <th>Doctor Name</th>
                    <th>Bill Amount</th>
                    <th>Clear Date</th>
                    <th>Agent Id</th>
                    <th className="text-center">Cancel</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingList.map((item, index) => (
                    <tr
                      key={index}
                      onClick={() => {
                        console.log("Form Data Set:", item);
                        setFormData(item);
                        fetchTestDetails(item.CaseId);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{item.CaseNo}</td>
                      <td>{item.SlipNo}</td>
                      <td>{item.Date}</td>
                      <td>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{item.PatientName}</span>
                          <button type="button" className="btn btn-sm  px-1">
                            <i className="fa fa-eye"></i>
                          </button>
                        </div>
                      </td>
                      <td>{item.DoctorId}</td>
                      <td>{item.Amount}</td>
                      <td>{item.ClearingDate?.split("T")[0]}</td>
                      <td>{item.AgentId}</td>
                      <td className="text-center">
                        {item.Cancel ? "Yes" : "No"}
                      </td>
                      <td>{item.Date}</td>
                    </tr>
                  ))}
                  {/* Empty State Visualization */
}
//           <tr style={{ height: "100%" }}>
//             <td colSpan={10} className="p-0 border-0"></td>
//           </tr>
//         </tbody>
//       </table>
//     </OverlayScrollbarsComponent>
//   </div> */}
