/**
 * Fila de pautas + estruturas de artigo por intencao de busca.
 *
 * A fila vem de scripts/data/cronograma.json, gerado por build-cronograma.py
 * a partir da planilha editorial. Este modulo so le e atualiza o status.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const QUEUE = path.join(ROOT, 'scripts', 'data', 'cronograma.json');

export function loadQueue() {
  return JSON.parse(fs.readFileSync(QUEUE, 'utf8'));
}

export function saveQueue(data) {
  fs.writeFileSync(QUEUE, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/** Proximas N pautas pendentes, ja ordenadas por volume no JSON. */
export function nextPending(data, n = 1) {
  return data.items.filter((i) => i.status === 'pending').slice(0, n);
}

export function markStatus(data, slug, status, extra = {}) {
  const item = data.items.find((i) => i.slug === slug);
  if (!item) return;
  item.status = status;
  Object.assign(item, extra);
}

/**
 * Tokens que precisam de caixa propria quando a keyword vira titulo.
 * A keyword da planilha e toda minuscula ("melhor lava e seca lg"); sem isso
 * o H2 sai com a marca em minuscula ("...lava e seca lg").
 */
const CAPS = {
  lg: 'LG', samsung: 'Samsung', hisense: 'Hisense', philco: 'Philco',
  electrolux: 'Electrolux', brastemp: 'Brastemp', midea: 'Midea',
  tcl: 'TCL', toshiba: 'Toshiba', eos: 'EOS', consul: 'Consul',
  panasonic: 'Panasonic', bespoke: 'Bespoke',
  wd11m: 'WD11M', wd11t: 'WD11T', wd13t: 'WD13T', wd11a: 'WD11A',
  vc2: 'VC2', vc4: 'VC4', pls11c: 'PLS11C', mf200d: 'MF200D',
  bnq10: 'BNQ10', hc2: 'HC2', oe: 'OE',
};

