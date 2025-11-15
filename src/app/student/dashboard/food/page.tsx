"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { motion } from "framer-motion";
import { toastMessages } from "@/lib/toast-messages";

interface FoodMenuItem {
  menuId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

interface OrderItem {
  menuId: string;
  name: string;
  quantity: number;
  price: number;
}

interface FoodOrder {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function FoodPage() {
  const router = useRouter();
  const [menu, setMenu] = useState<FoodMenuItem[]>([]);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/food", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMenu(data.menu || []);
        setOrders(data.orders || []);
      } else {
        toastMessages.food.fetchError();
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toastMessages.food.fetchError();
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: FoodMenuItem) => {
    const existingItem = cart.find((i) => i.menuId === item.menuId);
    if (existingItem) {
      setCart(
        cart.map((i) =>
          i.menuId === item.menuId ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          menuId: item.menuId,
          name: item.name,
          quantity: 1,
          price: item.price,
        },
      ]);
    }
  };

  const updateQuantity = (menuId: string, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter((i) => i.menuId !== menuId));
    } else {
      setCart(
        cart.map((i) => (i.menuId === menuId ? { ...i, quantity } : i))
      );
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toastMessages.general.validationError("Your cart is empty!");
      return;
    }

    setOrdering(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: cart }),
      });

      if (response.ok) {
        toastMessages.food.orderSuccess();
        setCart([]);
        fetchData();
        setActiveTab("orders");
      } else {
        toastMessages.food.orderError();
      }
    } catch (error) {
      console.error("Order error:", error);
      toastMessages.food.orderError();
    } finally {
      setOrdering(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout type="student" title="Food Orders" subtitle="Order food from the hostel menu">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("menu")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === "menu"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Menu
              {cart.length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === "orders"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Orders
            </button>
          </nav>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : activeTab === "menu" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Items */}
            <div className="lg:col-span-2">
              {menu.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 text-center border border-neutral-200/50">
                  <p className="text-gray-600">
                    No menu items available at the moment.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Admin needs to add menu items.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menu
                    .filter((item) => item.available)
                    .map((item) => (
                      <motion.div
                        key={item.menuId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50 hover:shadow-xl transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {item.category}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            ₹{item.price}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          {item.description}
                        </p>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full py-2 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-lg font-semibold transition-all duration-200"
                        >
                          Add to Cart
                        </button>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
              <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50 sticky top-4">
                <h2 className="text-xl font-light tracking-tight mb-4">Your Cart</h2>

                {cart.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    Cart is empty
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cart.map((item) => (
                        <div
                          key={item.menuId}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              ₹{item.price} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.menuId, item.quantity - 1)
                              }
                              className="px-2 py-1 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all duration-200"
                            >
                              -
                            </button>
                            <span className="font-medium">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.menuId, item.quantity + 1)
                              }
                              className="px-2 py-1 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all duration-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-lg">Total:</span>
                        <span className="font-bold text-xl text-green-600">
                          ₹{getTotalAmount()}
                        </span>
                      </div>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={ordering}
                        className="w-full py-3 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200"
                      >
                        {ordering ? "Placing Order..." : "Place Order"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50">
            <h2 className="text-2xl font-light tracking-tight mb-6">Order History</h2>

            {orders.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No orders yet
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div
                    key={order.orderId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-2xl p-6 bg-white/40 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">Order #{order.orderId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm rounded-full capitalize ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg text-green-600">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
