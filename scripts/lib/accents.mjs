/**
 * Correcao de acentuacao para texto gerado pelo DeepSeek.
 *
 * O modelo as vezes escreve secoes inteiras sem acento mesmo com a regra no
 * prompt. Esta lista cobre as palavras reincidentes cuja forma sem acento NAO
 * existe em portugues (ou e rara demais pra importar), entao a troca e segura.
 * Palavras ambiguas (esta/está, e/é, pais/país) ficam DE FORA de proposito.
 *
 * Usada pelo gerador (blog-from-cronograma.mjs) e pelo utilitario de
 * manutencao que corrige artigos ja publicados (fix-blog-text.mjs).
 */

// [padrao (case-insensitive, \b implicito), forma acentuada com $1 de sufixo]
const PARES = [
  ['nao', 'não'], ['entao', 'então'], ['estao', 'estão'], ['sao', 'são'],
  ['ja', 'já'], ['ate', 'até'], ['voce(s)?', 'você$1'], ['porem', 'porém'],
  ['alem', 'além'], ['tres', 'três'], ['mes', 'mês'], ['ha', 'há'],
  ['apos', 'após'], ['sabao', 'sabão'], ['padrao', 'padrão'], ['padroes', 'padrões'],
  ['versao', 'versão'], ['versoes', 'versões'], ['mao(s)?', 'mão$1'],
  ['botao', 'botão'], ['botoes', 'botões'], ['questao', 'questão'], ['questoes', 'questões'],
  ['area(s)?', 'área$1'], ['historia(s)?', 'história$1'],
  ['campeao', 'campeão'], ['campeoes', 'campeões'], ['cenario(s)?', 'cenário$1'],
  ['reuniao', 'reunião'], ['reunioes', 'reuniões'], ['orcamento(s)?', 'orçamento$1'],
  ['fisic(o|a|os|as)', 'físic$1'], ['diari(o|a|os|as)', 'diári$1'],
  ['duracao', 'duração'], ['acustic(o|a|os|as)', 'acústic$1'],
  ['desnecessari(o|a|os|as)', 'desnecessári$1'], ['notavel', 'notável'],
  ['confiavel', 'confiável'], ['instavel', 'instável'], ['solid(o|a|os|as)', 'sólid$1'],
  ['concorrencia', 'concorrência'], ['conexao', 'conexão'],
  ['notificacao', 'notificação'], ['notificacoes', 'notificações'],
  ['bacteria(s)?', 'bactéria$1'], ['lider', 'líder'], ['lideres', 'líderes'],
  ['alivio', 'alívio'], ['senao', 'senão'], ['tao', 'tão'],
  ['campea', 'campeã'], ['da pra', 'dá pra'],
  ['agua(s)?', 'água$1'], ['maquina(s)?', 'máquina$1'], ['familia(s)?', 'família$1'],
  ['peca(s)?', 'peça$1'], ['preco(s)?', 'preço$1'], ['espaco(s)?', 'espaço$1'],
  ['servico(s)?', 'serviço$1'], ['diferenca(s)?', 'diferença$1'],
  ['crianca(s)?', 'criança$1'], ['duvida(s)?', 'dúvida$1'], ['saude', 'saúde'],
  ['ruido(s)?', 'ruído$1'], ['residuo(s)?', 'resíduo$1'], ['usuario(s)?', 'usuário$1'],
  ['numero(s)?', 'número$1'], ['titulo(s)?', 'título$1'], ['silencio', 'silêncio'],
  ['nivel', 'nível'], ['niveis', 'níveis'], ['util', 'útil'], ['uteis', 'úteis'],
  ['dificil', 'difícil'], ['dificeis', 'difíceis'], ['faceis', 'fáceis'],
  ['facil(is)?', 'fácil$1'], ['possivel(is)?', 'possível$1'],
  ['incrivel', 'incrível'], ['disponivel', 'disponível'], ['disponiveis', 'disponíveis'],
  ['varios', 'vários'], ['varias', 'várias'], ['media(s)?', 'média$1'],
  // Adjetivos com flexao o/a/os/as: o sufixo entra no grupo pra cobrir
  // masculino E feminino ("ultima", "eletrica") — a forma antiga
  // "ultimo(s|a|as)?" nunca casava o feminino.
  ['ultim(o|a|os|as)', 'últim$1'], ['unic(o|a|os|as)', 'únic$1'],
  ['otim(o|a|os|as)', 'ótim$1'], ['proxim(o|a|os|as)', 'próxim$1'],
  ['propri(o|a|os|as)', 'própri$1'], ['rapid(o|a|os|as)', 'rápid$1'],
  ['basic(o|a|os|as)', 'básic$1'], ['tecnic(o|a|os|as)', 'técnic$1'],
  ['pratic(o|a|os|as)', 'prátic$1'], ['classic(o|a|os|as)', 'clássic$1'],
  ['economic(o|a|os|as)', 'econômic$1'], ['eletric(o|a|os|as)', 'elétric$1'],
  ['eletronic(o|a|os|as)', 'eletrônic$1'], ['energetic(o|a|os|as)', 'energétic$1'],
  ['automatic(o|a|os|as)', 'automátic$1'], ['necessari(o|a|os|as)', 'necessári$1'],
  ['obrigatori(o|a|os|as)', 'obrigatóri$1'], ['horario(s)?', 'horário$1'],
  ['umid(o|a|os|as)', 'úmid$1'], ['minim(o|a|os|as)', 'mínim$1'],
  ['maxim(o|a|os|as)', 'máxim$1'], ['periodo(s)?', 'período$1'],
  ['conteudo(s)?', 'conteúdo$1'], ['tambem', 'também'],
  ['opcao', 'opção'], ['opcoes', 'opções'], ['funcao', 'função'], ['funcoes', 'funções'],
  ['secao', 'seção'], ['secoes', 'seções'], ['atencao', 'atenção'],
  ['situacao', 'situação'], ['situacoes', 'situações'],
  ['manutencao', 'manutenção'], ['centrifugacao', 'centrifugação'],
  ['vibracao', 'vibração'], ['promocao', 'promoção'], ['promocoes', 'promoções'],
  ['avaliacao', 'avaliação'], ['avaliacoes', 'avaliações'],
  ['reclamacao', 'reclamação'], ['reclamacoes', 'reclamações'],
  ['informacao', 'informação'], ['informacoes', 'informações'],
  ['condicao', 'condição'], ['condicoes', 'condições'],
  ['instalacao', 'instalação'], ['programacao', 'programação'],
  ['interrupcao', 'interrupção'], ['combinacao', 'combinação'], ['combinacoes', 'combinações'],
  ['compensacao', 'compensação'], ['condensacao', 'condensação'], ['higienizacao', 'higienização'],
  ['algodao', 'algodão'], ['tenis', 'tênis'], ['ninguem', 'ninguém'],
  ['inicio', 'início'], ['beneficio(s)?', 'benefício$1'], ['contrario(s)?', 'contrário$1'],
  ['especific(o|a|os|as)', 'específic$1'], ['sintetic(o|a|os|as)', 'sintétic$1'],
  ['liquid(o|a|os|as)', 'líquid$1'],
  ['eficiencia', 'eficiência'], ['assistencia', 'assistência'],
  ['experiencia(s)?', 'experiência$1'], ['frequencia', 'frequência'],
  ['potencia', 'potência'], ['comeca', 'começa'], ['comecar', 'começar'],
];

// O \b sozinho nao basta no fim: "ç" e letras acentuadas nao contam como \w
// em regex JS, entao \bespecifica\b casaria DENTRO de "especificações" e
// geraria "específicações". O lookahead exige que a palavra termine de
// verdade (nada de letra, acentuada ou nao, logo depois).
const FIM = '(?![\\wçáàâãéêíóôõúü])';
const ACENTOS = PARES.map(([p, r]) => [new RegExp(`\\b${p}${FIM}`, 'gi'), r]);

/** Preserva a capitalizacao original da 1a letra ("Nao" -> "Não"). */
function comCaixa(original, trocado) {
  if (original[0] === original[0].toUpperCase()) {
    return trocado.charAt(0).toUpperCase() + trocado.slice(1);
  }
  return trocado;
}

export function fixAccents(md) {
  let out = md;
  for (const [re, to] of ACENTOS) {
    out = out.replace(re, (m, g1) => comCaixa(m, to.replace('$1', g1 || '')));
  }
  return out;
}
