/// <reference types="vite/client" />

declare module '*.cdc?raw' {
  const content: string;
  export default content;
}