/** Keyword em forma de titulo: 1a letra maiuscula + marcas/modelos com caixa certa. */
export function displayKeyword(keyword) {
  const s = keyword
    .split(/\s+/)
    .map((w) => CAPS[w.toLowerCase()] || w)
    .join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Esqueleto de H2 por intencao. Segue o padrao definido pela consultoria:
 * review de verdade tem testes, pros, contras, comparativo e veredito.
 *
 * `weight` distribui o total de palavras entre as secoes.
 *
 * Onde a keyword entra num H2, SEMPRE na forma "{kw}: complemento". Colar a
 * keyword no meio da frase quebra a gramatica quando ela ja comeca com
 * "melhor" — foi o que gerou "As melhores opções de Melhor lava e seca lg"
 * em todos os rankings publicados ate 22/07/2026.
 */
const OUTLINES = {
  review: [
    { h2: '{kw}: visão geral do modelo', weight: 10, guide: 'Explique o que é o produto, em que categoria se encaixa e qual a proposta principal dele. Contextualize pra quem nunca ouviu falar.' },
    { h2: 'Principais características e especificações', weight: 14, guide: 'Liste recursos e ficha técnica em bullets: capacidade de lavagem e secagem, motor, rotação, programas, eficiência energética, dimensões, voltagem. Seja concreto.' },
    { h2: 'Como avaliamos este modelo', weight: 10, guide: 'Explique a metodologia: quanto tempo de uso, que tipo de carga foi testada, o que foi medido (consumo, ruído, tempo de ciclo, resultado de secagem). Isso dá credibilidade.' },
    { h2: 'Pontos positivos', weight: 12, guide: 'Prós específicos e justificados, não genéricos. Cada ponto explica POR QUE é bom no uso real.' },
    { h2: 'Pontos negativos', weight: 12, guide: 'Contras reais e honestos. Review sem defeito não tem credibilidade. Explique o impacto prático de cada limitação.' },
    { h2: 'Para quem vale a pena', weight: 10, guide: 'Descreva o perfil ideal de usuário: tamanho de família, tipo de moradia, rotina de lavagem, orçamento. E também para quem NÃO vale.' },
    { h2: 'Comparação com alternativas', weight: 12, guide: 'Compare com 2 ou 3 concorrentes diretos, em tabela markdown. Colunas: modelo, capacidade, recurso diferencial, para quem serve.' },
    { h2: 'Preço e custo-benefício', weight: 8, guide: 'Discuta a faixa de preço e se o valor se justifica frente ao que entrega e aos concorrentes. NUNCA cite valores em reais: diga para consultar o preço atualizado.' },
    { h2: 'Veredito final', weight: 8, guide: 'Resposta objetiva e direta: vale a pena ou não, e em que condição. Sem enrolação.' },
    { h2: 'Perguntas frequentes', weight: 4, guide: 'De 4 a 5 perguntas reais que quem pesquisa esse termo faz, cada uma com resposta curta e direta. Use H3 para cada pergunta.' },
  ],
  ranking: [
    { h2: 'Como escolhemos as melhores opções', weight: 10, guide: 'Explique os critérios de avaliação e a metodologia. O que foi priorizado e por quê.' },
    { h2: '{kw}: as melhores opções', weight: 26, guide: 'Apresente APENAS modelos da lista fornecida — de 3 a 7. Se a lista tiver menos que 5, apresente todos e NENHUM a mais (nunca complete com modelo de outra marca). Para cada um use H3 com o nome do modelo, e traga: para quem serve, principais recursos, um ponto forte e um ponto fraco reais.' },
    { h2: 'Comparativo lado a lado', weight: 10, guide: 'Tabela markdown comparando SOMENTE os modelos apresentados na seção anterior (nenhum outro): capacidade de lavagem e secagem, motor, recurso destaque, perfil indicado.' },
    { h2: 'Guia de compra: o que observar antes de decidir', weight: 20, guide: 'Fatores decisivos com H3: capacidade, tipo de motor, eficiência energética, programas que se usa de verdade, espaço e dimensões, assistência técnica. Explique o impacto prático de cada um.' },
    { h2: 'Qual escolher para cada perfil', weight: 12, guide: 'Recomendação por cenário: casal, família grande, apartamento pequeno, orçamento apertado, quem quer tecnologia.' },
    { h2: 'Erros comuns na hora de comprar', weight: 10, guide: 'Armadilhas frequentes e como evitar. Traga situações concretas.' },
    { h2: 'Veredito: qual vale mais a pena', weight: 8, guide: 'Fechamento objetivo indicando as melhores escolhas por categoria.' },
    { h2: 'Perguntas frequentes', weight: 4, guide: 'De 4 a 5 perguntas reais com respostas curtas. H3 para cada pergunta.' },
  ],
  guia: [
    // A forma "{kw}: subtitulo" e gramaticalmente segura com qualquer
    // palavra-chave. Interpolar a keyword no meio da frase quebra ("O que
    // causa lava e seca fazendo barulho"). Só 2 secoes levam a keyword:
    // repetir em todas viraria stuffing.
    { h2: '{kw}: o que causa', weight: 20, kw: true, guide: 'Explique as causas mais comuns, da mais provável para a menos provável. Seja técnico mas acessível.' },
    { h2: 'Como identificar o que está acontecendo', weight: 16, guide: 'Sinais e sintomas que ajudam a diagnosticar, e como testar cada hipótese em casa.' },
    { h2: '{kw}: como resolver passo a passo', weight: 28, kw: true, steps: true, guide: 'Passo a passo numerado e prático, do mais simples ao mais complexo. Use H3 para agrupar por tipo de solução.' },
    { h2: 'Quando chamar a assistência técnica', weight: 12, guide: 'Deixe claro o limite entre o que dá pra resolver sozinho e o que exige técnico, e o risco de insistir.' },
    { h2: 'Como evitar que aconteça de novo', weight: 16, guide: 'Rotina de prevenção e manutenção concreta, com frequência recomendada.' },
    { h2: 'Perguntas frequentes', weight: 8, guide: 'De 4 a 5 perguntas reais com respostas curtas. H3 para cada pergunta.' },
  ],
  // Separado de 'guia' em 04/08/2026. O template de guia e de DEFEITO ("o que
  // causa", "como identificar o que esta acontecendo", "como evitar que
  // aconteca de novo") e estava sendo aplicado a pauta de PROCEDIMENTO ("como
  // instalar", "como calibrar"). Como instalacao nao tem causa nem reincidencia,
  // o modelo preenchia as secoes com enchimento — a queixa de que os tutoriais
  // enrolam e nao ensinam nada vinha daqui.
  tutorial: [
    { h2: '{kw}: o que voce vai precisar', weight: 14, kw: true, guide: 'Lista do que a pessoa precisa ter em maos ANTES de comecar: ferramentas, pecas, espaco, tomada, ponto de agua, quantas pessoas. Em bullets. Sem introducao ao assunto.' },
    { h2: '{kw}: passo a passo', weight: 34, kw: true, steps: true, guide: 'O procedimento completo, do inicio ao fim, na ordem exata de execucao.' },
    { h2: 'Como saber se deu certo', weight: 14, guide: 'Os sinais concretos de que o procedimento funcionou, e o teste que a pessoa faz pra confirmar. Nada de repetir os passos.' },
    { h2: 'Se nao funcionar', weight: 16, guide: 'Os problemas mais comuns depois de executar, cada um com a verificacao correspondente. Conteudo novo, nao os passos invertidos.' },
    { h2: 'Erros que estragam o resultado', weight: 14, guide: 'O que a pessoa faz por conta propria e compromete o resultado, com a consequencia pratica de cada um.' },
    { h2: 'Perguntas frequentes', weight: 8, guide: 'De 4 a 5 perguntas reais com respostas curtas. H3 para cada pergunta. Nenhuma respondida repetindo secao anterior.' },
  ],
  comparativo: [
    { h2: 'Visão geral de cada opção', weight: 20, guide: 'Apresente cada lado da comparação com H3, explicando a proposta e o público de cada um.' },
    { h2: 'Comparativo lado a lado', weight: 16, guide: 'Tabela markdown com os critérios que realmente importam na decisão.' },
    { h2: 'Onde cada uma se sai melhor', weight: 24, guide: 'Analise por critério (limpeza, secagem, ruído, consumo, durabilidade, assistência), dizendo quem ganha em cada e por quê.' },
    { h2: 'Qual escolher para cada perfil', weight: 20, guide: 'Recomendação por cenário de uso concreto.' },
    { h2: 'Veredito', weight: 12, guide: 'Conclusão objetiva sobre qual escolher e em que situação.' },
    { h2: 'Perguntas frequentes', weight: 8, guide: 'De 4 a 5 perguntas reais com respostas curtas. H3 para cada pergunta.' },
  ],
  // Reescrito em 04/08/2026. O template anterior tinha TRES secoes pedindo a
  // mesma coisa por outro nome ("o que e e por que importa", "como funciona na
  // pratica", "o que observar antes de decidir") mais "dicas praticas" e
  // "erros comuns", que se sobrepunham. O modelo obedecia e dizia a mesma
  // coisa cinco vezes — foi a queixa da redatora: "enrola e nao ensina nada".
  // Agora cada secao tem um angulo que as outras nao podem cobrir.
  informativo: [
    { h2: '{kw}: a resposta direta', weight: 12, kw: true, guide: 'Responda a duvida do titulo LOGO no primeiro paragrafo, em uma frase. Depois explique em no maximo dois paragrafos por que a resposta e essa. Nada de introduzir o assunto ou definir termos: quem chegou aqui ja sabe do que se trata.' },
    { h2: 'Por que isso acontece', weight: 20, guide: 'O mecanismo tecnico, causa por causa, da mais comum para a mais rara. Explique o COMO funciona, nao o que fazer — a acao vem na proxima secao e nao pode ser antecipada aqui.' },
    { h2: 'O que fazer, na ordem', weight: 28, steps: true, guide: 'Passo a passo NUMERADO (1., 2., 3., ...), com no minimo 4 passos. Cada passo comeca com verbo no imperativo e diz exatamente o que ajustar: qual programa, qual regulagem, qual limite de carga, o que observar depois. Nada de conselho vago tipo "escolha o programa certo" — diga QUAL programa e em que situacao.' },
    { h2: 'Quando a regra muda', weight: 16, guide: 'Excecoes e casos-limite em que a orientacao anterior NAO vale: tipo de tecido, capacidade da maquina, clima, peca especifica. Conteudo que nao apareceu em nenhuma secao anterior.' },
    { h2: 'O que nao fazer', weight: 16, guide: 'Erros concretos e a consequencia de cada um. Nao repita as recomendacoes ja dadas invertidas: traga o que a pessoa faz por conta propria e piora a situacao.' },
    { h2: 'Perguntas frequentes', weight: 8, guide: 'De 4 a 5 perguntas reais com respostas curtas e diretas. H3 para cada pergunta. Nenhuma pode ser respondida repetindo secao anterior.' },
  ],
};

/**
 * A planilha marca como "guia" tanto pauta de defeito ("erro OE", "nao esta
 * secando") quanto de procedimento ("como instalar", "como calibrar"), mas os
 * dois pedem estruturas opostas: defeito tem causa e reincidencia, instalacao
 * nao tem nem uma nem outra. Aqui a pauta de procedimento e desviada pro
 * template de tutorial.
 */
const SINTOMA = /erro|n[aã]o (seca|liga|centrifuga|enche|funciona)|vazand|barulh|travad|quebr|encolhe|cheiro|mofo|fuma[cç]|desliga sozinha/i;

export function escolherTemplate(pauta) {
  if (pauta.intent === 'guia' && /^como\s/i.test(pauta.keyword) && !SINTOMA.test(pauta.keyword)) {
    return 'tutorial';
  }
  return pauta.intent;
}

/** Monta o outline com a keyword aplicada e o alvo de palavras por secao. */
export function buildOutline(pauta) {
  const base = OUTLINES[escolherTemplate(pauta)] || OUTLINES.informativo;
  const introWords = 160;
  // Fator 0.8: o modelo estoura em ~25% a cota que recebe, entao pedir o
  // tamanho cheio entrega artigo inflado e o portao reprova por enchimento
  // (medido em 04/08/2026: alvo 1500, saida 2049). Pedindo 80% a soma cai
  // perto do alvo real, e texto no tamanho certo foi o que a redatora pediu.
  const bodyWords = Math.max(Math.round((pauta.targetWords - introWords) * 0.8), 400);
  const totalWeight = base.reduce((s, x) => s + x.weight, 0);

  // A keyword abre o H2 na forma "{kw}: ...", entao entra capitalizada e com
  // marca/modelo na caixa certa ("Melhor lava e seca LG", nao "...lg").
  const kwCap = displayKeyword(pauta.keyword);

  return base.map((s) => ({
    h2: s.h2.replace(/\{kw\}/g, kwCap),
    guide: s.guide,
    steps: !!s.steps,
    words: Math.round((s.weight / totalWeight) * bodyWords),
  }));
}
