import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Página não encontrada',
  description: 'A página que você tentou acessar não existe ou foi movida.',
  path: '/404/',
});

export default function NotFound() {
  return (
    <section className="section container-narrow" style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem' }}>404</h1>
      <h2 style={{ marginTop: 0 }}>Essa página tirou férias</h2>
      <p>Pode ser um link antigo ou uma página removida.</p>
      <p>Volte para o início e continue de lá.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link href="/" className="btn btn-primary">Voltar para o início →</Link>
      </p>
    </section>
  );
}
