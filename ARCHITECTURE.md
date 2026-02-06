# ארכיטקטורת המערכת ותרשימי זרימה

## תרשים ארכיטקטורה כללי

```mermaid
graph TB
    subgraph Client[Frontend - React + Vite]
        UI[React Components]
        Router[React Router]
        Context[Context API]
        Axios[Axios HTTP Client]
    end
    
    subgraph Backend[NestJS Backend]
        Controllers[Controllers]
        Services[Services]
        Guards[Auth Guards]
        DTOs[DTOs]
    end
    
    subgraph Database[(MongoDB)]
        Users[(Users)]
        Products[(Products)]
        Orders[(Orders)]
        Cart[(Cart)]
        Doctors[(Doctors)]
        Team[(Team)]
        Referrals[(Referrals)]
    end
    
    subgraph External[External Services]
        PayPal[PayPal API]
        Email[SMTP Email]
    end
    
    UI --> Router
    Router --> Context
    Context --> Axios
    Axios -->|HTTP REST API| Controllers
    Controllers --> Guards
    Guards --> Services
    Services --> DTOs
    Services --> Database
    Services --> PayPal
    Services --> Email
    
    Database --> Users
    Database --> Products
    Database --> Orders
    Database --> Cart
    Database --> Doctors
    Database --> Team
    Database --> Referrals
```

## תרשים זרימת תשלום PayPal

```mermaid
sequenceDiagram
    participant User as משתמש
    participant Frontend as Frontend<br/>React
    participant Backend as Backend<br/>NestJS
    participant PayPalSDK as PayPal SDK<br/>Frontend
    participant PayPalAPI as PayPal API
    participant DB as MongoDB
    
    User->>Frontend: מעבר לעמוד תשלום
    Frontend->>Frontend: טעינת PayPal SDK
    Frontend->>Backend: GET /cart
    Backend->>DB: שליפת סל קניות
    DB-->>Backend: נתוני סל
    Backend-->>Frontend: נתוני סל
    
    User->>Frontend: לחיצה על "המשך לתשלום"
    Frontend->>Backend: POST /orders
    Backend->>DB: יצירת הזמנה
    DB-->>Backend: Order ID
    
    Backend->>PayPalAPI: createOrder (body)
    PayPalAPI-->>Backend: PayPal Order ID
    
    Backend-->>Frontend: PayPal Order ID
    Frontend->>PayPalSDK: יצירת כפתור PayPal
    PayPalSDK-->>Frontend: כפתור PayPal מוכן
    
    User->>PayPalSDK: לחיצה על כפתור PayPal
    PayPalSDK->>PayPalAPI: אישור תשלום
    PayPalAPI-->>PayPalSDK: אישור תשלום
    
    PayPalSDK->>Frontend: onApprove callback
    Frontend->>Backend: POST /orders/:id/payment/capture
    Backend->>PayPalAPI: captureOrder (PayPal Order ID)
    PayPalAPI-->>Backend: פרטי תשלום
    
    Backend->>DB: עדכון הזמנה - סטטוס "paid"
    Backend->>DB: ניקוי סל קניות
    Backend-->>Frontend: אישור תשלום
    
    Frontend->>Frontend: מעבר לעמוד אישור הזמנה
    Frontend-->>User: הצגת פרטי הזמנה
```

## תרשים מבנה מודולים - Backend

```mermaid
graph LR
    subgraph AppModule[App Module]
        Auth[Auth Module]
        Users[Users Module]
        Products[Products Module]
        Cart[Cart Module]
        Orders[Orders Module]
        Categories[Categories Module]
        Doctors[Doctors Module]
        Appointments[Appointments Module]
        Services[Services Module]
        Referrals[Referrals Module]
        Team[Team Module]
        Email[Email Module]
        Payment[Payment Module]
    end
    
    subgraph PaymentModule[Payment Module]
        PayPalService[PayPal Service]
        PaymentModuleFile[Payment Module]
    end
    
    subgraph OrdersModule[Orders Module]
        OrdersController[Orders Controller]
        OrdersService[Orders Service]
        OrderSchema[Order Schema]
    end
    
    AppModule --> PaymentModule
    AppModule --> OrdersModule
    OrdersModule --> PaymentModule
    PaymentModule --> PayPalService
    OrdersService --> PayPalService
```

