// User types
export interface User {
    id: string;
    tenantId: string;
    email: string;
    role: UserRole;
    profile: UserProfile;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    VIEWER = 'VIEWER',
}

export interface UserProfile {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
}

// Tenant types
export interface Tenant {
    id: string;
    name: string;
    planId: string;
    status: TenantStatus;
    settings: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export enum TenantStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    TRIAL = 'TRIAL',
}

// Project types
export interface Project {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    settings: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantName: string;
}

export interface JwtPayload {
    sub: string;
    email: string;
    tenantId: string;
    role: UserRole;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    errors?: ApiError[];
    message?: string;
}

export interface ApiError {
    field?: string;
    message: string;
    code?: string;
}

// Pagination types
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
