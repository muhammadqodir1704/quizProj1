import AppRoutes from "./Routes/AppRoutes";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  return (
    <ThemeProvider>
      <div className="container dark:text-white dark:bg-black">
        <AppRoutes />
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}
