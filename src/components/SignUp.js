import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { styles } from "react-select";
import "../css/signup.css";
import img from "../STC_logo-01.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "./Sidebar";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const history = useNavigate();

  const handleRoleChange = (selectedRoles) => {
    setRoles(selectedRoles.map((role) => role.value));
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://65.2.189.168:5000/api/auth/signup",
        {
          email,
          password,
          roles,
        }
      );
      console.log("Sign Up success:", response.data.message);
      history("/viewboothdata");
    } catch (error) {
      console.error("Sign Up failed:", error.response.data.message);
    }
  };

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "mod", label: "Moderator" },
    { value: "user", label: "User" },
    { value: "1-Nandurbar (ST)", label: "Nandurbar (ST)" },
    { value: "2-Dhule", label: "Dhule" },
    { value: "3-Jalgaon", label: "Jalgaon" },
    { value: "4-Raver", label: "Raver" },
    { value: "5-Buldhana", label: "Buldhana" },
    { value: "6-Akola", label: "Akola" },
    { value: "7-Amravati (SC)", label: "Amravati (SC)" },
    { value: "8-Wardha", label: "Wardha" },
    { value: "9-Ramtek (SC)", label: "Ramtek (SC)" },
    { value: "10-Nagpur", label: "Nagpur" },
    { value: "11-Bhandara-Gondiya", label: "Bhandara-Gondiya" },
    { value: "12-Gadchiroli-Chimur (ST)", label: "Gadchiroli-Chimur (ST)" },
    { value: "13-Chandrapur", label: "Chandrapur" },
    { value: "14-Yavatmal-Washim", label: "Yavatmal-Washim" },
    { value: "15-Hingoli", label: "Hingoli" },
    { value: "16-Nanded", label: "Nanded" },
    { value: "17-Parbhani", label: "Parbhani" },
    { value: "18-Jalna", label: "Jalna" },
    {
      value: "19-Chatrapati Sambhaji Nagar",
      label: "Chatrapati Sambhaji Nagar",
    },
    { value: "20-Dindori (ST)", label: "Dindori (ST)" },
    { value: "21-Nashik", label: "Nashik" },
    { value: "22-Palghar (ST)", label: "Palghar (ST)" },
    { value: "23-Bhiwandi", label: "Bhiwandi" },
    { value: "24-Kalyan", label: "Kalyan" },
    { value: "25-Thane", label: "Thane" },
    { value: "26-Mumbai North", label: "Mumbai North" },
    { value: "27-Mumbai North-West", label: "Mumbai North-West" },
    { value: "28-Mumbai North-East", label: "Mumbai North-East" },
    { value: "29-Mumbai North-Central", label: "Mumbai North-Central" },
    { value: "30-Mumbai South-Central", label: "Mumbai South-Central" },
    { value: "31-Sindhudurg", label: "Sindhudurg" },
    { value: "32-Raigad", label: "Raigad" },
    { value: "33-Maval", label: "Maval" },
    { value: "34-Pune", label: "Pune" },
    { value: "35-Baramati", label: "Baramati" },
    { value: "36-Shirur", label: "Shirur" },
    { value: "37-Ahmednagar", label: "Ahmednagar" },
    { value: "38-Shirdi (SC)", label: "Shirdi (SC)" },
    { value: "39-Dharashiv", label: "Dharashiv" },
    { value: "40-Latur (SC)", label: "Latur (SC)" },
    { value: "41-Latur (SC)", label: "Latur" },
    { value: "42-Solapur (SC)", label: "Solapur" },
    { value: "43-Madha", label: "Madha" },
    { value: "44-Sangli", label: "Sangli" },
    { value: "45-Satara", label: "Satara" },
    { value: "46-Ratnagiri-Sindhudurg", label: "Ratnagiri" },
    { value: "47-Kolhapur", label: "Kolhapur" },
    { value: "48-Hatkanangle", label: "Hatkanangle" },
  ];

  const customStyles = {
    indicatorSeparator: (provided, state) => ({
      ...provided,
      display:
        state.selectProps.value && state.selectProps.value.length > 0
          ? "block"
          : "none",
    }),
    control: (provided, state) => ({
      ...provided,
      border: state.isFocused ? "2px solid #4CAF50" : "2px solid #ccc",
      borderRadius: "4px",
      boxShadow: state.isFocused ? "0 0 5px rgba(76, 175, 80, 0.7)" : "none",
      cursor: "pointer",
    }),
  };

  return (
    <>
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="container">
        <div className="login" style={{ width: "350px", marginTop: "120px" }}>
          <img src={img} className="img" alt="STC Logo" />
          <h1>Sign Up</h1>
          <form onSubmit={handleSubmit} style={{ alignItems: "center" }}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "300px" }}
            />
            <div
              className="password-input"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                marginBottom: "20px",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "300px" }}
              />
              <div
                className="eye-icon"
                onClick={toggleShowPassword}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </div>
            </div>
            <div
              className="roles"
              style={{
                width: "300px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label style={{ marginBottom: "5px", textAlign: "center" }}>
                Select Roles
              </label>
              <Select
                isMulti
                options={roleOptions}
                value={roleOptions.filter((role) => roles.includes(role.value))}
                onChange={handleRoleChange}
                styles={customStyles}
              />
            </div>

            <div className="bttn">
              <button type="submit" className="button">
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
