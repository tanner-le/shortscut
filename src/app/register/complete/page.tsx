import CompleteRegistrationForm from '@/components/auth/CompleteRegistrationForm';
import AuthHeader from '@/components/auth/AuthHeader';

export const metadata = {
  title: 'Complete Registration | Shortscut',
  description: 'Complete your Shortscut account registration',
};

export default function CompleteRegistrationPage() {
  return (
    <>
      <AuthHeader />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16">
        <CompleteRegistrationForm />
      </div>
    </>
  );
} 