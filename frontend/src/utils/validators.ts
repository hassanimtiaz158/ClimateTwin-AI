export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateScenarioName(name: string): boolean {
  return name.trim().length >= 3 && name.trim().length <= 100;
}

export function validateYearRange(start: number, end: number): boolean {
  return start >= 2024 && end <= 2035 && end > start;
}

export function validateScenarioConfig(config: {
  name: string;
  actions: string[];
  startYear: number;
  endYear: number;
}): { valid: boolean; error?: string } {
  if (!validateScenarioName(config.name)) {
    return { valid: false, error: 'Scenario name must be 3-100 characters' };
  }
  if (config.actions.length === 0) {
    return { valid: false, error: 'Select at least one action' };
  }
  if (!validateYearRange(config.startYear, config.endYear)) {
    return { valid: false, error: 'Invalid year range (2024-2035)' };
  }
  return { valid: true };
}
