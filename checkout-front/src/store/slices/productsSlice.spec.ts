import { configureStore } from '@reduxjs/toolkit'
import type { Product } from '@/types/product'
import {
  clearSelectedProduct,
  fetchProductById,
  fetchProducts,
  productsReducer,
} from './productsSlice'

const mockProduct: Product = {
  id: 'p1',
  title: 'Speaker',
  description: 'A speaker',
  price: 100000,
  currency: 'COP',
  stock: 5,
  images: ['a.jpg'],
  deliveryFee: 9000,
}

const makeStore = () => configureStore({ reducer: { products: productsReducer } })

describe('productsSlice', () => {
  let fetchMock: jest.Mock

  beforeEach(() => {
    fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it('clearSelectedProduct resets the selected product state', () => {
    const store = makeStore()
    store.dispatch({
      type: fetchProductById.fulfilled.type,
      payload: mockProduct,
    })

    store.dispatch(clearSelectedProduct())

    const state = store.getState().products
    expect(state.selected).toBeNull()
    expect(state.selectedStatus).toBe('idle')
  })

  describe('fetchProducts', () => {
    it('sets listStatus to succeeded and stores the items on success', async () => {
      fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve([mockProduct]) })
      const store = makeStore()

      await store.dispatch(fetchProducts())

      const state = store.getState().products
      expect(state.listStatus).toBe('succeeded')
      expect(state.items).toEqual([mockProduct])
      expect(state.listError).toBeNull()
    })

    it('sets listStatus to failed with an error message when the request fails', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) })
      const store = makeStore()

      await store.dispatch(fetchProducts())

      const state = store.getState().products
      expect(state.listStatus).toBe('failed')
      expect(state.listError).toContain('500')
    })
  })

  describe('fetchProductById', () => {
    it('sets selectedStatus to succeeded and stores the product on success', async () => {
      fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockProduct) })
      const store = makeStore()

      await store.dispatch(fetchProductById('p1'))

      const state = store.getState().products
      expect(state.selectedStatus).toBe('succeeded')
      expect(state.selected).toEqual(mockProduct)
    })

    it('sets selectedStatus to failed when the product does not exist', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) })
      const store = makeStore()

      await store.dispatch(fetchProductById('missing'))

      const state = store.getState().products
      expect(state.selectedStatus).toBe('failed')
      expect(state.selectedError).toContain('404')
    })
  })
})
