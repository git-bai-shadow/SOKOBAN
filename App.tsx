import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_LEVELS } from './constants';
import { Grid, LevelData, TileType, Position } from './types';
import GridCell from './components/GridCell';
import GameControls from './components/GameControls';
import { Trophy, Star, Sparkles, Box as BoxIcon } from 'lucide-react';

const App: React.FC = () => {
  const [levels] = useState<LevelData[]>(INITIAL_LEVELS);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [grid, setGrid] = useState<Grid>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<{ grid: Grid; playerPos: Position; moves: number }[]>([]);
  const [isWon, setIsWon] = useState(false);

  // Helper: Deep copy grid
  const cloneGrid = (g: Grid) => g.map(row => [...row]);

  // Helper: Parse string map to grid
  const parseLevel = useCallback((mapData: string[]) => {
    const newGrid: Grid = [];
    let startPos: Position = { x: 0, y: 0 };

    mapData.forEach((rowStr, y) => {
      const row = rowStr.split('');
      const newRow: string[] = [];
      row.forEach((char, x) => {
        if (char === TileType.Player || char === TileType.PlayerOnTarget) {
          startPos = { x, y };
        }
        newRow.push(char);
      });
      newGrid.push(newRow);
    });

    return { grid: newGrid, playerPos: startPos };
  }, []);

  // Load level
  const loadLevel = useCallback((index: number) => {
    const level = levels[index];
    if (!level) return;
    
    const { grid: newGrid, playerPos: startPos } = parseLevel(level.map);
    setGrid(newGrid);
    setPlayerPos(startPos);
    setMoves(0);
    setHistory([]);
    setIsWon(false);
  }, [levels, parseLevel]);

  // Initial load
  useEffect(() => {
    loadLevel(currentLevelIndex);
  }, [currentLevelIndex, loadLevel]);

  // Check Win Condition
  useEffect(() => {
    if (grid.length === 0) return;

    let boxCount = 0;
    let boxOnTargetCount = 0;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        if (cell === TileType.Box) boxCount++;
        if (cell === TileType.BoxOnTarget) boxOnTargetCount++;
      }
    }

    const hasTargets = grid.some(row => row.some(c => c === TileType.Target || c === TileType.BoxOnTarget || c === TileType.PlayerOnTarget));
    
    if (hasTargets && boxCount === 0 && boxOnTargetCount > 0) {
      setIsWon(true);
    }
  }, [grid]);

  // Movement Logic
  const move = useCallback((dx: number, dy: number) => {
    if (isWon) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newY < 0 || newY >= grid.length || newX < 0 || newX >= grid[newY].length) return;

    const targetCell = grid[newY][newX];
    const nextX = newX + dx;
    const nextY = newY + dy;

    let newGrid = cloneGrid(grid);
    let moved = false;

    if (targetCell === TileType.Floor || targetCell === TileType.Target) {
      moved = true;
    } 
    else if (targetCell === TileType.Box || targetCell === TileType.BoxOnTarget) {
      if (nextY >= 0 && nextY < grid.length && nextX >= 0 && nextX < grid[nextY].length) {
        const behindBox = grid[nextY][nextX];
        if (behindBox === TileType.Floor || behindBox === TileType.Target) {
          const destinationIsTarget = behindBox === TileType.Target;
          newGrid[nextY][nextX] = destinationIsTarget ? TileType.BoxOnTarget : TileType.Box;
          moved = true;
        }
      }
    }

    if (moved) {
      setHistory(prev => [...prev, { grid: cloneGrid(grid), playerPos, moves }]);
      const currentCell = grid[playerPos.y][playerPos.x];
      newGrid[playerPos.y][playerPos.x] = (currentCell === TileType.PlayerOnTarget) ? TileType.Target : TileType.Floor;
      const isDestinationTarget = 
        targetCell === TileType.Target || 
        targetCell === TileType.BoxOnTarget || 
        targetCell === TileType.PlayerOnTarget;
      newGrid[newY][newX] = isDestinationTarget ? TileType.PlayerOnTarget : TileType.Player;

      setGrid(newGrid);
      setPlayerPos({ x: newX, y: newY });
      setMoves(m => m + 1);
    }
  }, [grid, playerPos, isWon]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': move(0, -1); break;
        case 'ArrowDown': case 's': case 'S': move(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': move(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': move(1, 0); break;
        case 'z': if (e.ctrlKey || e.metaKey) handleUndo(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setGrid(lastState.grid);
    setPlayerPos(lastState.playerPos);
    setMoves(lastState.moves);
    setHistory(prev => prev.slice(0, -1));
    setIsWon(false);
  };

  const handleReset = () => {
    loadLevel(currentLevelIndex);
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
    } else {
      setCurrentLevelIndex(0);
    }
  };

  const handlePrevLevel = () => {
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center py-6 px-4 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="mb-8 text-center space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700/50 backdrop-blur-sm shadow-xl mb-2">
           <BoxIcon size={16} className="text-amber-500" />
           <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Classic Puzzle Game</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-2xl">
          SOKOBAN
          <span className="text-blue-500">.</span>
        </h1>
      </header>

      {/* Main Game Container */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        
        {/* Victory Modal */}
        {isWon && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-3xl" />
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-700 text-center transform animate-in zoom-in-95 duration-300 relative overflow-hidden max-w-sm w-full">
              {/* Confetti effect background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 to-transparent animate-pulse" />
              
              <div className="relative z-10">
                <div className="mx-auto w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <Trophy className="text-yellow-400 drop-shadow-lg" size={40} />
                </div>
                
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Level Clear!</h2>
                
                <div className="flex justify-center gap-1 mb-6 text-yellow-400">
                   <Star size={20} fill="currentColor" className="animate-[spin_1s_ease-out_reverse]" />
                   <Star size={24} fill="currentColor" className="animate-[bounce_1s_infinite_-0.2s]" />
                   <Star size={20} fill="currentColor" className="animate-[spin_1s_ease-out]" />
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 mb-6 border border-slate-800">
                   <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Moves Taken</p>
                   <p className="text-3xl font-mono font-bold text-white">{moves}</p>
                </div>

                <button 
                  onClick={handleNextLevel}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <Sparkles size={20} className="group-hover:animate-spin" />
                  {currentLevelIndex < levels.length - 1 ? "Next Level" : "Replay Game"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Board Shadow/Glow Wrapper */}
        <div className="relative group p-1 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 shadow-2xl">
          {/* Stats Bar (Integrated into top of board) */}
          <div className="bg-slate-900/90 rounded-t-xl p-4 flex justify-between items-center border-b border-slate-800">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                  <span className="font-mono text-lg font-bold text-slate-200">
                     {currentLevelIndex + 1}
                  </span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level Name</span>
                  <span className="text-sm font-semibold text-white max-w-[150px] truncate">{levels[currentLevelIndex]?.name.split(':')[1] || levels[currentLevelIndex]?.name}</span>
               </div>
             </div>

             <div className="flex items-center gap-3">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Moves</span>
                  <span className="text-xl font-mono font-bold text-blue-400 tabular-nums">{String(moves).padStart(3, '0')}</span>
               </div>
             </div>
          </div>

          {/* Grid Container */}
          <div className="bg-slate-950 p-2 sm:p-4 rounded-b-xl overflow-hidden border-t border-slate-800/50">
            <div className="flex flex-col gap-0.5 sm:gap-1">
              {grid.map((row, y) => (
                <div key={y} className="flex gap-0.5 sm:gap-1 justify-center">
                  {row.map((cellType, x) => (
                    <GridCell key={`${x}-${y}`} type={cellType} x={x} y={y} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <GameControls 
          onUndo={handleUndo}
          onReset={handleReset}
          onNextLevel={handleNextLevel}
          onPrevLevel={handlePrevLevel}
          canUndo={history.length > 0}
          levelIndex={currentLevelIndex}
          totalLevels={levels.length}
        />
        
      </div>
    </div>
  );
};

export default App;