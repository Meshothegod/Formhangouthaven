import { Users, Shield, FileText } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: 'apply' | 'login') => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Shield className="w-20 h-20 text-blue-500" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Discord Staff Portal</h1>
          <p className="text-xl text-gray-400">
            Join our team or manage staff applications
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('apply')}
            className="bg-gray-800 hover:bg-gray-750 rounded-lg p-8 shadow-xl transition-all hover:scale-105 border-2 border-gray-700 hover:border-blue-500"
          >
            <div className="flex justify-center mb-4">
              <FileText className="w-16 h-16 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Apply for Staff</h2>
            <p className="text-gray-400">
              Submit your application to join our staff team
            </p>
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="bg-gray-800 hover:bg-gray-750 rounded-lg p-8 shadow-xl transition-all hover:scale-105 border-2 border-gray-700 hover:border-green-500"
          >
            <div className="flex justify-center mb-4">
              <Users className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Staff Dashboard</h2>
            <p className="text-gray-400">
              Login to review and manage applications
            </p>
          </button>
        </div>

        <div className="mt-16 text-center text-gray-500">
          <p>Secure staff application system powered by Supabase</p>
        </div>
      </div>
    </div>
  );
}
