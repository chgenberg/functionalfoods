'use client';

import { useEffect, useState } from 'react';

export default function VideoTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [videosInfo, setVideosInfo] = useState<any[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    addLog('🎬 Video test page loaded');
    
    const testVideo = (videoElement: HTMLVideoElement, name: string) => {
      addLog(`📹 Testing ${name} video`);
      
      videoElement.addEventListener('loadstart', () => addLog(`${name}: loadstart`));
      videoElement.addEventListener('loadedmetadata', () => addLog(`${name}: loadedmetadata`));
      videoElement.addEventListener('loadeddata', () => addLog(`${name}: loadeddata`));
      videoElement.addEventListener('canplay', () => addLog(`${name}: canplay`));
      videoElement.addEventListener('canplaythrough', () => addLog(`${name}: canplaythrough`));
      videoElement.addEventListener('play', () => addLog(`${name}: play event`));
      videoElement.addEventListener('playing', () => addLog(`${name}: playing`));
      videoElement.addEventListener('pause', () => addLog(`${name}: pause`));
      videoElement.addEventListener('error', (e) => {
        addLog(`${name}: ERROR - ${e.message || 'Unknown error'}`);
        if (videoElement.error) {
          addLog(`${name}: Error code: ${videoElement.error.code}`);
          addLog(`${name}: Error message: ${videoElement.error.message}`);
        }
      });
      
      // Try to play after a delay
      setTimeout(() => {
        addLog(`${name}: Attempting to play...`);
        videoElement.play().then(() => {
          addLog(`${name}: ✅ Play promise resolved`);
        }).catch(err => {
          addLog(`${name}: ❌ Play promise rejected: ${err.message}`);
        });
      }, 1000);
    };

    // Test videos after DOM is ready
    setTimeout(() => {
      const videos = document.querySelectorAll('video');
      addLog(`🔍 Found ${videos.length} video elements`);
      
      videos.forEach((video, index) => {
        const name = index === 0 ? 'Desktop' : 'Mobile';
        testVideo(video, name);
        
        setVideosInfo(prev => [...prev, {
          name,
          src: video.src,
          readyState: video.readyState,
          paused: video.paused,
          muted: video.muted,
          autoplay: video.autoplay,
          loop: video.loop
        }]);
      });
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Video Test Page</h1>
      
      {/* Video elements */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Videos</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Desktop video */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Desktop Video</h3>
            <video
              ref={(el) => {
                if (el && !el.src) {
                  el.src = "/introvideo_compressed.mp4";
                  addLog('🖥️ Desktop video src set');
                }
              }}
              className="w-full h-48 bg-black rounded"
              muted
              loop
              playsInline
              preload="auto"
              controls
            />
          </div>
          
          {/* Mobile video */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Mobile Video</h3>
            <video
              ref={(el) => {
                if (el && !el.src) {
                  el.src = "/introvideo_mobile.mp4";
                  addLog('📱 Mobile video src set');
                }
              }}
              className="w-full h-48 bg-black rounded"
              muted
              loop
              playsInline
              preload="auto"
              controls
            />
          </div>
        </div>
      </div>
      
      {/* Video info */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Video Information</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <pre className="text-sm">
            {JSON.stringify(videosInfo, null, 2)}
          </pre>
        </div>
      </div>
      
      {/* Logs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
        <div className="bg-black text-accent p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
      
      {/* Test buttons */}
      <div className="mt-8 space-x-4">
        <button
          onClick={() => {
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
              video.play().catch(err => addLog(`Play failed: ${err.message}`));
            });
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Force Play All
        </button>
        
        <button
          onClick={() => {
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
              video.pause();
              addLog(`Video paused`);
            });
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Pause All
        </button>
        
        <button
          onClick={() => {
            setLogs([]);
            setVideosInfo([]);
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
} 