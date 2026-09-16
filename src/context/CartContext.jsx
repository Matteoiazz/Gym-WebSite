import React, { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [lastOrder, setLastOrder] = useState(null)

  const selectPlan = useCallback((plan) => {
    setSelectedPlan(plan)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedPlan(null)
  }, [])

  const completeOrder = useCallback((order) => {
    setLastOrder(order)
  }, [])

  const value = {
    selectedPlan,
    selectPlan,
    clearSelection,
    lastOrder,
    completeOrder,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
