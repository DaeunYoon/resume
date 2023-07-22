import { produce } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Client } from '@xmtp/xmtp-js'
import { ethers } from 'ethers'

interface ResumesStore {
  setClient: () => Promise<void>
  state: {
    isConnected: boolean
    isOnNetwork: boolean
    xmtpClient: null | Client
  }
}

const state = {
  isConnected: false,
  isOnNetwork: false,
  xmtpClient: null,
}

export const useXmtpClient = create<ResumesStore>()(
  immer((set) => ({
    setClient: async (address) => {
      let signer

      if (typeof window.ethereum !== 'undefined') {
        try {
          // Request access to the user's Ethereum accounts
          await window.ethereum.enable()

          // Instantiate a new ethers provider with Metamask
          const provider = new ethers.providers.Web3Provider(window.ethereum)

          // Get the signer from the ethers provider
          signer = provider.getSigner()

          // Update the isConnected data property based on whether we have a signer
          set(
            produce((draft) => {
              draft.state.isConnected = true
            })
          )
        } catch (error) {
          console.error('User rejected request', error)
        }
      } else {
        console.error('Metamask not found')
      }

      let xmtp
      if (signer) {
        xmtp = await Client.create(signer, { env: 'production' })
      }

      if (xmtp) {
        set(
          produce((draft) => {
            draft.state.isOnNetwork = !!xmtp.address
            draft.state.xmtpClient = xmtp
          })
        )
      }
    },
    state,
  }))
)
