import React, { useState, useEffect } from "react";
import axios from "axios";
import localforage from "localforage";
import "../css/dataCount.css";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";

const API_BASE_URL = "http://65.2.189.168:5000/api/auth";

const DataCount = () => {
  const [pramukhCount, setPramukhCount] = useState(null);
  const [uniquePramukhCount, setUniquePramukhCount] = useState(null);
  const [boothCount, setBoothCount] = useState(null);
  const [totalDataCount, setTotalDataCount] = useState(null);
  const [urbanDataCount, setUrbanDataCount] = useState(null);
  const [ruralDataCount, setRuralDataCount] = useState(null);
  const [influentialLeadersCount, setInfluentialLeadersCount] = useState(null);
  const [uniqueInfluentialLeadersCount, setUniqueInfluentialLeadersCount] =
    useState(null);
  const [influentialPersonsCount, setInfluentialPersonsCount] = useState(null);
  const [uniqueInfluentialPersonsCount, setUniqueInfluentialPersonsCount] =
    useState(null);
  const [probableJoineesCount, setProbableJoineesCount] = useState(null);
  const [uniqueProbableJoineesCount, setUniqueProbableJoineesCount] =
    useState(null);
  const [leadersDisgruntledCount, setLeadersDisgruntledCount] = useState(null);
  const [uniqueLeadersDisgruntledCount, setUniqueLeadersDisgruntledCount] =
    useState(null);
  const [currentMlaPerceptionCount, setCurrentMlaPerceptionCount] =
    useState(null);
  const [reasonForShsWinLossCount, setReasonForShsWinLossCount] =
    useState(null);
  const [administrativeIssuesCount, setAdministrativeIssuesCount] =
    useState(null);
  const [suggestionsComplaintsCount, setSuggestionsComplaintsCount] =
    useState(null);
  const [casteCount, setCasteCount] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = await localforage.getItem("token");
        const pramukhCountResponse = await axios.get(
          `${API_BASE_URL}/pramukh/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setPramukhCount(pramukhCountResponse.data.count);
        const uniquePramukhCountResponse = await axios.get(
          `${API_BASE_URL}/unique/pramukh/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setUniquePramukhCount(uniquePramukhCountResponse.data.count);
        const boothCountResponse = await axios.get(
          `${API_BASE_URL}/survey/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setBoothCount(boothCountResponse.data.count);
        const totalCountResponse = await axios.get(
          `${API_BASE_URL}/urban-and-rural-survey/total-count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setTotalDataCount(totalCountResponse.data.count);
        const urbanCountResponse = await axios.get(
          `${API_BASE_URL}/urban-survey/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setUrbanDataCount(urbanCountResponse.data.count);
        const ruralCountResponse = await axios.get(
          `${API_BASE_URL}/rural-survey/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setRuralDataCount(ruralCountResponse.data.count);

        const influentialLeadersCountResponse = await axios.get(
          `${API_BASE_URL}/influentialleaders/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setInfluentialLeadersCount(influentialLeadersCountResponse.data.count);
        const uniqueInfluentialLeadersCountResponse = await axios.get(
          `${API_BASE_URL}/unique/influentialleaders/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setUniqueInfluentialLeadersCount(
          uniqueInfluentialLeadersCountResponse.data.count
        );
        const influentialPersonsCountResponse = await axios.get(
          `${API_BASE_URL}/influentialpersons/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setInfluentialPersonsCount(influentialPersonsCountResponse.data.count);
        const uniqueInfluentialPersonsCountResponse = await axios.get(
          `${API_BASE_URL}/unique/influentialpersons/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setUniqueInfluentialPersonsCount(
          uniqueInfluentialPersonsCountResponse.data.count
        );
        const probableJoineesCountResponse = await axios.get(
          `${API_BASE_URL}/probablejoinees/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setProbableJoineesCount(probableJoineesCountResponse.data.count);
        const uniqueProbableJoineesCountResponse = await axios.get(
          `${API_BASE_URL}/unique/probableJoinees/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setUniqueProbableJoineesCount(
          uniqueProbableJoineesCountResponse.data.count
        );
        const leadersDisgruntledCountResponse = await axios.get(
          `${API_BASE_URL}/leadersdisgruntled/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setLeadersDisgruntledCount(leadersDisgruntledCountResponse.data.count);
        const uniqueLeadersDisgruntledCountResponse = await axios.get(
          `${API_BASE_URL}/unique/leadersDisgruntled/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setUniqueLeadersDisgruntledCount(
          uniqueLeadersDisgruntledCountResponse.data.count
        );
        const currentMlaPerceptionResponse = await axios.get(
          `${API_BASE_URL}/currentmlaperception/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setCurrentMlaPerceptionCount(currentMlaPerceptionResponse.data.count);
        const reasonForShsWinLossCountResponse = await axios.get(
          `${API_BASE_URL}/reasonforshswinloss/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setReasonForShsWinLossCount(
          reasonForShsWinLossCountResponse.data.count
        );
        const administrativeIssuesCountProcess = await axios.get(
          `${API_BASE_URL}/administrativeissues/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setAdministrativeIssuesCount(
          administrativeIssuesCountProcess.data.count
        );
        const suggestionsComplaintsCountProcess = await axios.get(
          `${API_BASE_URL}/suggestionscomplaints/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setSuggestionsComplaintsCount(
          suggestionsComplaintsCountProcess.data.count
        );
        const casteCountProcess = await axios.get(
          `${API_BASE_URL}/caste/count`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setCasteCount(casteCountProcess.data.count);
      } catch (error) {
        console.error("Error fetching count data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Dashboard />
      <div>
        <h2>Booth Survey Data Count</h2>
        <div className="percentage-div">
        <table className="data-booth-table">
          <thead>
            <tr>
              <th className="text-align2">Category</th>
              <th className="text-align">Count</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Pramukh Count</td>
              <td className="text-align">{pramukhCount}</td>
            </tr>
            <tr>
              <td>Unique Pramukh Count</td>
              <td className="text-align">{uniquePramukhCount}</td>
            </tr>
            <tr>
              <td>Booth Count</td>
              <td className="text-align">{boothCount}</td>
            </tr>
            <tr>
              <td>Total Urban and Rural Count</td>
              <td className="text-align">{totalDataCount}</td>
            </tr>
            <tr>
              <td>Total Urban Count</td>
              <td className="text-align">{urbanDataCount}</td>
            </tr>
            <tr>
              <td>Total Rural Count</td>
              <td className="text-align">{ruralDataCount}</td>
            </tr>
            <tr>
              <td>Total Influential Leaders Count</td>
              <td className="text-align">{influentialLeadersCount}</td>
            </tr>
            <tr>
              <td>Unique Influential Leaders Count</td>
              <td className="text-align">{uniqueInfluentialLeadersCount}</td>
            </tr>
            <tr>
              <td>Total Influential Persons Count</td>
              <td className="text-align">{influentialPersonsCount}</td>
            </tr>
            <tr>
              <td>Unique Influential Persons Count</td>
              <td className="text-align">{uniqueInfluentialPersonsCount}</td>
            </tr>
            <tr>
              <td>Total Probable Joinees Count</td>
              <td className="text-align">{probableJoineesCount}</td>
            </tr>
            <tr>
              <td>Unique Probable Joinees Count</td>
              <td className="text-align">{uniqueProbableJoineesCount}</td>
            </tr>
            <tr>
              <td>Total Leaders Disgruntled Count</td>
              <td className="text-align">{leadersDisgruntledCount}</td>
            </tr>
            <tr>
              <td>Unique Leaders Disgruntled Count</td>
              <td className="text-align">{uniqueLeadersDisgruntledCount}</td>
            </tr>
            <tr>
              <td>Current MLA Perception Count</td>
              <td className="text-align">{currentMlaPerceptionCount}</td>
            </tr>
            <tr>
              <td>Administrative Issues Count</td>
              <td className="text-align">{administrativeIssuesCount}</td>
            </tr>
            <tr>
              <td>Suggestions and Complaints Count</td>
              <td className="text-align">{suggestionsComplaintsCount}</td>
            </tr>
            <tr>
              <td>Reason for Shivsena win or loss</td>
              <td className="text-align">{reasonForShsWinLossCount}</td>
            </tr>
            <tr>
              <td>Caste Count</td>
              <td className="text-align">{casteCount}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default DataCount;
