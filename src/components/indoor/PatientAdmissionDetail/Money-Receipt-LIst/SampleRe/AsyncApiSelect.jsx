import { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";


export default function AsyncApiSelect({
  api,
  value,
  onChange,
  placeholder = "Search...",
  labelKey = "label",
  valueKey = "value",
  searchKey = "admissionId",
  pageKey = "page",
  defaultPage = 1,
  isDisabled = false,
}) {
  const [selectedOption, setSelectedOption] = useState(null);


  // ------------------------------------------------
  // 🔹 PRELOAD DATA (edit mode)
  // ------------------------------------------------
  useEffect(() => {
    if (!value) return;


    const url = `${api}?${searchKey}=${value}&${pageKey}=1`;


    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        const list = res?.data || [];   // 🔥 FIX


        if (list.length === 0) return;


        const item = list[0];


        setSelectedOption({
          value: item[valueKey],
          label: item[labelKey],
        });
      })
      .catch((err) => console.error("Preload error:", err));
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


      const list = result?.data || [];   // 🔥 FIX


      return list.map((item) => ({
        value: item[valueKey],
        label: item[labelKey],
      }));
    } catch (err) {
      console.error("Search error:", err);
      return [];
    }
  };


  return (
    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      value={selectedOption}
      onChange={(opt) => {
        setSelectedOption(opt);
        onChange(opt ? opt : null);
      }}
      placeholder={placeholder}
      isClearable
    />
  );
}
