#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Converte a planilha de cronograma editorial em scripts/data/cronograma.json.

Por que existe: o GitHub Actions nao tem acesso ao .xlsx local, entao a fila
de pautas precisa estar versionada no repositorio como JSON.

Uso:
    python scripts/build-cronograma.py [caminho-do-xlsx]

Regras aplicadas (decididas com o cliente em 19/07/2026):
  - Slug = APENAS a palavra-chave principal (coluna A), normalizada.
    Nunca o titulo inteiro.
  - Titulo adaptado por intencao de busca, alvo de 50-60 caracteres.
    As colunas E/F/G da planilha NAO sao usadas: foram geradas por template
    e tem 174 titulos acima de 60 chars + 15 reviews rotulados como ranking.
  - Colunas A/B/C/D (keyword, volume, KD, tamanho) sao seguidas a risca.
"""
import json
import os
import re
import sys
import unicodedata

try:
    import openpyxl
except ImportError:
    sys.exit("Falta openpyxl. Rode: python -m pip install openpyxl")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_XLSX = r"E:\Melhor Lava e Seca\Backup\Documentos\CRONOGRAMA LAVA E SECA - CONTEÚDOS.xlsx"
OUT = os.path.join(ROOT, "scripts", "data", "cronograma.json")

TITLE_MIN, TITLE_MAX, TITLE_IDEAL = 50, 60, 56

# Keywords que a HOME ja mira (H1, H2/H3 e metadados). Viram artigo NENHUM:
# a home e a pagina canonica desses termos.
HOME_KEYWORDS = {
    "melhor lava e seca",
    "qual a melhor lava e seca do mercado",
}

# Termos que mantem caixa propria dentro do titulo.
BRANDS = ["Samsung", "LG", "Brastemp", "Electrolux", "Philco", "Midea",
          "Hisense", "TCL", "Consul", "Panasonic", "Mueller", "Britânia",
          "Continental", "Esmaltec", "Colormaq"]


def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s)
                   if unicodedata.category(c) != "Mn")


def slugify(keyword):
    """Slug = so a palavra-chave, normalizada. Sem titulo, sem data."""
    s = strip_accents(keyword).lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"^-+|-+$", "", s)


def smart_case(keyword):
    """Sentence case, preservando marcas e codigos de modelo (WD11M, VC4)."""
    words = keyword.strip().split()
    out = []
    for i, w in enumerate(words):
        bare = strip_accents(w).lower()
        brand = next((b for b in BRANDS if strip_accents(b).lower() == bare), None)
        if brand:
            out.append(brand)
        elif re.fullmatch(r"[a-z]{1,3}\d{1,4}[a-z]{0,3}", bare):   # wd11m, vc4, cv5011wg4
            out.append(w.upper())
        elif re.fullmatch(r"\d+(kg|v|l)", bare):                    # 13kg, 220v
            out.append(w.lower())
        elif i == 0:
            out.append(w[0].upper() + w[1:])
        else:
            out.append(w)
    return " ".join(out)


def detect_intent(keyword):
    k = strip_accents(keyword).lower()
    if re.search(r"\breview\b|\be boa\b|\bvale a pena\b|opinia|avaliac|reclamac", k):
        return "review"
    if re.search(r"\bvs\b|\bx\b| ou |comparativ|diferenc", k):
        return "comparativo"
    if re.search(r"\bcomo\b|\bnao \b|problema|conserto|erro|defeito|barulho|cheiro|manutenc|limpar", k):
        return "guia"
    if re.search(r"\bmelhor(es)?\b|\bqual\b|\btop\b|\branking\b", k):
        return "ranking"
    return "informativo"


# Sufixos por intencao, do mais longo pro mais curto. O gerador escolhe o que
# faz o titulo cair entre 50 e 60 caracteres.
# Escada densa de sufixos por intencao (de ~48 ate ~11 chars). A densidade
# importa: com poucas opcoes sobra um vao de tamanho e o titulo cai fora da
# faixa de 50-60 mesmo existindo formulacao possivel.
SUFFIXES = {
    "ranking": [
        ": Ranking Completo, Análise e Guia de Compra 2026",
        ": Ranking Completo e Guia de Compra em 2026",
        ": Ranking Completo, Análise e Guia 2026",
        ": Ranking Completo e Análise 2026",
        ": Ranking e Guia de Compra 2026",
        ": Ranking Completo e Análise",
        ": Ranking e Guia de Compra",
        ": Ranking Completo 2026",
        ": Ranking e Análise 2026",
        ": Ranking Completo",
        ": Ranking 2026",
    ],
    "review": [
        ": Review Completo com Prós, Contras e Veredito",
        ": Review Completo, Prós e Contras 2026",
        ": Review Completo e Prós e Contras",
        ": Review, Prós e Contras 2026",
        ": Vale a Pena? Review Completo",
        ": Review e Prós e Contras",
        ": Vale a Pena? Review 2026",
        ": Review Completo 2026",
        ": Vale a Pena? Review",
        ": Review Completo",
        ": Review 2026",
    ],
    "comparativo": [
        ": Comparativo Completo com Prós e Contras 2026",
        ": Comparativo Completo e Qual Escolher 2026",
        ": Comparativo Completo e Qual Escolher",
        ": Comparativo Completo e Análise 2026",
        ": Comparativo e Qual Escolher 2026",
        ": Comparativo Completo 2026",
        ": Comparativo e Qual Escolher",
        ": Comparativo Completo",
        ": Comparativo 2026",
    ],
    "guia": [
        ": Guia Completo com Causas e Como Resolver 2026",
        ": Guia Completo com Causas e Soluções",
        ": Causas, Soluções e Guia Completo 2026",
        ": Causas, Soluções e Guia Completo",
        ": Guia Completo e Como Resolver 2026",
        ": Guia Completo e Como Resolver",
        ": Causas e Como Resolver 2026",
        ": Guia Completo e Soluções",
        ": Causas e Soluções 2026",
        ": Guia Completo 2026",
        ": Guia 2026",
    ],
    "informativo": [
        ": Guia Completo com Tudo o Que Você Precisa Saber",
        ": Tudo o Que Você Precisa Saber em 2026",
        ": Guia Completo e Dicas Práticas 2026",
        ": Tudo o Que Você Precisa Saber",
        ": Guia Completo e Dicas Práticas",
        ": Guia Completo com Dicas 2026",
        ": Guia Completo e Dicas 2026",
        ": Guia Prático e Dicas 2026",
        ": Guia Completo e Dicas",
        ": Guia Completo 2026",
        ": Guia Prático 2026",
        ": Guia 2026",
    ],
}


def build_title(keyword, intent):
    """Escolhe o titulo mais proximo de 56 chars, dentro de 50-60 quando der.
    Inclui a keyword sozinha como candidata: keywords longas ja bastam."""
    base = smart_case(keyword)
    candidates = [base] + [(base + s) for s in SUFFIXES[intent]]

    inrange = [c for c in candidates if TITLE_MIN <= len(c) <= TITLE_MAX]
    if inrange:
        return min(inrange, key=lambda c: abs(len(c) - TITLE_IDEAL))

    # Nada coube. Se a keyword sozinha ja passa de 60, nao da pra encurtar sem
    # mutilar a palavra-chave: fica o titulo mais curto possivel (a keyword).
    if len(base) > TITLE_MAX:
        return base
    # Caso contrario, o mais proximo de 50 por baixo.
    return max((c for c in candidates if len(c) < TITLE_MIN), key=len, default=base)


def parse_size(raw):
    """'3.500 palavras' -> 3500"""
    digits = re.sub(r"[^\d]", "", str(raw or ""))
    return int(digits) if digits else 2000


def main():
    xlsx = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_XLSX
    if not os.path.exists(xlsx):
        sys.exit(f"Planilha nao encontrada: {xlsx}")

    ws = openpyxl.load_workbook(xlsx, data_only=True).active
    seen, items, dupes = set(), [], 0

    for row in ws.iter_rows(min_row=2, values_only=True):
        keyword = (row[0] or "").strip() if isinstance(row[0], str) else None
        if not keyword:
            continue
        keyword = re.sub(r"\s+", " ", keyword)

        slug = slugify(keyword)
        if slug in seen:
            dupes += 1
            continue
        seen.add(slug)

        intent = detect_intent(keyword)
        secondary = [k.strip() for k in str(row[7] or "").split(",") if k.strip()]
        # A planilha tem secundarias com palavra repetida ("inverter inverter").
        secondary = [re.sub(r"\b(\w+)(\s+\1)+\b", r"\1", s, flags=re.I) for s in secondary]

        covered = strip_accents(keyword).lower() in HOME_KEYWORDS
        items.append({
            "keyword": keyword,
            "slug": slug,
            "title": build_title(keyword, intent),
            "intent": intent,
            "volume": int(row[1]) if isinstance(row[1], (int, float)) else None,
            "kd": int(row[2]) if isinstance(row[2], (int, float)) else None,
            "targetWords": parse_size(row[3]),
            "secondaryKeywords": secondary,
            # A home ja e otimizada pra essas keywords. Gerar artigo de blog
            # pro mesmo termo canibalizaria a propria home.
            "status": "coberto-pela-home" if covered else "pending",
            "publishedAt": None,
        })

    # Mais buscado primeiro: o trafego chega mais cedo.
    items.sort(key=lambda i: (-(i["volume"] or 0), i["keyword"]))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as fh:
        json.dump({"generatedFrom": os.path.basename(xlsx), "items": items},
                  fh, ensure_ascii=False, indent=2)

    lens = [len(i["title"]) for i in items]
    ok = sum(1 for n in lens if TITLE_MIN <= n <= TITLE_MAX)
    print(f"pautas: {len(items)} (slugs duplicados ignorados: {dupes})")
    print(f"titulos entre {TITLE_MIN}-{TITLE_MAX} chars: {ok}/{len(items)}")
    print(f"tamanho de titulo min/max: {min(lens)}/{max(lens)}")
    print(f"gravado em: {OUT}")


if __name__ == "__main__":
    main()
