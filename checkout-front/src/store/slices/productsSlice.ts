import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Product } from '@/types/product'
import { API_URL } from '@/utils/apiUrl'
import { logger } from '@/utils/logger'

type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface ProductsState {
  items: Product[]
  listStatus: FetchStatus
  listError: string | null
  selected: Product | null
  selectedStatus: FetchStatus
  selectedError: string | null
}

const initialState: ProductsState = {
  items: [],
  listStatus: 'idle',
  listError: null,
  selected: null,
  selectedStatus: 'idle',
  selectedError: null,
}

export const fetchProducts = createAsyncThunk<Product[]>('products/fetchAll', async () => {
  logger.info('products', 'GET /products')
  const response = await fetch(`${API_URL}/products`)
  if (!response.ok) throw new Error(`Error ${response.status}`)
  return (await response.json()) as Product[]
})

export const fetchProductById = createAsyncThunk<Product, string>(
  'products/fetchById',
  async (id) => {
    logger.info('products', `GET /products/${id}`)
    const response = await fetch(`${API_URL}/products/${id}`)
    if (!response.ok) throw new Error(`Error ${response.status}`)
    return (await response.json()) as Product
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelectedProduct(state) {
      state.selected = null
      state.selectedStatus = 'idle'
      state.selectedError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.error.message ?? 'No pudimos cargar los productos.'
      })
      .addCase(fetchProductById.pending, (state) => {
        state.selectedStatus = 'loading'
        state.selectedError = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.selectedError = action.error.message ?? 'No pudimos cargar el producto.'
      })
  },
})

export const { clearSelectedProduct } = productsSlice.actions
export const productsReducer = productsSlice.reducer
