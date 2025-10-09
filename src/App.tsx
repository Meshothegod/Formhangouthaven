import { useState, useEffect } from 'react';
import Home from './components/Home';
import StaffApplication from './components/StaffApplication';
import Login from './components/Login';
import StaffRegister from './components/StaffRegister';
import StaffDashboard from './components/StaffDashboard';
import { supabase } from './lib/supabase';

type Page = 'home' | 'apply' | 'login' | 'register' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const { data: staffData } = await supabase
            .from('staff_members')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          setIsAuthenticated(!!staffData && staffData.approved === true);
        } else {
          setIsAuthenticated(false);
        }
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: staffData } = await supabase
        .from('staff_members')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (staffData && staffData.approved === true) {
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
      }
    }
  };

  const handleNavigate = (page: 'apply' | 'login') => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  const handleRegisterClick = () => {
    setCurrentPage('register');
  };

  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  if (currentPage === 'apply') {
    return <StaffApplication onBack={handleBack} />;
  }

  if (currentPage === 'login') {
    return <Login onBack={handleBack} onLoginSuccess={handleLoginSuccess} onRegisterClick={handleRegisterClick} />;
  }

  if (currentPage === 'register') {
    return <StaffRegister onBack={() => setCurrentPage('login')} onRegisterSuccess={handleRegisterSuccess} />;
  }

  if (currentPage === 'dashboard' && isAuthenticated) {
    return <StaffDashboard onBack={handleBack} onLogout={handleLogout} />;
  }

  return <Home onNavigate={handleNavigate} />;
}

export default App;
