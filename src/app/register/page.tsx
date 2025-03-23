import AuthForm from '@/components/auth/AuthForm';
import AuthHeader from '@/components/auth/AuthHeader';

export const metadata = {
  title: 'Register | Shortscut',
  description: 'Create a new Shortscut account',
};

export default function RegisterPage() {
  return (
    <>
      <AuthHeader />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16">
        <AuthForm mode="register" />
      </div>
    </>
  );
} 