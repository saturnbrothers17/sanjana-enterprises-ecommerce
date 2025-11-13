# Sanjana Enterprises - Medical Equipment Ecommerce Website

A beautiful, advanced multi-page medical equipment ecommerce website built with Node.js, Express.js, and Tailwind CSS.

## 🏥 Features

### Frontend Features
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Beautiful, clean interface with Tailwind CSS
- **Interactive Elements**: Smooth animations and transitions
- **Product Catalog**: Advanced filtering, sorting, and search functionality
- **Shopping Cart**: Full cart management with quantity controls
- **User Authentication**: Login/Register with session management
- **Product Details**: Comprehensive product pages with reviews and specifications
- **Checkout Process**: Multi-step checkout with payment options

### Backend Features
- **Express.js Server**: Robust Node.js backend
- **Session Management**: Secure user sessions
- **Dynamic Routing**: SEO-friendly URLs
- **Form Handling**: Contact forms and user registration
- **Product Management**: Dynamic product catalog
- **Order Processing**: Complete checkout and order management

### Pages Included
1. **Homepage**: Hero section, featured products, testimonials
2. **Products Catalog**: Filterable product listings
3. **Product Details**: Individual product pages with reviews
4. **Shopping Cart**: Cart management and order summary
5. **Checkout**: Multi-step checkout process
6. **User Authentication**: Login and registration pages
7. **About Us**: Company information and team
8. **Contact**: Contact form and company details
9. **404 Error**: Custom error page

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd d:\ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build Tailwind CSS**
   ```bash
   npx tailwindcss -i ./public/css/input.css -o ./public/css/style.css
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Mode
For development with auto-restart:
```bash
npm run dev
```

For CSS auto-compilation:
```bash
npm run build-css
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS templating, Tailwind CSS, Alpine.js
- **Session Management**: express-session
- **Form Handling**: body-parser
- **Development**: nodemon for auto-restart

## 📱 Demo Credentials

### Admin Access
- **Email**: admin@sanjana.com
- **Password**: admin123

### Customer Access
- **Email**: Any valid email
- **Password**: Any password

## 🎨 Design Features

- **Color Scheme**: Professional medical blue theme
- **Typography**: Inter font family for modern look
- **Icons**: Font Awesome icons throughout
- **Animations**: Smooth CSS transitions and hover effects
- **Layout**: Grid-based responsive layout

## 🛒 Ecommerce Features

### Product Management
- Product catalog with categories
- Advanced filtering (category, price, rating)
- Search functionality
- Product ratings and reviews
- Stock management

### Shopping Experience
- Add to cart functionality
- Cart quantity management
- Wishlist support
- Product comparison
- Recently viewed products

### Checkout Process
- Guest and registered user checkout
- Multiple payment methods
- Shipping options
- Order summary
- Promo code support

## 📊 Sample Data

The application includes sample medical equipment data:
- Digital Blood Pressure Monitors
- Digital Thermometers
- Pulse Oximeters
- Nebulizer Machines
- Wheelchairs
- Hospital Beds

## 🔧 Customization

### Adding New Products
Edit the `products` array in `server.js` to add new products with:
- Product details (name, price, description)
- Categories and features
- Images and ratings

### Styling Changes
Modify `public/css/input.css` and rebuild with:
```bash
npx tailwindcss -i ./public/css/input.css -o ./public/css/style.css
```

### Adding New Pages
1. Create new EJS template in `views/`
2. Add route in `server.js`
3. Update navigation in `partials/header.ejs`

## 📞 Support

For support or questions about this project:
- Email: info@sanjanaenterprises.com
- Phone: +91 98765 43210

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Tailwind CSS for the utility-first CSS framework
- Font Awesome for icons
- Alpine.js for lightweight JavaScript interactions
- Express.js community for excellent documentation

---

**Sanjana Enterprises** - Your trusted partner for medical equipment needs.
