import RandomNumbeGenerator from './utils/randomNumbeGenerator'

export class HexInfo
{
  location: LocationInfo
  dexNumber: number;
  color: number;
  name: string;
  hidden: boolean;
  
  constructor(location: LocationInfo, dexNumber: number, name: string)
  {
    this.location = location;
    this.dexNumber = dexNumber;
    this.color = 0;
    this.name = name;
    this.hidden = false;
  }
}

export interface PlayStyle {
  name: string;
  hexClicked(mon: HexInfo, direction: number, hexes: HexInfo[]): void
}

export type Point = {
  x: number;
  y: number;
}

export type LocationInfo =
{
  index: Point;
  coordinates: Point;
}

export type GraphicsInfo =
{
  fudge: number;
  imageType: string;
  hexRadius: number;
  colors: string[];
  hexBorder: string;
  background: string;
  border: 10;
  borderExpand: boolean;
  toolTip: boolean;
}

export type Settings = 
{
  includedPokemon: string;
  graphics: GraphicsInfo;
  map: MapSettings;
  seed: string | null;
  trackerType: string;
  trackerSettings: any;
}

export type MapSettings =
{
    type: string,
    size: number | null,
    verticalFlip: boolean,
    horizontalFlip: boolean,
    seed: string | null
}

export type ZombieStats = 
{
  infected: number,
  susceptible: number,
  safe: number
}

export type InfoSettings = 
{
  showStats: boolean;
  statsLocation: string;
  statscolor: string;
}

export enum SettingsFrames {
  Inital,
  Settings,
  Mons,
  Map,
  Game,
  Graphics,
  Finalize
}