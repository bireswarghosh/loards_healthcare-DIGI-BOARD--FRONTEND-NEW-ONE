import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "..//axiosInstance";

const useAxiosFetch = (url, deps = []) => {
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(url);
      setData(res.data?.success ? res.data.data : []);
    } catch (err) {
      setError(err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: fetchData };
};

export default useAxiosFetch;
