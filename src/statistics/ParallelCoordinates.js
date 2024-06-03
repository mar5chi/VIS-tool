import "../App.css";
import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { AxisBottom } from "./boxplot/AxisBottomCategoric";

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const ParallelCoordinates = ({ width, height, data }) => {
  const axesRef = useRef(null);
  const svgRef = useRef();

  // transform data
  const rooms = d3.group(data, (d) => d.label);
  const versionsGenerator = d3.group(data, (d) => d.version);
  const versions = useMemo(() => {
    let versionsForXaxis = []; // for the axis labels
    for (const key of versionsGenerator.keys()) {
      versionsForXaxis.push(key);
    }
    return versionsForXaxis;
  }, [versionsGenerator]);

  // bounds: area inside the graph axis (substract the margins)
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const axisBottomTitle = "Version #";
  const axisLeftTitle = "Temperature[°C]";

  // Axes
  const [yMin, yMax] = d3.extent(data, (d) => d.temp);

  const xScale = useMemo(() => {
    return d3.scalePoint().range([0, boundsWidth]).domain(versions);
  }, [boundsWidth, versions]);

  const yScale = useMemo(() => {
    return (
      d3
        .scaleLinear()
        //.domain([0, yMax || 0])
        .domain([yMin - (yMax - yMin) / 10, yMax + (yMax - yMin) / 10])
        .range([boundsHeight, 0])
    );
  }, [boundsHeight, yMin, yMax]);

  // Render the Y axis using d3.js
  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();

    const yAxisGenerator = d3.axisLeft(yScale).ticks(5);

    svgElement
      .selectAll(".pco-parallel-axes")
      .data(versions)
      .join("g")
      .attr("class", "pco-parallel-axes")
      .attr("transform", function (d) {
        return `translate(${xScale(d)})`;
      })
      .call(yAxisGenerator);

    // add axis title on the left:
    svgElement
      .append("text")
      .text(`${axisLeftTitle}`)
      .attr("transform", "rotate(-90)")
      .attr("x", -(boundsHeight / 2))
      .attr("y", -40) // Relative to the y axis.;
      .style("font-size", "12px")
      .style("text-anchor", "middle");
  }, [versions, xScale, yScale, boundsHeight]);

  // Render the dots and lines
  useEffect(() => {
    const svgLines = d3.select(svgRef.current);
    svgLines.selectAll("*").remove();

    // color palette
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const path = svgLines
      .selectAll(".line")
      .data(rooms) // needs grouped items for the lines
      .join("path")
      .attr("fill", "none")
      .attr("stroke", function (d) {
        return color(d[0]);
      })
      .attr("stroke-width", 1)
      .attr("d", function (d) {
        return d3
          .line()
          .x(function (d) {
            return xScale(d.version);
          })
          .y(function (d) {
            return yScale(d.temp);
          })(d[1]); // the items
      });

    // Tooltip --------------------------------
    const tooltip = d3
      .select(svgRef.current)
      .append("foreignObject")
      .attr("width", 120);

    const tooltipDiv = tooltip
      .append("xhtml:div")
      .attr("class", "pco-tooltip")
      .style("visibility", "visible")
      .style("opacity", 0.8)
      .style("background-color", "white")
      .style("color", "black")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");

    // Dots ------------------------------------
    const dot = svgLines
      .selectAll(".dot")
      .data(function (d) {
        return data;
      }) // no grouped data for the dots
      .join("circle")
      .attr("r", 5)
      .attr("fill", function (d) {
        return color(d.label);
      })
      .style("fill-opacity", 0.9)
      .attr("stroke", "none")
      .attr("cx", function (d) {
        return xScale(d.version);
      })
      .attr("cy", function (d) {
        return yScale(d.temp);
      })
      .on("mouseover", function (event, d) {
        return tooltipDiv
          .style("visibility", "visible")
          .html(d.version + "  " + d.label + "<br>" + d.temp + " °C");
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

  }, [data, rooms, xScale, yScale]);

  return (
    <div>
      <svg width={width} height={height} className="pco">
        <g
          className="pco-lines"
          width={boundsWidth}
          height={boundsHeight}
          ref={svgRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        />
        <g
          className="pco-axes"
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
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
