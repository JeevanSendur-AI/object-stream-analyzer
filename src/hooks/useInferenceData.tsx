import { useState, useEffect } from "react";

interface Detection {
  bbox: [number, number, number, number];
  confidence: number;
  label: string;
}

interface StreamData {
  id: number;
  name: string;
  url: string;
}

export const useInferenceData = (streams: StreamData[]) => {
  const [inferenceData, setInferenceData] = useState<Record<string, Detection[]>>({});
  const [objectCounts, setObjectCounts] = useState<Record<string, Record<string, number>>>({});
  const [historyData, setHistoryData] = useState<Record<string, Array<{time: string, count: number}>>>({});

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    // Create intervals for each stream to fetch inference data
    streams.forEach((stream) => {
      const interval = setInterval(async () => {
        try {
          // Convert base URL to inference URL
          const baseUrl = stream.url.endsWith('/video') ? stream.url.replace('/video', '') : stream.url;
          const inferenceUrl = `${baseUrl}/inference`;
          
          const response = await fetch(inferenceUrl);
          if (!response.ok) {
            console.error(`Failed to fetch inference for stream ${stream.id}`);
            return;
          }
          
          const detections: Detection[] = await response.json();
          const streamKey = `source${stream.id}`;
          
          // Update inference data
          setInferenceData(prev => ({
            ...prev,
            [streamKey]: detections
          }));

          // Count objects by label
          const counts: Record<string, number> = {};
          detections.forEach(detection => {
            counts[detection.label] = (counts[detection.label] || 0) + 1;
          });

          // Update object counts
          setObjectCounts(prev => ({
            ...prev,
            [streamKey]: counts
          }));

          // Update history data
          const totalCount = detections.length;
          setHistoryData(prev => {
            const streamHistory = prev[streamKey] || [];
            const newHistory = [...streamHistory, {
              time: new Date().toLocaleTimeString(),
              count: totalCount
            }];
            return {
              ...prev,
              [streamKey]: newHistory.slice(-20) // Keep last 20 entries
            };
          });

        } catch (error) {
          console.error(`Error fetching inference for stream ${stream.id}:`, error);
        }
      }, 1000); // Fetch every second

      intervals.push(interval);
    });

    // Calculate overall statistics
    const overallInterval = setInterval(() => {
      // Combine all stream data for overall view
      const allDetections: Detection[] = [];
      const overallCounts: Record<string, number> = {};
      
      Object.values(inferenceData).forEach(detections => {
        allDetections.push(...detections);
        detections.forEach(detection => {
          overallCounts[detection.label] = (overallCounts[detection.label] || 0) + 1;
        });
      });

      setObjectCounts(prev => ({
        ...prev,
        overall: overallCounts
      }));

      setHistoryData(prev => {
        const overallHistory = prev.overall || [];
        const newHistory = [...overallHistory, {
          time: new Date().toLocaleTimeString(),
          count: allDetections.length
        }];
        return {
          ...prev,
          overall: newHistory.slice(-20)
        };
      });
    }, 1000);

    intervals.push(overallInterval);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [streams, inferenceData]);

  return { inferenceData, objectCounts, historyData };
};