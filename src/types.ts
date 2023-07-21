export interface Resume = {
    walletAddress: string
    name: string
    position: string
    location: string
    educations: Education[]
    experience: Experience[]
}

export interface Education = {
    name: string
    degree: string
    location: string
    start: number
    end: number
}

export interface Experience = {
    name: string
    position: string
    company: string
    start: number
    end: number
}