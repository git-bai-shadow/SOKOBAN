export enum TileType {
  Wall = '#',
  Floor = ' ',
  Target = '.',
  Box = '$',
  Player = '@',
  BoxOnTarget = '*',
  PlayerOnTarget = '+',
}

export type Grid = string[][];

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  grid: Grid;
  playerPos: Position;
  moves: number;
  level: number;
  isWon: boolean;
}

export interface LevelData {
  id: number;
  name: string;
  map: string[]; // Array of strings representing rows
}