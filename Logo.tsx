import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      {/* Abstract Representation of the Logo from Image */}
      <div className="flex gap-1 h-10">
        <div className="w-3 bg-brandYellow h-full rounded-l-md relative">
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 bg-midnight rounded-full border-2 border-brandYellow z-10"></div>
        </div>
        <div className="w-3 bg-brandYellow h-full rounded-r-md"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold tracking-widest text-white leading-none">HOME</span>
        <span className="text-[10px] tracking-[0.2em] text-white/80 uppercase">Real Estate</span>
      </div>
    </div>
  );
};