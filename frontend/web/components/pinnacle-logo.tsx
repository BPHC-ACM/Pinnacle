export const PinnacleLogo = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 800 150"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="crosshatch"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
        >
          <path
            d="M 0 0 L 8 8 M 8 0 L 0 8"
            stroke="#70B8FF"
            strokeWidth="0.5"
            opacity="0.6"
          />
        </pattern>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#4A9FFF', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#70B8FF', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="120"
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill="url(#crosshatch)"
        stroke="#70B8FF"
        strokeWidth="3"
      >
        PINNACLE
      </text>
    </svg>
  );
};
