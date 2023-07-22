import { useState } from 'react'

import { baseURL, CUSTOM_SCHEMAS, EASContractAddress } from '~/utils'
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import invariant from 'tiny-invariant'
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'

import axios from 'axios'
import { Input, Select, Button } from 'antd'
import { RocketOutlined, StarOutlined } from '@ant-design/icons'
import SkillAttestationList from '~/components/SkillAttestationList'

const eas = new EAS(EASContractAddress)

export default function CreateSkillAttestation({
  signer,
}: {
  signer: ethers.Signer
}) {
  const { address } = useAccount()

  const [skill, setSkill] = useState('')
  const [score, setScore] = useState<undefined | number>(undefined)
  const [attesting, setAttesting] = useState(false)
  const [isStale, setIsStale] = useState(false)

  const options = Array.from({ length: 10 }).map((_, i) => ({
    label: i + 1,
    value: i + 1,
  }))

  return (
    <div className="max-w-[600px] space-y-2">
      <h3>I attest my skill of </h3>
      <div className="flex gap-2">
        <Input
          placeholder="Skill"
          value={skill}
          prefix={<RocketOutlined />}
          onChange={(e) => setSkill(e.target.value)}
        />
        <Select
          suffixIcon={<StarOutlined />}
          value={score}
          style={{ width: 120 }}
          onChange={(value) => setScore(value)}
          placeholder="Score"
          options={options}
        />
        <Button
          style={{ width: 200 }}
          loading={attesting}
          onClick={async () => {
            setAttesting(true)
            try {
              const schemaEncoder = new SchemaEncoder(
                'string skill,uint8 score'
              )
              const encoded = schemaEncoder.encodeData([
                { name: 'skill', type: 'string', value: skill },
                { name: 'score', type: 'uint8', value: score },
              ])

              invariant(signer, 'signer must be defined')
              eas.connect(signer)

              const tx = await eas.attest({
                data: {
                  recipient: address,
                  data: encoded,
                  refUID: ethers.constants.HashZero,
                  revocable: true,
                  expirationTime: 0,
                },
                schema: CUSTOM_SCHEMAS.SKILL_SCHEMA,
              })

              const uid = await tx.wait()
              setIsStale(true)
            } catch (e) {
              console.error(e)
            } finally {
              setAttesting(false)
            }
          }}
        >
          Attest
        </Button>
      </div>
      <SkillAttestationList
        attestAddress={address}
        signer={signer}
        isStale={isStale}
        setIsStale={setIsStale}
      />
    </div>
  )
}
