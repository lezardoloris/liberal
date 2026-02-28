import Link from 'next/link';
import { Users } from 'lucide-react';

export function SignupCTA() {
  return (
    <div className="bg-drapeau-rouge/5 border-drapeau-rouge/20 rounded-2xl border p-4 text-center">
      <Users className="text-drapeau-rouge mx-auto mb-2 h-8 w-8" />
      <h2 className="text-text-primary text-sm font-semibold">Rejoignez la communauté</h2>
      <p className="text-text-secondary mt-1 text-xs">
        Signalez, votez et validez les gaspillages publics avec d&apos;autres citoyens.
      </p>
      <Link
        href="/register"
        className="bg-drapeau-rouge mt-3 inline-block rounded-lg px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
      >
        S&apos;inscrire
      </Link>
    </div>
  );
}