## תרשים מבנה Frontend

```mermaid
graph TB
    subgraph App[App Component]
        Router[React Router]
        AuthContext[Auth Context]
        CartContext[Cart Context]
    end
    
    subgraph Pages[Pages]
        Home[Home Page]
        Products[Products Page]
        Cart[Cart Page]
        Checkout[Checkout Page]
        OrderConfirmation[Order Confirmation]
        Admin[Admin Dashboard]
        Team[Team Page]
        Contact[Contact Page]
    end
    
    subgraph CheckoutFlow[Checkout Flow]
        LoadCart[טעינת סל]
        LoadPayPalSDK[טעינת PayPal SDK]
        CreateOrder[יצירת הזמנה]
        PayPalButton[כפתור PayPal]
        CapturePayment[Capture תשלום]
        Redirect[מעבר לאישור]
    end
    
    Router --> Home
    Router --> Products
    Router --> Cart
    Router --> Checkout
    Router --> OrderConfirmation
    Router --> Admin
    Router --> Team
    Router --> Contact
    
    Checkout --> LoadCart
    Checkout --> LoadPayPalSDK
    Checkout --> CreateOrder
    Checkout --> PayPalButton
    PayPalButton --> CapturePayment
    CapturePayment --> Redirect
    Redirect --> OrderConfirmation
    
    App --> AuthContext
    App --> CartContext
    AuthContext --> Admin
    CartContext --> Cart
    CartContext --> Checkout
```

## תרשים זרימת נתונים - יצירת הזמנה

```mermaid
flowchart TD
    Start([משתמש לוחץ 'המשך לתשלום']) --> ValidateCart{סל תקין?}
    ValidateCart -->|לא| Error1[שגיאה: סל ריק]
    ValidateCart -->|כן| CheckPayPal{PayPal SDK נטען?}
    
    CheckPayPal -->|לא| Error2[שגיאה: PayPal לא מוגדר]
    CheckPayPal -->|כן| CreateOrder[POST /orders]
    
    CreateOrder --> ValidateOrder{הזמנה נוצרה?}
    ValidateOrder -->|לא| Error3[שגיאה ביצירת הזמנה]
    ValidateOrder -->|כן| CreatePayPalOrder[POST /orders/:id/payment/create]
    
    CreatePayPalOrder --> PayPalCreate[PayPalService.createOrder]
    PayPalCreate --> PayPalAPI[PayPal API]
    PayPalAPI -->|PayPal Order ID| SetOrderId[שמירת PayPal Order ID]
    
    SetOrderId --> RenderButton[הצגת כפתור PayPal]
    RenderButton --> WaitUser[ממתין ללחיצת משתמש]
    
    WaitUser --> UserClick[משתמש לוחץ PayPal]
    UserClick --> PayPalApprove[PayPal onApprove]
    PayPalApprove --> CapturePayment[POST /orders/:id/payment/capture]
    
    CapturePayment --> PayPalCapture[PayPalService.captureOrder]
    PayPalCapture --> PayPalAPI2[PayPal API Capture]
    PayPalAPI2 -->|תשלום הושלם| UpdateOrder[עדכון הזמנה - paid]
    
    UpdateOrder --> ClearCart[ניקוי סל]
    ClearCart --> Success[מעבר לעמוד אישור]
    Success --> End([סיום])
    
    Error1 --> End
    Error2 --> End
    Error3 --> End
```

## תרשים מבנה נתונים - Order

