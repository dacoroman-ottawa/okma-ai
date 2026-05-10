'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
    id: string
    name: string
    email: string
    role: 'admin' | 'teacher' | 'student'
    isAdmin: boolean
}

interface UserContextType {
    user: User | null
    isAdmin: boolean
    isLoading: boolean
    logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser)
                setUser({
                    id: parsed.id || '',
                    name: parsed.name || 'User',
                    email: parsed.email || '',
                    role: parsed.role || 'student',
                    isAdmin: parsed.isAdmin ?? false,
                })
            } catch {
                setUser(null)
            }
        }
        setIsLoading(false)
    }, [])

    const logout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        setUser(null)
    }

    const isAdmin = user?.isAdmin ?? false

    return (
        <UserContext.Provider value={{ user, isAdmin, isLoading, logout }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
