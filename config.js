"use strict";

global.URL_BASE = "http://localhost:4200";
//global.URL_BASE = "http://localhost:6002";
//global.URL_BASE = "http://10.0.0.174:4200";
//global.URL_BASE = "http://iraflor.com.br";

global.ENCRYPT_KEY =
  "addc92733c4b0545ca7d036027d197e3aafe8fdc33e1b3bb34b7bea76d" +
  "a9377ff2ef0746b27e412402fa02ec8f466ead362d21a215516e21b5e6" +
  "a3ce57de4e67"

module.exports = {
  pathVersion: "/e-npi/v2"
};

global.FILES_DIR = './npi-files/'

global.NPI_LABELS = {
  number: 'Número',
  created: 'Data de Criação',
  stage: 'Status',
  status: 'Status',
  npiRef: 'NPI de Referência',
  complexity: 'Complexidade',
  annex: 'Anexos',
  client: 'Cliente',
  requester: 'Solicitante',
  name: 'Nome da NPI',
  cost: 'Custo',
  price: 'Preço',
  resources: 'Recursos',
  norms: 'Normas Aplicáveis',
  investment: 'Valor de Investimento',
  fiscals: 'Inc. Fiscais',
  projectCost: 'Custo do Projeto',
  activities: 'Atividades',
  inStockDate: 'Data em Estoque',
  regulations: 'Regulamentações',
  demand: 'Demanda',
  oemActivities: 'Atividades O&M',
  critical: 'Análise Crítica',
  dev: 'Desenvolvimento',
  finished: 'Concluído',
  canceled: 'Cancelado',
  draft: 'Rascunho'
}

global.DEPARTMENTS = [
  'COM',
  'OSC',
  'ADM',
  'MPD',
  'MPR',
  'OPR',
  'MEP',
]

global.DEPARTMENTS_LABELS = [
  { value: 'COM', label: 'Comercial' },
  { value: 'OSC', label: 'Compras' },
  { value: 'ADM', label: 'Administrativo' },
  { value: 'MPD', label: 'P&D' },
  { value: 'MPR', label: 'Produto' },
  { value: 'OPR', label: 'Operações' },
  { value: 'MEP', label: 'Processo' }
],

  global.NPI_PIXEL_CRITICAL_DEPTS = ['MPR', 'MEP', 'OPR', 'ADM', 'COM']
global.NPI_INTERNAL_CRITICAL_DEPTS = ['MEP', 'OPR', 'ADM', 'COM']
global.NPI_CUSTOM_CRITICAL_DEPTS = ['MEP', 'OPR', 'ADM', 'COM']
global.NPI_OEM_CRITICAL_DEPTS = ['MEP', 'OPR', 'ADM', 'COM']

