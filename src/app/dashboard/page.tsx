'use client';

import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Summary Card - Clients */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                <dd className="text-3xl font-semibold text-gray-900">12</dd>
              </dl>
            </div>
          </div>
          <div className="mt-5">
            <Link href="/clients" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all clients
            </Link>
          </div>
        </div>

        {/* Summary Card - Active Contracts */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Contracts</dt>
                <dd className="text-3xl font-semibold text-gray-900">8</dd>
              </dl>
            </div>
          </div>
          <div className="mt-5">
            <Link href="/contracts" className="text-sm font-medium text-green-600 hover:text-green-500">
              View all contracts
            </Link>
          </div>
        </div>

        {/* Summary Card - Revenue */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                <dd className="text-3xl font-semibold text-gray-900">$24,500</dd>
              </dl>
            </div>
          </div>
          <div className="mt-5">
            <div className="text-sm font-medium text-purple-600">
              Last 30 days
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
        <div className="mt-5 flow-root">
          <div className="-my-4 divide-y divide-gray-200">
            <div className="flex py-4">
              <div className="mr-4 flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">AC</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Acme Corp</h3>
                  <p className="text-sm text-gray-500">2 days ago</p>
                </div>
                <p className="text-sm text-gray-500">New contract signed for social media campaign</p>
              </div>
            </div>
            <div className="flex py-4">
              <div className="mr-4 flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-semibold">GL</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Global Labs</h3>
                  <p className="text-sm text-gray-500">1 week ago</p>
                </div>
                <p className="text-sm text-gray-500">Project completed and final deliverables sent</p>
              </div>
            </div>
            <div className="flex py-4">
              <div className="mr-4 flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">NH</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Northern Horizons</h3>
                  <p className="text-sm text-gray-500">2 weeks ago</p>
                </div>
                <p className="text-sm text-gray-500">Contract renewal discussion initiated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 