import { http, createConfig } from "wagmi";
import { botchainMainnet } from "./chain";

export const wagmiConfig = createConfig({
  chains: [botchainMainnet],
  ssr: true,
  transports: {
    [botchainMainnet.id]: http("https://rpc.botchain.ai"),
  },
});
