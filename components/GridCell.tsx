import React from 'react';
import { TileType } from '../types';
import { Box, User, Flag, Check } from 'lucide-react';

interface GridCellProps {
  type: string;
  x: number;
  y: number;
}

const GridCell: React.FC<GridCellProps> = ({ type }) => {
  const getCellContent = () => {
    // We use a key based on 'type' to trigger enter animations when cell content changes
    switch (type) {
      case TileType.Wall:
        return (
          <div key="wall" className="w-full h-full animate-in zoom-in-95 duration-300">
            <div className="w-full h-full bg-slate-600 rounded-md shadow-[0_4px_0_0_rgba(30,41,59,1)] relative overflow-hidden border-t border-slate-500">
              {/* Texture detail */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-400 to-transparent" />
              <div className="absolute bottom-0 w-full h-1 bg-slate-800/50" />
            </div>
          </div>
        );
      case TileType.Floor:
        return (
          <div key="floor" className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 bg-slate-800 rounded-full opacity-20" />
          </div>
        );
      case TileType.Target:
        return (
          <div key="target" className="w-full h-full flex items-center justify-center animate-pulse">
            <div className="w-full h-full bg-slate-800/50 rounded-md flex items-center justify-center border-2 border-slate-700/50">
              <div className="w-2/5 h-2/5 bg-red-500/20 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              </div>
            </div>
          </div>
        );
      case TileType.Box:
        return (
          <div key="box" className="w-full h-full relative z-10 animate-in zoom-in-50 duration-200">
             <div className="w-full h-full bg-amber-600 rounded-md shadow-[0_4px_0_0_rgba(146,64,14,1)] border-t border-amber-400 flex items-center justify-center group">
               <div className="absolute inset-2 border-2 border-amber-800/20 rounded-sm" />
               <Box size={20} className="text-amber-900/40 relative z-10" strokeWidth={2.5} />
             </div>
          </div>
        );
      case TileType.Player:
        return (
          <div key="player" className="w-full h-full relative z-20 animate-in zoom-in-75 duration-150">
             <div className="w-full h-full flex items-center justify-center">
                <div className="w-[85%] h-[85%] bg-blue-500 rounded-full shadow-[0_4px_0_0_rgba(29,78,216,1)] border-t-2 border-blue-300 flex items-center justify-center relative">
                   <User size={20} className="text-white drop-shadow-md" strokeWidth={2.5} />
                   <div className="absolute -bottom-1 w-3/4 h-1 bg-black/20 rounded-full blur-[2px]" />
                </div>
             </div>
          </div>
        );
      case TileType.BoxOnTarget:
        return (
          <div key="box-target" className="w-full h-full relative z-10 animate-in zoom-in-90 duration-300">
             <div className="w-full h-full bg-emerald-500 rounded-md shadow-[0_0_20px_rgba(16,185,129,0.5),0_4px_0_0_rgba(6,95,70,1)] border-t border-emerald-300 flex items-center justify-center">
               <div className="absolute inset-0 bg-white/20 animate-pulse rounded-md" />
               <Check size={24} className="text-white drop-shadow-md relative z-10" strokeWidth={3} />
             </div>
          </div>
        );
      case TileType.PlayerOnTarget:
        return (
          <div key="player-target" className="w-full h-full relative z-20">
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-1/2 h-1/2 bg-red-500/20 rounded-full animate-ping absolute" />
             </div>
             <div className="w-full h-full flex items-center justify-center animate-in zoom-in-75 duration-150">
                <div className="w-[85%] h-[85%] bg-blue-500 rounded-full shadow-[0_4px_0_0_rgba(29,78,216,1)] border-t-2 border-blue-300 flex items-center justify-center">
                   <User size={20} className="text-white" strokeWidth={2.5} />
                </div>
             </div>
          </div>
        );
      default:
        return <div className="w-full h-full" />;
    }
  };

  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center p-0.5 sm:p-1 transition-all duration-100">
      <div className="w-full h-full bg-slate-800/40 rounded-lg relative">
        {getCellContent()}
      </div>
    </div>
  );
};

export default GridCell;