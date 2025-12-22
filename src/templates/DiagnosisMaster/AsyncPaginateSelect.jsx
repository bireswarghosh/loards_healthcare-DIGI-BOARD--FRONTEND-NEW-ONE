import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import axiosInstance from "../../axiosInstance";

const AsyncPaginateSelect = ({
  value,
  onChange,
  apiUrl,
  getByIdUrl,
  labelKey,
  valueKey,
  placeholder,
  isDisabled = false,

  searchKey = "search",
  minSearchLength = 1,   // 👈 empty search block
  loadOnOpen = false,    // 👈 avoid auto spam
  limit = 20,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");

  const debounceRef = useRef(null);

  /* ===== PRESELECT (EDIT MODE) ===== */
  useEffect(() => {
    if (!value || !getByIdUrl) return;
    if (selectedOption?.value === value) return;

    (async () => {
      try {
        const res = await axiosInstance.get(`${getByIdUrl}/${value}`);
        const d = res.data?.data;
        if (d) {
          setSelectedOption({
            label: d[labelKey],
            value: d[valueKey],
          });
        }
      } catch {}
    })();
  }, [value]);

  /* ===== LOAD OPTIONS ===== */
  const loadOptions = async (search = "", nextPage = 1, append = false) => {
    if (search.length < minSearchLength) return;
    if (loading || (!hasMore && append)) return;

    setLoading(true);

    try {
      const res = await axiosInstance.get(apiUrl, {
        params: {
          ...(searchKey ? { [searchKey]: search } : {}),
          page: nextPage,
          limit,
        },
      });

      const list = res.data?.data || [];

      const mapped = list.map((i) => ({
        label: i[labelKey],
        value: i[valueKey],
      }));

      setOptions((prev) => (append ? [...prev, ...mapped] : mapped));
      setPage(nextPage);
      setHasMore(list.length === limit);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      value={selectedOption}
      options={options}
      isLoading={loading}
      isDisabled={isDisabled}
      placeholder={placeholder}

      /* ===== SIMPLE DARK STYLE ===== */
      styles={{
        control: (b) => ({ ...b, background: "#000", color: "#fff" }),
        singleValue: (b) => ({ ...b, color: "#fff" }),
        input: (b) => ({ ...b, color: "#fff" }),
        menu: (b) => ({ ...b, background: "#000", color: "#fff", zIndex: 99999 }),
        option: (b, s) => ({
          ...b,
          background: s.isFocused ? "#222" : "#000",
          color: "#fff",
        }),
      }}

      onChange={(opt) => {
        setSelectedOption(opt);
        onChange?.(opt);
      }}

      /* ===== DEBOUNCED SEARCH ===== */
      onInputChange={(val, { action }) => {
        if (action === "input-change") {
          setSearchText(val);
          setHasMore(true);
          setPage(1);
          setOptions([]);

          clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            loadOptions(val, 1, false);
          }, 400); // 👈 debounce
        }
        return val;
      }}

      /* ===== PAGINATION ===== */
      onMenuScrollToBottom={() => {
        if (hasMore && searchText.length >= minSearchLength) {
          loadOptions(searchText, page + 1, true);
        }
      }}
    />
  );
};

export default AsyncPaginateSelect;
