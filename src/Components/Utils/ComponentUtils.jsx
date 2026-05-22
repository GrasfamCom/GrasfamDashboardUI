import Overview from "../Pages/Overview/Overview";
import Analytics from "../Pages/Analytics/Analytics";
import Reports from "../Pages/Reports/Reports";

export function getComponentByName(menuName) {
  const componentMap = {
    Overview:  <Overview />,
    Analytics: <Analytics />,
    Reports:   <Reports />,
  };
  return componentMap[menuName] || <div>Page Not Found</div>;
}