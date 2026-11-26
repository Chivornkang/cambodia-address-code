// Readable URLs: /province/battambang, /province/battambang/mangkul-bourei (district), /province/battambang/020101 (commune)
export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const provincePath = (p) => `/province/${slug(p.en)}`
export const districtPath = (p, d) => `/province/${slug(p.en)}/${slug(d.en)}`
export const communePath = (p, c) => `/province/${slug(p.en)}/${c.code}`
export const isCommuneCode = (s) => /^\d{6}$/.test(s)
export const matchProvince = (list, key) => list?.find((p) => p.code === key || slug(p.en) === key)