global.MACRO_STAGES = [
  { value: 'SPECS_HW', label: 'Especificação Técnica - Funcionalidade HW', dept: 'MPR', term: 1, required: true },
  { value: 'SPECS_SW', label: 'Especificação Técnica - Funcionalidade de SW', dept: 'MPR', term: 1 },
  { value: 'MECH_SPEC', label: 'Especificação Mecânica/Dimensional', dept: 'MPR', term: 1 },
  { value: 'ELETRIC_LAYOUT', label: 'Esquema Elétrico/Layout', dept: 'MPD', term: 60, dep: ["SPECS_HW"] },
  { value: 'BOM_DESC', label: 'BOM com P/N, Descrição', dept: 'MEP', term: 5, dep: ["ELETRIC_LAYOUT"], required: true },
  { value: 'GERBER', label: 'Arquivo Gerber', dept: 'MPD', term: 5, dep: ["ELETRIC_LAYOUT"] },
  { value: 'MECH_LAYOUT', label: 'Desenho de Partes Mecânicas', dept: 'MPR', term: 60, dep: ["MECH_SPEC"] },
  { value: 'FIRMWARE', label: 'Firmware', dept: 'MPD', term: 10, dep: ["GERBER"] },
  { value: 'BOM_PRICE', label: 'Cotação/Compra da BOM', dept: 'OSC', term: 5, dep: ["GERBER", "BOM_DESC"], required: true },
  { value: 'PROTO_ASSEMB', label: 'Montagem de Protótipo', dept: 'MPD', term: 30, dep: ["BOM_PRICE", "FIRMWARE", "BOM_PRICE"] },
  { value: 'PROTO_SW', label: 'Protótipo de Software', dept: 'MPD', term: 100, dep: ["SPECS_SW"] },
  { value: 'PROTO_TEST', label: 'Testes de Verficação/Validação de Protótipo', dept: 'MPR', term: 15, dep: ["PROTO_ASSEMB"], },
  { value: 'DEVICE', label: 'Dispositivos/Moldes', dept: 'MPR', term: 90, dep: ["MECH_LAYOUT"] },
  { value: 'TEMPLATE', label: 'Estêncil/Templates', dept: 'MEP', term: 5, dep: ["PROTO_TEST"] },
  { value: 'DATASHEET', label: 'Datasheet', dept: 'MPR', term: 5, dep: ["PROTO_TEST"], required: true },
  { value: 'TAG_SPEC', label: 'Desenho/Especificação de Etiquetas', dept: 'MPR', term: 5, dep: ["DATASHEET"] },
  { value: 'PACKING_SPEC', label: 'Desenho/Especificação de Embalagem Individual', dept: 'MPR', term: 10, dep: ["DATASHEET"] },
  { value: 'MANUAL', label: 'Manual para o Produto', dept: 'MPR', term: 10, dep: ["DATASHEET"] },
  { value: 'HOMOLOG', label: 'Entrada Homologação', dept: 'MPR', term: 150, dep: ["DATASHEET"] },
  { value: 'JIG', label: 'Equipamento e Jiga de Testes', dept: 'MPD', term: 10, dep: ["PROTO_TEST"] },
  { value: 'TEST_INSTR', label: 'Instrução de Teste', dept: 'MPD', term: 5, dep: ["JIG"], required: true },
  { value: 'ASSEMB_TOOLS', label: 'Definição de Ferramentas para Montagem', dept: 'MEP', term: 10, dep: ["PROTO_TEST"] },
  { value: 'ASSEMB_INSTR', label: 'Instrução de Montagem', dept: 'MEP', term: 5, dep: ["TEST_INSTR", "ASSEMB_TOOLS"] },
  { value: 'SMT', label: 'Programa para Máquina SMT', dept: 'MEP', term: 5, dep: ["PROTO_TEST", "GERBER", "BOM_DESC"] },
  { value: 'INJECT', label: 'Ajuste/Programação Injetora', dept: 'MEP', term: 5, dep: ["DEVICE"] },
  { value: 'QUALITY', label: 'Critérios de Qualidade', dept: 'MPR', term: 5, dep: ["ASSEMB_INSTR"], required: true },
  { value: 'PILOT', label: 'Lote Piloto', dept: 'MEP', term: 5, dep: ["INJECT", "ASSEMB_INSTR", "SMT", "TEST_INSTR", "QUALITY", "TEMPLATE", "TAG_SPEC", "PACKING_SPEC", "MANUAL"], required: true },
  { value: 'TEST', label: 'Testes de Verificação/Validação', dept: 'MPR', term: 5, dep: ["PILOT", "PROTO_SW"], required: true },
  { value: 'GOLD', label: 'Golden Sample', dept: 'MPR', term: 5, dep: ["QUALITY", "PILOT"] },
  { value: 'PRODUCT_DOC', label: 'Documento de Produto', dept: 'MPR', term: 5, dep: ["TEST"], required: true },
  { value: 'PRODUCT_SW', label: 'Documento de Software', dept: 'MPD', term: 5, dep: ["TEST"] },
  { value: 'PRODUCT_FW', label: 'Documento de Firmware', dept: 'MPD', term: 5, dep: ["TEST"] },
  { value: 'ASSEMB_DOC', label: 'Documento de Montagem/Teste', dept: 'MEP', term: 2, dep: ["PILOT"], required: true },
  { value: 'PRICE_TABLE', label: 'Tabela de Preço', dept: 'COM', term: 5, dep: ["TEST", "BOM_PRICE"], required: true },
  { value: 'RELEASE_PLAN', label: 'Plano de Lançamento', dept: 'MPR', term: 5, dep: ["PRICE_TABLE"], required: true },
  { value: 'PRODUCTION', label: 'Produção', dept: 'OPR', term: 90, dep: ["PILOT", "TEST", "GOLD", "PRODUCT_DOC", "PRODUCT_SW", "PRODUCT_FW", "ASSEMB_DOC"], required: true },
  { value: 'RELEASE', label: 'Lançamento', dept: null, term: 0, dep: ["PRODUCTION", "RELEASE_PLAN", "HOMOLOG"], required: true }
],

  global.REGULATIONS = [
    'ABNT', 'ANATEL', 'INMETRO', 'ANVISA'
  ]

global.CURRENCIES = [
  'BRL', 'USD', 'EUR', null
]
