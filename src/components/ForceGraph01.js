import React, { useRef, useEffect, useMemo, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import ColorLegend from "./ColorLegend";

const ForceGraph01 = ({
  data,
  isOverview,
  backToOverview,
  handleNodeClick,
  width,
  height,
}) => {
  const forceRef = useRef(null);
  useEffect(() => {
    forceRef.current.d3Force("charge").strength(-200);
  });

  // -----------------------------------
  const memoData = useMemo(() => {
    return data;
  }, [data]);
  // -----------------------------------
  const rValMinMax = useMemo(() => {
    return [0.05, 9.41];
  }, []);

  const [animate, setAnimate] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(3);
  const handleAnimate = () => {
    setAnimate(!animate);
  };
  const MAXSPEED = 20;
  const getBackgroundSize = () => {
    return { backgroundSize: `${(animationSpeed * 100) / MAXSPEED}% 100%` };
  };

  const [highlightHigh, setHighlightHigh] = useState(false);
  const [highlightHighPerc, setHighlightHighPerc] = useState(0);
  const [highlightLow, setHighlightLow] = useState(false);
  const [highlightLowPerc, setHighlightLowPerc] = useState(0);
  const handleHighlightHigh = () => {
    setHighlightHigh(!highlightHigh);
  };
  const handleHighlightHighPerc = (value) => {
    if (!highlightHigh) setHighlightHigh(true);
    setHighlightHighPerc(value);
  };
  const handleHighlightLow = () => {
    setHighlightLow((highlightLow) => (highlightLow = !highlightLow));
  };
  const handleHighlightLowPerc = (value) => {
    if (!highlightLow) setHighlightLow(true);
    setHighlightLowPerc(value);
  };
  const MAXPERCENT = 100;
  const getBackgroundSizePerc = () => {
    return { backgroundSize: `${(animationSpeed * 100) / MAXPERCENT}% 100%` };
  };

  let description = "RoomNetwork";
  if (isOverview) {
    description = "RoomNetwork Overview";
  } else {
    description = "Roomnetwork Detail";
  }

  const NODE_R = 7;
  const bgColor = "#f1f4e9";

  function nodePaint(node, ctx, globalScale) {
    //ctx.fillStyle = color;
    //console.log(ctx);
    console.log("nodePaint()");
    // shape
    ctx.fillStyle = node.color;
    if (node.x) {
      if (node.isAR) {  // triangle
        ctx.beginPath(); 
        ctx.moveTo(node.x, node.y - NODE_R); 
        ctx.lineTo(node.x - NODE_R, node.y + NODE_R); 
        ctx.lineTo(node.x + NODE_R, node.y + NODE_R); 
        ctx.fill(); 
      }
      else {  // circle
        ctx.beginPath(); 
        ctx.arc(node.x, node.y, NODE_R, 0, 2 * Math.PI, false); 
        ctx.fill();  
        // outline for white node
        ctx.beginPath(); 
        ctx.arc(node.x, node.y, NODE_R * 1.05, 0, 2 * Math.PI, false);
        ctx.strokeStyle = node.color === "#f7f7f7" ? "#999999" : node.color;
        ctx.stroke();
      }
    }
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText(node.label, node.x, node.y);
  }

  return (
    <div className="App">
      <div>
        {description} &nbsp;&nbsp;
        {!isOverview ? (
          <button onClick={backToOverview}>Back to Overview</button>
        ) : (
          ""
        )}
        <ForceGraph2D
          graphData={memoData}
          width={width}
          height={height}
          backgroundColor={bgColor}
          nodeRelSize={3}
          nodeLabel="hoverText"
          ref={forceRef}
          linkWidth={(link) =>
            link.rValue <
            rValMinMax[0] + rValMinMax[1] * (highlightLowPerc / 100)
              ? 3
              : link.rValue >
                rValMinMax[1] -
                  (rValMinMax[1] - rValMinMax[0]) * (highlightHighPerc / 100)
              ? 5
              : 1
          }
          onNodeClick={handleNodeClick}
          nodeCanvasObjectMode={() => "after"}
          nodeCanvasObject={(node, ctx, globalScale) => nodePaint(node, ctx, globalScale)}
          linkLabel="hoverText"
          linkDirectionalArrowLength={(d) => d.arrowLength}
          linkCurvature={"curvature"}
          linkDirectionalParticles={animate ? "particles" : "0"}
          linkDirectionalParticleSpeed={(d) =>
            d.particles * 0.002 * animationSpeed
          }
          linkDirectionalParticleWidth={(d) => d.particleWidth}
        />
      </div>
      <div>
        <br></br>
        <hr></hr>
        <label>
          <input type="checkbox" checked={animate} onChange={handleAnimate} />
          Animation
        </label>
        <br></br>
        <label>
          Speed:
          <input
            type="range"
            min="0"
            max={MAXSPEED}
            onChange={(e) => setAnimationSpeed(e.target.value)}
            style={getBackgroundSize()}
            value={animationSpeed}
          />
        </label>
        <hr></hr>
        <label>
          <input
            type="checkbox"
            checked={highlightHigh}
            onChange={handleHighlightHigh}
          />
          Highlight Highest R-values
        </label>
        <br></br>
        <label>
        &nbsp;Threshold %:
          <input
            type="range"
            min="0"
            max={MAXPERCENT}
            onChange={(e) => handleHighlightHighPerc(e.target.value)}
            style={getBackgroundSizePerc()}
            value={highlightHighPerc}
          />
        </label>
        <hr></hr>

        <label>
          <input
            type="checkbox"
            checked={highlightLow}
            onChange={handleHighlightLow}
          />
          Highlight Lowest R-values
        </label>
        <br></br>
        <label>
        &nbsp;Threshold %:
          <input
            type="range"
            min="0"
            max={MAXPERCENT}
            onChange={(e) => handleHighlightLowPerc(e.target.value)}
            style={getBackgroundSizePerc()}
            value={highlightLowPerc}
          />
        </label>
        <hr></hr>
        <label>Node Color Legend:
        </label><br></br>
        <ColorLegend />
        <hr></hr>
      </div>
    </div>
  );
};

export default ForceGraph01;
