/** Mock on-chain txs until Boombox game contract is deployed */

const MOCK_DELAY_MS = 1400;

function randomMockHash(): string {
  const hex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return `0x${hex}`;
}

export async function mockStartGameTx(): Promise<{ hash: string }> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  return { hash: randomMockHash() };
}

export async function mockCashOutTx(_amount: number): Promise<{ hash: string }> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  return { hash: randomMockHash() };
}
