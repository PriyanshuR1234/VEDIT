import React, { useRef, useEffect, useState } from 'react';

const Filmstrip = ({ videoUrl, duration, width, videoOffset = 0 }) => {
    const [thumbnails, setThumbnails] = useState([]);
    const canvasRef = useRef(null);
    const videoRef = useRef(null);

    useEffect(() => {
        if (!videoUrl || !duration || !width || width < 50) return;

        const generateThumbnails = async () => {
            const video = document.createElement('video');
            video.src = videoUrl;
            video.crossOrigin = 'anonymous';
            video.muted = true;
            videoRef.current = video;

            await new Promise(resolve => {
                video.onloadeddata = resolve;
            });

            const canvas = document.createElement('canvas');
            canvasRef.current = canvas;
            const ctx = canvas.getContext('2d');
            
            // Assume 16:9 aspect ratio roughly for height calculation
            const thumbHeight = 60; // Approximate height of clip
            const thumbWidth = (video.videoWidth / video.videoHeight) * thumbHeight;
            const numThumbs = Math.max(1, Math.ceil(width / thumbWidth));

            canvas.width = thumbWidth;
            canvas.height = thumbHeight;

            const newThumbnails = [];
            const interval = duration / numThumbs;

            for (let i = 0; i < numThumbs; i++) {
                const time = (i * interval) + videoOffset;
                if (time < video.duration) {
                    video.currentTime = Math.max(0, time);
                    await new Promise(resolve => {
                        video.onseeked = resolve;
                    });
                    ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);
                    newThumbnails.push(canvas.toDataURL('image/jpeg', 0.5));
                }
            }
            setThumbnails(newThumbnails);
        };

        generateThumbnails();

        return () => {
            if (videoRef.current) {
                videoRef.current.src = '';
                videoRef.current.load();
            }
        };
    }, [videoUrl, duration, width, videoOffset]);

    return (
        <div className="absolute inset-0 flex overflow-hidden pointer-events-none opacity-50 z-0">
            {thumbnails.map((thumb, i) => (
                <img key={i} src={thumb} className="h-full object-cover border-r border-black/20" alt="frame" />
            ))}
        </div>
    );
};

export default Filmstrip;
