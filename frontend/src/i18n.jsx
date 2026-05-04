import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      "home": "Home",
      "products": "Products",
      "cart": "Cart",
      "login": "Login",
      "register": "Register",
      "logout": "Logout",
      "profile": "Profile",
      "orders": "Orders",
      
      // Product
      "addToCart": "Add to Cart",
      "outOfStock": "Out of Stock",
      "price": "Price",
      "category": "Category",
      "description": "Description",
      "search": "Search products...",
      "filterByCategory": "Filter by Category",
      "filterByPrice": "Filter by Price",
      "noProductsFound": "No products found",
      
      // Cart
      "shoppingCart": "Shopping Cart",
      "quantity": "Quantity",
      "total": "Total",
      "checkout": "Checkout",
      "remove": "Remove",
      "update": "Update",
      "emptyCart": "Your cart is empty",
      
      // Authentication
      "email": "Email",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "firstName": "First Name",
      "lastName": "Last Name",
      "phone": "Phone",
      "alreadyHaveAccount": "Already have an account?",
      "dontHaveAccount": "Don't have an account?",
      
      // Orders
      "orderHistory": "Order History",
      "orderStatus": "Order Status",
      "orderDate": "Order Date",
      "orderTotal": "Order Total",
      "trackOrder": "Track Order",
      "pending": "Pending",
      "processing": "Processing",
      "shipped": "Shipped",
      "delivered": "Delivered",
      "cancelled": "Cancelled",
      
      // General
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Edit",
      "delete": "Delete",
      "welcome": "Welcome to KLEIN E-commerce",
      
      // Additional
      "whyChoose": "Why Choose KLEIN?",
      "whyChooseDesc": "We're committed to providing you with the best shopping experience",
      "wideSelection": "Wide Selection",
      "wideSelectionDesc": "Choose from thousands of products across multiple categories",
      "fastDelivery": "Fast Delivery",
      "fastDeliveryDesc": "Quick and reliable delivery to your doorstep",
      "secureShopping": "Secure Shopping",
      "secureShoppingDesc": "Safe and secure payment processing",
      "support247": "24/7 Support",
      "support247Desc": "Round-the-clock customer service",
      "shopByCategory": "Shop by Category",
      "browseSelection": "Browse our wide selection of products",
      "readyToShop": "Ready to Start Shopping?",
      "joinThousands": "Join thousands of satisfied customers who trust KLEIN for their shopping needs",
      "browseProducts": "Browse Products",
      "whatCustomersSay": "What Our Customers Say",
      "realReviews": "Real reviews from real customers",
      "excellentService": "Excellent service and fast delivery! The quality of products exceeded my expectations. Will definitely shop again.",
      "verifiedBuyer": "Verified Buyer",
      "startShopping": "Start Shopping",
      "signUp": "Sign Up",
      "allCategories": "All Categories",
      "minPrice": "Min Price",
      "maxPrice": "Max Price",
      "sortBy": "Sort By",
      "nameAsc": "Name (A-Z)",
      "nameDesc": "Name (Z-A)",
      "priceAsc": "Price (Low to High)",
      "priceDesc": "Price (High to Low)",
      "filters": "Filters",
      "toKlein": "to KLEIN",
      "forKlein": "for KLEIN",
      "validEmailError": "Please enter a valid email",
      "validPhoneError": "Please enter a valid phone number",
      "passwordLengthError": "Password must be at least 6 characters",
      "confirmPasswordError": "Please confirm your password",
      "passwordsMatchError": "Passwords do not match",
      "trackCart": "Track and manage your cart",
      "noProductsYet": "Looks like you haven't added any products to your cart yet.",
      "continueShopping": "Continue Shopping",
      "orderSummary": "Order Summary",
      "subtotal": "Subtotal",
      "shipping": "Shipping",
      "free": "FREE",
      "tax": "Tax",
      "secureCheckout": "Secure checkout powered by Stripe",
      "securePayment": "Secure Payment",
      "securePaymentDesc": "Your payment information is encrypted and secure",
      "easyReturns": "Easy Returns",
      "easyReturnsDesc": "30-day return policy on all items",
      "customerSupport": "Customer Support",
      "customerSupportDesc": "24/7 support for all your shopping needs"
    }
  },
  fr: {
    translation: {
      // Navigation
      "home": "Accueil",
      "products": "Produits",
      "cart": "Panier",
      "login": "Connexion",
      "register": "S'inscrire",
      "logout": "Déconnexion",
      "profile": "Profil",
      "orders": "Commandes",
      
      // Product
      "addToCart": "Ajouter au Panier",
      "outOfStock": "Rupture de Stock",
      "price": "Prix",
      "category": "Catégorie",
      "description": "Description",
      "search": "Rechercher des produits...",
      "filterByCategory": "Filtrer par Catégorie",
      "filterByPrice": "Filtrer par Prix",
      "noProductsFound": "Aucun produit trouvé",
      
      // Cart
      "shoppingCart": "Panier d'Achat",
      "quantity": "Quantité",
      "total": "Total",
      "checkout": "Commander",
      "remove": "Supprimer",
      "update": "Mettre à jour",
      "emptyCart": "Votre panier est vide",
      
      // Authentication
      "email": "Email",
      "password": "Mot de passe",
      "confirmPassword": "Confirmer le Mot de passe",
      "firstName": "Prénom",
      "lastName": "Nom",
      "phone": "Téléphone",
      "alreadyHaveAccount": "Vous avez déjà un compte?",
      "dontHaveAccount": "Vous n'avez pas de compte?",
      
      // Orders
      "orderHistory": "Historique des Commandes",
      "orderStatus": "Statut de la Commande",
      "orderDate": "Date de Commande",
      "orderTotal": "Total de la Commande",
      "trackOrder": "Suivre la Commande",
      "pending": "En attente",
      "processing": "En traitement",
      "shipped": "Expédié",
      "delivered": "Livré",
      "cancelled": "Annulé",
      
      // General
      "loading": "Chargement...",
      "error": "Erreur",
      "success": "Succès",
      "save": "Enregistrer",
      "cancel": "Annuler",
      "edit": "Modifier",
      "delete": "Supprimer",
      "welcome": "Bienvenue sur KLEIN E-commerce",

      // Additional
      "whyChoose": "Pourquoi choisir KLEIN?",
      "whyChooseDesc": "Nous nous engageons à vous offrir la meilleure expérience d'achat",
      "wideSelection": "Vaste Sélection",
      "wideSelectionDesc": "Choisissez parmi des milliers de produits dans plusieurs catégories",
      "fastDelivery": "Livraison Rapide",
      "fastDeliveryDesc": "Livraison rapide et fiable à votre porte",
      "secureShopping": "Achats Sécurisés",
      "secureShoppingDesc": "Traitement des paiements sûr et sécurisé",
      "support247": "Assistance 24/7",
      "support247Desc": "Service client disponible en permanence",
      "shopByCategory": "Acheter par Catégorie",
      "browseSelection": "Parcourez notre vaste sélection de produits",
      "readyToShop": "Prêt à commencer vos achats?",
      "joinThousands": "Rejoignez des milliers de clients satisfaits qui font confiance à KLEIN",
      "browseProducts": "Parcourir les Produits",
      "whatCustomersSay": "Ce que disent nos clients",
      "realReviews": "De vrais avis de vrais clients",
      "excellentService": "Service excellent et livraison rapide ! La qualité des produits a dépassé mes attentes. Je recommanderai certainement.",
      "verifiedBuyer": "Acheteur Vérifié",
      "startShopping": "Commencer vos Achats",
      "signUp": "S'inscrire",
      "allCategories": "Toutes les Catégories",
      "minPrice": "Prix Min",
      "maxPrice": "Prix Max",
      "sortBy": "Trier par",
      "nameAsc": "Nom (A-Z)",
      "nameDesc": "Nom (Z-A)",
      "priceAsc": "Prix (Croissant)",
      "priceDesc": "Prix (Décroissant)",
      "filters": "Filtres",
      "toKlein": "à KLEIN",
      "forKlein": "pour KLEIN",
      "validEmailError": "Veuillez entrer une adresse e-mail valide",
      "validPhoneError": "Veuillez entrer un numéro de téléphone valide",
      "passwordLengthError": "Le mot de passe doit contenir au moins 6 caractères",
      "confirmPasswordError": "Veuillez confirmer votre mot de passe",
      "passwordsMatchError": "Les mots de passe ne correspondent pas",
      "trackCart": "Suivez et gérez votre panier",
      "noProductsYet": "Il semble que vous n'ayez pas encore ajouté de produits à votre panier.",
      "continueShopping": "Continuer vos achats",
      "orderSummary": "Résumé de la Commande",
      "subtotal": "Sous-total",
      "shipping": "Livraison",
      "free": "GRATUIT",
      "tax": "Taxes",
      "secureCheckout": "Paiement sécurisé par Stripe",
      "securePayment": "Paiement Sécurisé",
      "securePaymentDesc": "Vos informations de paiement sont cryptées et sécurisées",
      "easyReturns": "Retours Faciles",
      "easyReturnsDesc": "Politique de retour de 30 jours sur tous les articles",
      "customerSupport": "Service Client",
      "customerSupportDesc": "Assistance 24/7 pour tous vos besoins d'achat"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
