'use client';

import React from 'react';

export default function ClinicLogo({ className = 'w-12 h-12', watermark = false }) {
  if (watermark) {
    return (
      <div className={`flex items-center justify-center ${className} select-none pointer-events-none`}>
        <img
          src="/web_logo.png"
          alt="Clinic Watermark"
          className="w-full h-full object-contain opacity-10 mix-blend-multiply select-none pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/web_logo.png"
        alt="Skin & HIV Care Clinic Logo"
        className="w-full h-full object-contain drop-shadow-sm"
      />
    </div>
  );
}
