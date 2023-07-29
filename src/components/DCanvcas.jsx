import React, { useRef, useEffect, useState } from "react";
import ClearButton from "./ClearButton";
import * as tf from "@tensorflow/tfjs";

export default function DCanvas() {
  const canvasref = useRef(null);
  const imgref = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setdrawing] = useState(false);
  const [predicted, setpredicted] = useState(false);
  const [result, setresult] = useState(null);
  const [canvasData, setCanvasData] = useState(null);
  let modelref = useRef(null);

  useEffect(() => {
    const ctx = canvasref.current.getContext("2d");
    ctxRef.current = ctx;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    (async function () {
      console.log("model loading...");
      modelref.current = await tf.loadLayersModel("model/model.json");
      console.log("model loaded..");
    })();
  }, []);

  function startDrawing(e) {
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setdrawing(true);
    // console.log("1");
  }
  function Drawing(e) {
    if (!drawing) {
      return;
    }
    ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.stroke();
    // console.log("d");
  }
  async function stopDrawing() {
    ctxRef.current.closePath();
    setdrawing(false);

    const canvas = await canvasref.current;
    setCanvasData(canvas.toDataURL("image/jpg"));
    // console.log("0");
  }
  
  const clear = () => {
    setdrawing(false);
    ctxRef.current.clearRect(
      0,
      0,
      canvasref.current.width,
      canvasref.current.height
    );
    setCanvasData(null);
    setpredicted(false);
  };

  async function preprocessCanvas(image) {
    try {
      let tensor = await tf.browser.fromPixelsAsync(image, 4);
      tensor = tensor
        .resizeNearestNeighbor([28, 28])
        .mean(2)
        .expandDims(2)
        .expandDims(0);
      return tensor.div(255.0);
    } catch {
      if(drawing){
        clear()
        alert("complete the drawing on canvas");
      }
      if(!drawing){
        alert("Drawning Canvas is BLANK");
      }
    }
  }

  function findmax(data) {
    var max = data[0];
    var maxIndex = 0;
    for (var i = 1; i < data.length; i++) {
      if (data[i] > max) {
        maxIndex = i;
        max = data[i];
      }
    }
    return maxIndex;
  }
  
  async function handleClick() {
    let tensor = await preprocessCanvas(imgref.current);
    if (tensor) {
      let predictions = await modelref.current.predict(tensor).data();
      // console.log(predictions);
      let results = Array.from(predictions);
      let r = findmax(results);
      console.log(r);
      setresult(r);
      setpredicted(true);
    }

    // fetch("/upload-canvas", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ dataURL }),
    // })
    //   .then((response) => {
    //     if (response) {
    //       console.log(dataURL);
    //       console.log("Canvas snapshot sent successfully");
    //       console.log(response);
    //     } else {
    //       console.error("Failed to send canvas snapshot");
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error sending canvas snapshot:", error);
    //   });
  }


  return (
    <div className="container">
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={Drawing}
        ref={canvasref}
        style={canvasstyle}
        width={`256px`}
        height={`256px`}
      />
      <div className="but-container">
      <ClearButton Clear={clear} />
      <button onClick={handleClick}>Predict</button>
      </div>
      {canvasData && (
        <img
          className="canvasimg"
          src={canvasData}
          ref={imgref}
          width={256}
          height={256}
          alt="canvas"
        />
      )}
      {predicted&&(<h1 className="result">{result}</h1>)}
    </div>
  );
}

const canvasstyle = {
  margin: 40,
};

