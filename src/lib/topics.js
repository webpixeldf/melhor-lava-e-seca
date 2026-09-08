export const topics = [
 {slug:'guias-de-compra', name:'Guias de compra', description:'Compare capacidade, espaço, recursos e orçamento antes de escolher.'},
 {slug:'instalacao-e-uso', name:'Instalação e uso', description:'Preparação da lavanderia, programas e cuidados na rotina.'},
 {slug:'manutencao-e-erros', name:'Manutenção e erros', description:'Entenda sintomas e encontre o manual e a assistência da sua marca.'},
];
export function topicFor(post) {
 const s=post.slug;
 if (/^(erro-|e21-|amortecedor|garantia|pecas|pes-)|limpar|limpeza|nao-|vazando|resetar|destravar/.test(s)) return topics[2];
 if (/^(como-|aplicativo|funcoes|qual-sabao|armario)|gasta|encolhe|estraga|altura|agua-quente|60-minutos/.test(s)) return topics[1];
 return topics[0];
}
export const manuals = [
 {brand:'Samsung', url:'https://www.samsung.com/br/support/', name:'Samsung — manuais e suporte'},
 {brand:'LG', url:'https://www.lg.com/br/suporte', name:'LG — suporte ao produto'},
 {brand:'Midea', url:'https://www.midea.com.br/assistencia-tecnica', name:'Midea — assistência e suporte'},
 {brand:'Electrolux', url:'https://www.electrolux.com.br/', name:'Electrolux — site oficial e atendimento'},
 {brand:'Brastemp', url:'https://www.brastemp.com.br/atendimento', name:'Brastemp — atendimento'},
 {brand:'Hisense', url:'https://www.hisense.com.br/lava-e-seca/3s/', name:'Hisense — manuais da linha 3S'},
];
export function manualsFor(post) {
 const names=(post.slug+' '+post.title).toLowerCase();
 const matching=manuals.filter(x=>new RegExp('(?:^|[^a-z])'+x.brand.toLowerCase()+'(?:[^a-z]|$)').test(names));
 return matching.length ? matching : manuals;
}
