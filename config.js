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
  'ADM',
  'COM',
  'OSC',
  'FIN',
  'MKT',
  'MPD',
  'PROD',
  'MPR',
  'RH',
  'OPR',
  'MEP',
]

global.DEPARTMENTS_LABELS = [
  { value: 'ADM', label: 'Administrativo' },
  { value: 'COM', label: 'Comercial' },
  { value: 'OSC', label: 'Compras' },
  { value: 'FIN', label: 'Financeiro' },
  { value: 'MKT', label: 'Marketing' },
  { value: 'MPD', label: 'P&D' },
  { value: 'PROD', label: 'Produção' },
  { value: 'MPR', label: 'Produto' },
  { value: 'RH', label: 'R.H.' },
  { value: 'OPR', label: 'Operações' },
  { value: 'MEP', label: 'Processo' },
]

global.NPI_PIXEL_CRITICAL_DEPTS = ['MPR', 'MEP', 'OPR', 'ADM', 'COM']
global.NPI_INTERNAL_CRITICAL_DEPTS = ['MEP', 'OPR', 'ADM', 'COM']
global.NPI_CUSTOM_CRITICAL_DEPTS = ['MEP', 'OPR', 'ADM', 'COM']
global.NPI_OEM_CRITICAL_DEPTS = ['MEP', 'OPR', 'ADM', 'COM']

global.MACRO_STAGES = [
  { value: 'SPECS_HW', label: 'Especificação Técnica - Funcionalidade HW', dept: 'MPR', term: 1 },
  { value: 'SPECS_SW', label: 'Especificação Técnica - Funcionalidade de SW', dept: 'MPR', term: 1 },
  { value: 'MECH_SPEC', label: 'Especificação Mecânica/Dimensional', dept: 'MPR', term: 1 },
  { value: 'ELETRIC_LAYOUT', label: 'Esquema Elétrico/Layout', dept: 'MPD', term: 60 },
  { value: 'BOM_DESC', label: 'BOM com P/N, Descrição', dept: 'MPD', term: 5 },
  { value: 'GERBER', label: 'Arquivo Gerber', dept: 'MPD', term: 5 },
  { value: 'MECH_LAYOUT', label: 'Desenho de Partes Mecânicas', dept: 'MPR', term: 60 },
  { value: 'FIRMWARE', label: 'Firmware', dept: 'MPD', term: 10 },
  { value: 'BOM_PRICE', label: 'Cotação/Compra da BOM', dept: 'OSC', term: 5 },
  { value: 'PROTO_ASSEMB', label: 'Montagem de Protótipo', dept: 'MPD', term: 30 },
  { value: 'PROTO_SW', label: 'Protótipo de Software', dept: 'MPD', term: 100 },
  { value: 'PROTO_TEST', label: 'Testes de Verficação/Validação de Protótipo', dept: 'MPR', term: 15 },
  { value: 'DEVICE', label: 'Dispositivos/Moldes', dept: 'MPR', term: 90 },
  { value: 'TEMPLATE', label: 'Estêncil/Templates', dept: 'MEP', term: 5 },
  { value: 'DATASHEET', label: 'Datasheet', dept: 'MPR', term: 5 },
  { value: 'TAG_SPEC', label: 'Desenho/Especificação de Etiquetas', dept: 'MPR', term: 5 },
  { value: 'PACKING_SPEC', label: 'Desenho/Especificação de Embalagem Individual', dept: 'MPR', term: 10 },
  { value: 'MANUAL', label: 'Manual para o Produto', dept: 'MPR', term: 10 },
  { value: 'HOMOLOG', label: 'Entrada Homologação', dept: 'MPR', term: 150 },
  { value: 'JIG', label: 'Equipamento e Jiga de Testes', dept: 'MPD', term: 10 },
  { value: 'TEST_INSTR', label: 'Instrução de Teste', dept: 'MPD', term: 5 },
  { value: 'ASSEMB_TOOLS', label: 'Definição de Ferramentas para Montagem', dept: 'MEP', term: 10 },
  { value: 'ASSEMB_INSTR', label: 'Instrução de Montagem', dept: 'MEP', term: 5 },
  { value: 'SMT', label: 'Programa para Máquina SMT', dept: 'MEP', term: 5 },
  { value: 'INJECT', label: 'Ajuste/Programação Injetora', dept: 'MEP', term: 5 },
  { value: 'QUALITY', label: 'Critérios de Qualidade', dept: 'MPR', term: 5 },
  { value: 'PILOT', label: 'Lote Piloto', dept: 'MEP', term: 5 },
  { value: 'TEST', label: 'Testes de Verificação/Validação', dept: 'MPR', term: 5 },
  { value: 'GOLD', label: 'Golden Sample', dept: 'MPR', term: 5 },
  { value: 'PRODUCT_DOC', label: 'Documento de Produto', dept: 'MPR', term: 5 },
  { value: 'PRODUCT_SW', label: 'Documento de Software', dept: 'MPD', term: 5 },
  { value: 'PRODUCT_FW', label: 'Documento de Firmware', dept: 'MPD', term: 5 },
  { value: 'ASSEMB_DOC', label: 'Documento de Montagem/Teste', dept: 'MEP', term: 2 },
  { value: 'PRICE_TABLE', label: 'Tabela de Preço', dept: 'COM', term: 5 },
  { value: 'RELEASE', label: 'Plano de Lançamento', dept: 'MPR', term: 5 },
  { value: 'PRODUCTION', label: 'Produção', dept: 'OPR', term: 90 },
]

global.REGULATIONS = [
  'ABNT', 'ANATEL', 'INMETRO', 'ANVISA'
]

global.CURRENCIES = [
  'BRL', 'USD', 'EUR', null
]
