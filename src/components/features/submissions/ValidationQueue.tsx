'use client';

import { useState, useEffect } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { ValidationCard } from '@/components/features/submissions/ValidationCard';

interface PendingSubmission {
  id: string;
  title: string;
  slug: string;
  description: string;
  amount: string;
  sourceUrl: string;
  authorDisplay: string;
  approveWeight: number;
  rejectWeight: number;
  createdAt: string;
}

export function ValidationQueue() {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPending() {
      try {
        const res = await fetch('/api/submissions/pending');
        const json = await res.json();
        if (json.error) {
          setError(json.error.message);
        } else {
          setSubmissions(json.data ?? []);
        }
      } catch {
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    fetchPending();
  }, []);

  async function handleValidate(id: string, verdict: 'approve' | 'reject', reason?: string) {
    const res = await fetch(`/api/submissions/${id}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verdict, reason }),
    });
    const json = await res.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-text-secondary h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-primary border-border-default rounded-2xl border p-6 text-center">
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-surface-primary border-border-default rounded-2xl border p-8 text-center">
        <Shield className="text-text-secondary mx-auto mb-3 h-10 w-10" />
        <p className="text-text-primary text-sm font-medium">Aucun signalement en attente</p>
        <p className="text-text-secondary mt-1 text-xs">
          Tous les signalements ont été validés. Revenez plus tard !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-xs">
        {submissions.length} signalement{submissions.length > 1 ? 's' : ''} en attente de
        validation
      </p>
      {submissions.map((sub) => (
        <ValidationCard key={sub.id} submission={sub} onValidate={handleValidate} />
      ))}
    </div>
  );
}
