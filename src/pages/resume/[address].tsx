import { useRouter } from 'next/router'
import ResumeDetails from '~/components/ResumeDetails'
import { useResumesStore } from '~/stores/resume'

import { useEffect, useMemo } from 'react'
import { Button } from 'antd'

import BackButton from '~/components/BackButton'

export default function Page() {
  const router = useRouter()
  const { address } = router.query

  const { fetchResumes } = useResumesStore()
  const { resumes, isLoading } = useResumesStore((state) => state.state)

  const selectedResume = useMemo(() => {
    return resumes.find((resume) => resume.walletAddress === address)
  }, [resumes, address])

  useEffect(() => {
    if (resumes.length === 0) {
      fetchResumes()
    }
  }, [])
  return (
    <>
      <BackButton />
      {isLoading && <div>Loading...</div>}
      {selectedResume && <ResumeDetails resume={selectedResume} />}
    </>
  )
}
