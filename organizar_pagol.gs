/**
 * Organiza as pastas "Pagol/Downloads/Downloads" e "Pagol/1" por tema.
 *
 * COMO USAR (uma vez só):
 *  1. Abra https://script.google.com e clique em "Novo projeto".
 *  2. Apague o conteúdo e cole este arquivo inteiro. Salve (Ctrl+S).
 *  3. No topo, escolha a função "organizar" e clique em "Executar".
 *  4. Autorize o acesso ao seu Drive quando o Google pedir.
 *
 * O script NUNCA apaga nada: só MOVE arquivos para as pastas de tema
 * dentro de "Pagol". Duplicatas vão para "99 - Duplicatas - revisar".
 * Se o tempo limite do Google (6 min) acabar, ele agenda a si mesmo
 * para continuar em 1 minuto, até terminar. No fim grava um relatório
 * "Relatório da organização" (planilha) dentro da pasta Pagol com
 * cada arquivo movido, de onde saiu e para onde foi.
 */

var PAGOL_ID = '1O45mszEeajGfVQtpP-o75AJ7_OOMAqyC';
var SOURCE_IDS = [
  '1CyWL6HyVPqbP6eU-pxFw11rBxxgIBsXH', // Pagol/Downloads/Downloads
  '1P8vEr3NAMxBXTkJjdi4CLQwycksC21lU'  // Pagol/1
];
var TIME_BUDGET_MS = 5 * 60 * 1000;
var DUP_FOLDER = '99 - Duplicatas - revisar';

