#!/usr/bin/env python3
"""
detect.py - painel de cinco testes que mede o quanto um rascunho parece
escrito por máquina. Versão adaptada para português do Brasil.

O que é:  cinco heurísticas locais inspiradas nos sinais que detectores
públicos de IA medem - variação no tamanho das frases, concretude,
vocabulário-clichê, assinatura tipográfica e voz. Tudo é calculado na sua
máquina, só a partir do texto. Nada é enviado para lugar nenhum.

O que NÃO é:  GPTZero, Originality, Copyleaks, Winston ou Turnitin. Não
chama essas APIs e não promete o veredito delas. Pega as coisas em que
todos eles se baseiam, por isso corrigir costuma mover os números deles
também - mas a única afirmação honesta é a desta linha.

Cada teste devolve uma nota HUMANA de 0 a 100. Quanto maior, melhor.

Uso
  python3 detect.py draft.txt
  pbpaste | python3 detect.py -
  python3 detect.py draft.txt --json
  python3 detect.py before.txt after.txt      # compare two drafts
"""

import argparse
import json
import os
import re
import statistics
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
LEX = os.path.join(HERE, "slop.json")

SENT_RE = re.compile(r"[^.!?\n]+[.!?]*")
WORD_RE = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿ']+")
# Português não tem contrações com apóstrofo como o inglês. O equivalente,
# como sinal de voz humana, são as marcas de oralidade do português falado.
ORALIDADE = re.compile(
    r"\b(?:pra|pro|pras|pros|tá|tô|tava|tavam|tamo|né|cê|cês|vc|vcs|pq|"
    r"bora|daí|aí|tipo assim|sei lá|olha só)\b", re.IGNORECASE)
# Primeira e segunda pessoa. O português omite muito o sujeito ("fiz",
# "aprendemos"), então a meta por 100 palavras é menor que no inglês.
PRONOUNS = re.compile(
    r"\b(?:eu|me|mim|comigo|meu|minha|meus|minhas|nós|nos|conosco|nosso|nossa|"
    r"nossos|nossas|a gente|você|vocês|te|ti|contigo|teu|tua|teus|tuas)\b",
    re.IGNORECASE)
NUMBERS = re.compile(r"\b\d[\d,.]*%?\b|R?\$\s?\d")
PROPER = re.compile(r"(?<![.!?]\s)(?<!^)\b[A-ZÀ-ÖØ-Þ][a-zß-öø-ÿ]{2,}\b", re.MULTILINE)


def clamp(n):
    return max(0.0, min(100.0, n))


def scale(value, human, machine):
    """Map value onto 0-100 where `human` -> 100 and `machine` -> 0."""
    if human == machine:
        return 50.0
    return clamp((value - machine) / (human - machine) * 100)


def sentences(text):
    return [s.strip() for s in SENT_RE.findall(text) if len(s.split()) > 2]


def words(text):
    return WORD_RE.findall(text)


def check_burstiness(text):
    """Humanos variam muito o tamanho das frases. Modelos escrevem por igual."""
    lens = [len(s.split()) for s in sentences(text)]
    if len(lens) < 4:
        return 50.0, "curto demais para avaliar"
    mean = statistics.mean(lens)
    cv = statistics.pstdev(lens) / mean if mean else 0
    score = scale(cv, human=0.70, machine=0.22)
    return score, f"variação {cv:.2f} em {len(lens)} frases (meta: 0,55+)"


def check_specificity(text):
    """Números, nomes e substantivos concretos. Clichê é abstrato."""
    w = words(text)
    if len(w) < 25:
        return 50.0, "curto demais para avaliar"
    per100 = 100 / len(w)
    hits = len(NUMBERS.findall(text)) + len(set(PROPER.findall(text)))
    density = hits * per100
    score = scale(density, human=6.0, machine=0.5)
    return score, f"{hits} marcadores concretos, {density:.1f} por 100 palavras (meta: 4+)"


def check_slop(text, lex):
    """Densidade de vocabulário-clichê, segundo o léxico."""
    w = words(text)
    if not w:
        return 50.0, "vazio"
    hits, found = 0, []
    for entry in lex["words"] + lex["phrases"]:
        pattern = re.compile(r"\b" + re.escape(entry["find"]).replace(r"\ ", r"\s+") + r"\b",
                             re.IGNORECASE)
        n = len(pattern.findall(text))
        if n:
            hits += n
            found.append(entry["find"])
    density = hits * 100 / len(w)
    score = scale(density, human=0.0, machine=4.0)
    detail = f"{hits} termos-clichê, {density:.1f} por 100 palavras"
    if found:
        detail += " (" + ", ".join(sorted(found)[:4]) + (", ..." if len(found) > 4 else "") + ")"
    return score, detail


def check_fingerprint(text):
    """Caracteres que um teclado de celular não produz."""
    invisible = sum(1 for c in text if unicodedata.category(c) == "Cf")
    em = text.count("—")
    curly = sum(text.count(c) for c in "‘’“”«»")
    ellip = text.count("…")
    nbsp = sum(text.count(c) for c in "   ")
    total = invisible * 4 + em * 2 + curly + ellip + nbsp
    per1k = total * 1000 / max(len(text), 1)
    score = scale(per1k, human=0.0, machine=12.0)
    detail = (f"{invisible} invisível, {em} travessão, {curly} aspa curva, "
              f"{ellip} reticências, {nbsp} espaço rígido")
    return score, detail


