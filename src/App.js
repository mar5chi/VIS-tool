import "./App.css";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Graph from "./pages/Graph";
import Statistics from "./pages/Statistics";
import MoreStats from "./pages/MoreStats";

import { Route, Routes } from "react-router-dom";

//import { network } from "./data/network_short_ids";
//import { network } from "../data/Run-13-03-2024_earth5";
import { network } from "./data/Run-05-04-2024-(14-05-19) StaticHeatingLoad (17)";
//import { network } from "../data/Run-05-04-2024-(13-46-06) Earth15Top20Bottom10";
//import { network } from "../data/Run-05-04-2024-(13-46-06) Earth15";

function App() {
  return (
    <>
    <Navbar />
    <div className="container">
      {/* {component} */}
      <Routes>
        <Route path="/" element={<Home network={network} />} />
        <Route path="/graph" element={<Graph network={network} />} />
        <Route path="/stats1" element={<Statistics network={network} />} />
        <Route path="/stats2" element={<MoreStats />} />
      </Routes>
    </div>
    </>
  );
}

export default App;
