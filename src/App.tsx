import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/AppRoutes";
import { Toaster } from "sonner";
import MaintenancePage from "./pages/maintenance";

const MAINTENANCE_MODE = false;

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      {MAINTENANCE_MODE ? <MaintenancePage /> : <AppRoutes />}
    </BrowserRouter>
  );
}

export default App;
