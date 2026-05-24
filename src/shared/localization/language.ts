export type AppLanguage = "en" | "am" | "om";
export type ApiLanguage = "en" | "am" | "oro";

/** Map app locale codes to API / database question locale keys. */
export function toApiLanguage(lang: string): ApiLanguage {
  if (lang === "om" || lang === "oro") return "oro";
  if (lang === "am") return "am";
  return "en";
}

/** BCP-47 locale for date/time formatting. */
export function getDateLocale(lang: string): string {
  if (lang === "am") return "am-ET";
  if (lang === "om") return "om-ET";
  return "en-US";
}

export const APP_LANGUAGES: { value: AppLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "am", label: "አማርኛ" },
  { value: "om", label: "Afaan Oromoo" },
];
