import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import localforage from "localforage";
import "../css/dataCount.css";
import Sidebar from "./Sidebar";
import ReactToPrint from "react-to-print";

const API_BASE_URL = "http://65.2.189.168:5000/api/auth";

const PcDataCount = () => {
  const [combinedCounts, setCombinedCounts] = useState(null);
  const componentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = await localforage.getItem("token");
        
        const response = await axios.get(`${API_BASE_URL}/combined-counts-by-pc`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        setCombinedCounts(response.data);
      } catch (error) {
        console.error("Error fetching count data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Sidebar />
       <div className="percentage-div" id="pdf-content" ref={componentRef}>
        {combinedCounts && combinedCounts.pcData && (
          <div className="main-percentage">
            <h2>PC-Wise Booth Survey Tracker</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-align2">Parliamentary Constituency</th>
                  <th className="text-align">Total Booths</th>
                  <th className="text-align">Completed Booths</th>
                  <th className="text-align">Completed Booth Percentage(%)</th>
                </tr>
              </thead>
              <tbody>
                {combinedCounts.pcData
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
                  <td className="text-align">{combinedCounts.totals.totalBooths}</td>
                  <td className="text-align">{combinedCounts.totals.totalCompletedBooths}</td>
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

export default PcDataCount;
