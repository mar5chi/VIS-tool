import "../App.css";
import "./home.css";

//import { Select } from "../components/Select";
import { Select } from "../components/SelectWithKeyboardAcc";

import { getNetworkStats } from "../utils/getNetworkStats";

import {
  getNodesTempIndoor,
  getNodesHeatIndoor,
  getEdgesHeat,
  getEdgesHeatFluxDensity
} from "../utils/getDataForVersionComparison";

import { Boxplot } from "../statistics/boxplot/Boxplot";
import { dummydata } from "../statistics/boxplot/dummydata";
import { StackedBarChart } from "../statistics/StackedBarChart";
import { ParallelCoordinates } from "../statistics/ParallelCoordinates";

import { useState } from "react";


export default function Statistics(props) {
  const numberOfRuns = getNetworkStats(props.network)[2];

  const options = [];
  for (let i = 0; i < numberOfRuns; i++) {
    options.push({ label: "v" + (i + 1), value: i });
  }

  const [versionNumber, setVersionNumber] = useState([
    options[numberOfRuns - 1],
  ]); // use this for multi select
  //const [versionNumber, setVersionNumber] = useState(options[0]);  // use this for single select

  const [dataForStackedBarChart, setDataForStackedBarChart] = useState([]);
  const [dataForParCoo, setDataForParCoo] = useState([]);
  const [edgesHeat, setEdgesHeat] = useState([]);
  const [edgesHeatFluxDens, setEdgesHeatFluxDens] = useState([]);


  function plot() {
    // for Stacked Bar Chart -----------------------
    const roomHeatForBarChart = getNodesHeatIndoor(
      props.network,
      versionNumber
    );
    setDataForStackedBarChart(roomHeatForBarChart);
    // for ParallelCoordinates ---------------------
    const roomTempsForParCoo = getNodesTempIndoor(
      props.network,
      versionNumber
    );
    setDataForParCoo(roomTempsForParCoo);
    // for Boxplot ---------------------------------
    //const edgesHeatForBoxplot = getEdgesHeat(
    //  props.network,
    //  versionNumber
    //);
    //setEdgesHeat(edgesHeatForBoxplot);

    const edgesHeatFluxDensForBoxplot = getEdgesHeatFluxDensity(
      props.network,
      versionNumber
    );
    setEdgesHeatFluxDens(edgesHeatFluxDensForBoxplot);
  }

  return (
    <div>
      <h2>Version Comparison</h2>
      <table>
        <tbody>
          <tr>
            <td>
              {" "}
              <Select
                multiple={true}
                options={options}
                value={versionNumber}
                onChange={(o) => setVersionNumber(o)}
              />
            </td>
            <td>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  plot();
                }}
              >
                Plot
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <table className="plottable">
        <tbody>
          <tr>
            <th>Heat Flux Density</th>
            <th>Temperatures</th>
            <th>Heat Load</th>
          </tr>
          <tr>
            <td>
              {" "}
              <Boxplot
                data={edgesHeatFluxDens}
                width={400}
                height={400}
                axisBottomTitle={"Version #"}
                axisLeftTitle={"Heat Flux Density [W/m²]"}
                color={"#7FCEDE"}
              />
            </td>
            <td>
              {" "}
              <ParallelCoordinates data={dataForParCoo} width={400} height={400} />
            </td>
            <td>
              {" "}
              <StackedBarChart
                data={dataForStackedBarChart}
                width={400}
                height={400}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
