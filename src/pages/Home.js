import "./home.css";
import {
  getNetworkStats,
  getAllNodesTemperature,
  getIndoorNodesTemperature,
  getNodesHeat,
  getEdgesHeat,
  getEdgesUvalue,
  getEdgesLvalue,
} from "../utils/getNetworkStats";
import { Boxplot } from "../statistics/boxplot/Boxplot";

export default function Home(props) {
  const nwStats = getNetworkStats(props.network);
  const id = nwStats[0];
  const label = nwStats[1];
  const numberOfRuns = nwStats[2];

  const allNodesTemperature = getAllNodesTemperature(props.network);
  const indoorNodesTemperature = getIndoorNodesTemperature(props.network);
  const nodesHeat = getNodesHeat(props.network);

  const edgesHeat = getEdgesHeat(props.network);
  const edgesUvalue = getEdgesUvalue(props.network);
  const edgesLvalue = getEdgesLvalue(props.network);

  const color = "#447294";

  return (
    <div>
      <h1>Network</h1>
      <table className="listtable">
        <tbody>
          <tr>
            <td>Id: </td>
            <td>{id}</td>
          </tr>
          <tr>
            <td>Label: </td>
            <td>{label}</td>
          </tr>
          <tr>
            <td>Number of Runs: </td>
            <td>{numberOfRuns}</td>
          </tr>
        </tbody>
      </table>

      <table className="plottable">
        <tbody>
          <tr>
            <th>All Temperatures</th>
            <th>Indoor Temperatures</th>
            <th>Nodes Heat</th>
          </tr>
          <tr>
            <td>
              <Boxplot
                data={allNodesTemperature}
                width={500}
                height={300}
                axisBottomTitle={"Version #"}
                axisLeftTitle={"Node Temperatures [°C]"}
                color={color}
              />
            </td>
            <td>
              <Boxplot
                data={indoorNodesTemperature}
                width={500}
                height={300}
                axisBottomTitle={"Version #"}
                axisLeftTitle={"Node Temperatures [°C]"}
                color={color}
              />
            </td>
            <td>
              <Boxplot
                data={nodesHeat}
                width={500}
                height={300}
                axisBottomTitle={"Version #"}
                axisLeftTitle={"Node Heat [W]"}
                color={color}
              />
            </td>
          </tr>
          <tr>
            <th>Edges Heat</th>
            <th>Edges U-Value</th>
            <th>Edges L-Value</th>
          </tr>
          <tr>
            <td>
              <Boxplot
                data={edgesHeat}
                width={500}
                height={300}
                axisBottomTitle={"Version #"}
                axisLeftTitle={"Heat trans. [W]"}
                color={color}
              />
            </td>
            <td>
              <Boxplot
                data={edgesUvalue}
                width={500}
                height={300}
                axisBottomTitle={"Version #"}
                axisLeftTitle={"U-Value [W / m²K]"}
                color={color}
              />
            </td>
            <td>
              <Boxplot
                data={edgesLvalue}
                width={500}
                height={300}
                axisBottomTitle={"Version #"}
                axisLeftTitle={"L-Value [W / K]"}
                color={color}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
