import { useEffect, useRef, useState } from "react";
import * as turf from "@turf/turf";
import { Segment } from "@/types";
import { Button } from "./ui/button";

interface CityMapProps {
  segments: Segment[];
}

const CityMap = ({ segments }: CityMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bounds, setBounds] = useState<{
    minLat: number;
    minLon: number;
    maxLat: number;
    maxLon: number;
  } | null>(null);

  // Create a bounding box from all segments
  useEffect(() => {
    if (segments.length === 0) return;

    let minLat = Infinity;
    let minLon = Infinity;
    let maxLat = -Infinity;
    let maxLon = -Infinity;

    segments.forEach((segment) => {
      segment.geometry.forEach((point: { lat: number; lon: number }) => {
        minLat = Math.min(minLat, point.lat);
        minLon = Math.min(minLon, point.lon);
        maxLat = Math.max(maxLat, point.lat);
        maxLon = Math.max(maxLon, point.lon);
      });
    });

    // Add a small buffer
    const latBuffer = (maxLat - minLat) * 0.1;
    const lonBuffer = (maxLon - minLon) * 0.1;

    setBounds({
      minLat: minLat - latBuffer,
      minLon: minLon - lonBuffer,
      maxLat: maxLat + latBuffer,
      maxLon: maxLon + lonBuffer,
    });
  }, [segments]);

  // Draw map and segments
  useEffect(() => {
    if (
      !mapContainerRef.current ||
      !canvasRef.current ||
      !bounds ||
      segments.length === 0
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a map background
    drawMapBackground(ctx, canvas.width, canvas.height);

    // Calculate scale to fit the map in the canvas
    const latRange = bounds.maxLat - bounds.minLat;
    const lonRange = bounds.maxLon - bounds.minLon;

    const xScale = canvas.width / lonRange;
    const yScale = canvas.height / latRange;

    // Function to convert geo coordinates to canvas coordinates
    const geoToCanvas = (lat: number, lon: number) => {
      const x = (lon - bounds.minLon) * xScale;
      // Flip y axis because canvas y increases downward
      const y = canvas.height - (lat - bounds.minLat) * yScale;
      return { x, y };
    };

    // Draw city grid for context
    drawCityGrid(ctx, bounds, geoToCanvas);

    // Draw all segments
    segments.forEach((segment) => {
      if (segment.geometry.length < 2) return;

      ctx.beginPath();

      // Get first point
      const firstPoint = geoToCanvas(
        segment.geometry[0].lat,
        segment.geometry[0].lon
      );
      ctx.moveTo(firstPoint.x, firstPoint.y);

      // Draw line through all points
      for (let i = 1; i < segment.geometry.length; i++) {
        const point = geoToCanvas(
          segment.geometry[i].lat,
          segment.geometry[i].lon
        );
        ctx.lineTo(point.x, point.y);
      }

      // Style based on selection status
      if (segment.selected) {
        ctx.strokeStyle = "#22c55e"; // Green for selected
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = "#94a3b8"; // Gray for unselected
        ctx.lineWidth = 1.5;
      }

      ctx.stroke();
    });

    // Draw selected segments again on top to make them more visible
    const selectedSegments = segments.filter((s) => s.selected);
    if (selectedSegments.length > 0) {
      selectedSegments.forEach((segment) => {
        if (segment.geometry.length < 2) return;

        ctx.beginPath();

        const firstPoint = geoToCanvas(
          segment.geometry[0].lat,
          segment.geometry[0].lon
        );
        ctx.moveTo(firstPoint.x, firstPoint.y);

        for (let i = 1; i < segment.geometry.length; i++) {
          const point = geoToCanvas(
            segment.geometry[i].lat,
            segment.geometry[i].lon
          );
          ctx.lineTo(point.x, point.y);
        }

        ctx.strokeStyle = "#22c55e"; // Green
        ctx.lineWidth = 4;
        ctx.stroke();
      });
    }
  }, [segments, bounds, mapZoom]);

  // Draw a background map pattern
  const drawMapBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Fill with a light color
    ctx.fillStyle = "#F1F1F1"; // Light background
    ctx.fillRect(0, 0, width, height);
  };

  // Draw a simplified city grid for context
  const drawCityGrid = (
    ctx: CanvasRenderingContext2D,
    bounds: { minLat: number; minLon: number; maxLat: number; maxLon: number },
    geoToCanvas: (lat: number, lon: number) => { x: number; y: number }
  ) => {
    // Draw a grid to represent city blocks
    const gridSize = 0.002; // Grid size in degrees

    ctx.strokeStyle = "#C8C8C9"; // Light gray grid
    ctx.lineWidth = 0.5;

    // Vertical lines (longitude)
    for (
      let lon = Math.floor(bounds.minLon / gridSize) * gridSize;
      lon <= bounds.maxLon;
      lon += gridSize
    ) {
      ctx.beginPath();
      const start = geoToCanvas(bounds.minLat, lon);
      const end = geoToCanvas(bounds.maxLat, lon);
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // Horizontal lines (latitude)
    for (
      let lat = Math.floor(bounds.minLat / gridSize) * gridSize;
      lat <= bounds.maxLat;
      lat += gridSize
    ) {
      ctx.beginPath();
      const start = geoToCanvas(lat, bounds.minLon);
      const end = geoToCanvas(lat, bounds.maxLon);
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // Draw major streets with slightly darker lines
    ctx.strokeStyle = "#8E9196"; // Darker gray for major streets
    ctx.lineWidth = 1;

    // Vertical major streets (every 5 grid cells)
    for (
      let lon = Math.floor(bounds.minLon / (gridSize * 5)) * gridSize * 5;
      lon <= bounds.maxLon;
      lon += gridSize * 5
    ) {
      ctx.beginPath();
      const start = geoToCanvas(bounds.minLat, lon);
      const end = geoToCanvas(bounds.maxLat, lon);
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // Horizontal major streets (every 5 grid cells)
    for (
      let lat = Math.floor(bounds.minLat / (gridSize * 5)) * gridSize * 5;
      lat <= bounds.maxLat;
      lat += gridSize * 5
    ) {
      ctx.beginPath();
      const start = geoToCanvas(lat, bounds.minLon);
      const end = geoToCanvas(lat, bounds.maxLon);
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  };

  const handleZoomIn = () => {
    setMapZoom((prev) => Math.min(prev * 1.5, 20));
  };

  const handleZoomOut = () => {
    setMapZoom((prev) => Math.max(prev / 1.5, 1));
  };

  const handleFitSelected = () => {
    const selectedSegments = segments.filter((s) => s.selected);
    if (selectedSegments.length === 0) return;

    let minLat = Infinity;
    let minLon = Infinity;
    let maxLat = -Infinity;
    let maxLon = -Infinity;

    selectedSegments.forEach((segment) => {
      segment.geometry.forEach((point: { lat: number; lon: number }) => {
        minLat = Math.min(minLat, point.lat);
        minLon = Math.min(minLon, point.lon);
        maxLat = Math.max(maxLat, point.lat);
        maxLon = Math.max(maxLon, point.lon);
      });
    });

    // Add a small buffer
    const latBuffer = (maxLat - minLat) * 0.2;
    const lonBuffer = (maxLon - minLon) * 0.2;

    setBounds({
      minLat: minLat - latBuffer,
      minLon: minLon - lonBuffer,
      maxLat: maxLat + latBuffer,
      maxLon: maxLon + lonBuffer,
    });
  };

  return (
    <div className="border rounded-md h-[400px] bg-slate-50 flex flex-col">
      <div className="p-2 border-b flex justify-between items-center">
        <div>
          <span className="text-sm font-medium">
            {segments.filter((s) => s.selected).length} segmentos selecionados
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={mapZoom >= 20}
          >
            +
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={mapZoom <= 1}
          >
            -
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFitSelected}
            disabled={segments.filter((s) => s.selected).length === 0}
          >
            Centralizar Selecionados
          </Button>
        </div>
      </div>
      <div ref={mapContainerRef} className="flex-1 relative">
        {segments.length > 0 && bounds ? (
          <canvas
            ref={canvasRef}
            width={800}
            height={340}
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">
              Selecione uma cidade para visualizar o mapa
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityMap;
