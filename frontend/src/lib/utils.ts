import { API_BASE_URL } from "./config"

export { API_BASE_URL }

export function getAuthToken(): string {
    const token = localStorage.getItem("accessToken")
    if (!token) {
        throw new Error("Not authenticated")
    }
    return token
}

export function getAuthHeaders(): { Authorization: string; "Content-Type": string } {
    return {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json"
    }
}

export function toCamel(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map((v) => toCamel(v))
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [key.replace(/(_\w)/g, (k) => k[1].toUpperCase())]: toCamel(obj[key]),
            }),
            {}
        )
    }
    return obj
}

export function toSnake(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map((v) => toSnake(v))
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [key.replace(/([A-Z])/g, (k) => `_${k.toLowerCase()}`)]: toSnake(obj[key]),
            }),
            {}
        )
    }
    return obj
}
