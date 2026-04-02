export interface Language {
  name: string;
  code: string;
  nativeName: string;
}

export const INDIAN_LANGUAGES: Language[] = [
  { name: "Hindi", code: "hi-IN", nativeName: "हिन्दी" },
  { name: "Bengali", code: "bn-IN", nativeName: "বাংলা" },
  { name: "Tamil", code: "ta-IN", nativeName: "தமிழ்" },
  { name: "Telugu", code: "te-IN", nativeName: "తెలుగు" },
  { name: "Marathi", code: "mr-IN", nativeName: "मराठी" },
  { name: "Gujarati", code: "gu-IN", nativeName: "ગુજરાતી" },
  { name: "Kannada", code: "kn-IN", nativeName: "ಕನ್ನಡ" },
  { name: "Malayalam", code: "ml-IN", nativeName: "മലയാളം" },
  { name: "Punjabi", code: "pa-IN", nativeName: "ਪੰਜਾਬੀ" },
  { name: "Odia", code: "or-IN", nativeName: "ଓଡ଼ିଆ" },
  { name: "Urdu", code: "ur-IN", nativeName: "اردو" },
  { name: "Assamese", code: "as-IN", nativeName: "অসমীয়া" },
  { name: "Sanskrit", code: "sa-IN", nativeName: "संस्कृतम्" },
];

export const getLanguageByName = (name: string) =>
  INDIAN_LANGUAGES.find((l) => l.name === name);

export const getLanguageCode = (name: string) =>
  getLanguageByName(name)?.code ?? "hi-IN";
