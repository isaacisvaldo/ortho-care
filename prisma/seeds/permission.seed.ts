export const internalPermissions = [

  // Gestão Financeira
  { name: 'payments.view', label: 'Visualizar Pagamentos' },
  { name: 'payments.process', label: 'Processar Pagamentos' },
  { name: 'invoices.view', label: 'Visualizar Faturas' },
  { name: 'invoices.generate', label: 'Gerar Faturas' },

  // Relatórios e Auditoria
  { name: 'reports.view', label: 'Visualizar Relatórios' },
  { name: 'audit.logs.view', label: 'Visualizar Logs de Auditoria' },

  // Configurações do Sistema
  { name: 'settings.view', label: 'Visualizar Configurações' },
  { name: 'settings.update', label: 'Atualizar Configurações' },
  
  // Acesso total (meta permissão)
  { name: 'full.access', label: 'Acesso Total' },
];