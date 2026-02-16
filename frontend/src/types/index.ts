export type InstrumentType = "piano" | "guitar" | "violin" | "drums" | "voice" | "cello" | "flute" | "saxophone" | "clarinet" | "trumpet";

export interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    biography: string;
    qualifications: string;
    hourlyRate: number;
    instruments: string[]; // Instrument IDs
    availability: AvailabilitySlot[];
    status: "active" | "inactive";
    createdAt: string;
}

export interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    skillLevels: Record<string, string>; // instrumentId -> skillLevel
    availability: AvailabilitySlot[];
    status: "active" | "inactive";
    createdAt: string;
}

export interface AvailabilitySlot {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    startTime: string; // HH:mm
    endTime: string; // HH:mm
}

export interface Instrument {
    id: string;
    name: string;
}

export interface Enrollment {
    id: string;
    studentId: string;
    teacherId: string;
    instrumentId: string;
    startDate: string;
    status: "active" | "completed" | "dropped";
}

export interface Class {
    id: string;
    teacherId: string;
    studentIds: string[];
    instrumentId: string;
    weekday: string;
    startTime: string;
    duration: number; // in minutes
    type: "private" | "group";
    status: "scheduled" | "completed" | "cancelled";
}

export interface Product {
    id: string;
    type: "instrument" | "book" | "accessory" | "musical_score" | "gift_card";
    name: string;
    model?: string;
    serialNumber?: string;
    supplierId: string;
    cost: number;
    sellingPrice: number;
    rentalPrice?: number;
    stockQuantity: number;
    reorderLevel: number;
}

export interface Rental {
    id: string;
    productId: string;
    customerId: string;
    rentalPeriod: "weekly" | "monthly";
    startDate: string;
    dueDate: string;
    deposit: number;
    lateFee: number;
    status: "active" | "returned" | "overdue";
}

export interface Sale {
    id: string;
    productId: string;
    customerId: string;
    date: string;
    quantity: number;
    amount: number;
    paymentMethod: string;
}

export interface CreditTransaction {
    id: string;
    studentId: string;
    enrollmentId: string;
    date: string;
    credits: number;
    amount: number;
    type: "purchase" | "deduction" | "adjustment";
}

export interface AppUser {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
}
