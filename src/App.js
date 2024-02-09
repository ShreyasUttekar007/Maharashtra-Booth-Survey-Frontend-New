import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Register2 from "./components/Register2";
import ViewBoothData from "./components/ViewBoothData";
import Register3 from "./components/Register3";
import DataCount from "./components/DataCount";
import SignUp from "./components/SignUp";
import AcDataCount from "./components/AcDataCount";
import CombinedDataCount from "./components/CombinedData";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/signup" element={<SignUp />} />
        <Route exact path="/acdata" element={<AcDataCount />} />
        <Route exact path="/districtdata" element={<CombinedDataCount />} />
        {/* <Route exact path="/register" element={<Register />} />
        <Route exact path="/register2" element={<Register2 />} />
        <Route exact path="/register3" element={<Register3 />} /> */}
        <Route exact path="/viewboothdata" element={<ViewBoothData />} />
        <Route exact path="/datacount" element={<DataCount />} />
      </Routes>
    </Router>
  );
};

export default App;