def check_voice(text, lex):
    """Oralidade, pessoa e as estruturas a que os modelos recorrem."""
    w = words(text)
    if len(w) < 25:
        return 50.0, "curto demais para avaliar"
    per100 = 100 / len(w)
    oralidade = len(ORALIDADE.findall(text)) * per100
    person = len(PRONOUNS.findall(text)) * per100
    tells = 0
    names = []
    for s in lex["structures"]:
        try:
            n = len(re.compile(s["regex"], re.MULTILINE).findall(text))
        except re.error:
            continue
        if n:
            tells += n
            names.append(s["id"])
    bullets = [len(b.split()) for b in re.findall(r"(?m)^\s*[-*•]\s+(.+)$", text)]
    uniform = (len(bullets) >= 3 and statistics.pstdev(bullets) < 1.6)
    score = (scale(oralidade, human=1.5, machine=0.0) * 0.35
             + scale(person, human=6.0, machine=0.5) * 0.35
             + clamp(100 - tells * 22) * 0.30)
    if uniform:
        score -= 12
        names.append("bullets-uniformes")
    detail = (f"{oralidade:.1f} marcas de oralidade, {person:.1f} pronomes pessoais "
              f"por 100 palavras, {tells} vício(s) estrutural(is)")
    if names:
        detail += " [" + ", ".join(names[:4]) + "]"
    return clamp(score), detail


CHECKS = ["RITMO", "CONCRETUDE", "CLICHÊS", "ASSINATURA", "VOZ"]
VERDICTS = {"PASS": "APROVADO", "REVIEW": "REVISAR", "FLAGGED": "SINALIZADO"}


def run(text, lex):
    results = {}
    results["RITMO"] = check_burstiness(text)
    results["CONCRETUDE"] = check_specificity(text)
    results["CLICHÊS"] = check_slop(text, lex)
    results["ASSINATURA"] = check_fingerprint(text)
    results["VOZ"] = check_voice(text, lex)
    scores = [results[c][0] for c in CHECKS]
    # O teste mais fraco puxa o veredito: um detector só precisa de um sinal.
    overall = statistics.mean(scores) * 0.6 + min(scores) * 0.4
    verdict = "APROVADO" if overall >= 70 and min(scores) >= 55 else (
        "REVISAR" if overall >= 50 else "SINALIZADO")
    return results, overall, verdict


def bar(score, width=24):
    filled = round(score / 100 * width)
    return "#" * filled + "." * (width - filled)


def render(results, overall, verdict, label=None, out=sys.stdout):
    title = "PAINEL DE DETECÇÃO DE IA" + (f"  -  {label}" if label else "")
    print("\n" + title, file=out)
    print("=" * max(len(title), 62), file=out)
    for name in CHECKS:
        score, detail = results[name]
        print(f"  {name:<13} {bar(score)} {score:5.1f}", file=out)
        print(f"  {'':<13} {detail}", file=out)
    print("-" * 62, file=out)
    print(f"  {'NOTA HUMANA':<13} {bar(overall)} {overall:5.1f}   {verdict}", file=out)
    if verdict != "APROVADO":
        weakest = min(CHECKS, key=lambda c: results[c][0])
        print(f"\n  Sinal mais fraco: {weakest}. Corrija esse primeiro.", file=out)
    print("", file=out)


def main():
    ap = argparse.ArgumentParser(description="Mede o quanto um rascunho parece escrito por máquina.")
    ap.add_argument("input", nargs="?", default="-", help="arquivo, ou - para stdin")
    ap.add_argument("compare", nargs="?", help="segundo arquivo, para mostrar antes/depois")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--lexicon", default=LEX)
    args = ap.parse_args()

    lex = json.load(open(args.lexicon, encoding="utf-8"))
    read = lambda p: sys.stdin.read() if p == "-" else open(p, encoding="utf-8").read()

    targets = [(args.input, read(args.input))]
    if args.compare:
        targets.append((args.compare, read(args.compare)))

    payload = []
    for name, text in targets:
        results, overall, verdict = run(text, lex)
        payload.append({
            "source": name,
            "checks": {k: {"score": round(v[0], 1), "detail": v[1]} for k, v in results.items()},
            "human_score": round(overall, 1),
            "verdict": verdict,
        })

    if args.json:
        print(json.dumps(payload if args.compare else payload[0], indent=2, ensure_ascii=False))
        return

    for (name, text), p in zip(targets, payload):
        results, overall, verdict = run(text, lex)
        render(results, overall, verdict, label=os.path.basename(name) if args.compare else None)
    if args.compare:
        a, b = payload
        delta = b["human_score"] - a["human_score"]
        print(f"  {a['human_score']:.1f} {a['verdict']}  ->  "
              f"{b['human_score']:.1f} {b['verdict']}   ({delta:+.1f})\n")

    sys.exit(0 if payload[-1]["verdict"] == "APROVADO" else 1)


if __name__ == "__main__":
    main()
