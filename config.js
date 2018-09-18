"use strict";

global.URL_BASE = "http://localhost:4200";
//global.URL_BASE = "http://10.0.0.175:4200";
//global.URL_BASE = "http://201.77.131.165:80";

global.ENCRYPT_KEY =
  "addc92733c4b0545ca7d036027d197e3aafe8fdc33e1b3bb34b7bea76d" +
  "a9377ff2ef0746b27e412402fa02ec8f466ead362d21a215516e21b5e6" +
  "a3ce57de4e67"

module.exports = {
  pathVersion: "/e-npi/v2"
};

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
  'COMP',
  'EPROD',
  'EPROC',
  'FIN',
  'MKT',
  'P&D',
  'PROD',
  'PRD',
  'RH',
  'OPR',
  'MEP',
  'CSC'
]

global.DEPARTMENTS_LABELS = [
  { value: 'ADM', label: 'Administrativo' },
  { value: 'COM', label: 'Comercial' },
  { value: 'COMP', label: 'Compras' },
  { value: 'EPROD', label: 'Engenharia de Produção' },
  { value: 'EPROC', label: 'Engenharia de Processos' },
  { value: 'FIN', label: 'Financeiro' },
  { value: 'MKT', label: 'Marketing' },
  { value: 'P&D', label: 'P&D' },
  { value: 'PROD', label: 'Produção' },
  { value: 'PRD', label: 'Produto' },
  { value: 'RH', label: 'R.H.' },
  { value: 'OPR', label: 'Operações' },
  { value: 'MEP', label: 'Ministério de Engenharia Privada' },
  { value: 'CSC', label: 'Controle Seccionado de Capacidade' }
]

global.NPI_PIXEL_CRITICAL_DEPTS = ['PRD', 'EPROC', 'OPR', 'ADM', 'COM']
global.NPI_INTERNAL_CRITICAL_DEPTS = ['EPROC', 'OPR', 'ADM', 'COM']
global.NPI_CUSTOM_CRITICAL_DEPTS = ['EPROC', 'OPR', 'ADM', 'COM']
global.NPI_OEM_CRITICAL_DEPTS = ['EPROC', 'OPR', 'ADM', 'COM']

global.MACRO_STAGES = [
  { value: 'SCHED', label: 'Cronograma', dept: 'MEP', dateOffset: 7 },
  { value: 'LAYOUT', label: 'Esquemático, Layout e Gerber', dept: 'MEP', dateOffset: 30 },
  { value: 'FIRMWARE', label: 'Firmware, Software e Aplicativo', dept: 'MEP', dateOffset: 60 },
  { value: 'MECHANICS', label: 'Mecânica', dept: 'MEP', dateOffset: 45 },
  { value: 'SPECS', label: 'Especificação Técnica', dept: 'MEP', dateOffset: 30 },
  { value: 'BOM', label: 'Lista de Materiais - BOM', dept: 'MEP', dateOffset: 15 },
  { value: 'QUOTATION', label: 'Cotação', dept: 'CSC', dateOffset: 30 },
  { value: 'REQUIRE', label: 'Validação de Requisitos de Entrada', dept: 'MEP', dateOffset: 12 },
  { value: 'STATIONERY', label: 'Papelaria (Embalagem, Etiquetas, Manuais, Guias, etc)', dept: 'MEP', dateOffset: 30 },
  { value: 'BOM_REG', label: 'Cadastro da BOM', dept: 'MEP', dateOffset: 20 },
  { value: 'TEST', label: 'IT de Teste', dept: 'MEP', dateOffset: 70 },
  { value: 'JIG', label: 'Jiga de Testes', dept: 'P&D', dateOffset: 90 },
  { value: 'PROD', label: 'Processo Produtivo', dept: 'MEP', dateOffset: 120 },
  { value: 'PILOT', label: 'Lote Piloto', dept: 'MEP', dateOffset: 130 },
  { value: 'ASSEMBLY', label: 'IT de Montagem', dept: 'MEP', dateOffset: 150 },
  { value: 'GOLD', label: 'Golden Sample', dept: 'MEP', dateOffset: 180 },
]

global.REGULATIONS = [
  'ABNT', 'ANATEL', 'INMETRO', 'ANVISA'
]

global.CURRENCIES = [
  'BRL', 'USD', 'EUR', null
]
