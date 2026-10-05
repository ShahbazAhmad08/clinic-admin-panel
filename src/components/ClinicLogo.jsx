'use client';

import React from 'react';

export default function ClinicLogo({ className = 'w-16 h-16', watermark = false }) {
  if (watermark) {
    return (
      <svg
        viewBox="0 0 300 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g opacity="0.16">
          {/* AIDS Awareness Ribbon - Red / Rose */}
          <path
            d="M95 90 C70 140, 55 210, 85 270 C100 300, 130 310, 150 280 C170 250, 185 220, 205 160 C220 115, 195 65, 150 65 C120 65, 105 75, 95 90 Z"
            fill="url(#ribbonGrad)"
          />
          <path
            d="M150 65 C185 65, 215 100, 200 150 C180 200, 140 260, 115 320 C105 340, 85 340, 75 320 C60 290, 80 230, 110 170 C130 130, 135 90, 150 65 Z"
            fill="url(#ribbonGradDark)"
            opacity="0.85"
          />

          {/* Skin Care & Health Teardrop Leaf / Face Silhouette - Teal / Green */}
          <path
            d="M165 40 C165 40, 240 100, 230 180 C220 250, 175 285, 150 295 C180 260, 195 210, 185 165 C178 135, 160 110, 155 80 C152 65, 158 50, 165 40 Z"
            fill="url(#leafTealGrad)"
          />
          <path
            d="M175 140 C182 155, 195 160, 205 160 C215 160, 222 170, 218 185 C212 205, 198 225, 180 238 C192 215, 195 185, 182 165 C176 155, 173 148, 175 140 Z"
            fill="#5eead4"
            opacity="0.9"
          />
          {/* Subtle profile silhouette curve */}
          <path
            d="M210 145 C218 152, 226 158, 224 168 C220 178, 208 184, 202 195 C198 202, 204 212, 198 222 C190 234, 178 245, 165 252 C185 238, 205 218, 212 190 C216 172, 205 158, 210 145 Z"
            fill="#14b8a6"
          />
        </g>

        <defs>
          <linearGradient id="ribbonGrad" x1="60" y1="70" x2="210" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e11d48" />
            <stop offset="0.5" stopColor="#f43f5e" />
            <stop offset="1" stopColor="#be123c" />
          </linearGradient>
          <linearGradient id="ribbonGradDark" x1="70" y1="80" x2="190" y2="330" gradientUnits="userSpaceOnUse">
            <stop stopColor="#be123c" />
            <stop offset="1" stopColor="#881337" />
          </linearGradient>
          <linearGradient id="leafTealGrad" x1="150" y1="40" x2="240" y2="295" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0d9488" />
            <stop offset="0.5" stopColor="#14b8a6" />
            <stop offset="1" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Red Awareness Ribbon */}
      <path
        d="M75 60 C55 95, 45 145, 68 190 C80 212, 105 220, 120 198 C135 178, 148 155, 164 112 C176 80, 156 45, 120 45 C96 45, 84 52, 75 60 Z"
        fill="url(#ribbonGradFront)"
      />
      <path
        d="M120 45 C148 45, 172 70, 160 110 C144 150, 112 195, 92 240 C84 255, 68 255, 60 240 C48 215, 64 170, 88 125 C104 95, 108 65, 120 45 Z"
        fill="url(#ribbonGradDarkFront)"
      />

      {/* Teal / Cyan Skin Silhouette Leaf */}
      <path
        d="M132 25 C132 25, 192 72, 184 135 C176 190, 140 218, 120 225 C144 198, 156 158, 148 122 C142 98, 128 78, 124 55 C121 43, 126 32, 132 25 Z"
        fill="url(#leafTealGradFront)"
      />
      <path
        d="M140 105 C146 118, 156 122, 164 122 C172 122, 178 130, 174 142 C170 158, 158 174, 144 184 C154 166, 156 142, 146 126 C141 118, 138 112, 140 105 Z"
        fill="#5eead4"
      />

      <defs>
        <linearGradient id="ribbonGradFront" x1="50" y1="45" x2="170" y2="225" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e11d48" />
          <stop offset="0.6" stopColor="#f43f5e" />
          <stop offset="1" stopColor="#be123c" />
        </linearGradient>
        <linearGradient id="ribbonGradDarkFront" x1="60" y1="50" x2="155" y2="250" gradientUnits="userSpaceOnUse">
          <stop stopColor="#be123c" />
          <stop offset="1" stopColor="#881337" />
        </linearGradient>
        <linearGradient id="leafTealGradFront" x1="120" y1="25" x2="192" y2="225" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d9488" />
          <stop offset="0.5" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
    </svg>
  );
}
