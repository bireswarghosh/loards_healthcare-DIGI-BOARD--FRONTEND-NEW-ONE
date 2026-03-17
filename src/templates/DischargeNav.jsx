import { useNavigate } from 'react-router-dom';
import React from "react";
import { NavLink, useParams } from "react-router-dom";

const DischargeNav = () => {
   const { id } = useParams();
   const navigate = useNavigate();
  // return (
  //   <div className="container my-3">
  //     <ul className="nav nav-pills gap-2">
  //       <li className="nav-item">
  //         <NavLink
  //           to="/discharge"
  //           className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
  //         >
  //           📋 List
  //         </NavLink>
  //       </li>

  //       {/* <li className="nav-item">
  //         <NavLink
  //           to={`/discharge/add`}
  //           className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
  //         >
  //           Add
  //         </NavLink>
  //       </li> */}

        
  //       {id && (
  //         <li className="nav-item">
  //           <NavLink
  //             to={id ? `/discharge/${encodeURIComponent(id)}` : "#"}
  //             className={({ isActive }) =>
  //               `nav-link ${isActive ? "active" : ""}`
  //             }
  //           >
  //             🔍 Detail
  //           </NavLink>
  //         </li>
  //       )}

  //       <li className="nav-item">
  //         <NavLink
  //           to={id ? `/discharge/${encodeURIComponent(id)}/advice` : "#"}
  //           className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
  //         >
  //           📝 Advice
  //         </NavLink>
  //       </li>
  //       <li className="nav-item">
  //         <NavLink
  //           to={id ? `/discharge/${encodeURIComponent(id)}/mrd` : "#"}
  //           className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
  //         >
  //           MRD
  //         </NavLink>
  //       </li>
  //     </ul>


  //     <button
  //                   className="btn btn-sm btn-danger"
  //                   onClick={() => {
  //                    navigate(-1)
  //                   }}
  //                 >
  //                   Back
  //                 </button>
  //   </div>
  // );


  return (
    <div className="container my-3 d-flex align-items-center">

  <ul className="nav nav-pills gap-2">
    <li className="nav-item">
      <NavLink
        to="/discharge"
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      >
        📋 List
      </NavLink>
    </li>

    {id && (
      <li className="nav-item">
        <NavLink
          to={id ? `/discharge/${encodeURIComponent(id)}` : "#"}
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          🔍 Detail
        </NavLink>
      </li>
    )}

    <li className="nav-item">
      <NavLink
        to={id ? `/discharge/${encodeURIComponent(id)}/advice` : "#"}
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      >
        📝 Advice
      </NavLink>
    </li>

    <li className="nav-item">
      <NavLink
        to={id ? `/discharge/${encodeURIComponent(id)}/mrd` : "#"}
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      >
        MRD
      </NavLink>
    </li>
  </ul>

  <button
    className="btn btn-sm btn-danger ms-auto"
    onClick={() => {
      navigate(-1);
    }}
  >
    Back
  </button>

</div>)
};

export default DischargeNav;