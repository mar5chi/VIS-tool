import { useMemo } from "react";
import { ScaleBand } from "d3";


// tick length
const TICK_LENGTH = 6;

export const AxisBottom = ({ xScale, title }) => {
  const [min, max] = xScale.range();
  const ticks = useMemo(() => {
    return xScale.domain().map((value) => ({
      value,
      xOffset: xScale(value) + xScale.bandwidth() / 2,
    }));
  }, [xScale]);

  return (
    <>
      {/* Main horizontal line */}
      <path
        d={["M", min + 5, 0, "L", max - 5, 0].join(" ")}
        fill="none"
        stroke="currentColor"
      />

      {/* Ticks and labels */}
      {ticks.map(({ value, xOffset }) => (
        <g key={value} transform={`translate(${xOffset}, 0)`}>
          <line y2={TICK_LENGTH} stroke="currentColor" />
          <text
            key={value}
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: "translateY(20px)",
            }}
          >
            {value}
          </text>
        </g>
      ))}
      <g key={"Bottom Title"} transform={`translate(${max / 2}, 40)`}>
          <text
            key={"B-Title"}
            style={{
              fontSize: "12px",
              textAnchor: "middle",
            }}
          >
            {title}
          </text>
        </g>
    </>
  );
};
