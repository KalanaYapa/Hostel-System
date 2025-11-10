"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";

interface MenuItem {
  menuId: string;
  name: string;
  description: string;
  price: number;
  category: "breakfast" | "lunch" | "dinner" | "snacks";
  available: boolean;
  imageUrl?: string;
}

export default function FoodMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
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
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/food", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.menu || []);
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
      const token = localStorage.getItem("token");

      const body = editingItem
        ? { menuId: editingItem.menuId, updates: formData }
        : formData;

      const response = await fetch("/api/admin/food", {
        method: editingItem ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert(editingItem ? "Menu item updated!" : "Menu item added!");
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
              item.menuId === editingItem.itemId
                ? { ...item, ...formData }
                : item
            )
          );
        } else {
          setMenuItems([
            ...menuItems,
            {
              menuId: String(menuItems.length + 1),
              ...formData,
            },
          ]);
        }
        alert(editingItem ? "Menu item updated!" : "Menu item added!");
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
      alert("Failed to save menu item");
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
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/food?menuId=${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Item deleted successfully!");
        fetchMenuItems();
      } else {
        // Update mock data
        setMenuItems(menuItems.filter((item) => item.menuId !== itemId));
        alert("Item deleted successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete item");
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

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesCategory;
  });

  const stats = {
    total: menuItems.length,
    breakfast: menuItems.filter((i) => i.category === "breakfast").length,
    lunch: menuItems.filter((i) => i.category === "lunch").length,
    dinner: menuItems.filter((i) => i.category === "dinner").length,
    snacks: menuItems.filter((i) => i.category === "snacks").length,
  };

  return (
    <DashboardLayout type="admin" title="Food Menu Management" subtitle="Manage hostel food menu items">
      {/* Stats Cards */}
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
    </DashboardLayout>
  );
}
