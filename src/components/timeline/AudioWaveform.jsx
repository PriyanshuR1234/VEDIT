import React, { useEffect, useState, useRef } from 'react';

const AudioWaveform = ({ audioUrl, width, height }) => {
    const canvasRef = useRef(null);
    const [peaks, setPeaks] = useState(null);

    useEffect(() => {
        let isCancelled = false;
        
        const fetchAndDecodeAudio = async () => {
            if (!audioUrl) return;
            try {
                const response = await fetch(audioUrl);
                const arrayBuffer = await response.arrayBuffer();
                
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                
                if (isCancelled) return;

                const channelData = audioBuffer.getChannelData(0);
                const step = Math.ceil(channelData.length / 1000); 
                const newPeaks = [];
                
                for (let i = 0; i < 1000; i++) {
                    let min = 1.0;
                    let max = -1.0;
                    for (let j = 0; j < step; j++) {
                        const datum = channelData[i * step + j];
                        if (datum < min) min = datum;
                        if (datum > max) max = datum;
                    }
                    newPeaks.push(Math.max(Math.abs(min), Math.abs(max)));
                }
                
                setPeaks(newPeaks);
            } catch (err) {
                console.error("Error generating waveform", err);
            }
        };

        fetchAndDecodeAudio();

        return () => {
            isCancelled = true;
        };
    }, [audioUrl]);

    useEffect(() => {
        if (!peaks || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        
        ctx.clearRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#a855f7');
        gradient.addColorStop(0.5, '#6366f1');
        gradient.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradient;

        const numBars = Math.floor(width / 3); 
        const step = Math.max(1, Math.floor(peaks.length / numBars));

        for (let i = 0; i < numBars; i++) {
            const peakIndex = Math.min(Math.floor(i * step), peaks.length - 1);
            let peak = peaks[peakIndex];
            
            if (peak === undefined || isNaN(peak)) peak = 0.1;

            const barHeight = Math.max(2, peak * height * 0.8);
            
            const x = i * 3;
            const y = (height - barHeight) / 2;

            ctx.fillRect(x, y, 2, barHeight);
        }
    }, [peaks, width, height]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
            style={{ width: `${width}px`, height: `${height}px` }}
        />
    );
};

export default AudioWaveform;
