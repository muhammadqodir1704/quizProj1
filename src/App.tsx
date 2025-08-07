import AppRoutes from "./Routes/AppRoutes";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  return (
    <ThemeProvider>
      <div className="container">
        <AppRoutes />
        <ThemeToggle />
      </div>
    </ThemeProvider>
  )
}
