import Link from 'next/link';
import { BreadcrumbSchema } from '@/components/Schema';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = buildMetadata({
  title: 'Sobre o Melhor Lava e Seca',
  description:
    'Conheça quem está por trás dos reviews do Melhor Lava e Seca: metodologia de teste, relação com fabricantes e como o site se mantém no ar.',
  path: '/sobre/',
});

export default function SobrePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Início', url: site.url },
          { name: 'Sobre', url: `${site.url}/sobre/` },
        ]}
      />

      <section className="section container-narrow">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Início</Link></li>
            <li>Sobre</li>
          </ol>
        </nav>

        <h1>Sobre o Melhor Lava e Seca</h1>

        <p>
          Oi, somos a equipe editorial do <strong>Melhor Lava e Seca</strong>.
          O site nasceu em 2024 depois de uma frustração simples: toda review
          de eletrodoméstico na internet era cópia das descrições do fabricante.
          Faltava alguém escrevendo sobre o dia a dia real de quem usa a máquina
          por meses a fio — e é esse o espaço que a gente tenta ocupar aqui.
        </p>

        <h2>O que nos move a fazer isso</h2>
        <p>
          Escrever sobre lava e seca parece bobo até você perceber algumas coisas.
          É um aparelho que vai ficar na sua casa por 8 a 12 anos. Usa muita
          energia elétrica. Interfere na rotina da família inteira. E custa o
          equivalente a um salário mínimo. Comprar errado dói no bolso por uma
          década. Queremos te ajudar a acertar na primeira tentativa.
        </p>

        <h2>Como testamos os produtos</h2>
        <p>
          Cada máquina que aparece na <Link href="/">página inicial</Link>{' '}
          passou por pelo menos um desses três processos de avaliação.
        </p>
        <ol>
          <li>
            <strong>Teste próprio:</strong> a máquina fica 2 a 4 semanas em casa
            com uso real — 3 a 5 lavagens por semana, carga variada. A gente
            acompanha consumo de energia e água, barulho, qualidade da secagem
            e eventuais falhas. Sem pressa e sem pressão de prazo editorial.
          </li>
          <li>
            <strong>Pesquisa em loja:</strong> visitamos lojas físicas para
            conferir acabamento e painel, e rodamos programas em modo demo.
          </li>
          <li>
            <strong>Entrevistas com donos:</strong> conversamos com pelo menos
            cinco pessoas que têm a máquina há mais de um ano, para entender
            como ela envelhece. Sem isso, não dá pra falar de durabilidade
            com honestidade.
          </li>
        </ol>

        <h2>Como o site se mantém no ar</h2>
        <p>
          Somos <strong>associados Amazon</strong>. Quando você clica em "Ver
          preço na Amazon" e compra qualquer produto, a Amazon nos paga uma
          comissão pequena — você não paga nada a mais. Não somos pagos por
          fabricantes, e também não aceitamos produto de cortesia em troca de
          review favorável. Se a gente aceitasse, toda maquina estaria em
          primeiro lugar. Detalhes completos na{' '}
          <Link href="/afiliados/">política de afiliados</Link>.
        </p>

        <h2>Quem está por trás disso</h2>
        <p>
          O site é mantido por uma pequena equipe de jornalistas e técnicos
          com experiência em eletrodoméstico. Não somos um conglomerado de
          mídia — somos duas pessoas que gostam de pesquisar lava e seca mais
          do que deviam. Se você tem dúvida específica sobre qual máquina
          comprar, manda email para <a href={`mailto:${site.email}`}>{site.email}</a>{' '}
          que eu mesmo respondo.
        </p>

        <h2>Erramos, corrija a gente</h2>
        <p>
          Especificação muda, modelo sai de linha, fabricante atualiza software.
          Se você pegou a gente dando mole em algum detalhe, escreva — a gente
          corrige publicamente e agradece. Preferimos admitir erro do que
          fingir que sabemos tudo. É mais honesto com o leitor.
        </p>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Voltar para a página inicial →</Link>
        </p>
      </section>
    </>
  );
}
