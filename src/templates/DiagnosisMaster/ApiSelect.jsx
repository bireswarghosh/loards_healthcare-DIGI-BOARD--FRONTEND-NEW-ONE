import { useEffect, useState } from "react";
import Select from "react-select";

/**
 * Reusable API Select Component
 *
 * Props:
 * - api (string)           → API endpoint
 * - value (number|string) → selected ID
 * - onChange (function)   → returns selected ID
 * - placeholder (string)
 * - labelKey (string)     → API label field (default: name)
 * - valueKey (string)     → API id field (default: id)
 */
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

  return (
    <Select className="form-control form-control-sm"
      options={options}
      value={selectedOption}
      onChange={opt => onChange(opt ? opt.value : null)}
      placeholder={placeholder}
      isSearchable
      isClearable
      isLoading={loading}
    />
  );
}