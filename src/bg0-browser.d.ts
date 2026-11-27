declare module '@bg0/browser' {
  export function removeBackground(file: File): Promise<{ blob: Blob }>;
}
