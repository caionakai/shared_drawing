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
    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;

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
    let { offsetX, offsetY } = nativeEvent;
    if (nativeEvent.touches) {
      offsetX = parseInt(nativeEvent.touches[0].pageX);
      offsetY = parseInt(nativeEvent.touches[0].pageY);
    }

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

    let { offsetX, offsetY } = nativeEvent;
    if (nativeEvent.touches) {
      offsetX = parseInt(nativeEvent.touches[0].pageX);
      offsetY = parseInt(nativeEvent.touches[0].pageY);
    }
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
        width: "100%",
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
          width: "90%",
          height: "30vh",
        }}
        onMouseDown={startDrawingHandler}
        onMouseUp={finishDrawingHandler}
        onMouseMove={drawHandler}
        onTouchStart={startDrawingHandler}
        onTouchEnd={finishDrawingHandler}
        onTouchMove={drawHandler}
        ref={canvasRef}
      />

      <button
        onClick={clearCanvasHandler}
        style={{
          padding: "5px 1rem",
          backgroundColor: "black",
          color: "white",
          fontSize: "1.2rem",
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
