"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import { toastMessages } from "@/lib/toast-messages";

interface MenuItem {
  menuId: string;
  name: string;
  description: string;
  price: number;
  category: "breakfast" | "lunch" | "dinner" | "snacks";
  available: boolean;
  imageUrl?: string;
}

interface OrderItem {
  menuId: string;
  name: string;
  quantity: number;
  price: number;
}

interface FoodOrder {
  orderId: string;
  studentId: string;
  studentName: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "preparing" | "delivered" | "cancelled";
  createdAt: string;
  deliveredAt?: string;
}

export default function FoodMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<FoodOrder | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchStudent, setSearchStudent] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "breakfast" as "breakfast" | "lunch" | "dinner" | "snacks",
    available: true,
  });

  const categories = ["breakfast", "lunch", "dinner", "snacks"];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      // Cookies are sent automatically
      const response = await fetch("/api/admin/food");

      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.menu || []);
        setOrders(data.orders || []);
      } else {
        console.error("Failed to fetch menu items");
        setMenuItems([
          {
            menuId: "1",
            name: "Paneer Paratha",
            description: "Whole wheat paratha stuffed with spiced paneer",
            price: 40,
            category: "breakfast",
            available: true,
          },
          {
            menuId: "2",
            name: "Idli Sambar",
            description: "Steamed rice cakes with lentil curry and chutney",
            price: 35,
            category: "breakfast",
            available: true,
          },
          {
            menuId: "3",
            name: "Dal Makhani with Rice",
            description: "Creamy black lentils with steamed basmati rice",
            price: 70,
            category: "lunch",
            available: true,
          },
          {
            menuId: "4",
            name: "Chicken Biryani",
            description: "Fragrant basmati rice cooked with marinated chicken",
            price: 120,
            category: "lunch",
            available: true,
          },
          {
            menuId: "5",
            name: "Veg Thali",
            description: "Complete meal with dal, sabzi, roti, rice, and curd",
            price: 90,
            category: "lunch",
            available: true,
          },
          {
            menuId: "6",
            name: "Roti with Paneer Curry",
            description: "Indian bread with cottage cheese curry",
            price: 80,
            category: "dinner",
            available: true,
          },
          {
            menuId: "7",
            name: "Fried Rice",
            description: "Indo-Chinese style fried rice with vegetables",
            price: 65,
            category: "dinner",
            available: true,
          },
          {
            menuId: "8",
            name: "Samosa",
            description: "Crispy pastry filled with spiced potatoes",
            price: 20,
            category: "snacks",
            available: true,
          },
          {
            menuId: "9",
            name: "Veg Sandwich",
            description: "Grilled sandwich with vegetables and cheese",
            price: 40,
            category: "snacks",
            available: true,
          },
          {
            menuId: "10",
            name: "Pakora",
            description: "Crispy vegetable fritters",
            price: 30,
            category: "snacks",
            available: false,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Cookies are sent automatically
      const body = editingItem
        ? { menuId: editingItem.menuId, updates: formData }
        : formData;

      const response = await fetch("/api/admin/food", {
        method: editingItem ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        if (editingItem) {
          toastMessages.food.menuUpdateSuccess(formData.name);
        } else {
          toastMessages.food.menuCreateSuccess(formData.name);
        }
        setShowAddModal(false);
        setEditingItem(null);
        setFormData({
          name: "",
          description: "",
          price: 0,
          category: "breakfast",
          available: true,
        });
        fetchMenuItems();
      } else {
        // Update mock data
        if (editingItem) {
          setMenuItems(
            menuItems.map((item) =>
              item.menuId === editingItem.menuId
                ? { ...item, ...formData }
                : item
            )
          );
          toastMessages.food.menuUpdateSuccess(formData.name);
        } else {
          setMenuItems([
            ...menuItems,
            {
              menuId: String(menuItems.length + 1),
              ...formData,
            },
          ]);
          toastMessages.food.menuCreateSuccess(formData.name);
        }
        setShowAddModal(false);
        setEditingItem(null);
        setFormData({
          name: "",
          description: "",
          price: 0,
          category: "breakfast",
          available: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toastMessages.food.menuCreateError();
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (menuId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      // Cookies are sent automatically
      const item = menuItems.find(i => i.menuId === menuId);
      const response = await fetch(`/api/admin/food?menuId=${menuId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toastMessages.food.menuDeleteSuccess(item?.name);
        fetchMenuItems();
      } else {
        // Update mock data
        setMenuItems(menuItems.filter((item) => item.menuId !== menuId));
        toastMessages.food.menuDeleteSuccess(item?.name);
      }
    } catch (error) {
      console.error("Error:", error);
      toastMessages.food.menuDeleteError();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breakfast":
        return "from-yellow-500 to-orange-500";
      case "lunch":
        return "from-green-500 to-emerald-500";
      case "dinner":
        return "from-purple-500 to-pink-500";
      case "snacks":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-neutral-500 to-neutral-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600";
      case "preparing":
        return "bg-blue-500/10 text-blue-600";
      case "delivered":
        return "bg-green-500/10 text-green-600";
      case "cancelled":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-neutral-500/10 text-neutral-600";
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Cookies are sent automatically
      const response = await fetch("/api/admin/food/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (response.ok) {
        toastMessages.food.statusUpdateSuccess(newStatus);
        fetchMenuItems();
        setSelectedOrder(null);
      } else {
        toastMessages.food.statusUpdateError();
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toastMessages.food.statusUpdateError();
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesCategory;
  });

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesStudent = searchStudent === "" ||
      order.studentName.toLowerCase().includes(searchStudent.toLowerCase());
    return matchesStatus && matchesStudent;
  });

  const stats = {
    total: menuItems.length,
    breakfast: menuItems.filter((i) => i.category === "breakfast").length,
    lunch: menuItems.filter((i) => i.category === "lunch").length,
    dinner: menuItems.filter((i) => i.category === "dinner").length,
    snacks: menuItems.filter((i) => i.category === "snacks").length,
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <DashboardLayout type="admin" title="Food Management" subtitle="Manage food menu and orders">
      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="border-b border-neutral-300">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("menu")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === "menu"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }`}
            >
              Menu Items
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === "orders"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }`}
            >
              View Orders
              {orderStats.pending > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  {orderStats.pending}
                </span>
              )}
            </button>
          </nav>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {activeTab === "menu" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        {[
          { label: "Total Items", value: stats.total, color: "from-blue-500 to-cyan-500" },
          { label: "Breakfast", value: stats.breakfast, color: "from-yellow-500 to-orange-500" },
          { label: "Lunch", value: stats.lunch, color: "from-green-500 to-emerald-500" },
          { label: "Dinner", value: stats.dinner, color: "from-purple-500 to-pink-500" },
          { label: "Snacks", value: stats.snacks, color: "from-blue-500 to-indigo-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
          >
            <p className="text-sm font-light text-neutral-600 mb-2">{stat.label}</p>
            <p className="text-4xl font-light text-neutral-900">{stat.value}</p>
          </motion.div>
        ))}
        </div>
      )}

      {/* Menu Tab Content */}
      {activeTab === "menu" && (
        <>
          {/* Filters and Add Button */}
          <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50 mb-8"
      >
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category} className="capitalize">
                {category}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({
                name: "",
                description: "",
                price: 0,
                category: "breakfast",
                available: true,
              });
              setShowAddModal(true);
            }}
            className="ml-auto px-6 py-2.5 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg transition-all font-medium"
          >
            + Add Menu Item
          </button>
        </div>
      </motion.div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-neutral-600">Loading menu items...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.menuId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-neutral-200/50 hover:shadow-3xl transition-all"
            >
              {/* Image Placeholder */}
              <div className={`h-48 bg-gradient-to-br ${getCategoryColor(item.category)} flex items-center justify-center`}>
                <svg
                  className="h-20 w-20 text-white/80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-light text-neutral-900">{item.name}</h3>
                    <span className="text-xs px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 capitalize mt-1 inline-block">
                      {item.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-medium text-neutral-900">Rs {item.price}</p>
                  </div>
                </div>

                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-neutral-600">Availability:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.available
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-600"
                  }`}>
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 px-4 py-2 bg-black/5 hover:bg-black/10 text-neutral-900 rounded-2xl transition-all text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.menuId)}
                    className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-2xl transition-all text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        )}
        </>
      )}

      {/* Orders Tab Content */}
      {activeTab === "orders" && (
        <>
          {/* Order Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            {[
              { label: "Total Orders", value: orderStats.total, color: "from-blue-500 to-cyan-500" },
              { label: "Pending", value: orderStats.pending, color: "from-yellow-500 to-orange-500" },
              { label: "Preparing", value: orderStats.preparing, color: "from-blue-500 to-indigo-500" },
              { label: "Delivered", value: orderStats.delivered, color: "from-green-500 to-emerald-500" },
              { label: "Cancelled", value: orderStats.cancelled, color: "from-red-500 to-pink-500" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
              >
                <p className="text-sm font-light text-neutral-600 mb-2">{stat.label}</p>
                <p className="text-4xl font-light text-neutral-900">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50 mb-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <input
                type="text"
                placeholder="Search by student name..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="px-4 py-2 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white flex-1 min-w-[200px]"
              />
            </div>
          </motion.div>

          {/* Orders Table */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 text-center border border-neutral-200/50"
            >
              <p className="text-neutral-600">No orders found</p>
            </motion.div>
          ) : (
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-neutral-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50/50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredOrders.map((order, index) => (
                      <motion.tr
                        key={order.orderId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-neutral-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                          {order.orderId.substring(0, 12)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                          {order.studentName}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-700">
                          {order.items.length} item(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                          Rs {order.totalAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-2xl transition-all font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-light text-neutral-900 mb-6">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Price (Rs)</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category} className="capitalize">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-5 h-5 rounded border-neutral-300 text-blue-500 focus:ring-2 focus:ring-black/20"
                    />
                    <span className="text-sm font-medium text-neutral-700">Available for ordering</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg transition-all font-medium"
                  >
                    {editingItem ? "Update" : "Add"} Item
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-light text-neutral-900 mb-2">Order Details</h2>
                  <p className="text-sm text-neutral-600">Order ID: {selectedOrder.orderId}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Student Info */}
              <div className="bg-neutral-50 rounded-2xl p-4 mb-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Student Information</h3>
                <p className="text-neutral-900 font-medium">{selectedOrder.studentName}</p>
                <p className="text-sm text-neutral-600">Student ID: {selectedOrder.studentId}</p>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-neutral-50 rounded-2xl p-4">
                      <div>
                        <p className="font-medium text-neutral-900">{item.name}</p>
                        <p className="text-sm text-neutral-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-neutral-900">Rs {item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-neutral-200 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-600">Total Amount:</span>
                  <span className="text-xl font-medium text-neutral-900">Rs {selectedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Order Date:</span>
                  <span className="text-neutral-900">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Update Status */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Update Order Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["pending", "preparing", "delivered", "cancelled"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, status)}
                      disabled={selectedOrder.status === status}
                      className={`px-4 py-3 rounded-2xl font-medium transition-all capitalize ${
                        selectedOrder.status === status
                          ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                          : status === "pending"
                          ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600"
                          : status === "preparing"
                          ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600"
                          : status === "delivered"
                          ? "bg-green-500/10 hover:bg-green-500/20 text-green-600"
                          : "bg-red-500/10 hover:bg-red-500/20 text-red-600"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl transition-all font-medium"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}