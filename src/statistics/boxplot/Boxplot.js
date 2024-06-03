import { useMemo } from "react";
import * as d3 from "d3";
import { getSummaryStats } from "./summary-stats";
import { AxisLeft } from "./AxisLeft";
import { AxisBottom } from "./AxisBottomCategoric";
import { VerticalBox } from "./VerticalBox";

const MARGIN = { top: 30, right: 20, bottom: 50, left: 60 };

export const Boxplot = ({ width, height, data, axisBottomTitle, axisLeftTitle, color }) => {
  // The bounds (= area inside the axis) is calculated by substracting the margins from total width / height
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Compute everything derived from the dataset:
  const { chartMin, chartMax, groups, yPadding } = useMemo(() => {
    const [chartMin, chartMax] = d3.extent(data.map((d) => d.value));
    const groups = [...new Set(data.map((d) => d.name))];
    const yPadding = Math.abs(chartMax - chartMin) / 20;
    return { chartMin, chartMax, groups, yPadding };
  }, [data]);

  // Compute scales
  const yScale = d3
    .scaleLinear()
    .domain([chartMin - yPadding, chartMax + yPadding])
    .range([boundsHeight, 0]);
  const xScale = d3
    .scaleBand()
    .range([0, boundsWidth])
    .domain(groups)
    .padding(0.25);

  // Build the box shapes
  const allShapes = groups.map((group, i) => {
    const groupData = data.filter((d) => d.name === group).map((d) => d.value);
    const sumStats = getSummaryStats(groupData);

    if (!sumStats) {
      return null;
    }

    const { min, q1, median, q3, max } = sumStats;

    return (
      <g key={i} transform={`translate(${xScale(group)},0)`}>
        <VerticalBox
          width={xScale.bandwidth()}
          q1={yScale(q1)}
          median={yScale(median)}
          q3={yScale(q3)}
          min={yScale(min)}
          max={yScale(max)}
          stroke="black"
          fill={color}
        />
      </g>
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allShapes}
          <AxisLeft yScale={yScale} pixelsPerTick={30}  title={axisLeftTitle} />
          {/* X axis uses an additional translation to appear at the bottom */}
          <g transform={`translate(0, ${boundsHeight})`}>
            <AxisBottom xScale={xScale} title={axisBottomTitle} />
          </g>
        </g>
      </svg>
    </div>
  );
};
