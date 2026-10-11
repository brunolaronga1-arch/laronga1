#!/usr/bin/env python3
"""
humanize.py - tira a assinatura de máquina de um rascunho.
Versão adaptada para português do Brasil.

Três passadas, nesta ordem:

  1. INVISÍVEIS  apaga ou normaliza caracteres que um teclado humano nunca
                 produz: zero-width joiners, word joiners, hífens suaves,
                 BOMs, caracteres de tag Unicode, espaços rígidos e estreitos.
                 Eles sobrevivem ao copiar e colar e são o sinal mais
                 mecânico de texto gerado.
  2. TIPOGRAFIA  travessão -> vírgula, meia-risca -> hífen, aspas curvas ->
                 retas, reticências -> três pontos, marcador -> hífen.
  3. LÉXICO      troca os clichês de slop.json por palavras simples,
                 preservando maiúsculas e sem mexer em URLs.

Vícios estruturais (tríades, "não é só X, é Y", paredes de hashtag) são
APONTADOS, nunca reescritos automaticamente - mudar a forma de uma frase
exige julgamento, então isso é trabalho do modelo, não de uma regex.

Uso
  python3 humanize.py draft.txt
  python3 humanize.py draft.txt --report
  pbpaste | python3 humanize.py - --report
  python3 humanize.py draft.txt --json
  python3 humanize.py draft.txt -o clean.txt
"""

import argparse
import json
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
LEX = os.path.join(HERE, "slop.json")

URL_RE = re.compile(r"https?://\S+|www\.\S+|\S+@\S+\.\S+")
SENT_RE = re.compile(r"[^.!?\n]+[.!?]*")


def load_lexicon(path=LEX):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def _cp(spec):
    """'U+200B' -> '\\u200b';  'U+E0000-U+E007F' -> (start, end)."""
    if "-" in spec:
        a, b = spec.split("-")
        return (int(a[2:], 16), int(b[2:], 16))
    return int(spec[2:], 16)


def protect_urls(text):
    """Troca URLs por marcadores para nenhuma passada mexer dentro de um link."""
    found = []

    def stash(m):
        found.append(m.group(0))
        return f"\x00URL{len(found) - 1}\x00"

    return URL_RE.sub(stash, text), found


def restore_urls(text, found):
    for i, url in enumerate(found):
        text = text.replace(f"\x00URL{i}\x00", url)
    return text


def pass_invisible(text, lex):
    """Apaga ou troca por espaço os caracteres invisíveis. Devolve (texto, ocorrências)."""
    hits = []
    for entry in lex["invisible"]:
        cp = _cp(entry["cp"])
        if isinstance(cp, tuple):
            pattern = "[" + re.escape(chr(cp[0])) + "-" + re.escape(chr(cp[1])) + "]"
        else:
            pattern = re.escape(chr(cp))
        n = len(re.findall(pattern, text))
        if n:
            hits.append({"name": entry["cp"] + " " + entry["name"], "count": n,
                         "action": entry["action"]})
            text = re.sub(pattern, "" if entry["action"] == "delete" else " ", text)
    # Qualquer caractere Cf (formatação) restante é invisível por definição.
    stray = [c for c in text if unicodedata.category(c) == "Cf"]
    if stray:
        hits.append({"name": "outros caracteres invisíveis de formatação", "count": len(stray),
                     "action": "delete"})
        text = "".join(c for c in text if unicodedata.category(c) != "Cf")
    return text, hits


def pass_typographic(text, lex):
    hits = []
    for entry in lex["typographic"]:
        ch = entry["from"]
        n = text.count(ch)
        if not n:
            continue
        hits.append({"name": f"{ch} {entry['name']}", "count": n, "to": entry["to"].strip() or "(espaço)"})
        if ch == "—":
            # Travessão no início da linha (fala de diálogo) é só removido.
            # No meio da frase, " palavra — palavra " vira vírgula + espaço.
            text = re.sub(r"(?m)^[ \t]*—[ \t]*", "", text)
            text = re.sub(r"\s*—\s*", ", ", text)
        elif ch == "–":
            text = re.sub(r"\s*–\s*(?=\d)", "-", text)      # 5–10  -> 5-10
            text = re.sub(r"\s+–\s+", ", ", text)            # usada como travessão
            text = text.replace("–", "-")
        else:
            text = text.replace(ch, entry["to"])
    # Vírgula inserida antes de outra pontuação fica errada.
    text = re.sub(r",\s*([,.;:!?])", r"\1", text)
    text = re.sub(r",\s*\n", "\n", text)
    return text, hits


def _match_case(src, repl):
    if not repl:
        return repl
    if src.isupper() and len(src) > 1:
        return repl.upper()
    if src[0].isupper():
        return repl[0].upper() + repl[1:]
    return repl


