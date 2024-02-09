import React, { createContext, useContext, useEffect, useState } from "react";
import "../css/register.css";
import data from "../dataFile.json";
import axios from "axios";
import { debounce } from "lodash";
import localforage from "localforage";
import AWS from "aws-sdk";
import DataTable from "./DataTable";
import { useNavigate } from "react-router-dom";

AWS.config.update({
  accessKeyId: "AKIAT74AEHFEQGSGLYO6",
  secretAccessKey: "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",
  region: "ap-south-1",
});

const s3 = new AWS.S3();

const Register2 = () => {
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
  const [selectedParty, setSelectedParty] = useState("");
  const [pramukhName, setPramukhName] = useState("");
  const [contact, setContact] = useState("");
  const [photo, setPhoto] = useState("");

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

  const isPhoneNumberValid = (phoneNumber) => {
    return (
      !isNaN(phoneNumber) &&
      /^[5-9]/.test(phoneNumber) &&
      phoneNumber.length === 10
    );
  };

  const [dropdownData, setDropdownData] = useState({
    districts: [],
    constituencies: [],
    booths: [],
    addresses: [],
  });
  const partyNames = [
    "Shivsena",
    "BJP",
    "UBT",
    "NCP(AP)",
    "NCP(AP)",
    "INC",
    "MNS",
    "Other Party",
  ];

  const [key, setKey] = useState(0);

  const handlePartyChange = (e) => {
    setSelectedParty(e.target.value);
    setKey((prevKey) => prevKey + 1);
  };

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
    const fetchData = async () => {
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
      if (selectedConstituency) {
        fetchBooths(selectedConstituency);
      }
      if (selectedBooth) {
        fetchAddress(selectedBooth);
      }
    };

    const debouncedFetchData = debounce(fetchData, 300);

    debouncedFetchData();

    return () => {
      debouncedFetchData.cancel();
    };
  }, [data, selectedConstituency, selectedBooth]);

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

  const uploadImageToS3 = async (file) => {
    try {
      if (!file || !file.name) {
        throw new Error("Invalid file provided or file name is missing.");
      }

      const params = {
        Bucket: "maha-booth-survey",
        Key: `images/${Date.now()}_${file.name}`,
        Body: file,
        ContentType: file.type,
        ACL: "public-read",
      };

      const uploadResult = await s3.upload(params).promise();

      return uploadResult.Location;
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      throw new Error("Failed to upload image to S3");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const phoneNumber =
      name === "contact" && !value.startsWith("+91") ? `+91${value}` : value;

    setContact(phoneNumber);
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    try {
      const imageUrl = await uploadImageToS3(file);
      setPhoto(imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
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
        partyName: selectedParty,
        pramukhName: pramukhName,
        contact: contact,
        photo: photo,
      };

      if (photo !== null) {
        try {
          const imageUrl = await uploadImageToS3(photo);
          formData.photo = imageUrl;
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      } else {
        formData.photo = null;
      }

      const response = await axios.post(
        "http://65.2.189.168:5000/api/auth/create-survey",
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

      alert("Form submitted successfully!!");
      navigate("/register3");
    } catch (error) {
      alert("Error submitting the form, please check the entries!!");
      console.error("Error submitting form:", error);
    }
  };
  useEffect(() => {
    return () => localStorage.removeItem("formSelections");
  }, []);

  return (
    <div key={key} className="registration-container">
      <button onClick={logout}>Logout</button>

      <div className="reg">
        <form onSubmit={handleSubmit} className="registration-form">
          <h1 className="header">Booth Survey - Maharashtra</h1>
          <div className="Main-fields2">
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
          </div>
          <div className="locality-header">
            <h2 style={{ color: "white" }}>Party Data</h2>
          </div>
          <div className="additional-fields">
            <div className="select-div">
              <label>
                Select Party
                <span style={{ color: "orange", marginLeft: "2px" }}>*</span>
              </label>
              <select
                value={selectedParty}
                onChange={handlePartyChange}
                required
                style={{ paddingRight: "20px" }}
              >
                <option value="" disabled>
                  Select a party
                </option>
                {partyNames.map((party, index) => (
                  <option key={index} value={party}>
                    {party}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-entries">
              <div className="field-section">
                <label>
                  {`Name of ${selectedParty} Booth Pramukh`}
                  <span style={{ color: "orange", marginLeft: "2px" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder={`Please enter Booth Pramukh Name...`}
                  value={pramukhName}
                  required
                  onChange={(e) => setPramukhName(e.target.value)}
                />
              </div>
              <div className="field-section">
                <label>{`Contact of ${selectedParty} Booth pramukh`}</label>
                <input
                  type="text"
                  placeholder={`Please enter Booth Pramukh Contact...`}
                  value={contact || ""}
                  onInput={(e) => {
                    e.target.value = e.target.value
                      .replace(/[^\d+]/g, "")
                      .slice(0, 10);
                    handleInputChange(e);
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="field-section">
                <label>{`${selectedParty} Booth Pramukh Photo`}</label>
                <input type="file" onChange={handleFileChange} />
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
      <DataTable />
    </div>
  );
};

export default Register2;
