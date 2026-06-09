import React from 'react';

const CRTOverlay = () => {
    return (
        <>
            <div className="crt-overlay crt-flicker" />
            <div className="scanline" />
            {/* Vignette */}
            <div className="fixed inset-0 pointer-events-none z-[110] shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
        </>
    );
};

export default CRTOverlay;
