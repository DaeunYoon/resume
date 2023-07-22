export interface Resume = {
    walletAddress: string
    name: string
    position: string
    location: string
    educations: Education[]
    experiences: Experience[]
}

export interface Education = {
    name: string
    degree: string
    start: number
    end: number
}

export interface Experience = {
    position: string
    company: string
    start: number
    end: number
}

/** Attestation */
export type EASChainConfig = {
  chainId: number;
  chainName: string;
  version: string;
  contractAddress: string;
  schemaRegistryAddress: string;
  etherscanURL: string;
  /** Must contain a trailing dot (unless mainnet). */
  subdomain: string;
  contractStartBlock: number;
  rpcProvider: string;
};

export interface AttestationResult {
  data: Data;
}

export interface MyAttestationResult {
  data: MyData;
}

export interface EnsNamesResult {
  data: {
    ensNames: { id: string; name: string }[];
  };
}

export interface Data {
  attestation: Attestation | null;
}

export interface MyData {
  attestations: Attestation[];
}

export interface Attestation {
  id: string;
  attester: string;
  recipient: string;
  refUID: string;
  revocationTime: number;
  expirationTime: number;
  time: number;
  txid: string;
  data: string;
}

export type ResolvedAttestation = Attestation & {
  decodedData?: Record<string, any>;
  confirmations?: Attestation[];
};
