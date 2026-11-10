import { type ReactNode } from 'react';
import { Link } from '../router';

const exploreLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/movies', label: 'Explorar películas' },
  { to: '/social', label: 'Social' },
  { to: '/about', label: 'Sobre Movienatic' },
];

const helpLinks = [
  { to: '/help', label: 'Centro de ayuda' },
  { to: '/help', label: 'Preguntas frecuentes' },
  { to: '/contact', label: 'Contacto' },
  { to: '/data', label: 'Eliminar mi cuenta' },
];

const legalLinks = [
  { to: '/privacy', label: 'Política de privacidad' },
  { to: '/terms', label: 'Términos y condiciones' },
  { to: '/cookies', label: 'Política de cookies' },
  { to: '/data', label: 'Protección de datos' },
  { to: '/legal', label: 'Aviso legal' },
];

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-[#64748b] hover:text-[#8b5cf6] transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="w-9 h-9 rounded-full border border-[#e2e8f0] bg-white flex items-center justify-center text-[#64748b] hover:text-[#8b5cf6] hover:border-[#c4b5fd] transition-colors"
    >
      {children}
    </a>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-[#e2e8f0] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Marca */}
          <div>
            <Link to="/" className="inline-flex items-center gap-1">
              <span className="text-2xl font-bold text-[#8b5cf6] tracking-tighter">
                M
              </span>
              <span className="font-bold text-xl text-[#0f172a] tracking-tight">
                ovienatic
              </span>
            </Link>
            <p className="mt-4 text-sm text-[#64748b] leading-relaxed max-w-xs">
              Tu comunidad para descubrir, valorar y guardar las películas que
              más te gustan. Comparte listas y sigue a otros cinéfilos.
            </p>
            <p className="mt-3 text-xs text-[#94a3b8] leading-relaxed max-w-xs">
              Movienatic no aloja películas: solo muestra información,
              opiniones y listas creadas por la comunidad.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <SocialLink href="https://x.com" label="Movienatic en X">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
                </svg>
              </SocialLink>
              <SocialLink href="https://instagram.com" label="Movienatic en Instagram">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </SocialLink>
              <SocialLink href="https://youtube.com" label="Movienatic en YouTube">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
                </svg>
              </SocialLink>
            </div>
          </div>

          {/* Explorar */}
          <div>
            <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">
              Explorar
            </h3>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">
              Ayuda
            </h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#94a3b8]">
            © {year} Movienatic. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#94a3b8]">
            Hecho con ♥ para los amantes del cine 🎬
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
