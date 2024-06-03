import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { AxisBottom } from "./boxplot/AxisBottomCategoric";

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const StackedBarChart = ({ width, height, data }) => {
  // bounds: area inside the graph axis (substract the margins)
  const svgRef = useRef();
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const axisBottomTitle = "Version #";

  // transform data for the stacks
  const stackSeries = d3
    .stack()
    .keys(d3.union(data.map((d) => d.label))) // distinct series keys, in input order E1, E2, ...
    .value(([, D], key) => D.get(key).heat)(
    // D is the group, get value for each series key and stack (v1, v2, ...)
    d3.index(
      // group by stack then series key
      data,
      (d) => d.version,
      (d) => d.label
    )
  );

  //const keys = ["E1", "E2", "O1", "O2a", "O2b"];
  let keys = [];
  stackSeries.forEach((entry) => keys.push(entry.key));

  // transform data for x-axis labels
  const versions = d3.group(data, (d) => d.version);
  let versionsForXaxis = []; // for the axis labels
  for (const key of versions.keys()) {
    versionsForXaxis.push(key);
  }

  const totals = useMemo(() => {
    // transform data for totals text
    const totalValues = stackSeries[stackSeries.length - 1];
    let tots = [];
    if (totalValues) {
      totalValues.forEach(createTotals);
      function createTotals(item, index, arr) {
        let totalsEntry = {};
        totalsEntry["version"] = versionsForXaxis[index];
        totalsEntry["totalValue"] = Math.round(item[1] * 10) / 10;
        tots.push(totalsEntry);
      }
    }
    return tots;
  }, [stackSeries, versionsForXaxis]);

  // color palette
  const color = d3.scaleOrdinal().domain(keys).range(d3.schemeCategory10);

  // Y axis
  let yMax = 5000;
  let yMin = 0;
  if (stackSeries.length !== 0) {
    yMax = d3.max(stackSeries[stackSeries.length - 1], (d) => d[1]); // the max value is in the last g
    yMin = d3.min(stackSeries[0], (d) => d[0]); // the min value is in the first g
  }

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([yMin, yMax || 0])
      .range([boundsHeight, 0]);
  }, [boundsHeight, yMax, yMin]);

  // Prepare the scales for positional and color encodings.
  const xScale = d3
    .scaleBand()
    .domain(
      d3.groupSort(
        data,
        (D) => -d3.sum(D, (d) => d.heat),
        (d) => d.version
      )
    )
    .range([0, boundsWidth])
    .padding(0.1);

  // Render the Y axis using d3.js, not react
  useEffect(() => {
    const svgYaxis = d3.select(axesRef.current);
    svgYaxis.selectAll("*").remove();

    const yAxisGenerator = d3.axisLeft(yScale);
    svgYaxis.append("g").call(yAxisGenerator);
    // add axis title:
    svgYaxis
      .append("text")
      .text("Heat [W]")
      .attr("transform", "rotate(-90)")
      .attr("x", -(boundsHeight / 2))
      .attr("y", -40) // Relative to the y axis.;
      .style("font-size", "12px")
      .style("text-anchor", "middle");
  }, [xScale, yScale, boundsHeight]);

  // Render the boxes using d3.js
  useEffect(() => {
    const svgBars = d3.select(svgRef.current);
    svgBars.selectAll("*").remove();

    // Tooltip --------------------------------
    const tooltip = d3
      .select(svgRef.current)
      .append("foreignObject")
      .attr("width", 120);

    const tooltipDiv = tooltip
      .append("xhtml:div")
      .attr("class", "sbc-tooltip")
      .style("visibility", "visible")
      .style("opacity", 0.8)
      .style("background-color", "white")
      .style("color", "black")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");

    // Bars ------------------------------------
    const boxes = svgBars
      .selectAll("myBox")
      .data(stackSeries)
      .join("g")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      .data((D) => D.map((d) => ((d.key = D.key), d)))
      .join("rect")
      .attr("x", (d) => xScale(d.data[0]))
      .attr("y", (d) => yScale(d[1]))
      .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .on("mouseover", function (event, d) {
        return tooltipDiv
          .style("visibility", "visible")
          .html(
            d.data[0] +
              "  " +
              d.key +
              "<br>" +
              d.data[1].get(d.key).heat +
              " Watt"
          );
      })
      .on("mousemove", function (event) {
        const [mx, my] = d3.pointer(event);
        const htmlContentHeight = tooltipDiv
          .node()
          .getBoundingClientRect().height;
        tooltip.attr("height", htmlContentHeight);
        tooltip.raise();
        return tooltip.attr("x", mx).attr("y", my);
      })
      .on("mouseout", function () {
        return tooltipDiv.style("visibility", "hidden");
      });

    const totalsText = svgBars
      .selectAll(".sbc-total-text")
      .data(totals)
      .join("text")
      .attr("x", function (d) {
        return xScale(d.version) + xScale.bandwidth() / 2;
      })
      .attr("y", function (d) {
        return yScale(d.totalValue) - 10;
      })
      .attr("text-anchor", "middle")
      .attr("class", "sbc-total-text")
      .text((d) => d.totalValue);

  }, [stackSeries, xScale, yScale, color, totals]);

  return (
    <div>
      <svg width={width} height={height} className="sbc">
        <g
          ref={svgRef}
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        ></g>
        <g
          ref={axesRef}
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        />
        {/* X axis uses an additional translation to appear at the bottom */}
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, boundsHeight + MARGIN.top].join(
            ","
          )})`}
        >
          <AxisBottom xScale={xScale} title={axisBottomTitle} />
        </g>
      </svg>
    </div>
  );
};
