export const STORE = {
  name: 'GCASE_Demo',
  tagline: 'ONE STOP SOLUTION FOR ALL YOUR GADGET NEEDS',
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '',
  adminEmail: (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase(),
}
