import React, { useEffect, useState } from "react";
import "../css/sidebar.css";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const logout = async () => {
    await localforage.removeItem("token");
    await localforage.removeItem("ID");
    await localforage.removeItem("email");
    navigate("/");
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedRole = await localforage.getItem("role");
        if (storedRole) {
          setRole(storedRole);
        } else {
          console.log("Role not found in localforage.");
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <div>
      <div
        className={`w3-sidebar w3-bar-block w3-card w3-animate-left ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="close-div">
          <button className="sidebar-close-button" onClick={closeSidebar}>
            Close &times;
          </button>
          <a href="/viewboothdata" className="w3-bar-item w3-button">
            Dashboard
          </a>
          {role !== "mod" ? null : (
            <a href="/datacount" className="w3-bar-item w3-button">
              User Data Count
            </a>
          )}
          {role !== "mod" ? null : (
            <a href="/districtdata" className="w3-bar-item w3-button">
              PC Data Count
            </a>
          )}
          {role !== "mod" ? null : (
            <a href="/acdata" className="w3-bar-item w3-button">
              Ac Data Count
            </a>
          )}
          {role !== "mod" ? null : (
            <a href="/signup" className="w3-bar-item w3-button">
              Create User
            </a>
          )}
          <a href="/" className="w3-bar-item w3-button" onClick={logout}>
            Logout
          </a>
        </div>
      </div>

      <div id="main">
        <button id="openNav" className="sidebar-button" onClick={openSidebar}>
          &#9776;
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