def pass_lexical(text, lex):
    """Troca palavras e expressões-clichê. As mais longas primeiro, para as expressões ganharem."""
    hits = []
    entries = sorted(lex["phrases"] + lex["words"],
                     key=lambda e: len(e["find"]), reverse=True)
    for entry in entries:
        find = entry["find"]
        pattern = re.compile(r"\b" + re.escape(find).replace(r"\ ", r"\s+") + r"\b",
                             re.IGNORECASE)
        found = pattern.findall(text)
        if not found:
            continue
        hits.append({"find": find, "replace": entry["replace"] or "(removido)",
                     "count": len(found), "family": entry["family"]})
        # Remoções viram um marcador (\x01) para a próxima palavra poder herdar
        # a maiúscula de início de frase.
        text = pattern.sub(lambda m: _match_case(m.group(0), entry["replace"]) or "\x01", text)
    text = re.sub(r"(?m)(^[ \t]*|[.!?][ \t]+)(?:\x01[ \t]*[,;:]?[ \t]*)+(\w)",
                  lambda m: m.group(1) + m.group(2).upper(), text)
    text = text.replace("\x01", "")
    # Limpeza depois das remoções.
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"(?m)^[ \t]*([,.;:])\s*", "", text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"(?m)^[ \t]+$", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Um travessão que virou vírgula seguido de conectivo deixa uma emenda
    # ("é importante, também, é prova"). Promove para ponto final.
    text = re.sub(r",\s*(também|então|ainda assim|resumindo|no fim)\s*,\s*",
                  lambda m: ". " + m.group(1)[0].upper() + m.group(1)[1:] + ", ", text)
    # "Além disso, X" vira "Também, X"; em português soa melhor sem a vírgula.
    text = re.sub(r"(?m)(^|[.!?][ \t]+)(Também),[ \t]+", r"\1\2 ", text)
    return text, hits


def scan_structures(text, lex):
    flags = []
    for s in lex["structures"]:
        try:
            pattern = re.compile(s["regex"], re.MULTILINE)
        except re.error:
            continue
        found = pattern.findall(text)
        if found:
            flags.append({"name": s["name"], "count": len(found), "fix": s["fix"]})
    # Uniformidade no tamanho das frases também é estrutural.
    lens = [len(s.split()) for s in SENT_RE.findall(text) if len(s.split()) > 2]
    if len(lens) >= 4:
        mean = sum(lens) / len(lens)
        var = sum((n - mean) ** 2 for n in lens) / len(lens)
        cv = (var ** 0.5) / mean if mean else 0
        if cv < 0.35:
            flags.append({
                "name": f"Frases do mesmo tamanho (variação {cv:.2f})",
                "count": len(lens),
                "fix": "Quebre uma frase ao meio. Deixe outra correr longa. Máquina escreve por igual.",
            })
    return flags


def humanize(text, lex):
    text, urls = protect_urls(text)
    text, inv = pass_invisible(text, lex)
    text, typo = pass_typographic(text, lex)
    text, lexi = pass_lexical(text, lex)
    text = restore_urls(text, urls)
    return text.strip() + "\n", {
        "invisible": inv,
        "typographic": typo,
        "lexical": lexi,
        "structures": scan_structures(text, lex),
    }


def render_report(report, out=sys.stderr):
    def head(title):
        print(f"\n{title}\n" + "-" * len(title), file=out)

    total = sum(h["count"] for h in report["invisible"]) \
        + sum(h["count"] for h in report["typographic"]) \
        + sum(h["count"] for h in report["lexical"])

    head("RELATÓRIO DO HUMANIZADOR")
    print(f"{total} marcas de máquina removidas, "
          f"{len(report['structures'])} vícios estruturais apontados para reescrita", file=out)

    if report["invisible"]:
        head("1. CARACTERES INVISÍVEIS")
        for h in report["invisible"]:
            print(f"  {h['count']:>3}x  {h['name']}  -> {h['action']}", file=out)
    if report["typographic"]:
        head("2. TIPOGRAFIA")
        for h in report["typographic"]:
            print(f"  {h['count']:>3}x  {h['name']}  -> {h['to']}", file=out)
    if report["lexical"]:
        head("3. LÉXICO DE CLICHÊS")
        for h in report["lexical"]:
            print(f"  {h['count']:>3}x  {h['find']}  -> {h['replace']}   [{h['family']}]", file=out)
    if report["structures"]:
        head("4. VÍCIOS ESTRUTURAIS  (não corrigidos automaticamente - reescreva você)")
        for h in report["structures"]:
            print(f"  {h['count']:>3}x  {h['name']}\n        {h['fix']}", file=out)
    if not any(report.values()):
        head("LIMPO")
        print("  Nada para remover.", file=out)
    print("", file=out)


def main():
    ap = argparse.ArgumentParser(description="Tira a assinatura de máquina de um rascunho.")
    ap.add_argument("input", nargs="?", default="-", help="arquivo, ou - para stdin")
    ap.add_argument("-o", "--out", help="grava o texto limpo aqui em vez de stdout")
    ap.add_argument("--report", action="store_true", help="mostra o que mudou, em stderr")
    ap.add_argument("--json", action="store_true", help="emite {text, report} em JSON")
    ap.add_argument("--lexicon", default=LEX, help="caminho do slop.json")
    args = ap.parse_args()

    raw = sys.stdin.read() if args.input == "-" else open(args.input, encoding="utf-8").read()
    lex = load_lexicon(args.lexicon)
    clean, report = humanize(raw, lex)

    if args.json:
        print(json.dumps({"text": clean, "report": report}, indent=2, ensure_ascii=False))
        return
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(clean)
        print(f"gravado em {args.out}", file=sys.stderr)
    else:
        sys.stdout.write(clean)
    if args.report:
        render_report(report)


if __name__ == "__main__":
    main()
