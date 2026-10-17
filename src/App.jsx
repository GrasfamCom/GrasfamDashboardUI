import './App.css';
import AppRoutes from './Routes';
import { I18nProvider } from './i18n';

const App = () => {
  return (
    <div className="r-dashboard">
      <I18nProvider>
        <AppRoutes />
      </I18nProvider>
    </div>
  );
};

export default App;