import type { Agent } from '../types';

const CATEGORY_ICON: Record<string, string> = {
  General: 'fa-robot',
  Research: 'fa-search',
  Creative: 'fa-lightbulb',
  Finance: 'fa-chart-line',
  Engineering: 'fa-cogs',
  Personal: 'fa-user-circle',
  Legal: 'fa-balance-scale',
  Medical: 'fa-notes-medical',
};

export function getAgentIconClass(agent: Agent): string {
  const raw = (agent.avatar_emoji || '').trim();

  if (raw.startsWith('fa-')) return raw;
  if (raw.startsWith('fas fa-')) return raw.replace(/^fas\s+/, '');

  return CATEGORY_ICON[agent.category] || 'fa-robot';
}
