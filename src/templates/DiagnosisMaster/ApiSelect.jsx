import { useEffect, useState } from "react";
import Select from "react-select";




export default function ApiSelect({
  api,
  value,
  onChange,
  placeholder = "Select",
  labelKey = "name",
  valueKey = "id",
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setLoading(true);


    fetch(api)
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const items = Array.isArray(data) ? data : data.data || [];
        const formatted = items.map(item => ({
          value: item[valueKey],
          label: item[labelKey],
        }));
        setOptions(formatted);
      })
      .catch(err => {
        console.error("ApiSelect fetch error:", err);
        setOptions([]);
      })
      .finally(() => setLoading(false));
  }, [api, labelKey, valueKey]);


  // ID → react-select object
  const selectedOption =
    options.find(opt => opt.value === value) || null;


const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "31px",
    height: "31px",
    fontSize: "0.875rem",
    backgroundColor: "white",
    borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
    boxShadow: state.isFocused ? "0 0 0 .2rem rgba(13,110,253,.25)" : "none",
    "&:hover": {
      borderColor: "#86b7fe",
    },
  }),


  /* 🔥 DROPDOWN MENU */
  menu: (base) => ({
    ...base,
    // backgroundColor: "primary", // black dropdown
    color: "#fff",
    zIndex: 9999,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),


  menuList: (base) => ({
    ...base,
    padding: 0,
    zIndex: 9999,
  }),


  /* 🔥 EACH OPTION */
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#0d6efd" // selected = bootstrap blue
      : state.isFocused
        ? "#9a9c9e" // hover = dark gray
        : "#d3cfcf", // normal = black
    color: "#000",
    cursor: "pointer",
    fontSize: "0.875rem",
  }),


  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
  }),


  indicatorsContainer: (base) => ({
    ...base,
    height: "31px",
  }),


  dropdownIndicator: (base) => ({
    ...base,
    padding: "2px",
  }),


  clearIndicator: (base) => ({
    ...base,
    padding: "2px",
  }),
};




  return (
    <Select
      className=""
      options={options}
      value={selectedOption}
      onChange={(opt) => onChange(opt ? opt.value : null)}
      placeholder={placeholder}
      isSearchable
      isClearable
      isLoading={loading}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      styles={customStyles}
    />
  );
}

