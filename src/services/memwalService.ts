import { MemWal } from '@mysten-incubation/memwal';

// Read config from env
const MEMWAL_PRIVATE_KEY = import.meta.env.VITE_MEMWAL_PRIVATE_KEY;
const MEMWAL_ACCOUNT_ID = import.meta.env.VITE_MEMWAL_ACCOUNT_ID;

let memwalClient: MemWal | null = null;

if (MEMWAL_PRIVATE_KEY && MEMWAL_ACCOUNT_ID) {
  memwalClient = MemWal.create({
    key: MEMWAL_PRIVATE_KEY,
    accountId: MEMWAL_ACCOUNT_ID,
  });
}

export interface ZodiacNote {
  id: string;
  name: string;
  birthDate: string;
  sign: string;
  message: string;
  address?: string;
  likes?: number;
  isSyncing?: boolean; // UI flag cho rememberAndWait
}

/**
 * Fetch notes from the Memwal smart contract space using vector search
 * @param sign Optional sign to filter by
 */
export async function fetchNotes(sign: string): Promise<ZodiacNote[]> {
  if (!memwalClient) {
    console.warn("Memwal configuration is missing. Returning empty notes.");
    return [];
  }

  try {
    console.log(`Fetching messages from Memwal namespace: ${sign}`);
    const res = await memwalClient.recall({ query: "lời tiên tri", limit: 100, namespace: sign });
    
    const parsedNotes = res.results.map(r => {
      try {
        return JSON.parse(r.text) as ZodiacNote;
      } catch (e) {
        return null;
      }
    }).filter((n): n is ZodiacNote => n !== null);

    // Deduplicate logic: Keep the version with highest likes, or newest birthDate if likes are equal
    const dedupMap = new Map<string, ZodiacNote>();
    for (const note of parsedNotes) {
      if (!note.id) continue;
      
      const existing = dedupMap.get(note.id);
      if (!existing) {
        dedupMap.set(note.id, note);
      } else {
        const currentLikes = note.likes || 0;
        const existingLikes = existing.likes || 0;
        
        if (currentLikes > existingLikes) {
          dedupMap.set(note.id, note);
        } else if (currentLikes === existingLikes) {
          if (new Date(note.birthDate).getTime() > new Date(existing.birthDate).getTime()) {
            dedupMap.set(note.id, note);
          }
        }
      }
    }

    return Array.from(dedupMap.values());
  } catch (error) {
    console.error("Error fetching Memwal notes:", error);
    return [];
  }
}

/**
 * Write a note to Memwal and wait for it to be indexed.
 */
export async function addNote(note: ZodiacNote): Promise<boolean> {
  if (!memwalClient) {
    console.error("Memwal configuration missing.");
    return false;
  }

  try {
    // Xóa cờ isSyncing trước khi lưu để tiết kiệm byte
    const { isSyncing, ...noteData } = note;
    const textToEmbed = JSON.stringify(noteData);
    
    // Sử dụng rememberAndWait để đảm bảo được ghi vào Walrus
    await memwalClient.rememberAndWait(textToEmbed, note.sign, { timeoutMs: 40_000 });
    return true;
  } catch (e) {
    console.error("Error writing note to Memwal:", e);
    return false;
  }
}

/**
 * Update likes by re-remembering the note.
 */
export async function likeNote(note: ZodiacNote): Promise<boolean> {
  const updatedNote = { ...note, likes: (note.likes || 0) + 1, birthDate: new Date().toISOString() };
  return addNote(updatedNote);
}

/**
 * Restore an entire namespace from Walrus blockchain.
 * Useful if the Relayer loses data.
 */
export async function restoreArchive(sign: string): Promise<{restored: number, skipped: number, total: number} | null> {
  if (!memwalClient) return null;
  
  try {
    const result = await memwalClient.restore(sign, 50);
    return result;
  } catch (e) {
    console.error(`Error restoring namespace ${sign}:`, e);
    return null;
  }
}
