import type { Connector } from "wagmi";
import { appChain } from "@/config/wagmi";

type ConnectArgs = {
  connector: Connector;
  chainId?: typeof appChain.id;
};

export async function connectWalletSafely(
  connector: Connector,
  connectAsync: (args: ConnectArgs) => Promise<unknown>,
  reconnectAsync: (args: { connectors: Connector[] }) => Promise<unknown>
): Promise<"connected" | "failed"> {
  try {
    await connectAsync({ connector, chainId: appChain.id });
    return "connected";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!/already connected/i.test(message)) {
      return "failed";
    }

    try {
      await reconnectAsync({ connectors: [connector] });
    } catch {
      /* connector is live — treat as success */
    }
    return "connected";
  }
}
