import React from 'react';

interface SnlLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'color' | 'light' | 'dark';
  showTagline?: boolean;
}

export const SnlLogo: React.FC<SnlLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'color',
  showTagline = true,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-[11px]' },
    xl: { icon: 60, text: 'text-3xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon matching the uploaded snl logo */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          {/* Top Blue Chevron Gradient */}
          <linearGradient id="topBlueGrad" x1="15%" y1="10%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#00A3FF" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          {/* Top Orange Accent Gradient */}
          <linearGradient id="topOrangeGrad" x1="20%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#FFAE00" />
          </linearGradient>

          {/* SNL Text Gradient */}
          <linearGradient id="snlTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="45%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Bottom Orange Accent Gradient */}
          <linearGradient id="botOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFAE00" />
            <stop offset="100%" stopColor="#FF5500" />
          </linearGradient>

          {/* Bottom Blue Chevron Gradient */}
          <linearGradient id="botBlueGrad" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* Top Outer Blue Chevron / Diamond Cap */}
        <path
          d="M50 4L78 30L67 30L50 14L33 30L22 30L50 4Z"
          fill="url(#topBlueGrad)"
        />

        {/* Top Inner Orange Wing */}
        <path
          d="M50 20L73 32L65 34L50 24L35 34L27 32L50 20Z"
          fill="url(#topOrangeGrad)"
        />

        {/* Stylized SNL Central Lettering */}
        <g fill="url(#snlTextGrad)">
          {/* 'S' */}
          <path
            d="M20 45C20 40 23 37 28 37H36C38 37 39 38 39 40V44H27C26 44 25.5 44.5 25.5 45.5C25.5 46.5 26 47 27 47H34C38 47 40 49 40 53V57C40 60 37 62 33 62H24C21.5 62 20 60.5 20 58V53H25.5V56C25.5 56.5 26 57 27 57H33C34 57 34.5 56.5 34.5 55.5C34.5 54.5 34 54 33 54H26C22 54 20 51 20 47V45Z"
          />

          {/* 'N' */}
          <path
            d="M44 38H49.5L57 52V38H62.5V61H57L49.5 47V61H44V38Z"
          />

          {/* 'L' */}
          <path
            d="M66 38H71.5V56H80V61H66V38Z"
          />
        </g>

        {/* Bottom Inner Orange Wing */}
        <path
          d="M50 78L73 66L65 64L50 74L35 64L27 66L50 78Z"
          fill="url(#botOrangeGrad)"
        />

        {/* Bottom Outer Blue Chevron / Diamond Base */}
        <path
          d="M50 96L78 70L67 70L50 86L33 70L22 70L50 96Z"
          fill="url(#botBlueGrad)"
        />
      </svg>

      {/* Brand Text: SNL RICH with Registered Trademark */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline gap-1">
          <span
            className={`font-extrabold tracking-tight ${currentSize.text} ${
              isLight ? 'text-white' : 'text-[#0B1B3D]'
            }`}
          >
            SNL
          </span>
          <span
            className={`font-black tracking-wider ${currentSize.text} text-[#2563EB]`}
          >
            RICH
          </span>
          <span
            className={`text-[9px] font-bold align-top -mt-2 ${
              isLight ? 'text-amber-400' : 'text-amber-500'
            }`}
            title="Registered Trademark"
          >
            ®
          </span>
        </div>
        {showTagline && (
          <span
            className={`${currentSize.sub} font-semibold uppercase tracking-widest ${
              isLight ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Multi-Merchant Hub
          </span>
        )}
      </div>
    </div>
  );
};
