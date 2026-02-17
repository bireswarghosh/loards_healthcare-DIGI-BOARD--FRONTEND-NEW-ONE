import { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";

export default function AsyncApiSelect({
  api,
  value,
  onChange,
  showKey,
  placeholder = "Search...",
  labelKey = "label",
  valueKey = "value",
  searchKey = "admissionId",
  pageKey = "page",
  defaultPage = 1,
  isDisabled = false,
}) {
  const [selectedOption, setSelectedOption] = useState(null);






  useEffect(() => {
    if (!value) return;


    // 🔥 value can be string OR object
    const q = typeof value === "string" ? value : value?.value;


    if (!q) return;


    fetch(`${api}?${searchKey}=${encodeURIComponent(q)}&${pageKey}=1`)
      .then((res) => res.json())
      .then((res) => {
        const item = res?.data?.[0];
        if (!item) return;


        setSelectedOption({
          value: item[valueKey],
          label: item[labelKey],
        });
      });
  }, [value]);


  // ------------------------------------------------
  // 🔹 SEARCH
  // ------------------------------------------------
  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];


    const url = `${api}?${searchKey}=${inputValue}&${pageKey}=${defaultPage}`;


    try {
      const res = await fetch(url);
      const result = await res.json();


      const list = result?.data || [];


      return list.map((item) => ({
        value: item[valueKey],


        label: showKey
          ? `${item[labelKey]}-${item[showKey]}`
          : `${item[labelKey]}`,
      }));
    } catch (err) {
      console.error("Search error:", err);
      return [];
    }
  };


  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "31px",
      height: "31px",
      fontSize: "0.875rem",
      backgroundColor: "#fff",


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
      // color: "#000",
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
    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      // value={selectedOption}
      value={value ?? selectedOption}
      onChange={(opt) => {
        setSelectedOption(opt);
        onChange(opt ? opt : null);
      }}
      placeholder={placeholder}
      isClearable
      menuPortalTarget={document.body}
      menuPosition="fixed"
      styles={customStyles}
      isDisabled={isDisabled}
    />
  );
}



