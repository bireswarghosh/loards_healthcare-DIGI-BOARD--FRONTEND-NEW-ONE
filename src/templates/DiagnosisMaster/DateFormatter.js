export const DateFormatter = (date) => {
  if (!date) return "";

  // Handle Date object
  if (date instanceof Date) {
    date = date.toISOString().split("T")[0];
  }

  // ISO handle (2026-03-31T...)
  const cleanDate = date.includes("T") ? date.split("T")[0] : date;

  const [y, m, d] = cleanDate.split("-");
  if (!y || !m || !d) return "";

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthName = monthNames[parseInt(m, 10) - 1];

  return `${d} ${monthName} ${y}`;
};

export const to12HourTime = (time) => {
  if (!time) return "";

  // handle "HH:mm" or "HH:mm:ss"
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr, 10);

  if (isNaN(hour)) return "";

  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  hour = hour === 0 ? 12 : hour; // 0 → 12

  return `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
};
