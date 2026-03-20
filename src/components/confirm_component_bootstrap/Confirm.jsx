import { useContext } from "react";
import { DigiContext } from "../../context/DigiContext";

const Confirm = () => {
  const { confirmYN, setConfirmYN, showConfirm, setShowConfirm } =
    useContext(DigiContext);
  return (
    <>
      {/* 🔴 BACKDROP */}
      <div className="modal-backdrop show"></div>

      {/* 🔵 MODAL */}
      <div className="modal show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Theme Change Confirmation</h5>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to change the color?</p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setConfirmYN(true);
                }}
              >
                Yes
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setConfirmYN(false);
                  setShowConfirm(false);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Confirm;
