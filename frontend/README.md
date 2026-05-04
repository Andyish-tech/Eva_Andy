# KLEIN E-commerce Frontend

A modern, responsive React.js frontend for the KLEIN e-commerce platform with multi-language support and comprehensive e-commerce features.

## Features

### 🛍️ Product Browsing
- **Product Catalog**: Browse products with search and filtering capabilities
- **Advanced Search**: Full-text search with category and price filters
- **Product Details**: Detailed product pages with image galleries
- **Responsive Design**: Mobile-first design that works on all devices

### 👤 User Authentication
- **Secure Login/Registration**: JWT-based authentication with form validation
- **User Profile**: Manage personal information and preferences
- **Protected Routes**: Route guards for authenticated pages
- **Session Management**: Automatic token refresh and logout

### 🛒 Shopping Cart
- **Add to Cart**: Real-time cart updates with stock validation
- **Quantity Management**: Update/remove items with intuitive controls
- **Cart Summary**: Live price calculations with shipping and tax
- **Persistent Cart**: Cart data synced with backend

### 📦 Order Management
- **Order History**: View all past orders with detailed information
- **Order Tracking**: Real-time status updates and timeline
- **Order Details**: Complete order breakdown with items and shipping info
- **Quick Actions**: Download invoices, contact support, returns

### 🌍 Multi-language Support
- **i18n Integration**: English and French language support
- **Dynamic Language Switching**: Change language without page reload
- **Localized Content**: All UI elements translated
- **RTL Support**: Ready for right-to-left languages

### 🎨 Modern UI/UX
- **Tailwind CSS**: Utility-first styling for consistent design
- **Lucide Icons**: Beautiful, consistent icon set
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Professional loading indicators
- **Error Handling**: Comprehensive error management

## Tech Stack

- **Frontend**: React 18 with functional components and hooks
- **Routing**: React Router v6 for navigation
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React icon library
- **HTTP Client**: Axios with interceptors
- **Internationalization**: react-i18next
- **Notifications**: react-toastify
- **State Management**: React Context API

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Main navigation component
│   └── ProtectedRoute.jsx # Authentication wrapper
├── contexts/           # React Context providers
│   ├── AuthContext.jsx # Authentication state management
│   └── CartContext.jsx # Shopping cart state management
├── pages/             # Page components
│   ├── Home.jsx       # Homepage
│   ├── Products.jsx   # Product listing with search/filter
│   ├── ProductDetail.jsx # Individual product page
│   ├── Cart.jsx       # Shopping cart
│   ├── Login.jsx      # User login
│   ├── Register.jsx   # User registration
│   ├── Profile.jsx    # User profile management
│   └── Orders.jsx     # Order history and tracking
├── services/          # API service layer
│   └── api.jsx        # Axios configuration and API endpoints
├── App.jsx            # Main app component with routing
├── index.jsx          # App entry point
├── i18n.jsx           # Internationalization configuration
└── index.css          # Global styles with Tailwind
```

## Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Configure the backend URL**
Edit `.env` and set your backend API URL:
```
REACT_APP_API_URL=http://localhost:5000/api
```

5. **Start the development server**
```bash
npm start
```

The app will be available at `http://localhost:3000`

## API Integration

The frontend is fully integrated with the KLEIN backend API:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Token validation
- `POST /api/auth/logout` - User logout

### Product Endpoints
- `GET /api/products` - Get products with search/filter
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - Get all categories

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove item

### Order Endpoints
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/checkout` - Process checkout

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Features Implementation

### Search & Filtering
- Real-time search with debouncing
- Category-based filtering
- Price range filtering
- Sorting options (name, price, rating)
- URL parameter persistence

### Authentication Flow
- JWT token management
- Automatic token refresh
- Protected route implementation
- User session persistence

### Shopping Cart
- Real-time cart synchronization
- Stock validation
- Price calculations
- Quantity management
- Local storage fallback

### Order Management
- Order status tracking
- Timeline visualization
- Detailed order information
- Quick action buttons

### Multi-language Support
- Dynamic language switching
- Persistent language preference
- Comprehensive translations
- Easy translation management

## Testing & Quality

### Code Quality
- ESLint configuration for code consistency
- Functional components with hooks
- Proper error boundaries
- Loading states and error handling

### Performance
- Code splitting with React.lazy
- Image optimization
- Efficient re-renders with React.memo
- Optimized bundle size

### Accessibility
- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```
REACT_APP_API_URL=https://your-api-domain.com/api
NODE_ENV=production
```

### Deployment Options
- **Static Hosting**: Deploy to Netlify, Vercel, or GitHub Pages
- **CDN**: Upload build files to AWS S3 with CloudFront
- **Docker**: Use nginx to serve static files
- **Server-side**: Deploy with Express static file serving

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Contributing

1. Follow the existing code style and patterns
2. Use functional components and hooks
3. Implement proper error handling
4. Add loading states for async operations
5. Test on different screen sizes
6. Ensure accessibility compliance

## License

MIT License - see LICENSE file for details
