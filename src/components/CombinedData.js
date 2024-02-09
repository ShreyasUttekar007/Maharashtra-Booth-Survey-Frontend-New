import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import localforage from "localforage";
import "../css/dataCount.css";
import ReactToPrint from "react-to-print";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";

const API_BASE_URL = "http://65.2.189.168:5000/api/auth";

const CombinedDataCount = () => {
  const [combinedData, setCombinedData] = useState([]);
  const [expandedPCs, setExpandedPCs] = useState({});
  const [selectedPC, setSelectedPC] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortedColumn, setSortedColumn] = useState(null);
  const componentRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = await localforage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/combined-counts-by-pc`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );

        setCombinedData(response.data.pcData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleToggleAC = (pc) => {
    setExpandedPCs((prevState) => ({
      ...prevState,
      [pc]: !prevState[pc],
    }));
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleSort = (columnName) => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
    setSortedColumn(columnName);
  };

  const sortedData = combinedData.sort((a, b) => {
    const aValue =
      sortedColumn === "pc"
        ? capitalizeFirstLetter(a.pc.split("-")[1].trim())
        : a[sortedColumn];
    const bValue =
      sortedColumn === "pc"
        ? capitalizeFirstLetter(b.pc.split("-")[1].trim())
        : b[sortedColumn];

    if (sortedColumn === "pc") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
  });

  const sortIcon = (columnName) => {
    if (sortedColumn === columnName) {
      return sortOrder === "asc" ? <span>&#9650;</span> : <span>&#9660;</span>;
    }
    return null;
  };

  const handleConstituencyClick = (pc, constituencyName) => {
    navigate(`/viewboothdata?pc=${pc}&constituency=${constituencyName}`);
  };
  

  return (
    <div>
      <Dashboard />
      <h2>PC & AC-Wise Booth Survey Tracker</h2>

      <div className="percentage-div" id="pdf-content" ref={componentRef}>
        <div className="main-percentage">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-align2" onClick={() => handleSort("pc")}>
                  Parliamentary Constituency {sortIcon("pc")}
                </th>
                <th
                  className="text-align"
                  onClick={() => handleSort("totalBooths")}
                >
                  Total Booths {sortIcon("totalBooths")}
                </th>
                <th
                  className="text-align"
                  onClick={() => handleSort("completedBooths")}
                >
                  Completed Booths {sortIcon("completedBooths")}
                </th>
                <th className="text-align">Completed Booth Percentage(%)</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((pc) => (
                <React.Fragment key={pc.pc}>
                  <tr>
                    <td>
                      {pc.pc}
                      <button
                        onClick={() => handleToggleAC(pc.pc)}
                        className="button-plus"
                      >
                        {expandedPCs[pc.pc] ? (
                          <span style={{ fontSize: "22px" }}>-</span>
                        ) : (
                          <span style={{ fontSize: "22px" }}>+</span>
                        )}
                      </button>
                    </td>
                    <td className="text-align">{pc.totalBooths}</td>
                    <td className="text-align">{pc.completedBooths}</td>
                    <td className="text-align">
                      {((pc.completedBooths / pc.totalBooths) * 100).toFixed(2)}
                      %
                    </td>
                  </tr>
                  {expandedPCs[pc.pc] &&
                    pc.constituencies.map((ac) => (
                      <tr
                        key={ac.constituencyName}
                        className="const-back"
                        onClick={() =>
                          handleConstituencyClick(pc.pc, ac.constituencyName)
                        }
                      >
                        <td>
                          <a href="">{ac.constituencyName}</a>
                        </td>
                        <td className="text-align">{ac.totalBooths}</td>
                        <td className="text-align">{ac.completedBooths}</td>
                        <td className="text-align">
                          {(
                            (ac.completedBooths / ac.totalBooths) *
                            100
                          ).toFixed(2)}
                          %
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="export-button">
        <ReactToPrint
          trigger={() => <button>Export PDF</button>}
          content={() => componentRef.current}
          pageStyle={`@page { margin: 20mm 0; }`}
        />
      </div>
    </div>
  );
};

export default CombinedDataCount;
