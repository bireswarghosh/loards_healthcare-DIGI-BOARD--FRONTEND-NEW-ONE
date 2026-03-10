import React, { useState } from "react";

import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import axiosInstance from "../../../axiosInstance";

const PathologistLogin = () => {

  const navivagate=useNavigate()
  const [formData, setFormData] = useState({
    Pathologist: "",
    PassWord: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post(
        "/loginpathologist",
        formData
      );
navivagate("/PathologyDashboard")
      console.log(res.data);

      toast.success("Login successful")

      // user data store
      localStorage.setItem("pathologist", JSON.stringify(res.data.data));
      
    } catch (error) {
      console.log(error.response?.data?.message || "Login failed");
      toast.error("Login Failled")
      
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-header text-center">
              <h4>Pathologist Login</h4>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>

                  <input
                    type="text"
                    className="form-control"
                    name="Pathologist"
                    value={formData.Pathologist}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>

                  <input
                    type="password"
                    className="form-control"
                    name="PassWord"
                    value={formData.PassWord}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathologistLogin;
