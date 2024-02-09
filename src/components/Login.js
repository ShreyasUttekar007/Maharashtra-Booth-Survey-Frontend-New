import React, { useState } from "react";
import axios from "axios";
import "../css/login.css";
import img from "../STC_logo-01.png";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://65.2.189.168:5000/api/auth/login",
        {
          email,
          password,
        }
      );
      const token = response.data.token;
      const id = response.data.userObj._id;
      const role = response.data.userObj.roles[0];
      const roles = response.data.userObj.roles;
      localforage.setItem("token", token);
      localforage.setItem("ID", id);
      localforage.setItem("role", role);
      localforage.setItem("roles", JSON.stringify(roles));

      console.log("Login success:", response.data.message);
      navigate("/viewboothdata");
    } catch (error) {
      alert("Error Logging In!! please check the entered credentials");
      console.error("Login failed:", error.response.data.message);
    }
  };

  return (
    <div className="container">
      <div className="login">
        <img src={img} className="img" alt="STC Logo" />
        <h1 className="Header">Sign In</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <div className="bttn">
            <button type="submit" className="button">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