// Regras por nome de arquivo — a primeira que casar define a pasta.
var RULES = [
  ['07 - RH e Pessoas', /roteiro_entrevistas|matriz_consolidada_head|baas1? - |^head |gerente de /i],
  ['02 - Contratos e Fornecedores', /^nfe?[ _]|^nf \d/i],
  ['05 - Regulatório e Compliance', /ravel/i],
  // Lixo técnico / temporários
  ['99 - Duplicatas - revisar', /^~\$|\.(exe|log|tmp|crdownload|ini)$|\.log\.\d|^desktop\.ini$|ChromeSetup|DiagnosticoItau/i],

  // Pessoal (antes de tudo para não cair em temas da empresa)
  ['12 - Pessoal', /^(img_)?20\d{6}_\d{6}|^boleto_(anterior|agosto|\d)|detalhe despesa|^31\d{4}[ -]|^pagol20\d\d|formul[aá]rio santander|^certidao\.pdf$|^pedido\.jpg$|apartamento|quintoandar|minuta_compra|fatura_itau|itaucard|ganho de capital|cdb ipca|santander2024|controle_fatura|controle_financeiro|tiggo|hist[oó]rico do ve[ií]culo|boleto (mar[cç]o|agoa?sto|setembro)\d|comp(ro|or)vante pgt|289[ _]154|154 2|vidr .*bruno|album lencois|informe para declara|despesas_da_fatura|fatura gol|bruno[ _-]?(de[ _-]?carvalho[ _-]?)?laronga|bruno.{0,30}(cv|curr)|(cv|curr).{0,40}(bruno|laronga)|^curriculo_executivo|bruno_cv|laronga\.pfx|vilma laronga|or[cç]amento - laronga|tracker_candidaturas|topaz|assessment|business director|fit_analysis|preparacao_thais|cnh|comprovante (de )?resid[eê]ncia|fgts|irpf|informe.{0,4}rendimento|declara[cç][aã]o ?ir|recibo entrega|holerite.*bruno|renda fixa|a[cç][oõ]es\.xlsx|controle financeiro|enel|sabesp|iptu|cotovelo|laudo|pedido m[eé]dico|exame|ultrassonografia|ecocardiograma|eletrocardiograma|matr[ií]cula marcela|marcela|tcross|netshoes|passagens|e-ticket|ingresso|vistoria|loca[cç][aã]o de im[oó]vel|compra e venda|celso garcia|belchior|varanda|su[ií]te|quarto|sala ?\d|lavabo|lavanderia|closet|cozinha|corredor|banheiro|valcenter|azul endosso|claro_|boletoclaro|monografia|rsvp|5 minute timer|15 minute timer|swot-pessoal|essencialismo|cancelamento-\d|ccb - cedula|evolu[cç][aã]o com presta|contrato de compra e venda de ve[ií]culo/i],

  // Outras empresas / projetos paralelos
  ['11 - Outras Empresas (ALVA, Larong, VeLa)', /larong(?!a)|alva|grupo ?vela|vibra|risco_sacado|athie|exsen_gatilho_x|startse|ecossistema_parcerias|plano_larong|lp para vendedores/i],

  // Regulatório e compliance
  ['05 - Regulatório e Compliance', /complain_|reclame_aqui|monitoramento|ccf\d|cartacobranca|bcb|bacen|of[ií]cio|parecer|decis[aã]o_|procon|atendimento_cip|reclama[cç][aã]o_|lavagem|pld|antifraude|fraude|bets?_|bets n[aã]o|infra[cç][oõ]es pix|insights regulat|portaria|\bcvm\b|lgpd|compliance|regulat|auditoria|carta_de_responsabilidade|certid[aã]o|sicaf|consultarsituacaofornecedor|falencia/i],

  // Societário e jurídico
  ['01 - Societário e Jurídico', /\bage\b|\bata\b|assembleia|altera[cç][aã]o pagol|\d+[ªa] altera|estatuto|procura[cç][aã]o|ren[uú]ncia|traslado|livro +1582|termo[- _]de|termo-declaracao|declara[cç][aã]o de concor|contrato de fian[cç]a|cess[aã]o contratual|consentimento|minuta|societ[aá]ri|reassinatura|docusign/i],

  // Contratos e fornecedores
  ['02 - Contratos e Fornecedores', /freshbilling|invoice|acordo de parceria|distrato|cancellation_letter|credenciamento|confiss[aã]o de d[ií]vida|cota referente|resumo_despesas|despesas|material de apoio|contrato(?!s \(|s\.xlsx)|proposta[ _]comercial|proposta pagol|reajuste|\bnfe?\b|nf[ _]\d|nota fiscal|_nf\d|incognia|exsen|lzp ?tech|dock|matera|celcoin|freshworks|uxb|acordo operacional|fornecedor|or[cç]amento - |proposta de servi[cç]os|bmp|comporte|runoffice|nicolle|max brando|danielle duarte|comprovante_|_comprovante/i],

  // Produtos
  ['03 - Produtos (Conta PJ, Escrow, FIDC, Consignado)', /simulador|simula[cç][aã]o|tabela_price|cdc|cr[eé]dito|motor_qi|taxa de juros|averba[cç][aã]o|conversor_cet|antecipa[cç][aã]o|wallet|fintech|risco sacado|pdd|desenrola|conta[ _]?pj|escrow|fidc|consignado|conv[eê]nio|boleto[ _]?parcelado|ccb|taxonomia|turbo[ _]?milhas|loyalty|banking|portf[oó]lio|jornada|conta[ _]garantia|conta digital|abertura[ _]de[ _]conta|abertura_conta|ciclo de vida|matriz_documentos|matriz_responsabilidade|matriz de criticidade|termos? .{0,3}condi|pix|cash[ -_]?in|cash[ -_]?out|cart[aã]o|produto|bancariza|baas(?!1? -)|onboarding|cadastr/i],

  // Relatórios e indicadores (exports de BI)
  ['04 - Relatórios e Indicadores', /volume|milhas|contas ativas|boletos pagos|sa[ií]da de caixa|convers[oõ]es|check-out|rentabilidade|baixas|cess[oõ]es|opera[cç][oõ]es no balan|^base|carga - gol|_report|amostra|forecast|proje[cç][aã]o|projection|potencial_de_vendas|numeros_|insights_|top_contacts|acionamentos|iniciativas|exclu[ií]dos|cnae|lista_unica|divis[aã]o geogr|comex|transpes|^list_|vendas|pmo|gantt|tipifica|feriados|estrutura da base|erros-estoque|receita|margem|faturamento|base ativa|cancelamentos|boletos (entrada|compensados)|milhas convertidas|saldo total|ccbs geradas|novas assinaturas|relat[oó]rio|painel|indicadores|n[uú]meros pagol|dashboard|contratos( \(\d+\))?\.xlsx|totais contas|car \(\d+\)|car\.xlsx|consolidado|score|produ[cç][aã]o|dre|diagnostico_pagol|kpi|transa[cç][oõ]es|orçamento|or[cç]ament|exercicio|data\.xlsx|entrega_\d|resultados_bc|custos/i],

  // RH e pessoas
  ['07 - RH e Pessoas', /curr[ií]culo|\bcv\b|matriz_de_compet|perguntas staff|resume_|^profile\.pdf$|holerite|espelhos?|aviso (pr[eé]vio|indenizado)|[uú]ltimo dia de trabalho|ultimo_dia|atestado|baas1? - |head |gerente de|roteiro_entrevistas|matriz_consolidada_head|remunera[cç][aã]o|soraia|carta_soraia|rescis|admiss|f[eé]rias|ponto|candidat|vaga|entrevista|onboarding de|organograma|rotina trabalho|tina trabalho|atividades_bruno|question[aá]rio individual|feedback|avalia[cç][aã]o/i],

  // Atendimento e operações
  ['06 - Atendimento e Operações', /conversations\.csv|liga[cç][oõ]es|alteracaotelefone|limite de mensagens|exemplo_bot|json_sess|number list|freshdesk|tickets?|analitico_voz|voz-chat|agents-|calls-|backlog|widget|top_5_assuntos|atendimento|pop[_ ]|procedimento|processo|fluxo|requisito do sistema|solicita[cç][aã]o de (documentos|acessos)|nao_enviados|cadencia|r[eé]gua|disparos|lote\d|demandas|detalhamento da semana|base_conhecimento|portal_gol|home_portal|pagina_inicial|\.liquid$|sla|chamado|ajuste cash|cnpj|empresas_cnpj|ligac|telefonia|0800|time de operacoes|status das tarefas|bc_?correio|bccorreio/i],

  // Apresentações e estratégia
  ['08 - Apresentações e Estratégia', /apresenta[cç][aã]o|deck|vertical|estrat[eé]g|plano|proposta_gestao|proposta_exsen|contraproposta|resumo_proposta|growth|pacote_gestao|briefing|diagn[oó]stico|dossie|benchmark|pesquisa|reformula[cç][aã]o|definicao_de_conceitos|executive_lab|parecer final|comite|\.pptx$|cronograma|roadmap|okr/i],

  // Marca e marketing
  ['09 - Marca e Marketing', /whats_|base_conversao|promo[cç][aã]o|envios pagol|propens|copy_|clientes impactados|elevenlabs|pagoal-|logo|wallpaper|pattern|identidade|manual-logo|landing|lp_|\.html$|e-?mail_|\.psd$|\.svg$|banner|post|campanha|marketing|chatgpt image|imagem do chatgpt|gemini_generated|fotor-ai|laras_aprovado|imagem_email/i],

  // Templates e estudos
  ['10 - Templates e Estudos', /-utc\.zip$|powerpoint|infographic|icons?[-_ ]|ui-kit|background|comece pelo porqu|armas da persuas|estudo_|grade_treinamento|_[0-9a-f]{32}(\.zip)?$|ex_files|e-?book|guia|curso|certificado|aula|ebook|template|modelo|framework|mckinsey|\.epub|spin_selling|obje[cç][oõ]es|cultura de growth|pitch de vendas|bain_report|meta do ano|varejo|\.json$|flowise/i],
];

var DEFAULT_FOLDER = '13 - Imagens e Diversos';

function baseName_(title) {
  return title.replace(/(\s?\(\d+\))+(?=(\.[^.]+)?$)/, '');
}

function classify_(title) {
  for (var i = 0; i < RULES.length; i++) {
    if (RULES[i][1].test(title)) return RULES[i][0];
  }
  return DEFAULT_FOLDER;
}

function destFolders_() {
  var pagol = DriveApp.getFolderById(PAGOL_ID);
  var map = {};
  var it = pagol.getFolders();
  while (it.hasNext()) { var f = it.next(); map[f.getName()] = f; }
  var names = RULES.map(function (r) { return r[0]; }).concat([DEFAULT_FOLDER, DUP_FOLDER]);
  names.forEach(function (n) { if (!map[n]) map[n] = pagol.createFolder(n); });
  return map;
}

function logSheet_() {
  var pagol = DriveApp.getFolderById(PAGOL_ID);
  var it = pagol.getFilesByName('Relatório da organização');
  if (it.hasNext()) return SpreadsheetApp.open(it.next()).getSheets()[0];
  var ss = SpreadsheetApp.create('Relatório da organização');
  DriveApp.getFileById(ss.getId()).moveTo(pagol);
  var sh = ss.getSheets()[0];
  sh.appendRow(['Arquivo', 'Origem', 'Destino', 'Motivo', 'Link']);
  return sh;
}

function organizar() {
  var start = Date.now();
  var dest = destFolders_();
  var sheet = logSheet_();
  var rows = [];
  var done = true;

  SOURCE_IDS.forEach(function (srcId) {
    if (!done) return;
    var src = DriveApp.getFolderById(srcId);

    // 1) Inventário da pasta (nome + tamanho) para achar cópias "(1)", "(2)"...
    var files = [];
    var keys = {};
    var it = src.getFiles();
    while (it.hasNext()) {
      var f = it.next();
      files.push(f);
      keys[f.getName() + '|' + f.getSize()] = true;
    }

    // 2) Duplicatas primeiro (o original continua na pasta até a fase 3).
    var rest = [];
    files.forEach(function (f) {
      var name = f.getName();
      var base = baseName_(name);
      if (base !== name && keys[base + '|' + f.getSize()]) rest.unshift([f, DUP_FOLDER, 'cópia idêntica de ' + base]);
      else rest.push([f, classify_(name), 'regra de nome']);
    });

    // 3) Move tudo.
    for (var i = 0; i < rest.length; i++) {
      if (Date.now() - start > TIME_BUDGET_MS) { done = false; break; }
      var file = rest[i][0], target = dest[rest[i][1]];
      file.moveTo(target);
      rows.push([file.getName(), src.getName(), rest[i][1], rest[i][2], file.getUrl()]);
    }

    // 4) Subpastas da origem: move a pasta inteira pelo nome.
    if (done) {
      var fit = src.getFolders();
      while (fit.hasNext()) {
        if (Date.now() - start > TIME_BUDGET_MS) { done = false; break; }
        var sub = fit.next();
        var t = classify_(sub.getName());
        sub.moveTo(dest[t]);
        rows.push([sub.getName() + ' (pasta)', src.getName(), t, 'regra de nome', sub.getUrl()]);
      }
    }
  });

  if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 5).setValues(rows);

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'organizar') ScriptApp.deleteTrigger(t);
  });
  if (!done) {
    ScriptApp.newTrigger('organizar').timeBased().after(60 * 1000).create();
    Logger.log('Movidos nesta rodada: ' + rows.length + '. Continua sozinho em 1 minuto.');
  } else {
    Logger.log('Concluído. Movidos nesta rodada: ' + rows.length + '. Veja "Relatório da organização" na pasta Pagol.');
  }
}
