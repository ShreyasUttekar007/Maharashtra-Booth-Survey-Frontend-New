import React, { useEffect, useState } from "react";
import "../css/register.css";
import data from "../dataFile.json";
import axios from "axios";
import { debounce } from "lodash";
import localforage from "localforage";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";

AWS.config.update({
  accessKeyId: "AKIAT74AEHFEQGSGLYO6",
  secretAccessKey: "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",
  region: "ap-south-1",
});

const s3 = new AWS.S3();

const Register = () => {
  const navigate = useNavigate();
  const savedSelections =
    JSON.parse(localStorage.getItem("formSelections")) || {};
  const [selectedDistrict, setSelectedDistrict] = useState(
    savedSelections.selectedDistrict || ""
  );
  const [selectedConstituency, setSelectedConstituency] = useState(
    savedSelections.selectedConstituency || ""
  );
  const [selectedBooth, setSelectedBooth] = useState(
    savedSelections.selectedBooth || ""
  );
  const [selectedAddress, setSelectedAddress] = useState(
    savedSelections.selectedAddress || ""
  );
  const [selectedLocality, setSelectedLocality] = useState("Urban");
  const [isUrbanSurvey, setIsUrbanSurvey] = useState(true);

  const [nagarPanchayat, setNagarPanchayat] = useState("");
  const [wardNo, setWardNo] = useState("");
  const [wardName, setWardName] = useState("");
  const [corporatorName, setCorporatorName] = useState("");
  const [corporatorContact, setCorporatorContact] = useState("");
  const [runnerUpCorporator, setRunnerUpCorporator] = useState("");
  const [runnerUpCorporatorContact, setRunnerUpCorporatorContact] =
    useState("");

  const [taluka, setTaluka] = useState("");
  const [zilaParishadGatt, setZilaParishadGatt] = useState("");
  const [panchayatSamitiGann, setPanchayatSamitiGann] = useState("");
  const [village, setVillage] = useState("");
  const [sarpanch, setSarpanch] = useState("");
  const [sarpanchContact, setSarpanchContact] = useState("");
  const [runnerUpSarpanch, setRunnerUpSarpanch] = useState("");
  const [runnerUpSarpanchContact, setRunnerUpSarpanchContact] = useState("");
  const [currentMlaPerception, setCurrentMlaPerception] = useState("");
  const [reasonForShsWinLoss, setReasonForShsWinLoss] = useState("");
  const [shsOfficeExistence, setShsOfficeExistence] = useState("");
  const [administrativeIssues, setAdministrativeIssues] = useState("");
  const [suggestionsComplaints, setSuggestionsComplaints] = useState("");

  // const [form, setForm] = useState({
  //   district: "",
  //   constituency: "",
  //   booth: "",
  //   dob: "",
  //   address: "",
  //   partyName: "",
  //   contact: "",
  //   photo: null,
  //   documentType: "",
  // });
  const logout = async () => {
    await localforage.removeItem("token");
    await localforage.removeItem("ID");

    navigate("/");
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setSelectedDistrict(selectedDistrict);

    const filteredUniversities = data
      .filter((item) => item["District"] === selectedDistrict)
      .map((item) => item["Ac Name and Number"]);

    setDropdownData({
      ...dropdownData,
      constituencies: [...new Set(filteredUniversities)],
    });
  };

  const handleConstituencyChange = (event) => {
    setSelectedConstituency(event.target.value);
  };

  const handleBoothChange = (event) => {
    setSelectedBooth(event.target.value);
  };
  const handleAddressChange = (event) => {
    setSelectedAddress(event.target.value);
  };

  const [dropdownData, setDropdownData] = useState({
    districts: [],
    constituencies: [],
    booths: [],
    addresses: [],
  });

  const [key, setKey] = useState(0);

  const fetchBooths = (selectedConstituency) => {
    const filteredBooths = data
      .filter((item) => item["Ac Name and Number"] === selectedConstituency)
      .map((item) => item["PS No and Name"]);

    setDropdownData((prevData) => ({
      ...prevData,
      booths: filteredBooths,
    }));
  };
  const fetchAddress = (selectedBooth) => {
    const filteredAddress = data
      .filter((item) => item["PS No and Name"] === selectedBooth)
      .map((item) => item["Address"]);

    setDropdownData((prevData) => ({
      ...prevData,
      addresses: filteredAddress,
    }));
  };

  useEffect(() => {
    const fetchData = () => {
      const uniqueDistricts = [
        ...new Set(data.map((item) => item["District"])),
      ];
      const uniqueConstituencies = [
        ...new Set(data.map((item) => item["Ac Name and Number"])),
      ];

      setDropdownData({
        districts: uniqueDistricts,
        constituencies: uniqueConstituencies,
        booths: [],
        addresses: [],
      });
    };

    const debouncedFetchData = debounce(fetchData, 300);

    debouncedFetchData();

    return () => {
      debouncedFetchData.cancel();
    };
  }, [data]);

  useEffect(() => {
    if (selectedConstituency) {
      fetchBooths(selectedConstituency);
    }
  }, [selectedConstituency]);

  useEffect(() => {
    if (selectedBooth) {
      fetchAddress(selectedBooth);
    }
  }, [selectedBooth]);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (selectedBooth) {
      const data = selectedBooth.split(" - ");
      setNumber(data[0]);
      setName(data[1]);
    } else {
      setNumber("");
      setName("");
    }
  }, [selectedBooth]);

  const [cNumber, setCNumber] = useState("");
  const [cName, setCName] = useState("");

  useEffect(() => {
    if (selectedConstituency) {
      const data = selectedConstituency.split("-");
      setCNumber(data[0]);
      setCName(data[1]);
    } else {
      setCNumber("");
      setCName("");
    }
  }, [selectedConstituency]);

  const handleInputChange6 = (e) => {
    const { name, value } = e.target;

    const phoneNumber =
      name === "runnerUpCorporatorContact" && !value.startsWith("+91")
        ? `+91${value}`
        : value;

    setRunnerUpCorporatorContact(phoneNumber);
  };
  const handleInputChange7 = (e) => {
    const { name, value } = e.target;

    const phoneNumber =
      name === "corporatorContact" && !value.startsWith("+91")
        ? `+91${value}`
        : value;

    setCorporatorContact(phoneNumber);
  };
  const handleInputChange8 = (e) => {
    const { name, value } = e.target;

    const phoneNumber =
      name === "runnerUpSarpanchContact" && !value.startsWith("+91")
        ? `+91${value}`
        : value;

    setRunnerUpSarpanchContact(phoneNumber);
  };
  const handleInputChange9 = (e) => {
    const { name, value } = e.target;

    const phoneNumber =
      name === "sarpanchContact" && !value.startsWith("+91")
        ? `+91${value}`
        : value;

    setSarpanchContact(phoneNumber);
  };

  const handleKeyDown = (e) => {
    const allowedCharacters = /^[0-9\b]+$/;

    if (e.key === "Backspace") {
      const currentValue = e.target.value;

      if (currentValue.endsWith("+91")) {
        e.preventDefault();
        return;
      }

      return;
    }

    if (!allowedCharacters.test(e.key)) {
      e.preventDefault();
    }
    if (e.target.selectionStart === 0 && !/[5-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleLocalityChange = (event) => {
    const newLocality = event.target.value;
    setSelectedLocality(newLocality);
    setIsUrbanSurvey(newLocality === "Urban");
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const token = await localforage.getItem("token");

      if (!token) {
        console.error("Token is null or undefined");
        return;
      }

      const id = await localforage.getItem("id");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const formData = {
        district: selectedDistrict,
        constituencyName: cName,
        constituencyNumber: cNumber,
        boothName: name,
        boothNumber: number,
        address: selectedAddress,
        locality: selectedLocality,
        isUrban: isUrbanSurvey,
        nagarPanchayat: nagarPanchayat,
        wardNo: wardNo,
        wardName: wardName,
        corporatorName: corporatorName,
        corporatorContact: corporatorContact,
        runnerUpCorporator: runnerUpCorporator,
        runnerUpCorporatorContact: runnerUpCorporatorContact,
        taluka: taluka,
        zilaParishadGatt: zilaParishadGatt,
        panchayatSamitiGann: panchayatSamitiGann,
        village: village,
        sarpanch: sarpanch,
        sarpanchContact: sarpanchContact,
        runnerUpSarpanch: runnerUpSarpanch,
        runnerUpSarpanchContact: runnerUpSarpanchContact,
        currentMlaPerception: currentMlaPerception,
        reasonForShsWinLoss: reasonForShsWinLoss,
        shsOfficeExistence: shsOfficeExistence,
        administrativeIssues: administrativeIssues,
        suggestionsComplaints: suggestionsComplaints,
      };

      const response = await axios.post(
        "http://65.2.189.168:5000/api/auth/survey",
        formData,
        { headers }
      );
      const formSelections = {
        selectedDistrict,
        selectedConstituency,
        selectedBooth,
        selectedAddress,
      };
      localStorage.setItem("formSelections", JSON.stringify(formSelections));
      navigate("/register2");
    } catch (error) {
      alert("Error submitting the form, please check the entries!!");
      console.error("Error submitting form:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 50000);
    }
  };
  useEffect(() => {
    return () => localStorage.removeItem("formSelections");
  }, []);

  return (
    <div key={key} className="registration-container">
      <button onClick={logout}>Logout</button>
      {loading && <div className="loader">loading....</div>}
      <div className="reg">
        <form onSubmit={handleSubmit} className="registration-form">
          <h1 className="header">Booth Survey - Maharashtra</h1>
          <div className="Main-fields">
            <div className="select-div">
              <label>
                Select District
                <span style={{ color: "orange", marginLeft: "2px" }}>*</span>
              </label>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                required
                style={{ paddingRight: "20px" }}
              >
                <option value="" disabled>
                  Select District
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
                Select Constituency
                <span style={{ color: "orange", marginLeft: "2px" }}>*</span>
              </label>
              <select
                value={selectedConstituency}
                onChange={handleConstituencyChange}
                required
                style={{ paddingRight: "20px" }}
              >
                <option value="" disabled>
                  Select Constituency
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

            <div className="select-div">
              <label>
                Select Address
                <span style={{ color: "orange", marginLeft: "2px" }}>*</span>
              </label>
              <select
                value={selectedAddress}
                onChange={handleAddressChange}
                required
                style={{ paddingRight: "20px" }}
              >
                <option value="" disabled>
                  Select Address
                </option>
                {dropdownData.addresses.map((address, index) => (
                  <option key={index} value={address}>
                    {address}
                  </option>
                ))}
              </select>
            </div>

            <div className="radio" style={{ padding: "5px" }}>
              {/* <label className="local">
                Select Locality{" "}
                <span style={{ color: "orange", marginLeft: "2px" }}>*</span>
              </label> */}
              <div className="locality-radio">
                <label>
                  <input
                    className="label-options"
                    type="radio"
                    value="Urban"
                    checked={selectedLocality === "Urban"}
                    onChange={handleLocalityChange}
                  />
                  Urban
                </label>
                <label>
                  <input
                    className="label-options"
                    type="radio"
                    value="Rural"
                    checked={selectedLocality === "Rural"}
                    onChange={handleLocalityChange}
                  />
                  Rural
                </label>
              </div>
            </div>
          </div>
          <div className="locality-fields">
            {selectedLocality === "Urban" && (
              <div className="urban-fields fields-grid">
                <div className="locality-header">
                  <h2 style={{ color: "white" }}>Urban Data</h2>
                </div>
                <div className="option-radio">
                  {/* Fields */}
                  <div className="extra-field-section">
                    <label>
                      Municipal Corporation{" "}
                      <span style={{ color: "orange", marginLeft: "2px" }}>
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter Municipal Corporation..."
                      value={nagarPanchayat}
                      required
                      onChange={(e) => setNagarPanchayat(e.target.value)}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>
                      Ward No{" "}
                      <span style={{ color: "orange", marginLeft: "2px" }}>
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Pleas enter Ward No..."
                      value={wardNo}
                      required
                      onChange={(e) => setWardNo(e.target.value)}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>
                      Ward Name{" "}
                      <span style={{ color: "orange", marginLeft: "2px" }}>
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter Ward Name..."
                      value={wardName}
                      required
                      onChange={(e) => setWardName(e.target.value)}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>
                      Corporator Name{" "}
                      <span style={{ color: "orange", marginLeft: "2px" }}>
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter Corporator Name..."
                      value={corporatorName}
                      required
                      onChange={(e) => setCorporatorName(e.target.value)}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>Corporator Contact Number </label>
                    <input
                      type="text"
                      placeholder="Please enter Corporator Contact Number..."
                      value={corporatorContact}
                      required
                      onInput={(e) => {
                        e.target.value = e.target.value
                          .replace(/[^\d+]/g, "")
                          .slice(0, 10);
                        handleInputChange7(e);
                      }}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>
                      Runner Up Corporator
                      <span style={{ color: "orange", marginLeft: "2px" }}>
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter Runner Up Corporator..."
                      value={runnerUpCorporator}
                      required
                      onChange={(e) => setRunnerUpCorporator(e.target.value)}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>Runner Up Corporator Contact </label>
                    <input
                      type="text"
                      placeholder="Please enter Runner Up Corporator Contact..."
                      value={runnerUpCorporatorContact}
                      onInput={(e) => {
                        e.target.value = e.target.value
                          .replace(/[^\d+]/g, "")
                          .slice(0, 10);
                        handleInputChange6(e);
                      }}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedLocality === "Rural" && (
              // Show Rural Fields with Grid
              <div className="rural-fields fields-grid">
                <div className="locality-header">
                  <h2 style={{ color: "white" }}>Rural Data</h2>
                </div>
                <div className="option-radio">
                  {/* Fields */}
                  <div className="extra-field-section">
                    <label>
                      Village{" "}
                      <span style={{ color: "orange", marginLeft: "2px" }}>
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter Village..."
                      value={village}
                      required
                      onChange={(e) => setVillage(e.target.value)}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>
                      Taluka{" "}
                      <span style={{ color: "orange", marginLeft: "2px" }}>
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter Taluka..."
                      value={taluka}
                      required
                      onChange={(e) => setTaluka(e.target.value)}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>
                      Zila Parishad Gatt/Circle{" "}
                      <span style={{ color: "orange", marginLeft: "2px" }}>
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter Zila Parishad Gatt/Circle..."
                      value={zilaParishadGatt}
                      required
                      onChange={(e) => setZilaParishadGatt(e.target.value)}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>
                      Panchayat Samiti Gann{" "}
                      <span style={{ color: "orange", marginLeft: "2px" }}>
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter Panchayat Samiti Gann..."
                      value={panchayatSamitiGann}
                      required
                      onChange={(e) => setPanchayatSamitiGann(e.target.value)}
                    />
                  </div>

                  <div className="extra-field-section">
                    <label>
                      Sarpanch{" "}
                      <span style={{ color: "orange", marginLeft: "2px" }}>
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter Sarpanch..."
                      value={sarpanch}
                      required
                      onChange={(e) => setSarpanch(e.target.value)}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>Sarpanch Contact Number </label>
                    <input
                      type="text"
                      placeholder="Please enter Sarpanch Contact Number..."
                      value={sarpanchContact}
                      required
                      onInput={(e) => {
                        e.target.value = e.target.value
                          .replace(/[^\d+]/g, "")
                          .slice(0, 10);
                        handleInputChange9(e);
                      }}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>
                      Runner Up Sarpanch{" "}
                      <span style={{ color: "orange", marginLeft: "2px" }}>
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter Runner Up Sarpanch..."
                      value={runnerUpSarpanch}
                      required
                      onChange={(e) => setRunnerUpSarpanch(e.target.value)}
                    />
                  </div>
                  <div className="extra-field-section">
                    <label>Runner Up Sarpanch Contact </label>
                    <input
                      type="text"
                      placeholder="Please enter Runner Up Sarpanch Contact..."
                      value={runnerUpSarpanchContact}
                      required
                      onInput={(e) => {
                        e.target.value = e.target.value
                          .replace(/[^\d+]/g, "")
                          .slice(0, 10);
                        handleInputChange8(e);
                      }}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div
            className={`locality-container ${
              number && name && cNumber && cName ? "fields-shown" : ""
            }`}
          >
            <div className="locality-header">
              <h2 style={{ color: "white" }}>Ac and Booth Data</h2>
            </div>

            <div className="ac-fields">
              {number && name && cNumber && cName && (
                <div className="text-entry">
                  <div className="field-section">
                    <div style={{ color: "white" }}>
                      <h3>
                        Booth Number:{" "}
                        <span style={{ color: "orange" }}> {number}</span>
                      </h3>
                    </div>
                  </div>

                  <div className="field-section">
                    <div style={{ color: "white" }}>
                      <h3>
                        Booth Name:
                        <span style={{ color: "orange" }}> {name}</span>
                      </h3>
                    </div>
                  </div>

                  <div className="field-section">
                    <div style={{ color: "white" }}>
                      <h3>
                        AC Number:
                        <span style={{ color: "orange" }}> {cNumber}</span>
                      </h3>
                    </div>
                  </div>

                  <div className="field-section">
                    <div style={{ color: "white" }}>
                      <h3>
                        AC Name:
                        <span style={{ color: "orange" }}> {cName}</span>
                      </h3>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="additional-fields">
            <div className="radio-fieldsss">
              {[
                {
                  label: "Is there a Shivsena Shakha/Party Office?",
                  value: shsOfficeExistence,
                  type: "radio",
                  options: ["Yes", "No"],
                  onChange: setShsOfficeExistence,
                },
              ].map((field, index) => (
                <div key={index}>
                  <label>{field.label}</label>
                  {field.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      placeholder={field.label}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  ) : field.type === "file" ? (
                    <input
                      type="file"
                      onChange={field.onChange}
                      ref={field.inputRef}
                    />
                  ) : field.type === "radio" ? (
                    <div className="radios">
                      {field.options.map((option, optionIndex) => (
                        <div className="gaps">
                          <label key={optionIndex}>
                            <input
                              className="label-options"
                              type="radio"
                              value={option}
                              checked={field.value === option}
                              onChange={() => field.onChange(option)}
                            />
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      placeholder={field.label}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {/* Add options based on your requirements */}
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      {/* ... Add other options as needed */}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      placeholder={field.label}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="additional-fields-grid fields-grid">
              <div>
                <div className="other-fields">
                  {[
                    {
                      label: "Reason for winning or losing Shivsena ",
                      value: reasonForShsWinLoss,
                      type: "textarea",
                      onChange: setReasonForShsWinLoss,
                    },
                    {
                      label: "Perception of current MLA",
                      value: currentMlaPerception,
                      type: "textarea",
                      onChange: setCurrentMlaPerception,
                    },
                    {
                      label: "Administrative Issues",
                      type: "textarea",
                      value: administrativeIssues,
                      onChange: setAdministrativeIssues,
                    },
                    {
                      label: "Suggestions/Complaints",
                      type: "textarea",
                      value: suggestionsComplaints,
                      onChange: setSuggestionsComplaints,
                    },
                  ].map((field, index) => (
                    <React.Fragment key={index}>
                      <label>{field.label}</label>
                      <div className="textarea-section">
                        {field.type === "checkbox" ? (
                          <input
                            type="checkbox"
                            placeholder={field.label}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        ) : field.type === "file" ? (
                          <input
                            type="file"
                            onChange={field.onChange}
                            ref={field.inputRef}
                          />
                        ) : field.type === "textarea" ? (
                          <textarea
                            placeholder={`Please enter ${field.label}...`}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        ) : field.type === "select" ? (
                          <select
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          >
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                          </select>
                        ) : (
                          <input
                            type={field.type || "text"}
                            placeholder={field.label}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="smt">
            <div className="submit">
              <button type="submit" className="btttn">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
