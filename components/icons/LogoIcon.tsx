import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 100 100" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Outer square */}
    <rect 
      x="10" 
      y="10" 
      width="80" 
      height="80" 
      rx="15" 
      fill="url(#logoGradient)"
    />
    
    {/* Inner cutout shape resembling a speech bubble/panel */}
    <path 
      fill="rgb(15 23 42)"
      d="M30,30 h40 a5,5 0 0 1 5,5 v20 a5,5 0 0 1 -5,5 h-15 l-10,10 v-10 h-15 a5,5 0 0 1 -5,-5 v-20 a5,5 0 0 1 5,-5 z"
    />
  </svg>
);