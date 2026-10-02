import './App.css';
import AppRoutes from './Routes';
import { I18nProvider } from './i18n';

const App = () => {
  return (
    <I18nProvider>
      <AppRoutes />
    </I18nProvider>
  );
};

export default App;