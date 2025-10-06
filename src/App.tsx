import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import AdminPanel from './pages/AdminPanel';
import BMICalculator from './calculators/BMICalculator';
import AgeCalculator from './calculators/AgeCalculator';
import FinancialCalculator from './calculators/FinancialCalculator';
import EMICalculator from './calculators/EMICalculator';
import InterestCalculator from './calculators/InterestCalculator';

type Page = 'home' | 'about' | 'bmi' | 'age' | 'emi' | 'interest' | 'investment' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);

    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'about':
        return <About />;
      case 'bmi':
        return <BMICalculator />;
      case 'age':
        return <AgeCalculator />;
      case 'emi':
        return <EMICalculator />;
      case 'interest':
        return <InterestCalculator />;
      case 'investment':
        return <FinancialCalculator />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {currentPage !== 'admin' && (
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      <main className="flex-grow">{renderPage()}</main>
      {currentPage !== 'admin' && <Footer />}
    </div>
  );
}

export default App;
