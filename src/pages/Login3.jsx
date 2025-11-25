import React, { useState, useContext } from 'react';
import Footer from '../components/footer/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { DigiContext } from '../context/DigiContext';
import axiosInstance from '../axiosInstance';
import { useAuth } from '../context/AuthContext';

const Login3 = () => {
  const { passwordVisible, togglePasswordVisibility, isLightTheme } = useContext(DigiContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
    
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", {
        username,
        password
      });
      
      if (response.data && response.data.message === "Login successful") {
        const token = btoa(`${username}:${Date.now()}`);
        const userId = response.data.userId;
        
        login(token, userId);
        navigate("/");
      }
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Login failed. Please check your credentials."
      );
      setLoading(false);
    }
  };

  return (
    <div className="main-content login-panel login-panel-3">
      <div className="container">
        <div className="d-flex justify-content-end">
          <div className="login-body">
            <div className="top d-flex justify-content-between align-items-center">
              <div className="logo">
                <img src={`${isLightTheme ? "assets/images/logo-black.png" : "assets/images/logo-big.png"}`} alt="Logo" style={{width: "60%"}} />
              </div>
              <Link to="/"><i className="fa-duotone fa-house-chimney"></i></Link>
            </div>
            <div className="bottom">
              <h3 className="panel-title">Login</h3>
              {error && (
                <div className="alert alert-danger mb-3" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="input-group mb-25">
                  <span className="input-group-text"><i className="fa-regular fa-user"></i></span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Username or email address"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group mb-20">
                  <span className="input-group-text"><i className="fa-regular fa-lock"></i></span>
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    className="form-control rounded-end"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Link
                    role="button"
                    className="password-show"
                    onClick={togglePasswordVisibility}
                  >
                    <i className="fa-duotone fa-eye"></i>
                  </Link>
                </div>
                <div className="d-flex justify-content-between mb-25">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id="loginCheckbox" />
                    <label className="form-check-label text-white" htmlFor="loginCheckbox">
                      Remember Me
                    </label>
                  </div>
                  <Link to="/resetPassword" className="text-white fs-14">Forgot Password?</Link>
                </div>
                <button className="btn btn-primary w-100 login-btn" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
              <div className="other-option">
                <p>Or continue with</p>
                <div className="social-box d-flex justify-content-center gap-20">
                  <Link to="#"><i className="fa-brands fa-facebook-f"></i></Link>
                  <Link to="#"><i className="fa-brands fa-twitter"></i></Link>
                  <Link to="#"><i className="fa-brands fa-google"></i></Link>
                  <Link to="#"><i className="fa-brands fa-instagram"></i></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login3;