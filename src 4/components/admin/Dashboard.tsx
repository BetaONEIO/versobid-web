import React from 'react';
import { BarChart, Users, ShoppingBag, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value="1,234"
          icon={<Users className="h-6 w-6" />}
          trend="+12%"
        />
        <StatCard
          title="Active Listings"
          value="567"
          icon={<ShoppingBag className="h-6 w-6" />}
          trend="+5%"
        />
        <StatCard
          title="Total Bids"
          value="2,345"
          icon={<BarChart className="h-6 w-6" />}
          trend="+8%"
        />
        <StatCard
          title="Reports"
          value="23"
          icon={<AlertCircle className="h-6 w-6" />}
          trend="-2%"
          negative
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <SystemMetrics />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, negative = false }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</h3>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900 p-3 rounded-lg">{icon}</div>
      </div>
      <div className={`mt-2 text-sm ${negative ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
        {trend}
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
      <div className="space-y-4">
        {/* Activity items would be mapped here */}
      </div>
    </div>
  );
}

function SystemMetrics() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Metrics</h2>
      <div className="space-y-4">
        {/* Metrics would be displayed here */}
      </div>
    </div>
  );
}