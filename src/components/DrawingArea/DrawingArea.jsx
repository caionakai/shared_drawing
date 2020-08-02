import React, { useRef, useState, useEffect } from "react";
import socket from "../../config/socketConfig";
import PropTypes from "prop-types";

const DrawingArea = (props) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    socket.off("start_draw").on("start_draw", ({ offsetX, offsetY }) => {
      startDrawing(offsetX, offsetY);
    });

    socket.off("finish_draw").on("finish_draw", () => {
      finishDrawing();
    });

    socket.off("draw").on("draw", ({ offsetX, offsetY }) => {
      draw(offsetX, offsetY);
    });

    socket.off("clear").on("clear", () => {
      clearCanvas();
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2 - 50;
    canvas.height = window.innerHeight;
    // canvas.width = window.innerWidth * 2;
    // canvas.height = window.innerHeight * 2;
    canvas.style.width = window.innerWidth - 50 + "px";
    canvas.style.height = window.innerHeight / 2 + "px";
    // canvas.style.width = `${window.innerWidth}px`;
    // canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
    contextRef.current = context;
  }, []);

  const startDrawing = (offsetX, offsetY) => {
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const startDrawingHandler = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    startDrawing(offsetX, offsetY);
    socket.emit("start_draw", {
      offsetX,
      offsetY,
    });
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const finishDrawingHandler = () => {
    finishDrawing();
    socket.emit("finish_draw");
  };

  const draw = (offsetX, offsetY) => {
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const drawHandler = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    draw(offsetX, offsetY);
    socket.emit("draw", {
      offsetX,
      offsetY,
    });
  };

  const clearCanvas = () => {
    contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
  };

  const clearCanvasHandler = () => {
    clearCanvas();
    socket.emit("clear");
  };

  return (
    <div
      style={{
        backgroundColor: "gray",
        display: "flex",
        justifyContent: "space-evenly",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1>Draw Anything Here (Other people can draw too!)</h1>
      <canvas
        style={{
          border: "2px solid black",
          borderRadius: "10px",
          backgroundColor: "white",
        }}
        onMouseDown={startDrawingHandler}
        onMouseUp={finishDrawingHandler}
        onMouseMove={drawHandler}
        ref={canvasRef}
      />

      <button
        onClick={clearCanvasHandler}
        style={{
          padding: "5px 10px",
          backgroundColor: "black",
          color: "white",
          width: "5vw",
          cursor: "pointer",
        }}
      >
        Clear
      </button>
    </div>
  );
};

DrawingArea.propTypes = {};

export default DrawingArea;
