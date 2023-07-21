import '~/styles/globals.css'

import { Web3Modal } from '@web3modal/react'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { gnosis, gnosisChiado } from 'wagmi/chains'
import invariant from 'tiny-invariant';

import type { AppProps } from 'next/app'
import Layout from '~/components/Layout'
import RouteProtect from '~/components/RouteProtect'

const chains = [gnosis, gnosisChiado]
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
invariant(projectId, 'Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      <Layout wagmiConfig={wagmiConfig} chains={chains}>
        <RouteProtect>
          <Component {...pageProps} />
        </RouteProtect>
      </Layout>
    </WagmiConfig>
  )
}
