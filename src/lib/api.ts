'use client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ── Types ──────────────────────────────────────────────────────────

export interface PollOption {
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: string;
  userId?: string;
}

export interface FeedResponse {
  polls: Poll[];
  nextCursor?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// ── Error class ────────────────────────────────────────────────────

export class FetchError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
  }
}

// ── Helper: get auth headers ──────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// ── Response handler ──────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'An error occurred';
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      message = response.statusText || message;
    }
    throw new FetchError(message, response.status);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ── HTTP helpers ───────────────────────────────────────────────────

export async function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders = getAuthHeaders();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options?.headers as Record<string, string>),
    },
    ...options,
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const authHeaders = getAuthHeaders();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options?.headers as Record<string, string>),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const authHeaders = getAuthHeaders();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options?.headers as Record<string, string>),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders = getAuthHeaders();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options?.headers as Record<string, string>),
    },
    ...options,
  });
  return handleResponse<T>(response);
}
