import React from 'react';
import { Undo2, RotateCcw, ChevronRight, ChevronLeft, RotateCw } from 'lucide-react';

interface GameControlsProps {
  onUndo: () => void;
  onReset: () => void;
  onNextLevel: () => void;
  onPrevLevel: () => void;
  canUndo: boolean;
  levelIndex: number;
  totalLevels: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  onUndo,
  onReset,
  onNextLevel,
  onPrevLevel,
  canUndo,
  levelIndex,
  totalLevels,
}) => {
  const isLastLevel = levelIndex === totalLevels - 1;

  // Reusable button component for consistency
  const ControlButton = ({ 
    onClick, 
    disabled, 
    icon: Icon, 
    label, 
    colorClass,
    hoverClass 
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden group w-full
        flex flex-row items-center justify-center gap-2 p-3 
        rounded-xl border-b-4 transition-all active:border-b-0 active:translate-y-1
        ${disabled 
          ? 'bg-slate-800 border-slate-900 text-slate-600 cursor-not-allowed opacity-50' 
          : `${colorClass} text-white shadow-lg active:shadow-none hover:brightness-110`
        }
      `}
    >
      <Icon size={18} className={`transition-transform ${!disabled && 'group-hover:scale-110'}`} />
      <span className="font-semibold text-sm tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto mt-8 relative z-20">
      
      {/* Level Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
          <span>Progress</span>
          <span>{Math.round(((levelIndex + 1) / totalLevels) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${((levelIndex + 1) / totalLevels) * 100}%` }}
          />
        </div>
      </div>

      {/* Level Navigation */}
      <div className="flex items-center justify-between bg-slate-800/40 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/50 shadow-xl">
        <button
          onClick={onPrevLevel}
          disabled={levelIndex === 0}
          className="p-3 hover:bg-slate-700/50 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed text-slate-300 transition-all hover:text-white"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Current Level</span>
          <span className="text-lg font-black text-white tracking-tight">
            {String(levelIndex + 1).padStart(2, '0')} <span className="text-slate-600">/</span> {totalLevels}
          </span>
        </div>

        <button
          onClick={onNextLevel}
          className={`p-3 hover:bg-slate-700/50 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all ${isLastLevel ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-300 hover:text-white'}`}
        >
          {isLastLevel ? <RotateCw size={24} strokeWidth={3} /> : <ChevronRight size={24} strokeWidth={3} />}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <ControlButton 
          onClick={onUndo} 
          disabled={!canUndo} 
          icon={Undo2} 
          label="UNDO" 
          colorClass="bg-slate-700 border-slate-900"
        />
        <ControlButton 
          onClick={onReset} 
          disabled={false} 
          icon={RotateCcw} 
          label="RESET" 
          colorClass="bg-slate-700 border-slate-900 hover:bg-red-900/80" 
        />
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Use <span className="text-slate-300">Arrow Keys</span> or <span className="text-slate-300">WASD</span> to move
      </div>
    </div>
  );
};

export default GameControls;