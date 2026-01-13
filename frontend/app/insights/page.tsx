'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { agentApi, Insights } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function InsightsPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadInsights();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const loadInsights = async () => {
    try {
      const data = await agentApi.getInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!insights) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">Failed to load insights</h2>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Insights</h1>
            <p className="text-gray-600">View AI recommendations and waste reduction statistics</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Items</h3>
              <p className="text-3xl font-bold text-gray-900">{insights.total_items}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
              <h3 className="text-sm font-medium text-green-700 mb-1">Safe</h3>
              <p className="text-3xl font-bold text-green-600">{insights.safe}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-700 mb-1">Expiring</h3>
              <p className="text-3xl font-bold text-yellow-600">{insights.expiring}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
              <h3 className="text-sm font-medium text-red-700 mb-1">Expired</h3>
              <p className="text-3xl font-bold text-red-600">{insights.expired}</p>
            </div>
          </div>

          {/* Waste Reduction Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Waste Reduction Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Items Wasted</p>
                <p className="text-2xl font-bold text-red-600">{insights.waste_count}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Waste Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {insights.total_items > 0
                    ? ((insights.waste_count / insights.total_items) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent AI Recommendations</h2>
            </div>
            {insights.recent_recommendations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No recommendations yet. The AI agent runs daily and will provide suggestions based on your inventory.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {insights.recent_recommendations.map((log) => (
                  <div key={log.id} className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 capitalize">{log.action.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{log.reasoning}</p>
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