```mermaid
erDiagram
    User ||--o{ Order : creates
    User ||--|| Cart : has
    Order ||--o{ OrderItem : contains
    Product ||--o{ OrderItem : referenced_in
    
    User {
        string _id
        string name
        string email
        string role
        string password
    }
    
    Cart {
        string _id
        ObjectId userId
        array items
    }
    
    Order {
        string _id
        ObjectId userId
        array items
        number total
        string status
        string paymentMethod
        string paypalOrderId
        date createdAt
    }
    
    OrderItem {
        ObjectId productId
        number quantity
        number price
    }
    
    Product {
        string _id
        string name
        number price
        string category
        string img
    }
```

## תרשים אבטחה - Authentication Flow

```mermaid
sequenceDiagram
    participant User as משתמש
    participant Frontend as Frontend
    participant Backend as Backend
    participant AuthService as Auth Service
    participant DB as MongoDB
    
    User->>Frontend: התחברות
    Frontend->>Backend: POST /auth/login
    Backend->>AuthService: login(email, password)
    AuthService->>DB: חיפוש משתמש
    DB-->>AuthService: נתוני משתמש
    AuthService->>AuthService: בדיקת סיסמה (bcrypt)
    AuthService->>AuthService: יצירת JWT token
    AuthService-->>Backend: Token + User Data
    Backend-->>Frontend: Token + User Data
    Frontend->>Frontend: שמירת Token ב-localStorage
    
    Note over Frontend: כל בקשה עתידית תכלול<br/>Authorization: Bearer {token}
    
    User->>Frontend: גישה לעמוד מוגן
    Frontend->>Backend: Request + Token
    Backend->>Backend: JwtAuthGuard - אימות Token
    Backend->>Backend: RolesGuard - בדיקת הרשאות
    Backend-->>Frontend: נתונים מוגנים
```

## תרשים סביבת פיתוח - Nx Monorepo

```mermaid
graph TB
    subgraph Monorepo[Nx Monorepo]
        subgraph Apps[Applications]
            FrontendApp[clinic-frontend<br/>React + Vite]
            BackendApp[clinic-backend<br/>NestJS + Express]
        end
        
        subgraph Libs[Libraries]
            SharedLib[shared<br/>TypeScript Types]
        end
        
        subgraph Config[Configuration]
            NxConfig[nx.json]
            TSConfig[tsconfig.base.json]
            PackageJson[package.json]
            EnvFile[.env]
        end
    end
    
    FrontendApp --> SharedLib
    BackendApp --> SharedLib
    FrontendApp --> Config
    BackendApp --> Config
    
    FrontendApp -->|Port 4200| Browser[Browser]
    BackendApp -->|Port 3000| API[API Server]
    API --> MongoDB[(MongoDB<br/>Port 27017)]
    API --> PayPal[PayPal API]
    API --> SMTP[SMTP Server]
```

---

## הערות על התרשימים

### ארכיטקטורה כללית
- **Frontend**: React 19 עם Vite, React Router, Context API
- **Backend**: NestJS עם Express, MongoDB, JWT Authentication
- **Database**: MongoDB עם Mongoose ODM
- **External Services**: PayPal API, SMTP Email

### זרימת תשלום PayPal
1. המשתמש מעבר לעמוד תשלום
2. טעינת PayPal SDK ב-Frontend
3. יצירת הזמנה ב-Backend
4. יצירת PayPal Order דרך PayPal API
5. הצגת כפתור PayPal
6. המשתמש מאשר תשלום ב-PayPal
7. Capture התשלום דרך PayPal API
8. עדכון הזמנה וניקוי הסל
9. מעבר לעמוד אישור

### אבטחה
- JWT Tokens לאימות משתמשים
- Role-based Authorization (admin/user)
- Password hashing עם bcrypt
- Guards להגנה על endpoints

### סביבת פיתוח
- Nx Monorepo לניהול הפרויקט
- Shared Library לטייפים משותפים
- Environment Variables לניהול הגדרות
- TypeScript לכל הקוד
