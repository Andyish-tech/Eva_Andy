import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Star, ArrowRight, Package, Truck, Shield, Headphones } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();

  const categories = [
    { name: "Clothing", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop" },
    { name: "Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop" },
    { name: "Bags", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop" },
    { name: "Jewellery", image: "https://images.unsplash.com/photo-1596944924616-7b38e7b24696?w=300&h=300&fit=crop" },
    { name: "Cosmetics", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop" },
    { name: "Household", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-red-50 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24 flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 z-10 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
              {t('welcome')}
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-lg mx-auto lg:mx-0">
              Discover amazing products at unbeatable prices. Shop from our wide range of clothing, shoes, bags, and more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/products"
                className="bg-primary-500 text-white px-8 py-4 text-lg font-bold rounded-full hover:bg-primary-600 hover:scale-105 transition-all duration-300 shadow-float inline-flex items-center"
              >
                {t('startShopping')}
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-1/2 mt-12 lg:mt-0 relative">
            <div className="relative w-full max-w-lg mx-auto">
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop" 
                alt="Shopping" 
                className="rounded-[3rem] object-cover shadow-float aspect-square"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-3xl shadow-float flex items-center gap-4">
                <div className="bg-primary-100 p-3 rounded-full text-primary-500">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Fast Delivery</p>
                  <p className="text-sm text-gray-500">Right to your door</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Carousel (DoorDash style) */}
      <section className="py-16 container mx-auto px-4 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
          {t('shopByCategory')}
        </h2>
        
        <div className="flex overflow-x-auto gap-6 pb-6 hide-scrollbar snap-x">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={`/products?category=${category.name.toLowerCase()}`}
              className="flex-none w-32 sm:w-40 flex flex-col items-center group snap-start"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 shadow-md group-hover:shadow-float transition-all bg-gray-100 border-4 border-transparent group-hover:border-primary-100">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-center font-bold text-gray-900 group-hover:text-primary-500 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: <Package className="w-10 h-10" />, titleKey: "wideSelection", descKey: "wideSelectionDesc" },
              { icon: <Shield className="w-10 h-10" />, titleKey: "secureShopping", descKey: "secureShoppingDesc" },
              { icon: <Headphones className="w-10 h-10" />, titleKey: "support247", descKey: "support247Desc" }
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center group bg-gray-50 p-8 rounded-[2rem] hover:shadow-float hover:-translate-y-2 transition-all duration-500 border border-gray-100">
                <div className="bg-primary-100 text-primary-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-lg text-gray-600 font-medium">
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-primary-500 rounded-[3rem] p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between text-white relative overflow-hidden shadow-float">
            <div className="z-10 text-center lg:text-left mb-8 lg:mb-0">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                {t('readyToShop')}
              </h2>
              <p className="text-xl opacity-90 max-w-xl">
                {t('joinThousands')}
              </p>
            </div>
            <div className="z-10">
              <Link
                to="/products"
                className="bg-white text-primary-500 px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 inline-flex items-center"
              >
                <ShoppingCart className="mr-3 w-6 h-6" />
                {t('browseProducts')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
