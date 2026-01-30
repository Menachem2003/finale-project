import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import type { Product } from "@clinic/shared";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

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

      alert("המוצר נוסף לסל בהצלחה!");
    } catch (err: unknown) {
      console.error("Error adding to cart:", err);
      
      if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const response = err as { response?: { status?: number; data?: { message?: string } } };
        
        if (response.response?.status === 401) {
          alert("עליך להתחבר כדי לבצע רכישה");
          navigate("/login");
          return;
        }
        
        if (response.response?.status === 400) {
          const errorMessage = response.response?.data?.message || "המוצר כבר נמצא בסל";
          alert(`שגיאה: ${errorMessage}`);
          return;
        }
        
        if (response.response?.status === 404) {
          const errorMessage = response.response?.data?.message || "המוצר לא נמצא";
          alert(`שגיאה: ${errorMessage}`);
          return;
        }
        
        if (response.response?.status === 500) {
          alert("שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר או פנה לתמיכה.");
          return;
        }
        
        const errorMessage = response.response?.data?.message || "שגיאה בהוספת מוצר לסל";
        alert(`שגיאה: ${errorMessage}`);
      } else {
        alert("שגיאה בהוספת מוצר לסל. אנא נסה שוב מאוחר יותר.");
      }
    }
  };

  return (
    <div key={product._id} className="product-card" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>
      <div className="product-image-container">
        <img src={product.img} alt={product.name} className="product-image" />
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-price" style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#2c3e50', marginBottom: '1rem' }}>
          {product.price} ₪
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="view-details-btn" 
            onClick={handleViewDetails}
            style={{ flex: 1, minWidth: '120px' }}
          >
            פרטים נוספים
          </button>
          <button 
            className="buy-now-btn" 
            onClick={handleViewDetails}
            style={{ 
              flex: 1,
              minWidth: '120px',
              backgroundColor: '#e74c3c',
              padding: '0.75rem 1.5rem',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1em',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c0392b';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#e74c3c';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            קנה עכשיו
          </button>
          <button 
            className="add-to-cart-btn" 
            onClick={handleAddToCart}
            style={{ 
              flex: 1,
              minWidth: '120px',
              backgroundColor: '#27ae60',
              padding: '0.75rem 1.5rem',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1em',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#229954';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#27ae60';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            הוסף לסל
          </button>
        </div>
      </div>
    </div>
  );
}
