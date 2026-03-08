import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Foundations from "./pages/Foundations";
import Architecture from "./pages/Architecture";
import Networking from "./pages/Networking";
import Objects from "./pages/Objects";
import Workloads from "./pages/Workloads";
import Glossary from "./pages/Glossary";
import Troubleshooting from "./pages/Troubleshooting";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/foundations" element={<Foundations />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/networking" element={<Networking />} />
          <Route path="/objects" element={<Objects />} />
          <Route path="/workloads" element={<Workloads />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/troubleshooting" element={<Troubleshooting />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
