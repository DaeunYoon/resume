import invariant from 'tiny-invariant'
import type {
  Attestation,
  AttestationResult,
  EASChainConfig,
  EnsNamesResult,
  MyAttestationResult,
  PoapWithEvent,
} from './types'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ethers } from 'ethers'
import axios from 'axios'

export const shortAddress = (addr) =>
  addr.length > 10 && addr.startsWith('0x')
    ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
    : addr

/** Attestation */
export const CUSTOM_SCHEMAS = {
  SKILL_SCHEMA:
    '0x891ccb5f076e90e1ca018fc57e993cd3f4246b25323577af7b449c009b6318f6',
  CONFIRM_SCHEMA:
    '0xb96446c85ce538c1641a967f23ea11bbb4a390ef745fc5a9905689dbd48bac86',
}

dayjs.extend(duration)
dayjs.extend(relativeTime)

function getChainId() {
  return Number(process.env.NEXT_PUBLIC_CHAIN_ID)
}

export const CHAINID = getChainId()
invariant(CHAINID, 'No chain ID env found')

export const EAS_CHAIN_CONFIGS: EASChainConfig[] = [
  {
    chainId: 11155111,
    chainName: 'sepolia',
    subdomain: 'sepolia.',
    version: '0.26',
    contractAddress: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
    schemaRegistryAddress: '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0',
    etherscanURL: 'https://sepolia.etherscan.io',
    contractStartBlock: 2958570,
    rpcProvider: `https://sepolia.infura.io/v3/`,
  },
]

export const activeChainConfig = EAS_CHAIN_CONFIGS.find(
  (config) => config.chainId === CHAINID
)

export const baseURL = `https://${activeChainConfig!.subdomain}easscan.org`

invariant(activeChainConfig, 'No chain config found for chain ID')
export const EASContractAddress = activeChainConfig.contractAddress

export const EASVersion = activeChainConfig.version

export const EAS_CONFIG = {
  address: EASContractAddress,
  version: EASVersion,
  chainId: CHAINID,
}

export const timeFormatString = 'MM/DD/YYYY h:mm:ss a'
export async function getAddressForENS(name: string) {
  const provider = new ethers.providers.StaticJsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
    'mainnet'
  )

  return await provider.resolveName(name)
}

export async function getAttestation(uid: string): Promise<Attestation | null> {
  const response = await axios.post<AttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Query($where: AttestationWhereUniqueInput!) {\n  attestation(where: $where) {\n    id\n    attester\n    recipient\n    revocationTime\n    expirationTime\n    time\n    txid\n    data\n  }\n}',
      variables: {
        where: {
          id: uid,
        },
      },
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )
  return response.data.data.attestation
}

export async function getAttestationsForAddress(address: string) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}',

      variables: {
        where: {
          schemaId: {
            equals: CUSTOM_SCHEMAS.SKILL_SCHEMA,
          },
          recipient: {
            equals: address,
          },
        },
        orderBy: [
          {
            time: 'desc',
          },
        ],
      },
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )
  return response.data.data.attestations
}

export async function getConfirmationAttestationsForUIDs(refUids: string[]) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  refUID\n  }\n}',

      variables: {
        where: {
          schemaId: {
            equals: CUSTOM_SCHEMAS.CONFIRM_SCHEMA,
          },
          refUID: {
            in: refUids,
          },
        },
        orderBy: [
          {
            time: 'desc',
          },
        ],
      },
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )
  return response.data.data.attestations
}

/** POAP SUBGRAPH */
export async function getRecentlyMintedPoapForId(to: string) {
  const response = await axios.post<{ validateEntities: PoapWithEvent[] }>(
    'https://api.thegraph.com/subgraphs/name/sharathkrml/poap-gnosis',
    {
      query: `query Poap {\n  validateEntities(\n    first: 15\n    where: { to: "${to}"}\n    orderBy: id\n    orderDirection: desc\n  ) {\n    id\n    eventId\n  }\n}`,
      variables: {},
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )

  const poaps = [] as PoapWithEvent[]
  for (const validateEntity of response.data.data.validateEntities) {
    const eventResponse = await axios.get(
      `https://api.poap.tech/metadata/${validateEntity.eventId}/${validateEntity.id}`
    )

    poaps.push({
      ...validateEntity,
      imageUri: eventResponse.data.image_url,
    })
  }

  return poaps
}
