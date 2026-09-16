// Source of truth for pricing. Never trust plan prices sent by the client.
export const PLANS = {
  single: { id: 'single', name: 'Ingresso Singolo', price: 7, billing: 'one-time' },
  monthly: { id: 'monthly', name: 'Mensile', price: 40, billing: 'monthly' },
  annual: { id: 'annual', name: 'Annuale', price: 29, billing: 'annual' },
}
