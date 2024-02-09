import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { debounce } from "lodash";
import localforage from "localforage";
import AWS from "aws-sdk";
import "../css/viewboothdata.css";
import data from "../dataFile.json";
import "jspdf-autotable";
import { RotateLoader } from "react-spinners";
import ReactToPrint from "react-to-print";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import Dashboard from "./Dashboard";

AWS.config.update({
  accessKeyId: "AKIAT74AEHFEQGSGLYO6",
  secretAccessKey: "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",
  region: "ap-south-1",
});

const s3 = new AWS.S3();

const ViewBoothData = () => {
  const [surveyDataByBooth, setSurveyDataByBooth] = useState([]);
  const pdfContentRef = useRef();
  const navigate = useNavigate();
  const componentRef = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedPC = queryParams.get("pc") || "";
  const selectedAc = queryParams.get("constituency") || "";
  const savedSelections =
    JSON.parse(localStorage.getItem("formSelections")) || {};
  const [selectedDistrict, setSelectedDistrict] = useState(selectedPC);
  const [selectedConstituency, setSelectedConstituency] = useState(selectedAc);
  const [selectedBooth, setSelectedBooth] = useState(
    savedSelections.selectedBooth || ""
  );
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");
  const constituencySelectRef = useRef(null);
  const [totalBoothsCount, setTotalBoothsCount] = useState("");
  const [overallBoothCount, setOverallBoothCount] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedToken = await localforage.getItem("token");
        const storedUserId = await localforage.getItem("userId");
        const storedRole = await localforage.getItem("role");

        setToken(storedToken);
        setUserId(storedUserId);
        setRole(storedRole);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (selectedAc) {
      setSelectedConstituency(selectedAc);
    }
  }, [selectedAc]);

  const [dropdownData, setDropdownData] = useState({
    districts: [],
    constituencies: [],
    booths: [],
    addresses: [],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const uniqueDistricts = [
        ...new Set(data.map((item) => item["Pc Name and Number"])),
      ];

      setDropdownData({
        districts: uniqueDistricts,
        constituencies: [],
        booths: [],
        addresses: [],
      });

      setSelectedDistrict(selectedPC);

      try {
        const response = await axios.get(
          `http://65.2.189.168:5000/api/auth/get-constituencies-by-pc/${selectedPC}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data;
        const constituencies = data.constituencyNames;
        setDropdownData((prevData) => ({
          ...prevData,
          constituencies: constituencies,
        }));

        setSelectedConstituency(selectedAc);
      } catch (error) {
        console.error("Error fetching constituencies:", error);
      }
    };

    fetchInitialData();
  }, [selectedPC, selectedAc, token]);

  useEffect(() => {
    const fetchTotalBoothsData = async (selectedConstituency) => {
      try {
        const response = await axios.get(
          `http://65.2.189.168:5000/api/auth/fetch-booths-by-constituency/${selectedConstituency}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOverallBoothCount(response.data.totalBooths);
      } catch (error) {
        console.error("Error fetching count data:", error);
      }
    };

    const fetchBooths = async (selectedConstituency) => {
      try {
        const response = await axios.get(
          `http://65.2.189.168:5000/api/auth/get-booths-by-constituency/${selectedConstituency}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        const booths = data.booths;
        const totalBooths = data.totalBoothCount;
        setTotalBoothsCount(totalBooths);
        setDropdownData((prevData) => ({
          ...prevData,
          booths: booths,
        }));
      } catch (error) {
        console.error("Error fetching booths:", error);
      }
    };

    const fetchData = async () => {
      if (selectedConstituency) {
        await fetchBooths(selectedConstituency);
        await fetchTotalBoothsData(selectedConstituency);
      }
    };

    const debouncedFetchData = debounce(fetchData, 300);
    debouncedFetchData();

    return () => {
      debouncedFetchData.cancel();
    };
  }, [selectedConstituency, token]);

  const handleDistrictChange = async (e) => {
    const selectedDistrict = e.target.value;
    setSelectedDistrict(selectedDistrict);
    setSelectedConstituency("");

    try {
      const response = await axios.get(
        `http://65.2.189.168:5000/api/auth/get-constituencies-by-pc/${selectedDistrict}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data;
      const constituencies = data.constituencyNames;
      setDropdownData((prevData) => ({
        ...prevData,
        constituencies: constituencies,
      }));
    } catch (error) {
      console.error("Error fetching constituencies:", error);
    }
  };

  const handleConstituencyChange = (event) => {
    const newSelectedConstituency = event.target.value;
    setSelectedConstituency(newSelectedConstituency);

    if (!data || data.length === 0) {
      console.error("Data is undefined or empty");
      return;
    }
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

  const handleBoothChange = (event) => {
    const selectedBooth = event.target.value;
    setSelectedBooth(selectedBooth);
    fetchSurveyDataByBooth(selectedBooth);
  };

  const fetchSurveyDataByBooth = async (selectedBooth) => {
    const formattedBooth = selectedBooth.replace(/(\d+)\s*-\s*/g, "$1-");
    try {
      const districtEndpoints = [
        `http://65.2.189.168:5000/api/auth/get-survey-by-booth/${formattedBooth}`,
        `http://65.2.189.168:5000/api/auth/get-surveys-by-booth/${formattedBooth}`,
        `http://65.2.189.168:5000/api/auth/get-survey2-by-booth/${formattedBooth}`,
        `http://65.2.189.168:5000/api/auth/get-survey3-by-booth/${formattedBooth}`,
        `http://65.2.189.168:5000/api/auth/get-survey4-by-booth/${formattedBooth}`,
        `http://65.2.189.168:5000/api/auth/get-survey5-by-booth/${formattedBooth}`,
        `http://65.2.189.168:5000/api/auth/get-survey6-by-booth/${formattedBooth}`,
        `http://65.2.189.168:5000/api/auth/get-survey7-by-booth/${formattedBooth}`,
        `http://65.2.189.168:5000/api/auth/get-survey8-by-booth/${formattedBooth}`,
        `http://65.2.189.168:5000/api/auth/get-survey9-by-booth/${formattedBooth}`,
        `http://65.2.189.168:5000/api/auth/get-survey10-by-booth/${formattedBooth}`,
        `http://65.2.189.168:5000/api/auth/get-survey11-by-booth/${formattedBooth}`,
      ];

      const districtResponses = await Promise.all(
        districtEndpoints.map(async (endpoint) => {
          try {
            const response = await axios.get(endpoint, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
          } catch (error) {
            console.error(
              `Error fetching data from ${endpoint}:`,
              error.message
            );
            return null;
          }
        })
      );
      if (role === "admin" || role === "mod") {
        const combinedSurveyData = [
          ...new Set([
            ...districtResponses[0].surveys,
            ...districtResponses[1].surveys,
            ...districtResponses[2].surveys,
            ...districtResponses[3].surveys,
            ...districtResponses[4].surveys,
            ...districtResponses[5].surveys,
            ...districtResponses[6].surveys,
            ...districtResponses[7].surveys,
            ...districtResponses[8].surveys,
            ...districtResponses[9].surveys,
            ...districtResponses[10].surveys,
            ...districtResponses[11].surveys,
          ]),
        ];
        setSurveyDataByBooth(combinedSurveyData);
      } else {
        const selectedIndex = districtResponses.findIndex(
          (response) =>
            response &&
            response.districts &&
            response.districts[0] &&
            response.districts[0].pc === selectedDistrict
        );

        if (selectedIndex !== -1) {
          const selectedDistrictResponse = districtResponses.splice(
            selectedIndex,
            1
          )[0];
          districtResponses.unshift(selectedDistrictResponse);
        }

        const combinedSurveyData = districtResponses.reduce(
          (result, districtResponse) => {
            if (
              districtResponse &&
              districtResponse.districts &&
              districtResponse.districts.length > 0
            ) {
              const districtDataIndex = districtResponse.districts.findIndex(
                (pc) => pc.pc === selectedDistrict
              );

              if (districtDataIndex !== -1) {
                const districtData =
                  districtResponse.districts[districtDataIndex];
                if (districtData && districtData.surveys) {
                  return [...result, ...districtData.surveys];
                }
              }
            }
            return result;
          },
          []
        );

        setSurveyDataByBooth(combinedSurveyData);
      }

      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const uniqueRows = new Set();

  return (
    <>
      <Dashboard />
      <div className="booth-container">
        <h2>Maharashtra Booth Report</h2>
        <div className="Main-fields3">
          <div className="select-div">
            <label>
              Select Parliamentary Constituency
              <span style={{ color: "orange", marginLeft: "2px" }}>*</span>
            </label>
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              required
              style={{ paddingRight: "20px" }}
            >
              <option value="" disabled>
                Select PC
              </option>
              {dropdownData.districts.map((district, index) => (
                <option key={index} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="select-div">
            <label>
              Select Assembly Constituency
              <span style={{ color: "orange", marginLeft: "2px" }}>*</span>
            </label>
            <select
              value={selectedConstituency}
              ref={constituencySelectRef}
              onChange={handleConstituencyChange}
              required
              style={{ paddingRight: "20px" }}
              id="ac-select"
            >
              <option value="" disabled>
                Select AC
              </option>
              {dropdownData.constituencies.map((constituency, index) => (
                <option key={index} value={constituency}>
                  {constituency}
                </option>
              ))}
            </select>
          </div>

          <div className="select-div">
            <label>
              Select Booth
              <span style={{ color: "orange", marginLeft: "2px" }}>*</span>
            </label>
            <select
              value={selectedBooth}
              onChange={handleBoothChange}
              required
              style={{ paddingRight: "20px" }}
            >
              <option value="" disabled>
                Select Booth
              </option>
              {dropdownData.booths.map((booth, index) => (
                <option key={index} value={booth}>
                  {booth}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <RotateLoader color="#acacac" className="loader" />
        ) : surveyDataByBooth.length === 0 ? (
          role !== "mod" && role !== "admin" ? (
            <div>
              <p
                style={{
                  fontSize: "22px",
                  marginTop: "20px",
                  fontWeight: "600",
                }}
              >
                You don't have permission to view this data.
              </p>
            </div>
          ) : (
            <div>
              <p
                style={{
                  fontSize: "22px",
                  marginTop: "20px",
                  fontWeight: "600",
                }}
              >
                No Booth Data Available.
              </p>
            </div>
          )
        ) : (
          <>
            <div className="header-positions">
              <div className="data-p">
                <p className="dp">PC : {selectedDistrict}</p>
                <p className="dp">AC : {selectedConstituency}</p>
                <p className="dp">Total Booths : {overallBoothCount}</p>
                <p className="dp">Covered Booths : {totalBoothsCount}</p>
              </div>
              <div className="pdf-button">
                {loading || surveyDataByBooth.length === 0 ? (
                  ""
                ) : (
                  <ReactToPrint
                    trigger={() => (
                      <FontAwesomeIcon
                        icon={faFilePdf}
                        className="font-pdf"
                        size="2x"
                      />
                    )}
                    content={() => componentRef.current}
                    pageStyle={`@page { margin: 20mm 0; }`}
                  />
                )}
              </div>
            </div>
            <div
              className="table-data-container"
              ref={componentRef}
              id="pdf-content"
            >
              <h2>Booth Report</h2>
              <table className="booth-table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Assembly Constituency</th>
                  </tr>
                </thead>
                <tbody>
                  {surveyDataByBooth.map((booth) => {
                    const rowKey = `${booth.district}-${booth.constituencyName}`;
                    if (!uniqueRows.has(rowKey)) {
                      uniqueRows.add(rowKey);
                      return (
                        <tr key={rowKey}>
                          <td>{booth.district}</td>
                          <td>{booth.constituencyName}</td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
              <table className="booth-table">
                <thead>
                  <tr>
                    <th>Booth Name</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {surveyDataByBooth.map((booth) => {
                    const rowKey = `${booth.Booth}-${booth.address}`;
                    if (
                      !uniqueRows.has(rowKey) &&
                      booth.Booth &&
                      booth.address
                    ) {
                      uniqueRows.add(rowKey);
                      return (
                        <tr key={rowKey}>
                          <td>{booth.Booth}</td>
                          <td>{booth.address}</td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>

              {surveyDataByBooth.map((booth) => (
                <React.Fragment key={booth._id}>
                  {booth.locality === "Rural" && booth.ruralData && (
                    <table className="booth-table">
                      <thead>
                        <tr>
                          <th>Village</th>
                          <th>Taluka</th>
                          <th>Gatt</th>
                          <th>Gan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {surveyDataByBooth.map((booth) => {
                          const rowKey = `${booth.ruralData?.village}-${booth.ruralData?.taluka}-${booth.ruralData?.zilaParishadGatt}-${booth.ruralData?.panchayatSamitiGann}`;
                          if (!uniqueRows.has(rowKey) && booth.ruralData) {
                            uniqueRows.add(rowKey);
                            return (
                              <tr key={rowKey}>
                                <td>{booth.ruralData.village || ""}</td>
                                <td>{booth.ruralData.taluka || ""}</td>
                                <td>
                                  {booth.ruralData.zilaParishadGatt || ""}
                                </td>
                                <td>
                                  {booth.ruralData.panchayatSamitiGann || ""}
                                </td>
                              </tr>
                            );
                          }
                          return null;
                        })}
                      </tbody>
                    </table>
                  )}

                  {booth.locality === "Urban" && booth.urbanData && (
                    <table className="booth-table">
                      <thead>
                        <tr>
                          <th>Municipal Corporation</th>
                          <th>Ward No.</th>
                          <th>Ward Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {surveyDataByBooth.map((booth) => {
                          const rowKey = `${booth.urbanData?.nagarPanchayat}-${booth.urbanData?.wardNo}-${booth.urbanData?.wardName}`;
                          if (!uniqueRows.has(rowKey) && booth.urbanData) {
                            uniqueRows.add(rowKey);
                            return (
                              <tr key={rowKey}>
                                <td>{booth.urbanData.nagarPanchayat || ""}</td>
                                <td>{booth.urbanData.wardNo || ""}</td>
                                <td>{booth.urbanData.wardName || ""}</td>
                              </tr>
                            );
                          }
                          return null;
                        })}
                      </tbody>
                    </table>
                  )}
                </React.Fragment>
              ))}

              {surveyDataByBooth.map((booth) => (
                <React.Fragment key={booth._id}>
                  {booth.locality === "Rural" && (
                    <>
                      <h3 style={{ color: "black" }}>Sarpanch Data</h3>
                      <table className="booth-table">
                        <thead>
                          <tr>
                            <th>Sarpanch Name</th>
                            <th>Sarpanch Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {surveyDataByBooth.map((booth) => {
                            const rowKey = `${booth.ruralData?.sarpanch}-${booth.ruralData?.sarpanchContact}`;
                            if (!uniqueRows.has(rowKey) && booth.ruralData) {
                              uniqueRows.add(rowKey);
                              return (
                                <tr key={rowKey}>
                                  <td>{booth.ruralData.sarpanch || ""}</td>
                                  <td>
                                    {booth.ruralData.sarpanchContact || ""}
                                  </td>
                                </tr>
                              );
                            }
                            return null;
                          })}
                        </tbody>
                        <thead>
                          <tr>
                            <th>Runner Up Sarpanch Name</th>
                            <th>Runner Up Sarpanch Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {surveyDataByBooth.map((booth) => {
                            const rowKey = `${booth.ruralData?.runnerUpSarpanch}-${booth.ruralData?.runnerUpSarpanchContact}`;
                            if (!uniqueRows.has(rowKey) && booth.ruralData) {
                              uniqueRows.add(rowKey);
                              return (
                                <tr key={rowKey}>
                                  <td>
                                    {booth.ruralData.runnerUpSarpanch || ""}
                                  </td>
                                  <td>
                                    {booth.ruralData.runnerUpSarpanchContact ||
                                      ""}
                                  </td>
                                </tr>
                              );
                            }
                            return null;
                          })}
                        </tbody>
                      </table>
                    </>
                  )}
                  {booth.locality === "Urban" && (
                    <>
                      <h3 style={{ color: "black" }}>Corporator Data</h3>
                      <table className="booth-table">
                        <thead>
                          <tr>
                            <th>Corporator Name</th>
                            <th>Corporator Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {surveyDataByBooth.map((booth) => {
                            const rowKey = `${booth.urbanData?.corporatorName}-${booth.urbanData?.corporatorContact}`;
                            if (!uniqueRows.has(rowKey) && booth.urbanData) {
                              uniqueRows.add(rowKey);
                              return (
                                <tr key={rowKey}>
                                  <td>
                                    {booth.urbanData.corporatorName || ""}
                                  </td>
                                  <td>
                                    {booth.urbanData.corporatorContact || ""}
                                  </td>
                                </tr>
                              );
                            }
                            return null;
                          })}
                        </tbody>
                        <thead>
                          <tr>
                            <th>Runner Up Corporator Name</th>
                            <th>Runner Up Corporator Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {surveyDataByBooth.map((booth) => {
                            const rowKey = `${booth.urbanData?.runnerUpCorporator}-${booth.urbanData?.runnerUpCorporatorContact}`;
                            if (!uniqueRows.has(rowKey) && booth.urbanData) {
                              uniqueRows.add(rowKey);
                              return (
                                <tr key={rowKey}>
                                  <td>
                                    {booth.urbanData.runnerUpCorporator || ""}
                                  </td>
                                  <td>
                                    {booth.urbanData
                                      .runnerUpCorporatorContact || ""}
                                  </td>
                                </tr>
                              );
                            }
                            return null;
                          })}
                        </tbody>
                      </table>
                    </>
                  )}
                </React.Fragment>
              ))}

              {surveyDataByBooth.some(
                (booth) => booth.caste && booth.caste.length > 0
              ) && (
                <>
                  <h3 style={{ color: "black" }}>Caste Composition</h3>
                  <table className="booth-table">
                    <thead>
                      <tr>
                        <th>Caste</th>
                        <th>Caste Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveyDataByBooth.map((booth) => {
                        const { caste } = booth;

                        if (caste && caste.length > 0) {
                          return caste.map((cast, index) => {
                            const {
                              casteName: casteName,
                              casteValue: casteValue,
                            } = cast;

                            const rowKey = `${casteName}-${casteValue}`;
                            const isDataValid = casteName || casteValue;

                            if (isDataValid && !uniqueRows.has(rowKey)) {
                              uniqueRows.add(rowKey);

                              return (
                                <tr key={rowKey}>
                                  <td>{casteName}</td>
                                  <td>{casteValue}</td>
                                </tr>
                              );
                            }

                            return null;
                          });
                        }

                        return null;
                      })}
                    </tbody>
                  </table>
                </>
              )}

              {surveyDataByBooth.some(
                (booth) =>
                  booth.pramukhName ||
                  booth.partyName ||
                  booth.contact ||
                  booth.photo
              ) && (
                <>
                  <h3 style={{ color: "black" }}>Booth Pramukh Data</h3>
                  <table className="booth-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Booth Pramukh Name</th>
                        <th>Party</th>
                        <th>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveyDataByBooth.map((booth, index) => {
                        const { pramukhName, partyName, contact, photo } =
                          booth;
                        const rowKey = `${pramukhName}-${partyName}-${contact}-${photo}`;
                        const isDataValid =
                          pramukhName || partyName || contact || photo;
                        const isSamePartyAsPrevious =
                          index > 0 &&
                          partyName === surveyDataByBooth[index - 1].partyName;

                        if (
                          isDataValid &&
                          !uniqueRows.has(rowKey) &&
                          !isSamePartyAsPrevious
                        ) {
                          uniqueRows.add(rowKey);

                          return (
                            <tr key={rowKey}>
                              <td>
                                {photo ? (
                                  <img
                                    src={photo}
                                    alt={`Photo of ${partyName}`}
                                    className="datatable-photo"
                                  />
                                ) : (
                                  <img
                                    src="https://media.istockphoto.com/id/871752462/vector/default-gray-placeholder-man.jpg?s=612x612&w=0&k=20&c=4aUt99MQYO4dyo-rPImH2kszYe1EcuROC6f2iMQmn8o="
                                    alt="Default Photo"
                                    className="datatable-photo"
                                  />
                                )}
                              </td>
                              <td>{pramukhName}</td>
                              <td>{partyName}</td>
                              <td>{contact}</td>
                            </tr>
                          );
                        }

                        return null;
                      })}
                    </tbody>
                  </table>
                </>
              )}

              {surveyDataByBooth.some(
                (booth) =>
                  booth.influentialLeaders &&
                  booth.influentialLeaders.length > 0
              ) && (
                <>
                  {" "}
                  <h3 style={{ color: "black" }}>Influential Leaders</h3>
                  <table className="booth-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Name</th>
                        <th>Party</th>
                        <th>Caste</th>
                        <th>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveyDataByBooth.map((booth) => {
                        const { influentialLeaders, partyName } = booth;

                        if (
                          influentialLeaders &&
                          influentialLeaders.length > 0
                        ) {
                          return influentialLeaders.map((leader, index) => {
                            const {
                              name: influentialLeadersName,
                              caste: influentialLeadersCaste,
                              contact: influentialLeadersContact,
                              photo: influentialLeadersPhoto,
                            } = leader;

                            const rowKey = `${influentialLeadersName}-${influentialLeadersCaste}-${partyName}-${influentialLeadersContact}-${influentialLeadersPhoto}`;
                            const isDataValid =
                              influentialLeadersName ||
                              influentialLeadersCaste ||
                              partyName ||
                              influentialLeadersContact ||
                              influentialLeadersPhoto;

                            if (isDataValid && !uniqueRows.has(rowKey)) {
                              uniqueRows.add(rowKey);

                              return (
                                <tr key={rowKey}>
                                  <td>
                                    {influentialLeadersPhoto && (
                                      <img
                                        src={influentialLeadersPhoto}
                                        alt={`Photo of ${partyName}`}
                                        className="datatable-photo"
                                      />
                                    )}
                                  </td>
                                  <td>{influentialLeadersName}</td>
                                  <td>{partyName}</td>
                                  <td>{influentialLeadersCaste}</td>
                                  <td>{influentialLeadersContact}</td>
                                </tr>
                              );
                            }

                            return null;
                          });
                        }

                        return null;
                      })}
                    </tbody>
                  </table>
                </>
              )}
              {surveyDataByBooth.some(
                (booth) =>
                  booth.influentialPersons &&
                  booth.influentialPersons.length > 0
              ) && (
                <>
                  <h3 style={{ color: "black" }}>Influential Persons</h3>
                  <table className="booth-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Name</th>
                        <th>Party</th>
                        <th>Caste</th>
                        <th>Contact</th>
                        <th>Reason of Influence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveyDataByBooth.map((booth) => {
                        const { influentialPersons, partyName } = booth;

                        if (
                          influentialPersons &&
                          influentialPersons.length > 0
                        ) {
                          return influentialPersons.map((person, index) => {
                            const {
                              name: influentialPersonsName,
                              caste: influentialPersonsCaste,

                              contact: influentialPersonsContact,
                              photo: influentialPersonsPhoto,
                              roi: influentialPersonsRoi,
                            } = person;

                            const rowKey = `${influentialPersonsName}-${influentialPersonsCaste}-${partyName}-${influentialPersonsContact}-${influentialPersonsPhoto}-${influentialPersonsRoi}`;
                            const isDataValid =
                              influentialPersonsName ||
                              influentialPersonsCaste ||
                              partyName ||
                              influentialPersonsContact ||
                              influentialPersonsPhoto ||
                              influentialPersonsRoi;

                            if (isDataValid && !uniqueRows.has(rowKey)) {
                              uniqueRows.add(rowKey);

                              return (
                                <tr key={rowKey}>
                                  <td>
                                    {influentialPersonsPhoto && (
                                      <img
                                        src={influentialPersonsPhoto}
                                        alt={`Photo of ${partyName}`}
                                        className="datatable-photo"
                                      />
                                    )}
                                  </td>
                                  <td>{influentialPersonsName}</td>
                                  <td>{partyName}</td>
                                  <td>{influentialPersonsCaste}</td>
                                  <td>{influentialPersonsContact}</td>
                                  <td>{influentialPersonsRoi}</td>
                                </tr>
                              );
                            }

                            return null;
                          });
                        }

                        return null;
                      })}
                    </tbody>
                  </table>
                </>
              )}
              {surveyDataByBooth.some(
                (booth) =>
                  booth.probableJoinees && booth.probableJoinees.length > 0
              ) && (
                <>
                  <h3 style={{ color: "black" }}>Probable Joinees</h3>
                  <table className="booth-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Name</th>
                        <th>Party</th>
                        <th>Caste</th>
                        <th>Contact</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveyDataByBooth.map((booth) => {
                        const { probableJoinees, partyName } = booth;

                        if (probableJoinees && probableJoinees.length > 0) {
                          return probableJoinees.map((joinee, index) => {
                            const {
                              name: probableJoineesName,
                              caste: probableJoineesCaste,
                              contact: probableJoineesContact,
                              photo: probableJoineesPhoto,
                              desc: probableJoineesDesc,
                            } = joinee;

                            const rowKey = `${probableJoineesName}-${probableJoineesCaste}-${partyName}-${probableJoineesContact}-${probableJoineesPhoto}-${probableJoineesDesc}`;
                            const isDataValid =
                              probableJoineesName ||
                              probableJoineesCaste ||
                              partyName ||
                              probableJoineesContact ||
                              probableJoineesPhoto ||
                              probableJoineesDesc;

                            if (isDataValid && !uniqueRows.has(rowKey)) {
                              uniqueRows.add(rowKey);

                              return (
                                <tr key={rowKey}>
                                  <td>
                                    {probableJoineesPhoto && (
                                      <img
                                        src={probableJoineesPhoto}
                                        alt={`Photo of ${partyName}`}
                                        className="datatable-photo"
                                      />
                                    )}
                                  </td>
                                  <td>{probableJoineesName}</td>
                                  <td>{partyName}</td>
                                  <td>{probableJoineesCaste}</td>
                                  <td>{probableJoineesContact}</td>
                                  <td>{probableJoineesDesc}</td>
                                </tr>
                              );
                            }

                            return null;
                          });
                        }

                        return null;
                      })}
                    </tbody>
                  </table>
                </>
              )}
              {surveyDataByBooth.some(
                (booth) =>
                  booth.leadersDisgruntled &&
                  booth.leadersDisgruntled.length > 0
              ) && (
                <>
                  <h3 style={{ color: "black" }}>Disgruntled Leaders</h3>
                  <table className="booth-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Name</th>
                        <th>Party</th>
                        <th>Caste</th>
                        <th>Contact</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveyDataByBooth.map((booth) => {
                        const { leadersDisgruntled, partyName } = booth;

                        if (
                          leadersDisgruntled &&
                          leadersDisgruntled.length > 0
                        ) {
                          return leadersDisgruntled.map(
                            (disgruntled, index) => {
                              const {
                                name: leadersDisgruntledName,
                                caste: leadersDisgruntledCaste,
                                contact: leadersDisgruntledContact,
                                photo: leadersDisgruntledPhoto,
                                reason: leadersDisgruntledReason,
                              } = disgruntled;

                              const rowKey = `${leadersDisgruntledName}-${leadersDisgruntledCaste}-${partyName}-${leadersDisgruntledContact}-${leadersDisgruntledPhoto}-${leadersDisgruntledReason}`;
                              const isDataValid =
                                leadersDisgruntledName ||
                                leadersDisgruntledCaste ||
                                partyName ||
                                leadersDisgruntledContact ||
                                leadersDisgruntledPhoto ||
                                leadersDisgruntledReason;

                              if (isDataValid && !uniqueRows.has(rowKey)) {
                                uniqueRows.add(rowKey);

                                return (
                                  <tr key={rowKey}>
                                    <td>
                                      {leadersDisgruntledPhoto && (
                                        <img
                                          src={leadersDisgruntledPhoto}
                                          alt={`Photo of ${partyName}`}
                                          className="datatable-photo"
                                        />
                                      )}
                                    </td>
                                    <td>{leadersDisgruntledName}</td>
                                    <td>{partyName}</td>
                                    <td>{leadersDisgruntledCaste}</td>
                                    <td>{leadersDisgruntledContact}</td>
                                    <td>{leadersDisgruntledReason}</td>
                                  </tr>
                                );
                              }

                              return null;
                            }
                          );
                        }

                        return null;
                      })}
                    </tbody>
                  </table>
                </>
              )}

              <div className="text-main">
                {surveyDataByBooth.some(
                  (booth) =>
                    booth.reasonForShsWinLoss &&
                    booth.reasonForShsWinLoss.length > 0
                ) && (
                  <>
                    <table className="text-data">
                      <thead className="thead-text">
                        <tr>
                          <th className="th-text">
                            Reason for Winning or Losing Shivsena
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {surveyDataByBooth.map((booth) => {
                          const { reasonForShsWinLoss } = booth;
                          const rowKey = `${reasonForShsWinLoss}`;
                          const isDataValid = reasonForShsWinLoss;

                          if (isDataValid && !uniqueRows.has(rowKey)) {
                            uniqueRows.add(rowKey);
                            return (
                              <tr key={rowKey}>
                                <td className="td-text">
                                  {reasonForShsWinLoss}
                                </td>
                              </tr>
                            );
                          }
                          return null;
                        })}
                      </tbody>
                    </table>
                  </>
                )}
                {surveyDataByBooth.some(
                  (booth) =>
                    booth.currentMlaPerception &&
                    booth.currentMlaPerception.length > 0
                ) && (
                  <>
                    <table className="text-data">
                      <thead className="thead-text">
                        <tr>
                          <th className="th-text">Current MLA Perception</th>
                        </tr>
                      </thead>
                      <tbody>
                        {surveyDataByBooth.map((booth) => {
                          const { currentMlaPerception } = booth;
                          const rowKey = `${currentMlaPerception}`;
                          const isDataValid = currentMlaPerception;

                          if (isDataValid && !uniqueRows.has(rowKey)) {
                            uniqueRows.add(rowKey);
                            return (
                              <tr key={rowKey}>
                                <td className="td-text">
                                  {currentMlaPerception}
                                </td>
                              </tr>
                            );
                          }
                          return null;
                        })}
                      </tbody>
                    </table>
                  </>
                )}
                {surveyDataByBooth.some(
                  (booth) =>
                    booth.administrativeIssues &&
                    booth.administrativeIssues.length > 0
                ) && (
                  <>
                    <table className="text-data">
                      <thead className="thead-text">
                        <tr>
                          <th className="th-text">Administrative Issues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {surveyDataByBooth.map((booth) => {
                          const { administrativeIssues } = booth;
                          const rowKey = `${administrativeIssues}`;
                          const isDataValid = administrativeIssues;

                          if (isDataValid && !uniqueRows.has(rowKey)) {
                            uniqueRows.add(rowKey);
                            return (
                              <tr key={rowKey}>
                                <td className="td-text">
                                  {administrativeIssues}
                                </td>
                              </tr>
                            );
                          }
                          return null;
                        })}
                      </tbody>
                    </table>
                  </>
                )}
                {surveyDataByBooth.some(
                  (booth) =>
                    booth.suggestionsComplaints &&
                    booth.suggestionsComplaints.length > 0
                ) && (
                  <>
                    <table className="text-data">
                      <thead className="thead-text">
                        <tr>
                          <th className="th-text">Suggestions/Complaints</th>
                        </tr>
                      </thead>
                      <tbody className="tbody-text">
                        {surveyDataByBooth.map((booth) => {
                          const { suggestionsComplaints } = booth;
                          const rowKey = `${suggestionsComplaints}`;
                          const isDataValid = suggestionsComplaints;

                          if (isDataValid && !uniqueRows.has(rowKey)) {
                            uniqueRows.add(rowKey);
                            return (
                              <tr key={rowKey} className="text-tr">
                                <td className="td-text">
                                  {suggestionsComplaints}
                                </td>
                              </tr>
                            );
                          }
                          return null;
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          </>
        )}
        <div className="header-positions2">
          <div className="pdf-button">
            {loading || surveyDataByBooth.length === 0 ? (
              ""
            ) : (
              <ReactToPrint
                trigger={() => (
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    className="font-pdf"
                    size="3x"
                  />
                )}
                content={() => componentRef.current}
                pageStyle={`@page { margin: 20mm 0; }`}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewBoothData;
