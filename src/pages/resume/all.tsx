import { useEffect } from 'react'
import { useResumesStore } from '~/stores/resume'

export default function Home() {
  const { fetchResumes } = useResumesStore()
  const { resumes, isLoading } = useResumesStore((state) => state.state)

  useEffect(() => {
    if (resumes.length === 0) {
      fetchResumes()
    }
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
      {resumes.length ? (
        resumes.map((resume, index) => (
          <div key={index}>
            <div>{resume.walletAddress}</div>
            <div>{resume.name}</div>
            <div>{resume.position}</div>
          </div>
        ))
      ) : (
        <div>No Resumes are uploaded yet!</div>
      )}
    </>
  )
}
