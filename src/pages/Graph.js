import "../App.css";
import { useState } from "react";
import {
  getNumberOfRuns,
  getOverviewData,
  getDetailData,
} from "../utils/getDataNew2";
import ForceGraph01 from "../components/ForceGraph01";

export default function Graph(props) {
  const width = 1000; // ForceGraph width 700
  const height = 680; // ForceGraph height 500

  const numberOfRuns = getNumberOfRuns(props.network);

  const [designNumber, setDesignNumber] = useState(numberOfRuns - 1);

  const [isOverview, setIsOverview] = useState(true);
  const [data, setData] = useState(
    getOverviewData(props.network, designNumber)
  );

  const backToOverview = () => {
    setData(getOverviewData(props.network, designNumber));
    setIsOverview(true);
  };

  const handleNodeClick = (node) => {
    setData(getDetailData(props.network, node.id, designNumber));
    setIsOverview(false);
  };

  const handleDnChange = (dNumber) => {
    setDesignNumber(dNumber - 1);
    setData(getOverviewData(props.network, dNumber - 1));
    setIsOverview(true);
  };

  return (
    <div className="App">
      <div>
        <br />
        {/*<select  multiple size={17} name="designNumber" value={designNumber+1} onChange={event => handleDnChange(event.target.value)}></select>*/}
        <label htmlFor="designNumber">Choose design number:</label>
        <select
          name="designNumber"
          value={designNumber + 1}
          /*options={options.map((option) => {
            return (
              <option key={option.id} id={option.id} value={option.id}>
                {option.title}
              </option>
            );
          })}*/
          onChange={(event) => handleDnChange(event.target.value)}
        >
          <option id="0">1</option>
          <option id="1">2</option>
          <option id="2">3</option>
          <option id="3">4</option>
          <option id="4">5</option>
          <option id="5">6</option>
          <option id="6">7</option>
          <option id="7">8</option>
          <option id="8">9</option>
          <option id="9">10</option>
          <option id="10">11</option>
          <option id="11">12</option>
          <option id="12">13</option>
          <option id="13">14</option>
          <option id="14">15</option>
          <option id="15">16</option>
          <option id="16">17</option>
        </select>
      </div>
      <ForceGraph01
        data={data}
        isOverview={isOverview}
        backToOverview={backToOverview}
        handleNodeClick={handleNodeClick}
        width={width}
        height={height}
      />
    </div>
  );
}
