import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import type { Product } from "@clinic/shared";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("צריך להירשם או להתחבר כדי לבצע רכישה");
        navigate("/login");
        return;
      }

      await api.post(
        "/cart",
        {
          productId: product._id,
          quantity: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate("/cart");
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 401
      ) {
        alert("עליך להתחבר כדי לבצע רכישה");
        navigate("/login");
        return;
      }
      alert("שגיאה בהוספת מוצר לסל");
    }
  };

  return (
    <div key={product._id} className="product-card">
      <div className="product-image-container">
        <img src={product.img} alt={product.name} className="product-image" />
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <button className="view-details-btn" onClick={handleAddToCart}>
          הוסף לסל
        </button>
      </div>
    </div>
  );
}
