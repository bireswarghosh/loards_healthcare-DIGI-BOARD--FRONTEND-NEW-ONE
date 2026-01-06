const PaginationBar = ({ pageNo, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex justify-content-center mt-3">
      <ul className="pagination pagination-sm">
        {/* PREV */}
        <li className={`page-item ${pageNo === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(pageNo - 1)}
          >
            Prev
          </button>
        </li>

        {/* PAGE INFO */}
        <li className="page-item">
          <button className="page-link" disabled>
            {pageNo}/{totalPages}
          </button>
        </li>

        {/* NEXT */}
        <li className={`page-item ${pageNo === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(pageNo + 1)}
          >
            Next
          </button>
        </li>
      </ul>
    </div>
  );
};

export default PaginationBar;
