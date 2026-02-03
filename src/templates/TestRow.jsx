import { useEffect } from "react";
// import AsyncApiSelect from "digiboard-react-lordshealthcare-main\src\components\indoor\PatientAdmissionDetail\Money-Receipt-LIst\SampleRe\AsyncApiSelect.jsx";
// import useAxiosFetch from "./Fetch";
import AsyncApiSelect from "../components/indoor/PatientAdmissionDetail/Money-Receipt-LIst/SampleRe/AsyncApiSelect";
// digiboard-react-lordshealthcare-main\src\templates\DiagnosisMaster\Fetch.js
import useAxiosFetch from "..//../src/templates/DiagnosisMaster/Fetch";

const TestRow = ({ row, index, onTestChange, onRateUpdate, removeRow }) => {
  const testId = row.testOption?.value;

  const { data: singleTest } = useAxiosFetch(
    testId ? `/tests/${testId}` : null,
    [testId]
  );

  // 🔥 Notify parent when rate changes
  // useEffect(() => {
  //   if (!testId) {
  //     onRateUpdate(index, 0);
  //   } else {
  //     onRateUpdate(index, Number(singleTest?.Rate || 0));
  //   }
  // }, [testId, singleTest?.Rate, index, onRateUpdate]);

  useEffect(() => {
    const rate = testId ? Number(singleTest?.Rate || 0) : 0;
    onRateUpdate(index, rate);
  }, [testId, singleTest?.Rate]);


  return (
    <tr>
      <td>{index + 1}</td>

      <td className="col-md-5">
        <AsyncApiSelect
          api="https://lords-backend.onrender.com/api/v1/tests/search/advanced"
          value={row.testOption}
          onChange={(opt) => onTestChange(index, opt)}
          searchKey="test"
          labelKey="Test"
          valueKey="TestId"
          defaultPage={1}
        />
      </td>

      <td>{testId ? singleTest?.Rate ?? "-" : "-"}</td>

      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm  btn-outline-danger "
          onClick={() => {removeRow(index)
              console.log(index);}
          }
        
          
          title="Remove"
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

export default TestRow;