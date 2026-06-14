import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Transaction } from '@mysten/sui/transactions';

// Read config from env
const SUI_NETWORK = import.meta.env.VITE_SUI_NETWORK || 'testnet';
const PACKAGE_ID = import.meta.env.VITE_MEMWAL_PACKAGE_ID;
const ARCHIVE_SHARED_OBJECT_ID = import.meta.env.VITE_ARCHIVE_SHARED_OBJECT_ID;

// Exporting a singleton client
export const suiClient = new SuiJsonRpcClient({ 
  url: getJsonRpcFullnodeUrl(SUI_NETWORK as any),
  network: SUI_NETWORK as any
});

export interface ZodiacNote {
  id: string;
  name: string;
  birthDate: string;
  sign: string;
}

/**
 * Fetch notes from the Memwal smart contract space
 * In a real scenario, this would query the events or dynamic fields of the shared object.
 * @param sign Optional sign to filter by
 */
export async function fetchNotes(sign?: string): Promise<Record<string, ZodiacNote[]>> {
  if (!PACKAGE_ID || !ARCHIVE_SHARED_OBJECT_ID) {
    console.warn("Memwal configuration is missing. Returning empty notes.");
    return {};
  }

  try {
    // Example: fetch dynamic fields from the ARCHIVE_SHARED_OBJECT_ID
    // const dynamicFields = await suiClient.getDynamicFields({ parentId: ARCHIVE_SHARED_OBJECT_ID });
    
    // For now, we simulate fetching the parsed data
    // In production, you would fetch from a Sui indexer or directly interpret on-chain objects/events.
    console.log(`Fetching messages from Memwal archive: ${ARCHIVE_SHARED_OBJECT_ID}`);
    
    return {};
  } catch (error) {
    console.error("Error fetching Memwal notes:", error);
    return {};
  }
}

/**
 * Prepare a transaction to write a note to the Memwal smart contract.
 * The front-end can sign and execute this transaction using a wallet adapter.
 */
export function buildAddNoteTx(note: ZodiacNote): Transaction {
  const tx = new Transaction();

  if (!PACKAGE_ID || !ARCHIVE_SHARED_OBJECT_ID) {
    throw new Error("Memwal Package ID or Shared Object ID completely missing.");
  }

  // memwal::archive::add_note(archive: &mut Archive, sign: String, name: String, birthDate: String)
  tx.moveCall({
    target: `${PACKAGE_ID}::archive::add_note`,
    arguments: [
      tx.object(ARCHIVE_SHARED_OBJECT_ID),
      tx.pure.string(note.sign),
      tx.pure.string(note.name),
      tx.pure.string(note.birthDate),
    ],
  });

  return tx;
}

/**
 * Fallback / Mock logic for development without a wallet.
 * If Dev mode is enabled, or no wallet is provided, we can simulate or trigger backend writes.
 */
export async function simulateAddNote(note: ZodiacNote): Promise<boolean> {
  console.log("Simulating writing to Memwal:", note);
  return new Promise(resolve => setTimeout(() => resolve(true), 1000));
}
