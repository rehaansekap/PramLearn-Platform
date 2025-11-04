import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./hooks/useAuth";

const Register = () => {
  const { register, error } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    privacyPolicies: false,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
    navigate("/login");
  };

  return (
    <div className="auth-wrapper d-flex align-center justify-center pa-4">
      <div className="position-relative my-sm-16">
        <div className="auth-card" max-width="460">
          <h4 className="text-h4 mb-1">Adventure starts here 🚀</h4>
          <p className="mb-0">Make your app management easy and fun!</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <div>
              <input
                type="checkbox"
                name="privacyPolicies"
                checked={form.privacyPolicies}
                onChange={(e) =>
                  setForm({ ...form, privacyPolicies: e.target.checked })
                }
                required
              />
              <label>I agree to privacy policy & terms</label>
            </div>
            <button type="submit">Sign up</button>
          </form>
          {error && <p>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Register;
