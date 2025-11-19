export type LeftoverFlag = 'rester' | 'rester_freezer';

const RESTER_REGEX = /\s*\(rester(?:\s+från\s+frysen)?\)\s*$/i;
const KCAL_REGEX = /\s*\(\d+\s*kcal\)\s*$/i;

export const stripResterSuffix = (value?: string) => {
  if (!value) return '';
  return value.replace(RESTER_REGEX, '').trim();
};

export const stripKcalSuffix = (value?: string) => {
  if (!value) return '';
  return value.replace(KCAL_REGEX, '').trim();
};

export const normalizeMealName = (value?: string) => {
  if (!value) return '';
  return stripResterSuffix(stripKcalSuffix(value));
};

export const applyLeftoverLabel = (value: string, leftovers?: LeftoverFlag | null) => {
  const base = normalizeMealName(value);
  if (leftovers === 'rester_freezer') {
    return `${base} (rester från frysen)`;
  }
  if (leftovers === 'rester') {
    return `${base} (rester)`;
  }
  return normalizeMealName(value);
};

export const getMealDuplicateKey = (meal: { recipeLink?: string; name?: string }) => {
  if (meal?.recipeLink && typeof meal.recipeLink === 'string') {
    return `link:${meal.recipeLink}`;
  }
  const normalized = normalizeMealName(meal?.name);
  return normalized ? `name:${normalized.toLowerCase()}` : null;
};

