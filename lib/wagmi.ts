import { http, createConfig } from "wagmi";
import { botchainMainnet, botchainTestnet } from "./chain";

export const wagmiConfig = createConfig({
  chains: [botchainMainnet, botchainTestnet],
  ssr: true,
  transports: {
    [botchainMainnet.id]: http("https://rpc.botchain.ai"),
    [botchainTestnet.id]: http("https://rpc.botchain.ai"),
  },
});
