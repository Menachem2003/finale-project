import { createContext, useContext } from "react";
import type { CartItem } from "@clinic/shared";

interface CartContextType {
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartContext.Provider");
  }
  return context;
};

export default CartContext;
