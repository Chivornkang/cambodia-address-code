// Readable URLs: /province/battambang, /district/battambang/mangkul-bourei
export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const provincePath = (p) => `/province/${slug(p.en)}`
export const districtPath = (p, d) => `/district/${slug(p.en)}/${slug(d.en)}`
export const matchProvince = (list, key) => list?.find((p) => p.code === key || slug(p.en) === key)
