const DEFAULT_FISCAL_SETTINGS = {
  brandName: "",
  legalName: "",
  rtn: "",
  phone: "",
  address: "",
  email: "",
  cai: "",
  authorizationRangeStart: "",
  authorizationRangeEnd: "",
  nextInvoiceNumber: "",
  emissionDeadline: "",
  copyLegend: "ORIGINAL: CLIENTE / COPIA: EMISOR",
  defaultCustomerRTN: "00000000000000",
  taxRate: 0.15,
  categoryRates: {
    appetizers: 0.15,
    main_courses: 0.15,
    beverages: 0.15,
    desserts: 0.15
  }
};

function toNumberOrFallback(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mergeFiscalSettings(remoteSettings = {}) {
  const categoryRates = remoteSettings && typeof remoteSettings.categoryRates === "object"
    ? remoteSettings.categoryRates
    : {};

  return {
    ...DEFAULT_FISCAL_SETTINGS,
    ...remoteSettings,
    taxRate: toNumberOrFallback(remoteSettings.taxRate, DEFAULT_FISCAL_SETTINGS.taxRate),
    categoryRates: {
      ...DEFAULT_FISCAL_SETTINGS.categoryRates,
      ...categoryRates,
      appetizers: toNumberOrFallback(categoryRates.appetizers, DEFAULT_FISCAL_SETTINGS.categoryRates.appetizers),
      main_courses: toNumberOrFallback(categoryRates.main_courses, DEFAULT_FISCAL_SETTINGS.categoryRates.main_courses),
      beverages: toNumberOrFallback(categoryRates.beverages, DEFAULT_FISCAL_SETTINGS.categoryRates.beverages),
      desserts: toNumberOrFallback(categoryRates.desserts, DEFAULT_FISCAL_SETTINGS.categoryRates.desserts)
    }
  };
}

function hasPendingFiscalPlaceholders(settings) {
  const requiredFields = [
    "brandName",
    "legalName",
    "rtn",
    "phone",
    "address",
    "cai",
    "authorizationRangeStart",
    "authorizationRangeEnd",
    "nextInvoiceNumber",
    "emissionDeadline"
  ];

  return requiredFields.some((field) => !String(settings?.[field] || "").trim());
}

export { DEFAULT_FISCAL_SETTINGS, mergeFiscalSettings, hasPendingFiscalPlaceholders };
