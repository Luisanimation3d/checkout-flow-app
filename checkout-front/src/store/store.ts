import { configureStore } from '@reduxjs/toolkit'
import { checkoutReducer } from '@/store/slices/checkoutSlice'
import { productsReducer } from '@/store/slices/productsSlice'
import { transactionReducer } from '@/store/slices/transactionSlice'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    checkout: checkoutReducer,
    transaction: transactionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
