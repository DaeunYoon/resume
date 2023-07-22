import { useState, useEffect } from 'react'
import {
  getAttestationsForAddress,
  getConfirmationAttestationsForUIDs,
} from '~/utils'
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'

import { ResolvedAttestation } from '~/types'
import invariant from 'tiny-invariant'
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'

import axios from 'axios'
import { Input, Select, Button } from 'antd'
import { RocketOutlined, StarOutlined } from '@ant-design/icons'

export default function SkillAttestationList() {
  const { address } = useAccount()

  const [attestations, setAttestations] = useState<ResolvedAttestation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function getAtts() {
      setAttestations([])
      setLoading(true)
      if (!address) return
      const tmpAttestations = await getAttestationsForAddress(address)
      console.log(tmpAttestations)
      const schemaEncoder = new SchemaEncoder('string skill,uint8 score')

      const addresses = new Set<string>()

      tmpAttestations.forEach((att) => {
        addresses.add(att.recipient)
      })

      let resolvedAttestations: ResolvedAttestation[] = []

      const uids = tmpAttestations.map((att) => att.id)

      const confirmations = await getConfirmationAttestationsForUIDs(uids)

      tmpAttestations.forEach((att) => {
        const relatedConfirmations = confirmations.filter((conf) => {
          return conf.refUID === att.id
        })

        resolvedAttestations.push({
          ...att,
          decodedData: schemaEncoder
            .decodeData(att.data)
            .reduce((acc, decoded) => {
              acc[decoded.name] = decoded.value.value
              return acc
            }, {} as Record<string, any>),
          confirmations: relatedConfirmations,
        })
      })

      console.log(resolvedAttestations)

      setAttestations(resolvedAttestations)
      setLoading(false)
    }
    getAtts()
  }, [address])

  return (
    <div className="max-w-[600px] border rounded p-2">
      <h3 className="font-bold mb-3">Attestations</h3>
      {loading && <div>Loading...</div>}
      {!loading && (
        <div className="flex flex-col divide-y-2 divide-dashed">
          {attestations.length ? (
            attestations.map((att, idx) => {
              return (
                <div className="w-full" key={idx}>
                  <span className="font-semibold">{att.decodedData.skill}</span>{' '}
                  skill is{' '}
                  <span className="font-semibold">{att.decodedData.score}</span>{' '}
                  out of 10
                </div>
              )
            })
          ) : (
            <div>No attestations created yet</div>
          )}
        </div>
      )}
    </div>
  )
}
