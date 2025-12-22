import { useState, useEffect, useRef } from "react";

const DoctorSearchSelect = ({
  label = "Doctor",
  value,              // selected DoctorId
  onChange,           // (doctorId, doctorName)
  doctorList = [],
  disabled = false,
  placeholder = "Search doctor...",
}) => {
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  // set name from id (edit / view time)
  useEffect(() => {
    if (value && doctorList.length) {
      const doc = doctorList.find((d) => d.DoctorId == value);
      setSearch(doc?.Doctor || "");
    }
  }, [value, doctorList]);

  // click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = search
    ? doctorList.filter((d) =>
        d.Doctor?.toLowerCase().includes(search.toLowerCase())
      )
    : doctorList;

  return (
    <div className="position-relative" ref={ref}>
      <label className="form-label">{label}</label>

      <input
        className="form-control"
        placeholder={placeholder}
        value={search}
        onFocus={() => !disabled && setShow(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setShow(true);
        }}
        disabled={disabled}
      />

      {show && !disabled && (
        <div
          className="border rounded bg-black position-absolute w-100 mt-1"
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 9999,
          }}
        >
          {filtered.length === 0 ? (
            <div className="px-2 py-1 text-muted">
              No doctor found
            </div>
          ) : (
            filtered.slice(0, 20).map((d) => (
              <div
                key={d.DoctorId}
                className="px-2 py-1 dropdown-item"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  onChange(d.DoctorId, d.Doctor);
                  setSearch(d.Doctor);
                  setShow(false);
                }}
              >
                {d.Doctor}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorSearchSelect;
