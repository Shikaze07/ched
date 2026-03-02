// lib/data-cache.ts
// Simple module-level cache for CMO and Program data.
// Fetches happen at most once per browser session/tab lifetime.

export interface CachedCmo {
    id: string;
    number: string;
    title: string;
    programId?: string | null;
}

export interface CachedProgram {
    id: string;
    code: string;
    name: string;
}

// Store promises so concurrent callers share the same in-flight request
let cmoPromise: Promise<CachedCmo[]> | null = null;
let programPromise: Promise<CachedProgram[]> | null = null;

export function getCMOs(): Promise<CachedCmo[]> {
    if (!cmoPromise) {
        cmoPromise = fetch("/api/cmo")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch CMOs");
                return res.json() as Promise<CachedCmo[]>;
            })
            .catch((err) => {
                // Clear so next call retries
                cmoPromise = null;
                throw err;
            });
    }
    return cmoPromise;
}

export function getPrograms(): Promise<CachedProgram[]> {
    if (!programPromise) {
        programPromise = fetch("/api/programs")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch programs");
                return res.json() as Promise<CachedProgram[]>;
            })
            .catch((err) => {
                programPromise = null;
                throw err;
            });
    }
    return programPromise;
}

/** Call this if you need to force a refresh (e.g. after adding/editing in admin) */
export function invalidateCache() {
    cmoPromise = null;
    programPromise = null;
}
