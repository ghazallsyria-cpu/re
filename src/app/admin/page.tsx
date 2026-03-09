"use client";
import DashboardLayout from "@/components/shared/DashboardLayout";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="text-center py-24" dir="rtl">
        <div className="text-5xl mb-4">🏫</div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          لوحة تحكم المدير
        </h1>
        <p className="text-gray-400">قيد التطوير</p>
      </div>
    </DashboardLayout>
  );
}
