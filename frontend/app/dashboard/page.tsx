'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { foodApi, FoodItem } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadFoods();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const loadFoods = async () => {
    try {
      const data = await foodApi.getAll();
      setFoods(data);
    } catch (error) {
      console.error('Error loading foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await foodApi.delete(id);
      loadFoods();
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Failed to delete item');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const expiringFoods = foods.filter((f) => f.status === 'expiring' || f.status === 'expired');
  const safeFoods = foods.filter((f) => f.status === 'safe');

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Manage your food inventory and reduce waste</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Items</h3>
              <p className="text-3xl font-bold text-gray-900">{foods.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Expiring Soon</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {foods.filter((f) => f.status === 'expiring').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Expired</h3>
              <p className="text-3xl font-bold text-red-600">
                {foods.filter((f) => f.status === 'expired').length}
              </p>
            </div>
          </div>

          {/* Expiring Soon Section */}
          {expiringFoods.length > 0 && (
            <div className="mb-8">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">
                      {expiringFoods.length} item(s) need attention
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Expiring Soon</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {expiringFoods.map((food) => (
                    <div key={food.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{food.name}</h3>
                          <p className="text-sm text-gray-500">
                            Quantity: {food.quantity} • Expires: {new Date(food.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              food.status
                            )}`}
                          >
                            {food.status}
                          </span>
                          <button
                            onClick={() => handleDelete(food.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All Foods Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">All Food Items</h2>
              <Link
                href="/add-food"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Add Food
              </Link>
            </div>
            {safeFoods.length === 0 && expiringFoods.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500 mb-4">No food items yet. Start by adding some!</p>
                <Link
                  href="/add-food"
                  className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium"
                >
                  Add Your First Item
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {safeFoods.map((food) => (
                  <div key={food.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{food.name}</h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {food.quantity} • Expires: {new Date(food.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            food.status
                          )}`}
                        >
                          {food.status}
                        </span>
                        <button
                          onClick={() => handleDelete(food.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
