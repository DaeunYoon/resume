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