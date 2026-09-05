import type { TransactionOutcome } from '@/types/transaction'

const OUTCOME_WEIGHTS: { outcome: TransactionOutcome; weight: number }[] = [
  { outcome: 'approved', weight: 0.6 },
  { outcome: 'failed', weight: 0.25 },
  { outcome: 'pending', weight: 0.15 },
]

// Mock temporal: el resultado real debería venir de la respuesta de Wompi vía el backend.
export const simulateTransactionOutcome = (): TransactionOutcome => {
  const random = Math.random()
  let cumulative = 0

  for (const { outcome, weight } of OUTCOME_WEIGHTS) {
    cumulative += weight
    if (random <= cumulative) return outcome
  }

  return 'approved'
}
