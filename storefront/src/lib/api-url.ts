const basePath = "";

export function apiUrl(path: string): string {
  return `${basePath}${path}`;
}
