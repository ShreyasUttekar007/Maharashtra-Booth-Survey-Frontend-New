import React, { useEffect, useState } from "react";
import axios from "axios";
import localforage from "localforage";
import "../css/dataTable.css"; 

const DataTable = () => {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const token = await localforage.getItem("token");

        if (!token) {
          console.error("Token is null or undefined");
          return;
        }

        const userId = await localforage.getItem("ID");

        if (!userId || !token) {
          console.error("User ID or Token not found");
          return;
        }

        const response = await axios.get(
          `http://65.2.189.168:5000/api/auth/get-surveys/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSurveys(response.data.surveys);

      } catch (error) {
        console.error("Error fetching survey data:", error);
      }
    };

    fetchSurveyData();
  }, []);

  return (
    <div className="datatable-container">
      <h2>Booth Data</h2>
      <table className="datatable-table">
        <thead>
          <tr>
            <th>District</th>
            <th>AC Number</th>
            <th>AC Name</th>
            <th>Booth Number</th>
            <th>Booth Name</th>
            <th>Pramukh Name</th>
            <th>Party Name</th>
            <th>Pramukh Contact</th>
            <th>Pramukh Photo</th>
          </tr>
        </thead>
        <tbody>
          {surveys.map((survey) => (
            <tr key={survey._id}>
              <td>{survey.district}</td>
              <td>{survey.constituencyNumber}</td>
              <td>{survey.constituencyName}</td>
              <td>{survey.boothNumber}</td>
              <td>{survey.boothName}</td>
              <td>{survey.pramukhName}</td>
              <td>{survey.partyName}</td>
              <td>{survey.contact}</td>

              <td>
                {survey.photo && (
                  <img
                    src={survey.photo}
                    alt={`Photo of ${survey.pramukhName}`}
                    className="datatable-photo"
                  />
                )}
              </td>

              {/* Add more columns as needed */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
