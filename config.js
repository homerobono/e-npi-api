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
  OemActivities: 'Atividades O&M',
  critical: 'Análise Crítica',
  dev: 'Desenvolvimento',
  finished: 'Concluído',
  canceled: 'Cancelado',
  draft: 'Rascunho'
}

global.DEPARTMENTS = [
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
  { value: 'OPR', label: 'Operações' }
]

global.NPI_PIXEL_CRITICAL_DEPTS = ['EPROC', 'OPR', 'ADM', 'COM']
global.NPI_INTERNAL_CRITICAL_DEPTS = ['EPROC', 'OPR', 'ADM', 'COM']
global.NPI_CUSTOM_CRITICAL_DEPTS = ['EPROC', 'OPR', 'ADM', 'COM']
global.NPI_OEM_CRITICAL_DEPTS = ['PRD', 'EPROC', 'OPR', 'ADM', 'COM']

global.MACRO_STAGES = [
  { activity: 'Cronograma', dept: 'MEP' },
  { activity: 'Esquemático, Layout e Gerber', dept: 'MEP' },
  { activity: 'Firmware, Software e Aplicativo', dept: 'MEP' },
  { activity: 'Mecânica', dept: 'MEP' },
  { activity: 'Especificação Técnica', dept: 'MEP' },
  { activity: 'Lista de Materiais - BOM', dept: 'MEP' },
  { activity: 'Cotação', dept: 'CSC' },
  { activity: 'Validação de Requisitos de Entrada', dept: 'MEP' },
  { activity: 'Papelaria (Embalagem, Etiquetas, Manuais, Guias, etc)', dept: 'MEP' },
  { activity: 'Jiga de Testes', dept: 'P&D' },
  { activity: 'Processo Produtivo', dept: 'MEP' },
  { activity: 'Lote Piloto', dept: 'MEP' },
  { activity: 'Golden Sample', dept: 'MEP' },
]
