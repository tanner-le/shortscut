import AdminSetupForm from '@/components/admin/AdminSetupForm';
import AuthHeader from '@/components/auth/AuthHeader';

export const metadata = {
  title: 'Admin Setup | Shortscut',
  description: 'Set up the initial admin user for Shortscut',
};

export default function AdminSetupPage() {
  return (
    <>
      <AuthHeader />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Setup</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create the initial administrator account for your Shortscut instance.
            </p>
          </div>
          <AdminSetupForm />
        </div>
      </div>
    </>
  );
} 