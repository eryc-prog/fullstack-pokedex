import { Routes, Route } from "react-router-dom";
import LandingPage from "/src/pages/LandingPage.jsx";
import Pokedex from "/src/pages/Pokedex.jsx";
import "./App.css";

const App = () => {
  return (
    <>
      <div>
        <Routes>
          <Route path="/UserDashboard" element={<LandingPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/pokedex" element={<Pokedex />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
