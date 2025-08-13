import { Routes, Route } from "react-router-dom";
import Form from "../pages/Form/Form";
import Quiz from "../pages/Quiz/Quiz";
import AIChatbot from "../pages/Result/AIChatbot";
import TokenValidator from "../components/TokenValidator";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Form />} />
      <Route path="/test" element={<TokenValidator />} />
      <Route path="/form" element={<Form />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result/:id" element={<AIChatbot />} />
    </Routes>
  );
};

export default AppRoutes;
