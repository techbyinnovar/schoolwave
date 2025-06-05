// Utility to replace template variables with actual values
// Usage: replaceTemplateVariables(templateString, { agent: { ... }, lead: { ... } })

export interface AgentVars {
  name: string;
  email: string;
  phone: string;
}

export interface LeadVars {
  schoolName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
}

export interface TemplateVars {
  agent: AgentVars;
  lead: LeadVars;
}

/**
 * Replace {{agent.name}}, {{lead.schoolName}}, etc. in a template string with actual values.
 */
export function replaceTemplateVariables(
  template: string,
  vars: TemplateVars
): string {
  if (!template) return '';
  let result = template;
  // Replace agent variables
  result = result.replace(/{{agent\.(\w+)}}/g, (_, key) => {
    return (vars.agent as any)[key] ?? '';
  });
  // Replace lead variables
  result = result.replace(/{{lead\.(\w+)}}/g, (_, key) => {
    return (vars.lead as any)[key] ?? '';
  });
  return result;
}
