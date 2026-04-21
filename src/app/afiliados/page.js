import Link from 'next/link';
import { BreadcrumbSchema } from '@/components/Schema';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = buildMetadata({
  title: 'Política de Afiliados',
  description:
    'Como o Melhor Lava e Seca ganha dinheiro e por que isso não interfere na opinião sobre os produtos.',
  path: '/afiliados/',
});

export default function AfiliadosPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Início', url: site.url },
          { name: 'Política de Afiliados', url: `${site.url}/afiliados/` },
        ]}
      />

      <section className="section container-narrow">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Início</Link></li>
            <li>Política de Afiliados</li>
          </ol>
        </nav>

        <h1>Política de Afiliados</h1>

        <p>Transparência antes de tudo.</p>
        <p>Este site ganha dinheiro pelo <strong>Programa de Associados da Amazon Brasil</strong>.</p>
        <p>Vamos te contar exatamente como funciona.</p>

        <h2>O que é programa de afiliados?</h2>
        <p>Um modelo em que divulgamos produtos da Amazon.</p>
        <p>Se você clica num link nosso e compra, a Amazon nos paga uma comissão.</p>
        <p>Não precisa ser o produto que você viu aqui — vale qualquer coisa que você comprar.</p>
        <p><strong>O preço pra você não muda.</strong></p>
        <p>A comissão sai da margem da Amazon, não do seu bolso.</p>

        <h2>Por que isso não corrompe os reviews?</h2>
        <p>Porque a comissão é a mesma para todos os modelos.</p>
        <p>Não há incentivo financeiro para recomendar A em vez de B.</p>
        <p>A gente ganha igual em qualquer caso.</p>
        <p>O que importa é você voltar ao site na próxima compra.</p>
        <p>E você só volta se sentir que a gente te ajudou de verdade.</p>

        <h2>Como identificar os links de afiliado</h2>
        <p>Todo botão laranja "Ver preço na Amazon" é link de afiliado.</p>
        <p>Qualquer link textual para <code>amazon.com.br</code> também é.</p>
        <p>Todos carregam nosso código: <code>tag={site.amazonPartnerTag}</code>.</p>

        <h2>Disclaimer obrigatório Amazon</h2>
        <p>Como exige o programa de Associados:</p>
        <blockquote>
          <p>
            Como associado da Amazon, recebemos por compras qualificadas
            feitas através deste site.
          </p>
        </blockquote>

        <h2>O que a gente não aceita</h2>
        <ul>
          <li><strong>Review patrocinado</strong> por fabricante</li>
          <li><strong>Produto de cortesia</strong> em troca de review</li>
          <li><strong>Banner de marca</strong> fora de produtos que recomendamos</li>
          <li><strong>Conteúdo enxertado por agência</strong></li>
        </ul>

        <h2>Reporte transparente</h2>
        <p>A comissão média da Amazon para lava e seca é de ~2%.</p>
        <p>Para Samsung e LG, isso dá entre R$ 30 e R$ 90 por venda.</p>
        <p>É o suficiente para pagar servidor, testes e a equipe editorial.</p>
        <p>Nada milionário. Dinheiro de sobrevivência.</p>

        <h2>Dúvidas?</h2>
        <p>Se algo aqui não ficou claro, escreve:</p>
        <p><a href={`mailto:${site.email}`}>{site.email}</a></p>
        <p>Respondemos pessoalmente.</p>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Voltar para a página inicial →</Link>
        </p>
      </section>
    </>
  );
}
