import * as fs from 'fs/promises';
import * as path from 'path';
import { sync } from 'fast-glob';

import { CommandBus } from './command-bus';
import { QueryBus } from './query-bus';

export const registerHandlers = async (bus: CommandBus | QueryBus) => {
  let featuresPaths: string[];

  if (bus instanceof CommandBus) {
    featuresPaths = sync(`**/command-handlers/`, { absolute: true, onlyDirectories: true });
  } else if (bus instanceof QueryBus) {
    featuresPaths = sync(`**/query-handlers/`, { absolute: true, onlyDirectories: true });
  } else {
    throw new Error('Unknown bus type');
  }

  const getAllHandlerFiles = async (dir: string): Promise<string[]> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await getAllHandlerFiles(fullPath)));
      } else if (entry.isFile() && entry.name.endsWith('.handler.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  };

  const allHandlerFiles: string[] = [];
  for (const featuresPath of featuresPaths) {
    const handlerFiles = await getAllHandlerFiles(featuresPath);
    allHandlerFiles.push(...handlerFiles);
  }

  allHandlerFiles.forEach(file => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const handlerModule = require(file);
    const HandlerClass = handlerModule[Object.keys(handlerModule)[0]];

    if (HandlerClass) {
      if (bus instanceof CommandBus) {
        bus.register(new HandlerClass());
      } else {
        bus.register(new HandlerClass());
      }
    }
  });
};
