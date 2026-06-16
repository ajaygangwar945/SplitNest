import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await axios.post(
        "https://splitnest-backend-api.onrender.com/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      toast.success("Registration Successful");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Registration Failed"
      );
    }
  };

  return (
    <div className="auth-container">
      {/* Floating Background Elements */}
      <div className="floating-shape shape-1">💸</div>
      <div className="floating-shape shape-2">🧾</div>
      <div className="floating-shape shape-3">💳</div>
      <div className="floating-shape shape-4">🤝</div>
      <div className="floating-shape shape-5">💰</div>
      <div className="floating-shape shape-6">📊</div>

      <div className="auth-card">
        <div className="logo-container">
          <img src="/favicon.png" alt="SplitNest Logo" />
        </div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join SplitNest to easily track your shared expenses</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <a href="/">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
