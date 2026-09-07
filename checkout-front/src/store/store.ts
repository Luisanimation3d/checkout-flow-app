import { configureStore } from '@reduxjs/toolkit'
import { loadPersistedState, persistState } from '@/store/persistence'
import { checkoutReducer } from '@/store/slices/checkoutSlice'
import { productsReducer } from '@/store/slices/productsSlice'
import { transactionReducer } from '@/store/slices/transactionSlice'

const persisted = loadPersistedState()

export const store = configureStore({
  reducer: {
    products: productsReducer,
    checkout: checkoutReducer,
    transaction: transactionReducer,
  },
  preloadedState: persisted,
})

// Cada cambio de estado se refleja en localStorage — ver store/persistence.ts
// para qué se persiste y qué se redacta (nunca cardNumber/cvv).
store.subscribe(() => {
  const state = store.getState()
  persistState({ checkout: state.checkout, transaction: state.transaction })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
