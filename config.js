"use strict";

global.URL_BASE = "http://localhost:4200";
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

global.NPI_PIXEL_CRITICAL_DEPTS = ['EPROC', 'OPR', 'ADM', 'COM']
global.NPI_INTERNAL_CRITICAL_DEPTS = ['EPROC', 'OPR', 'ADM', 'COM']
global.NPI_CUSTOM_CRITICAL_DEPTS = ['EPROC', 'OPR', 'ADM', 'COM']
global.NPI_OEM_CRITICAL_DEPTS = ['PRD', 'EPROC', 'OPR', 'ADM', 'COM']

global.MACRO_STAGES = [
  { value: 'SCHED', label: 'Cronograma', dept: 'MEP' },
  { value: 'LAYOUT', label: 'Esquemático, Layout e Gerber', dept: 'MEP' },
  { value: 'FIRMWARE', label: 'Firmware, Software e Aplicativo', dept: 'MEP' },
  { value: 'MECHANICS', label: 'Mecânica', dept: 'MEP' },
  { value: 'SPECS', label: 'Especificação Técnica', dept: 'MEP' },
  { value: 'BOM', label: 'Lista de Materiais - BOM', dept: 'MEP' },
  { value: 'QUOTATION', label: 'Cotação', dept: 'CSC' },
  { value: 'REQUIRE', label: 'Validação de Requisitos de Entrada', dept: 'MEP' },
  { value: 'STATIONERY', label: 'Papelaria (Embalagem, Etiquetas, Manuais, Guias, etc)', dept: 'MEP' },
  { value: 'BOM_REG', label: 'Cadastro da BOM', dept: 'MEP' },
  { value: 'TEST', label: 'IT de Teste', dept: 'MEP' },
  { value: 'JIG', label: 'Jiga de Testes', dept: 'P&D' },
  { value: 'PROD', label: 'Processo Produtivo', dept: 'MEP' },
  { value: 'PILOT', label: 'Lote Piloto', dept: 'MEP' },
  { value: 'ASSEMBLY', label: 'IT de Montagem', dept: 'MEP' },
  { value: 'GOLD', label: 'Golden Sample', dept: 'MEP' },
]

global.REGULATIONS = [
  ['ABNT', 'ANATEL', 'INMETRO', 'ANVISA']
]
