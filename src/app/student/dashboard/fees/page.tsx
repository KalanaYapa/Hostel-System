"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Payment {
  paymentId: string;
  amount: number;
  paymentType: string;
  status: string;
  createdAt: string;
}

export default function FeesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [amount, setAmount] = useState("5000");
  const [feesPaid, setFeesPaid] = useState(false);

  useEffect(() => {
    const studentData = localStorage.getItem("studentData");
    if (studentData) {
      const data = JSON.parse(studentData);
      setFeesPaid(data.feesPaid);
    }
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/payment", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentType: "hostel-fee",
        }),
      });

      if (response.ok) {
        alert("Payment successful!");
        setFeesPaid(true);

        const studentData = localStorage.getItem("studentData");
        if (studentData) {
          const data = JSON.parse(studentData);
          data.feesPaid = true;
          localStorage.setItem("studentData", JSON.stringify(data));
        }

        fetchPayments();
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <DashboardLayout type="student" title="Hostel Fees" subtitle="Manage your hostel fee payments">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
        >
          <h2 className="text-2xl font-light tracking-tight text-neutral-900 mb-6">Make Payment</h2>

          {feesPaid && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl"
            >
              <p className="text-green-600 font-medium">
                ✓ Your hostel fees are paid!
              </p>
            </motion.div>
          )}

          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-neutral-600 font-medium">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 transition-all bg-white"
                  required
                  min="1"
                />
              </div>
              <p className="mt-2 text-sm text-neutral-500">
                Standard hostel fee: ₹5,000 per semester
              </p>
            </div>

            <div className="bg-neutral-50 p-6 rounded-2xl">
              <h3 className="font-medium text-neutral-900 mb-3">Payment Details:</h3>
              <p className="text-sm text-neutral-600">Type: Hostel Fee</p>
              <p className="text-sm text-neutral-600">
                Amount: ₹{amount || "0"}
              </p>
            </div>

            <button
              type="submit"
              disabled={paying || feesPaid}
              className="w-full py-3.5 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg disabled:shadow-none"
            >
              {paying ? "Processing..." : feesPaid ? "Already Paid" : "Pay Now"}
            </button>

            <p className="text-xs text-neutral-400 text-center">
              This is a sample payment system. No actual payment is processed.
            </p>
          </form>
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
        >
          <h2 className="text-2xl font-light tracking-tight text-neutral-900 mb-6">Payment History</h2>

          {loading ? (
            <p className="text-neutral-600">Loading...</p>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-neutral-500">No payment history yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <motion.div
                  key={payment.paymentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-neutral-200 rounded-2xl p-5 hover:shadow-lg transition-all bg-white/50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-neutral-900 capitalize">
                        {payment.paymentType.replace("-", " ")}
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">
                        {new Date(payment.createdAt).toLocaleDateString()} at{" "}
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 text-sm rounded-full font-medium border border-green-500/20">
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-2xl font-light text-neutral-900">
                    ₹{payment.amount}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2">
                    ID: {payment.paymentId}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
