import React, { useRef, useEffect } from "react";

function TourCanvas({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !data.Coordinates || !data.ActualTour) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const coordinates = data.Coordinates;
    const tour = data.ActualTour;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const margin = 20;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    coordinates.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
    minX -= margin;
    minY -= margin;
    maxX += margin;
    maxY += margin;
    const scaleFactor = Math.min(
      canvas.width / (maxX - minX),
      canvas.height / (maxY - minY)
    );
    const xOffset = (canvas.width - (maxX - minX) * scaleFactor) / 2;
    const yOffset = (canvas.height - (maxY - minY) * scaleFactor) / 2;
    ctx.fillStyle = "#3498db";
    coordinates.forEach(([x, y]) => {
      const scaledX = (x - minX) * scaleFactor + xOffset;
      const scaledY = (y - minY) * scaleFactor + yOffset;
      ctx.beginPath();
      ctx.arc(scaledX, scaledY, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
      (coordinates[tour[0]][0] - minX) * scaleFactor + xOffset,
      (coordinates[tour[0]][1] - minY) * scaleFactor + yOffset
    );
    for (let i = 1; i < tour.length; i++) {
      const scaledX = (coordinates[tour[i]][0] - minX) * scaleFactor + xOffset;
      const scaledY = (coordinates[tour[i]][1] - minY) * scaleFactor + yOffset;
      ctx.lineTo(scaledX, scaledY);
    }
    ctx.lineTo(
      (coordinates[tour[0]][0] - minX) * scaleFactor + xOffset,
      (coordinates[tour[0]][1] - minY) * scaleFactor + yOffset
    );
    ctx.stroke();
  }, [data]);

  return <canvas ref={canvasRef} width={600} height={600} />;
}

export default TourCanvas;
