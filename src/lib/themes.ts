export type Theme = 
  | 'default'
  | 'dark'
  | 'cat'
  | 'dog'
  | 'horse'
  | 'dragon'
  | 'neon'
  | 'gaming'
  | 'retro'
  | 'blueprint'
  | 'japan';

export const THEMES: { id: Theme; name: string }[] = [
  { id: 'default', name: 'デフォルト (ライト)' },
  { id: 'dark', name: 'ダークモード' },
  { id: 'cat', name: '猫モード 🐱' },
  { id: 'dog', name: '犬モード 🐶' },
  { id: 'horse', name: '馬モード (競馬風) 🏇' },
  { id: 'dragon', name: 'ドラゴンモード 🐉' },
  { id: 'neon', name: 'ネオンモード 🌃' },
  { id: 'gaming', name: 'ゲーミングモード 🌈' },
  { id: 'retro', name: 'レトロRPGモード 👾' },
  { id: 'blueprint', name: '設計図モード 📐' },
  { id: 'japan', name: '和風・浮世絵モード 🍵' },
];
