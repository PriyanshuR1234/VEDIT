import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import VideoEditor from './VideoEditor';
import RightSidebar from './RightSidebar';

const Layout = () => {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    const [leftWidth, setLeftWidth] = useState(320);
    const [rightWidth, setRightWidth] = useState(320);
    const isDraggingLeft = useRef(false);
    const isDraggingRight = useRef(false);
    const videoEditorRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (isDraggingLeft.current) {
            setLeftWidth(Math.max(200, Math.min(e.clientX, 600)));
        } else if (isDraggingRight.current) {
            setRightWidth(Math.max(200, Math.min(window.innerWidth - e.clientX, 600)));
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingLeft.current = false;
        isDraggingRight.current = false;
        document.body.style.cursor = 'default';
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden font-sans selection:bg-indigo-500/30">
            <Header
                isLeftSidebarOpen={isLeftSidebarOpen}
                setIsLeftSidebarOpen={setIsLeftSidebarOpen}
                isRightSidebarOpen={isRightSidebarOpen}
                setIsRightSidebarOpen={setIsRightSidebarOpen}
                videoEditorRef={videoEditorRef}
            />
            <div className="flex-1 flex overflow-hidden relative min-h-0">
                {/* Left Sidebar */}
                <div 
                    className={`flex-shrink-0 overflow-hidden ${isLeftSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    style={{ 
                        width: isLeftSidebarOpen ? `${leftWidth}px` : '0px',
                        transition: isDraggingLeft.current ? 'none' : 'width 300ms ease-in-out, opacity 300ms ease-in-out'
                    }}
                >
                    <LeftSidebar />
                </div>

                {/* Left Drag Handle */}
                {isLeftSidebarOpen && (
                    <div 
                        className="w-1.5 flex-shrink-0 cursor-col-resize hover:bg-indigo-500 bg-gray-800 transition-colors z-20"
                        onMouseDown={() => {
                            isDraggingLeft.current = true;
                            document.body.style.cursor = 'col-resize';
                        }}
                    />
                )}

                <VideoEditor ref={videoEditorRef} />

                {/* Right Drag Handle */}
                {isRightSidebarOpen && (
                    <div 
                        className="w-1.5 flex-shrink-0 cursor-col-resize hover:bg-indigo-500 bg-gray-800 transition-colors z-20"
                        onMouseDown={() => {
                            isDraggingRight.current = true;
                            document.body.style.cursor = 'col-resize';
                        }}
                    />
                )}

                {/* Right Sidebar */}
                <div 
                    className={`flex-shrink-0 overflow-hidden ${isRightSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    style={{ 
                        width: isRightSidebarOpen ? `${rightWidth}px` : '0px',
                        transition: isDraggingRight.current ? 'none' : 'width 300ms ease-in-out, opacity 300ms ease-in-out'
                    }}
                >
                    <RightSidebar />
                </div>
            </div>
        </div>
    );
};

export default Layout;
