import appRoot from "app-root-path";
import path from "node:path";

export function getFullPathFromRoot(fileOrDirPath: string) {
  return path.resolve(appRoot.path, fileOrDirPath);
}
