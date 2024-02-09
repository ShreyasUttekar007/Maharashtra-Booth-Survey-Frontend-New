import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import localforage from "localforage";
import "../css/dataCount.css";
import ReactToPrint from "react-to-print";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";

const API_BASE_URL = "http://65.2.189.168:5000/api/auth";

const AcDataCount = () => {
  const [combinedCounts, setCombinedCounts] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedPc, setSelectedPc] = useState("19-Chatrapati Sambhaji Nagar"); 
  const componentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = await localforage.getItem("token");

        const districtsResponse = await axios.get(
          `${API_BASE_URL}/get-pc-with-count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );

        setDistricts(districtsResponse.data.pc);
        const mumbaiCityDistrict = districtsResponse.data.pc.find(
          (district) => district._id === "19-Chatrapati Sambhaji Nagar"
        );
        if (mumbaiCityDistrict) {
          setSelectedPc(mumbaiCityDistrict._id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchBoothData = async () => {
      try {
        const storedToken = await localforage.getItem("token");

        const boothSurveyResponse = await axios.get(
          `${API_BASE_URL}/combined-counts-by-constituency/${selectedPc}`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );

        setCombinedCounts(boothSurveyResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchBoothData();
  }, [selectedPc]);

  return (
    <div>
      <Dashboard />
      <h2>AC-Wise Booth Survey Tracker</h2>
      <div className="select-button">
        <label>Select PC :</label>
        <select
          value={selectedPc}
          onChange={(e) => setSelectedPc(e.target.value)}
        >
          {districts
            .slice()
            .sort((a, b) => a._id.localeCompare(b._id))
            .map((district) => (
              <option key={district._id} value={district._id}>
                {district._id}
              </option>
            ))}
        </select>
      </div>

      <div className="percentage-div" id="pdf-content" ref={componentRef}>
        {combinedCounts && combinedCounts.constituencyData && (
          <div className="main-percentage">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-align2">Ac Name</th>
                  <th className="text-align">Total Booths</th>
                  <th className="text-align">Completed Booths</th>
                  <th className="text-align">Completed Booth Percentage(%)</th>
                </tr>
              </thead>
              <tbody>
                {combinedCounts.constituencyData
                  .sort(
                    (a, b) =>
                      b.completedBooths / b.totalBooths -
                      a.completedBooths / a.totalBooths
                  )
                  .map((district) => (
                    <tr key={district._id}>
                      <td>{district._id}</td>
                      <td className="text-align">{district.totalBooths}</td>
                      <td className="text-align">{district.completedBooths}</td>
                      <td className="text-align">
                        {(
                          (district.completedBooths / district.totalBooths) *
                          100
                        ).toFixed(2)}
                        %
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td className="text-align">
                    {combinedCounts.totals.totalBooths}
                  </td>
                  <td className="text-align">
                    {combinedCounts.totals.totalCompletedBooths}
                  </td>
                  <td className="text-align">
                    {(
                      (combinedCounts.totals.totalCompletedBooths /
                        combinedCounts.totals.totalBooths) *
                      100
                    ).toFixed(2)}
                    %
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
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

export default AcDataCount;
