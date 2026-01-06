
import React from 'react';

interface MinimalFrameProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
  isDark?: boolean;
}

const MinimalFrame: React.FC<MinimalFrameProps> = ({ label, children, className = "", isDark = false }) => {
  return (
    <div className={`transition-all duration-700 ease-in-out ${className}`}>
      {label && (
        <div className="mb-4">
          <span className={`text-[9px] font-bold tracking-[0.3em] uppercase transition-colors ${isDark ? 'opacity-20 text-white' : 'opacity-60 text-black'}`}>{label}</span>
        </div>
      )}
      <div className={`relative border p-2 transition-colors duration-500 rounded-3xl ${isDark ? 'border-white/5 bg-[#0e0e0e]' : 'border-black/20 bg-white shadow-sm'}`}>
        {children}
      </div>
    </div>
  );
};

export default MinimalFrame;
