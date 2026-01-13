import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'vertical' | 'icon';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'horizontal', 
  className = "",
  showText = true 
}) => {
  // Sizes increased by 10% from original base values
  const sizes = {
    sm: { icon: 26, text: 'text-xl' },
    md: { icon: 44, text: 'text-[1.65rem]' },
    lg: { icon: 88, text: 'text-[2.475rem]' },
    xl: { icon: 132, text: 'text-[4.125rem]' }
  };

  const config = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${variant === 'vertical' ? 'flex-col text-center' : 'flex-row'} ${className} group`}>
      {/* Zen Stones SVG */}
      <svg 
        width={config.icon} 
        height={config.icon * 1.2} 
        viewBox="0 0 100 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xl overflow-visible"
      >
        <path 
          className="fill-teal-500 transition-all duration-1000"
          d="M10 90C10 82 30 75 50 75C70 75 90 82 90 90C90 98 70 105 50 105C30 105 10 98 10 90Z" 
        />
        <path 
          className="fill-indigo-600 transition-all duration-1000"
          d="M25 65C25 58 40 53 52 53C64 53 79 58 79 65C79 72 64 78 52 78C40 78 25 72 25 65Z" 
        />
        <path 
          className="fill-purple-500 transition-all duration-1000"
          d="M35 43C35 38 45 35 52 35C59 35 69 38 69 43C69 48 59 52 52 52C45 52 35 48 35 43Z" 
        />
        <g className="animate-bounce-zen">
          <circle className="fill-amber-500" cx="52" cy="22" r="8" />
          <circle className="animate-pulse fill-amber-400/40" cx="52" cy="22" r="14" />
          <circle className="fill-white/30" cx="50" cy="19" r="3" />
        </g>
      </svg>

      {(variant !== 'icon' && showText) && (
        <div className="flex flex-col items-start leading-none tracking-tighter">
          <span className={`${config.text} font-black text-slate-900 dark:text-white uppercase font-montserrat`}>
            Footsteps
          </span>
          <span className="text-[0.4em] font-black uppercase tracking-[0.4em] text-teal-600 dark:text-teal-400 mt-1">
            To Freedom
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
