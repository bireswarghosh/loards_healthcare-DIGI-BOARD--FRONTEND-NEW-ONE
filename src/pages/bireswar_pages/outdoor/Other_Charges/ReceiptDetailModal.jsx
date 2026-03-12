import React from "react";

const ReceiptDetailModal = ({ show, setShow, data }) => {
  const receiptData = data;

  if (!show) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content"
            style={{
              width: "750px",
              height: "350px",
            }}
          >
            {/* Header */}
            <div className="modal-header py-2">
              <h6 className="modal-title">Receipt Detail</h6>
              <button
                className="btn-close"
                onClick={() => setShow(false)}
              ></button>
            </div>

            {/* Body */}
            <div
              className="modal-body px-2 py-3"
              style={{
                overflowY: "auto",
                height: "230px",
              }}
            >
              <table className="table table-bordered table-sm mb-0 ">
                <thead className="">
                  <tr>
                    <th>Rec No</th>
                    <th>Date</th>
                    <th>Receipt Type</th>
                    <th className="text-end">Disc</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {receiptData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.no}</td>
                      <td>{item.date}</td>
                      <td>{item.type}</td>
                      <td className="text-end">{item.disc}</td>
                      <td className="text-end">{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="modal-footer py-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShow(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default ReceiptDetailModal;