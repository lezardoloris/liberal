export default function Footer() {
  return (
    <footer className="hidden md:block border-t border-border-default bg-surface-primary py-8 px-6">
      <div className="mx-auto max-w-5xl flex flex-col gap-4 text-text-muted text-sm">
        <p>
          NICOLAS PAYE &mdash; La communaute open source pour tronconner les depenses publiques. Licence{' '}
          <a
            href="https://opensource.org/licenses/MIT"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-text-secondary"
          >
            MIT
          </a>
          .
        </p>
        <p>
          Donnees officielles issues de sources publiques. Les montants et
          estimations sont fournis a titre indicatif et ne constituent pas un
          avis juridique ou financier.
        </p>
        <p>
          <a href="/methodology" className="underline hover:text-text-secondary">
            Methodologie et sources
          </a>
        </p>
      </div>
    </footer>
  );
}
