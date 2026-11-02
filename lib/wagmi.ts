import { http, createConfig } from "wagmi";
import { botchainTestnet } from "./chain";

export const wagmiConfig = createConfig({
  chains: [botchainTestnet],
  ssr: true,
  transports: {
    [botchainTestnet.id]: http("https://rpc.bohr.life"),
  },
});
