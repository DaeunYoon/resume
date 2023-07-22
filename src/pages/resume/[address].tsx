import { useRouter } from 'next/router'
import ResumeDetails from '~/components/ResumeDetails'
import { useResumesStore } from '~/stores/resume'

import { useEffect, useMemo, useState } from 'react'
import { Button } from 'antd'
import { ethers } from 'ethers'

import BackButton from '~/components/BackButton'

export default function Page() {
  const router = useRouter()
  const { address } = router.query

  const { fetchResumes } = useResumesStore()
  const { resumes, isLoading } = useResumesStore((state) => state.state)

  const [signer, setSigner] = useState(null)

  const selectedResume = useMemo(() => {
    return resumes.find((resume) => resume.walletAddress === address)
  }, [resumes, address])

  const connectWallet = async function () {
    // Check if the ethereum object exists on the window object
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.enable()
        // Instantiate a new ethers provider with Metamask

        const provider = new ethers.providers.Web3Provider(window.ethereum)

        // Get the signer from the ethers provider
        setSigner(provider.getSigner())
      } catch (error) {
        console.error('User rejected request', error)
      }
    } else {
      console.error('Metamask not found')
    }
  }

  useEffect(() => {
    if (resumes.length === 0) {
      fetchResumes()
    }
    connectWallet()
  }, [])
  return (
    <>
      <BackButton />
      {isLoading ? (
        <div>Loading...</div>
      ) : selectedResume ? (
        <ResumeDetails resume={selectedResume} signer={signer} />
      ) : (
        <div>
          Resume not found with wallet address. Please check the wallet address
          again.
        </div>
      )}
    </>
  )
}
