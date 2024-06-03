import { useRef, useEffect } from "react";

const ColorLegend = (props) => {
  const legendRef = useRef(null);

  useEffect(() => {
    const canvas = legendRef.current;
    const context = canvas.getContext("2d");
    const r = 8;
    const d = r*2;
    const p = 5;

    context.fillStyle = "#ca0020";  // dark red
    context.beginPath();
    context.arc(30, 1*d+p, r, 0, 2 * Math.PI);
    context.fill();
    context.fillStyle = "#f4a582";  // light red
    context.beginPath();
    context.arc(30, 2*d+p, r, 0, 2 * Math.PI);
    context.fill();
    context.fillStyle = "#f7f7f7";  // off white
    context.beginPath();
    context.arc(30, 3*d+p, r, 0, 2 * Math.PI);
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = "#555555";
    context.stroke();
    context.fillStyle = "#92c5de";  // light blue
    context.beginPath();
    context.arc(30, 4*d+p, r, 0, 2 * Math.PI);
    context.fill();
    context.fillStyle = "#0571b0";  // dark blue
    context.beginPath();
    context.arc(30, 5*d+p, r, 0, 2 * Math.PI);
    context.fill();

    context.font = "10px sans-serif";
    context.fillStyle = "#222222";
    context.fillText("Too warm", 60, 1*d+p+4);
    context.fillText("Target temp", 60, 3*d+p+4);
    context.fillText("Too cold", 60, 5*d+p+4);
  }, []);

  return <canvas ref={legendRef} width={150} height={120}/>;
};

export default ColorLegend;
