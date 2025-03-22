'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/Layout/AppLayout';
import { useContracts } from '@/hooks/useContracts';
import { useClients } from '@/hooks/useClients';
import LoadingState from '@/components/ui/LoadingState';
import { Contract, Video } from '@/types/contract';
import { Client } from '@/types/client';
import { PACKAGES, PackageType } from '@/types/package';
import VideoDeliverables from '@/components/contracts/VideoDeliverables';

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;
  const { fetchContract, deleteContract } = useContracts();
  const { clients, isLoading: isLoadingClients } = useClients();
  const [contract, setContract] = useState<Contract | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadContract = async () => {
      setIsLoading(true);
      try {
        const data = await fetchContract(contractId);
        setContract(data);
        
        // For demo purposes, generate some sample videos based on the contract's package type
        if (data) {
          const sampleVideos: Video[] = [];
          const startDate = new Date(data.startDate);
          const videosPerMonth = data.videosPerMonth || 0;
          const totalMonths = data.totalMonths || 1;
          
          // Calculate total videos for the contract duration
          const totalVideos = videosPerMonth * totalMonths;
          
          // Generate sample videos with varying statuses
          const statuses: Video['status'][] = ['planning', 'scripting', 'production', 'editing', 'review', 'completed'];
          
          for (let i = 0; i < Math.min(totalVideos, 20); i++) {
            const dueDate = new Date(startDate);
            dueDate.setDate(dueDate.getDate() + (Math.floor(i / videosPerMonth) * 30) + (i % 7) * 3);
            
            const statusIndex = Math.min(Math.floor((i / totalVideos) * 6), 5);
            
            const video: Video = {
              id: `video-${i}`,
              contractId: data.id,
              title: `Video ${i + 1}`,
              description: `Sample video ${i + 1} for contract ${data.title}`,
              status: statuses[statusIndex],
              dueDate: dueDate.toISOString(),
              revisionCount: Math.floor(Math.random() * 3),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            // Add delivery date and feedback for completed videos
            if (video.status === 'completed') {
              video.deliveryDate = new Date(dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString();
            }
            
            // Add feedback for some videos
            if (video.revisionCount > 0) {
              video.feedback = [
                'Please adjust the color grading',
                'The audio needs to be louder in the intro',
                'Can we add a call-to-action at the end?',
              ].slice(0, video.revisionCount);
            }
            
            sampleVideos.push(video);
          }
          
          setVideos(sampleVideos);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContract();
  }, [contractId, fetchContract]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      setIsDeleting(true);
      try {
        await deleteContract(contractId);
        router.push('/contracts');
      } catch (err) {
        setError(err as Error);
        setIsDeleting(false);
      }
    }
  };

  const handleVideoUpdate = (updatedVideo: Video) => {
    setVideos(videos.map(video => 
      video.id === updatedVideo.id ? updatedVideo : video
    ));
  };

  const handleVideoAdd = (newVideo: Video) => {
    setVideos([...videos, newVideo]);
  };

  const getClientName = (clientId: string) => {
    const client = clients?.find((c) => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };
  
  const getPackageDetails = (type: PackageType) => {
    return PACKAGES.find(pkg => pkg.type === type);
  };

  if (isLoading || isLoadingClients) {
    return (
      <AppLayout>
        <LoadingState message="Loading contract..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p>Error: {error.message}</p>
        </div>
      </AppLayout>
    );
  }

  if (!contract) {
    return (
      <AppLayout>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-700">
          <p>Contract not found</p>
        </div>
      </AppLayout>
    );
  }
  
  const packageDetails = getPackageDetails(contract.packageType as PackageType);

  return (
    <AppLayout>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Client: {getClientName(contract.clientId)}
          </p>
        </div>
        <div className="mt-4 flex gap-3 sm:mt-0">
          <Link
            href={`/contracts/${contractId}/edit`}
            className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Contract Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Contract information and details.</p>
          </div>
          
          {/* Package Information Card */}
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <div className="bg-blue-50 p-4 sm:p-6 border-b border-blue-100">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-lg font-medium text-blue-900">{packageDetails?.name}</h4>
                  <p className="mt-1 text-sm text-blue-700">{packageDetails?.description}</p>
                </div>
                <div className="mt-3 sm:mt-0">
                  <span className="inline-flex items-center rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    ${contract.pricePerMonth}/month
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm font-medium text-gray-500">Videos per Month</div>
                  <div className="mt-1 text-2xl font-semibold text-blue-600">{contract.videosPerMonth}</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm font-medium text-gray-500">Contract Duration</div>
                  <div className="mt-1 text-2xl font-semibold text-blue-600">{contract.totalMonths} months</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm font-medium text-gray-500">Total Contract Value</div>
                  <div className="mt-1 text-2xl font-semibold text-blue-600">
                    ${(contract.pricePerMonth * contract.totalMonths).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="text-sm font-medium text-blue-900">Package Features</h5>
                <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {packageDetails?.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-blue-700">
                      <svg className="mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      contract.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : contract.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : contract.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </span>
                </dd>
              </div>
              
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Monthly Sync Call</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  Day {contract.syncCallDay} of each month
                </dd>
              </div>
              
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {new Date(contract.startDate).toLocaleDateString()}
                </dd>
              </div>
              
              {contract.endDate && (
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">End Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {new Date(contract.endDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
              
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {contract.description || 'No description provided'}
                </dd>
              </div>
              
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Terms</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {contract.terms || 'No terms specified'}
                </dd>
              </div>
              
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {contract.notes || 'No notes added'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Video Deliverables Section */}
      <VideoDeliverables 
        contractId={contract.id}
        videos={videos}
        onVideoUpdate={handleVideoUpdate}
        onVideoAdd={handleVideoAdd}
      />

      <div className="mt-8">
        <Link
          href={`/clients/${contract.clientId}`}
          className="text-blue-600 hover:text-blue-900"
        >
          View Client
        </Link>
      </div>
    </AppLayout>
  );
} 