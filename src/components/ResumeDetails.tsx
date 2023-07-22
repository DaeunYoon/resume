import { useState, useEffect } from 'react'

import type { Resume } from '~/types'
import { Button, Divider } from 'antd'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'

import { useAccount } from 'wagmi'
import SkillAttestationList from '~/components/SkillAttestationList'

export default function ResumeDetails({
  resume,
  signer,
  showAttestationList = true,
}: {
  resume: Resume
  signer: ethers.Signer
  showAttestationList?: boolean
}) {
  const router = useRouter()
  const [isMyResume, setIsMyResume] = useState(false)
  const { address } = useAccount()

  useEffect(() => {
    if (address === resume.walletAddress) {
      setIsMyResume(true)
    }
  }, [address])

  return (
    <div className="w-full">
      <div className="font-bold text-center text-lg mb-2">{resume.name}</div>
      {!isMyResume && address && (
        <div className="w-full flex justify-end">
          <Button
            className="PrimaryButton"
            onClick={() => router.push(`/message/${resume.walletAddress}`)}
          >
            Send message
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <div className="w-[calc(50%-0.25rem)]">
          <span className="font-bold">Position: </span>
          {resume.position}
        </div>
        <div className="w-[calc(50%-0.25rem)]">
          <span className="font-bold">Location: </span>
          {resume.location}
        </div>
      </div>
      <div>
        <span className="font-bold">Education</span>
        {resume.educations?.map((education, index) => (
          <div key={index} className="flex gap-1">
            <p>•</p>
            <div className="w-[calc(100%-10px)]">
              <div className="flex gap-2">
                <div className="w-[calc(50%-0.25rem)]">
                  <span className="font-bold">Institute: </span>
                  {education.name}
                </div>
                <div className="w-[calc(50%-0.25rem)]">
                  <span className="font-bold">Degree: </span>
                  {education.degree}
                </div>
              </div>
              <div>
                {education.start} ~ {education.end}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <span className="font-bold">Experience</span>
        {resume.experiences?.map((experience, index) => (
          <div key={index} className="flex gap-1">
            <p>•</p>
            <div className="w-[calc(100%-10px)]">
              <div className="flex gap-2">
                <div className="w-[calc(50%-0.25rem)]">
                  <span className="font-bold">Position: </span>
                  {experience.position}
                </div>
                <div className="w-[calc(50%-0.25rem)]">
                  <span className="font-bold">Company: </span>
                  {experience.company}
                </div>
              </div>
              <div>
                {experience.start} ~ {experience.end}
              </div>
            </div>
          </div>
        ))}
      </div>
      {showAttestationList && (
        <>
          <Divider />
          <SkillAttestationList
            attestAddress={resume.walletAddress}
            signer={signer}
          />
        </>
      )}
    </div>
  )
}
