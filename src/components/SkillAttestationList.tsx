import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import Link from 'next/link'

import {
  baseURL,
  CUSTOM_SCHEMAS,
  EASContractAddress,
  getAttestationsForAddress,
  getConfirmationAttestationsForUIDs,
} from '~/utils'

import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'

import { ResolvedAttestation, Attestation } from '~/types'
import invariant from 'tiny-invariant'
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'

import axios from 'axios'
import { Input, Select, Button, Popover } from 'antd'
import { RocketOutlined, StarOutlined, SmileFilled } from '@ant-design/icons'

const eas = new EAS(EASContractAddress)

export default function SkillAttestationList({
  attestAddress,
  signer,
  isStale = false,
  setIsStale,
  classes,
}: {
  attestAddress: string
  signer: ethers.Signer
  isStale?: boolean
  setIsStale?: Dispatch<SetStateAction<boolean>>
  classes?: string
}) {
  const { address } = useAccount()

  const [attestations, setAttestations] = useState<ResolvedAttestation[]>([])
  const [loading, setLoading] = useState(false)
  const [attesting, setAttesting] = useState(false)
  const [isStaleLocal, setIsStaleLocal] = useState(false)

  async function getAtts() {
    setAttestations([])
    setLoading(true)
    const tmpAttestations = await getAttestationsForAddress(attestAddress)
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

    setAttestations(resolvedAttestations)
    setLoading(false)
  }

  useEffect(() => {
    getAtts()
  }, [attestAddress])

  useEffect(() => {
    if (isStale || isStaleLocal) {
      getAtts()
      if (setIsStale) {
        setIsStale(false)
      }
      setIsStaleLocal(false)
    }
  }, [isStale, isStaleLocal])

  const content = (confirmations: Attestation[]) => (
    <div>
      <div className="font-bold mb-2">Attested by</div>
      {confirmations.map((conf, idx) => {
        return (
          <div key={idx}>
            <Link href={`/resume/${conf.attester}`}>{conf.attester}</Link>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className={`max-w-[600px] border rounded p-2 ${classes}`}>
      <h3 className="font-bold mb-3">Attestations</h3>
      {loading && <div>Looking for data...⌐◨-◨</div>}
      {!loading && (
        <div className="flex flex-col divide-y-2 divide-dashed">
          {attestations.length ? (
            attestations.map((att, idx) => {
              return (
                <div className="w-full" key={idx}>
                  <div>
                    <span className="font-semibold">
                      {att.decodedData.skill}
                    </span>{' '}
                    skill is{' '}
                    <span className="font-semibold">
                      {att.decodedData.score}
                    </span>{' '}
                    out of 10
                  </div>
                  <div className="text-gray-400 text-sm flex gap-2 items-center">
                    <Popover content={content(att.confirmations)}>
                      <div>Attested by {att.confirmations.length} people</div>
                    </Popover>
                    {attestAddress !== address &&
                    !att.confirmations.some(
                      (confirmation) => confirmation.attester === address
                    ) ? (
                      <Button
                        className="flex items-center mb-1"
                        loading={attesting}
                        onClick={async () => {
                          setAttesting(true)
                          try {
                            const schemaEncoder = new SchemaEncoder(
                              'bool confirm'
                            )
                            const encoded = schemaEncoder.encodeData([
                              {
                                name: 'confirm',
                                type: 'bool',
                                value: true,
                              },
                            ])

                            invariant(signer, 'signer must be defined')
                            eas.connect(signer)

                            const tx = await eas.attest({
                              data: {
                                recipient: address,
                                data: encoded,
                                refUID: att.id,
                                revocable: true,
                                expirationTime: 0,
                              },
                              schema: CUSTOM_SCHEMAS.CONFIRM_SCHEMA,
                            })

                            const uid = await tx.wait()
                            setIsStaleLocal(true)
                          } catch (e) {
                            console.error(e)
                          } finally {
                            setAttesting(false)
                          }
                        }}
                      >
                        I attest this skill <SmileFilled />
                      </Button>
                    ) : (
                      <Button disabled className="flex items-center mb-1">
                        I attested this skill <SmileFilled />
                      </Button>
                    )}
                  </div>
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
