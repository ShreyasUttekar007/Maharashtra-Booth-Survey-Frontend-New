import React, { createContext, useContext, useEffect, useState } from "react";
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

const Register3 = () => {
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

  const [influentialLeaders, setInfluentialLeaders] = useState([
    {
      name: "",
      caste: "",
      contact: "",
      photo: "",
    },
  ]);

  const [influentialPersons, setInfluentialPersons] = useState([
    {
      name: "",
      caste: "",
      contact: "",
      roi: "",
      photo: "",
    },
  ]);

  const [probableJoinees, setProbableJoinees] = useState([
    {
      name: "",
      caste: "",
      contact: "",
      desc: "",
      photo: "",
    },
  ]);

  const [leadersDisgruntled, setLeadersDisgruntled] = useState([
    {
      name: "",
      caste: "",
      contact: "",
      reason: "",
      photo: "",
    },
  ]);

  const handleAddMore = (setType) => {
    switch (setType) {
      case "influentialLeaders":
        setInfluentialLeaders((prev) => [
          ...prev,
          { name: "", caste: "", contact: "", photo: "" },
        ]);
        break;
      case "influentialPersons":
        setInfluentialPersons((prev) => [
          ...prev,
          { name: "", caste: "", contact: "", roi: "", photo: "" },
        ]);
        break;
      case "probableJoinees":
        setProbableJoinees((prev) => [
          ...prev,
          { name: "", caste: "", contact: "", desc: "", photo: "" },
        ]);
        break;
      case "leadersDisgruntled":
        setLeadersDisgruntled((prev) => [
          ...prev,
          { name: "", caste: "", contact: "", reason: "", photo: "" },
        ]);
        break;
      default:
        break;
    }
  };

  const handleRemove = (setType, index) => {
    switch (setType) {
      case "influentialLeaders":
        setInfluentialLeaders((prev) => prev.filter((_, i) => i !== index));
        break;
      case "influentialPersons":
        setInfluentialPersons((prev) => prev.filter((_, i) => i !== index));
        break;
      case "probableJoinees":
        setProbableJoinees((prev) => prev.filter((_, i) => i !== index));
        break;
      case "leadersDisgruntled":
        setLeadersDisgruntled((prev) => prev.filter((_, i) => i !== index));
        break;
      default:
        break;
    }
  };

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
  const handleInputChange2 = (index, fieldName, value) => {
    // Remove non-digit characters and limit to 10 digits
    const trimmedPhoneNumber = value.replace(/[^\d]/g, "").slice(0, 10);

    // If the number starts with +91, remove it
    const phoneNumber = trimmedPhoneNumber.startsWith("91")
      ? trimmedPhoneNumber.slice(2)
      : trimmedPhoneNumber;

    const updatedLeaders = [...influentialLeaders];
    updatedLeaders[index][fieldName] = phoneNumber;

    setInfluentialLeaders(updatedLeaders);
  };

  const handleInputChange3 = (index, fieldName, value) => {
    // Remove non-digit characters and limit to 10 digits
    const trimmedPhoneNumber = value.replace(/[^\d]/g, "").slice(0, 10);

    // If the number starts with +91, remove it
    const phoneNumber = trimmedPhoneNumber.startsWith("91")
      ? trimmedPhoneNumber.slice(2)
      : trimmedPhoneNumber;

    const updatedPersons = [...influentialPersons];
    updatedPersons[index][fieldName] = phoneNumber;

    setInfluentialPersons(updatedPersons);
  };

  const handleInputChange4 = (index, fieldName, value) => {
    // Remove non-digit characters and limit to 10 digits
    const trimmedPhoneNumber = value.replace(/[^\d]/g, "").slice(0, 10);

    // If the number starts with +91, remove it
    const phoneNumber = trimmedPhoneNumber.startsWith("91")
      ? trimmedPhoneNumber.slice(2)
      : trimmedPhoneNumber;

    const updatedJoinees = [...probableJoinees];
    updatedJoinees[index][fieldName] = phoneNumber;

    setProbableJoinees(updatedJoinees);
  };

  const handleInputChange5 = (index, fieldName, value) => {
    // Remove non-digit characters and limit to 10 digits
    const trimmedPhoneNumber = value.replace(/[^\d]/g, "").slice(0, 10);

    // If the number starts with +91, remove it
    const phoneNumber = trimmedPhoneNumber.startsWith("91")
      ? trimmedPhoneNumber.slice(2)
      : trimmedPhoneNumber;

    const updatedDisgruntled = [...leadersDisgruntled];
    updatedDisgruntled[index][fieldName] = phoneNumber;

    setLeadersDisgruntled(updatedDisgruntled);
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
  const handleFileChange1 = async (index, e) => {
    const file = e.target.files[0];
    try {
      const imageUrl = await uploadImageToS3(file);

      const updatedLeaders = [...influentialLeaders];
      updatedLeaders[index].photo = imageUrl;

      setInfluentialLeaders(updatedLeaders);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleFileChange2 = async (index, e) => {
    const file = e.target.files[0];
    try {
      const imageUrl = await uploadImageToS3(file);

      const updatedPersons = [...influentialPersons];
      updatedPersons[index].photo = imageUrl;

      setInfluentialPersons(updatedPersons);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleFileChange3 = async (index, e) => {
    const file = e.target.files[0];
    try {
      const imageUrl = await uploadImageToS3(file);

      const updatedJoinees = [...probableJoinees];
      updatedJoinees[index].photo = imageUrl;

      setProbableJoinees(updatedJoinees);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleFileChange = async (section, index, e) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        console.log("No file selected");
        return;
      }
  
      const imageUrl = await uploadImageToS3(file);
  
      const updatedData = [...eval(section)];
      updatedData[index].photo = imageUrl;
      eval(`set${capitalizeFirstLetter(section)}`)(updatedData);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
        influentialLeaders: influentialLeaders.map((leader) => ({
          name: leader.name,
          caste: leader.caste,
          contact: leader.contact,
          photo: leader.photo,
        })),
        influentialPersons: influentialPersons.map((person) => ({
          name: person.name,
          caste: person.caste,
          contact: person.contact,
          roi: person.roi,
          photo: person.photo,
        })),
        probableJoinees: probableJoinees.map((joinee) => ({
          name: joinee.name,
          caste: joinee.caste,
          contact: joinee.contact,
          desc: joinee.desc,
          photo: joinee.photo,
        })),
        leadersDisgruntled: leadersDisgruntled.map((leader) => ({
          name: leader.name,
          caste: leader.caste,
          contact: leader.contact,
          reason: leader.reason,
          photo: leader.photo,
        })),
      };
      for (const category of [
        "influentialLeaders",
        "influentialPersons",
        "probableJoinees",
        "leadersDisgruntled",
      ]) {
        const categoryState = formData[category];
        for (let i = 0; i < categoryState.length; i++) {
          if (categoryState[i].photo !== null) {
            try {
              const imageUrl = await uploadImageToS3(categoryState[i].photo);
              categoryState[i].photo = imageUrl;
            } catch (error) {
              console.error(
                `Error uploading image for ${category} at index ${i}:`,
                error
              );
            }
          }
        }
      }

      const response = await axios.post(
        "http://65.2.189.168:5000/api/auth/add-survey",
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
      window.location.reload();
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
          </div>

          <div className="additional-fields">
            {influentialLeaders.map((leader, index) => (
              <div key={index} className="additional-fields-grid fields-grid">
                <div>
                  <h3>{`Influential Leader ${
                    index + 1
                  } with ${selectedParty}`}</h3>
                  <div className="extra-fields2">
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Name..."
                        value={leader.name}
                        onChange={(e) => {
                          const updatedLeaders = [...influentialLeaders];
                          updatedLeaders[index].name = e.target.value;
                          setInfluentialLeaders(updatedLeaders);
                        }}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Caste..."
                        value={leader.caste}
                        onChange={(e) => {
                          const updatedLeaders = [...influentialLeaders];
                          updatedLeaders[index].caste = e.target.value;
                          setInfluentialLeaders(updatedLeaders);
                        }}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Contact..."
                        value={leader.contact}
                        onInput={(e) =>
                          handleInputChange2(index, "contact", e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="file"
                        onChange={(e) =>
                          handleFileChange("influentialLeaders", index, e)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="field-section">
              <button
                type="button"
                onClick={() => handleAddMore("influentialLeaders")}
              >
                Add
              </button>
            </div>

            {influentialPersons.map((person, index) => (
              <div key={index} className="additional-fields-grid fields-grid">
                <div>
                  <h3>{`Influential Person ${
                    index + 1
                  } with ${selectedParty}`}</h3>
                  <div className="extra-fields2">
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Name..."
                        value={person.name}
                        onChange={(e) => {
                          const updatedPersons = [...influentialPersons];
                          updatedPersons[index].name = e.target.value;
                          setInfluentialPersons(updatedPersons);
                        }}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Caste..."
                        value={person.caste}
                        onChange={(e) => {
                          const updatedPersons = [...influentialPersons];
                          updatedPersons[index].caste = e.target.value;
                          setInfluentialPersons(updatedPersons);
                        }}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Contact..."
                        value={person.contact}
                        onInput={(e) => {
                          const updatedPersons = [...influentialPersons];
                          updatedPersons[index].contact = e.target.value
                            .replace(/[^\d+]/g, "")
                            .slice(0, 10);
                          setInfluentialPersons(updatedPersons);
                        }}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="file"
                        onChange={(e) =>
                          handleFileChange("influentialPersons", index, e)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="field-section">
              <button
                type="button"
                onClick={() => handleAddMore("influentialPersons")}
              >
                Add
              </button>
            </div>

            {probableJoinees.map((joinee, index) => (
              <div key={index} className="additional-fields-grid fields-grid">
                <div>
                  <h3>{`Probable Joinee ${
                    index + 1
                  } with ${selectedParty}`}</h3>
                  <div className="extra-fields2">
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Name..."
                        value={joinee.name}
                        onChange={(e) => {
                          const updatedJoinees = [...probableJoinees];
                          updatedJoinees[index].name = e.target.value;
                          setProbableJoinees(updatedJoinees);
                        }}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Caste..."
                        value={joinee.caste}
                        onChange={(e) => {
                          const updatedJoinees = [...probableJoinees];
                          updatedJoinees[index].caste = e.target.value;
                          setProbableJoinees(updatedJoinees);
                        }}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Contact..."
                        value={joinee.contact}
                        onInput={(e) => {
                          const updatedJoinees = [...probableJoinees];
                          updatedJoinees[index].contact = e.target.value
                            .replace(/[^\d+]/g, "")
                            .slice(0, 10);
                          setProbableJoinees(updatedJoinees);
                        }}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Description/Designation..."
                        value={joinee.desc}
                        onChange={(e) => {
                          const updatedJoinees = [...probableJoinees];
                          updatedJoinees[index].desc = e.target.value;
                          setProbableJoinees(updatedJoinees);
                        }}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="file"
                        onChange={(e) =>
                          handleFileChange("probableJoinees", index, e)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="field-section">
              <button
                type="button"
                onClick={() => handleAddMore("probableJoinees")}
              >
                Add
              </button>
            </div>

            {leadersDisgruntled.map((disgruntled, index) => (
              <div key={index} className="additional-fields-grid fields-grid">
                <div>
                  <h3>{`Leader or Karyakarta Disgruntled ${
                    index + 1
                  } with ${selectedParty}`}</h3>
                  <div className="extra-fields2">
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Name..."
                        value={disgruntled.name}
                        onChange={(e) => {
                          const updatedDisgruntled = [...leadersDisgruntled];
                          updatedDisgruntled[index].name = e.target.value;
                          setLeadersDisgruntled(updatedDisgruntled);
                        }}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Caste..."
                        value={disgruntled.caste}
                        onChange={(e) => {
                          const updatedDisgruntled = [...leadersDisgruntled];
                          updatedDisgruntled[index].caste = e.target.value;
                          setLeadersDisgruntled(updatedDisgruntled);
                        }}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Contact..."
                        value={disgruntled.contact}
                        onInput={(e) => {
                          const updatedDisgruntled = [...leadersDisgruntled];
                          updatedDisgruntled[index].contact = e.target.value
                            .replace(/[^\d+]/g, "")
                            .slice(0, 10);
                          setLeadersDisgruntled(updatedDisgruntled);
                        }}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="text"
                        placeholder="Please enter Reason..."
                        value={disgruntled.reason}
                        onChange={(e) => {
                          const updatedDisgruntled = [...leadersDisgruntled];
                          updatedDisgruntled[index].reason = e.target.value;
                          setLeadersDisgruntled(updatedDisgruntled);
                        }}
                      />
                    </div>
                    <div className="field-section">
                      <input
                        type="file"
                        onChange={(e) =>
                          handleFileChange("leadersDisgruntled", index, e)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="field-section">
              <button
                type="button"
                onClick={() => handleAddMore("leadersDisgruntled")}
              >
                Add
              </button>
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

export default Register3;
