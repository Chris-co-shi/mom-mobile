import { storage } from '@/platform/storage';
import type { OfflineCommand } from './types';

const STORAGE_KEY = 'mom-mobile:offline-command-queue:v1';

export function loadCommands(): OfflineCommand[] {
  return storage.get<OfflineCommand[]>(STORAGE_KEY, []);
}

export function saveCommands(commands: OfflineCommand[]): void {
  storage.set(STORAGE_KEY, commands);
}

export function upsertCommand(command: OfflineCommand): void {
  const commands = loadCommands();
  const index = commands.findIndex((item) => item.id === command.id);
  if (index >= 0) commands[index] = command;
  else commands.push(command);
  saveCommands(commands);
}

export function removeCommand(id: string): void {
  saveCommands(loadCommands().filter((item) => item.id !== id));
}
