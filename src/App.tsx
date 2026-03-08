import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StartHere from "./pages/StartHere";
import Foundations from "./pages/Foundations";
import Architecture from "./pages/Architecture";
import Networking from "./pages/Networking";
import Objects from "./pages/Objects";
import Workloads from "./pages/Workloads";
import Yaml from "./pages/Yaml";
import Services from "./pages/Services";
import Storage from "./pages/Storage";
import Security from "./pages/Security";
import Scheduling from "./pages/Scheduling";
import Labels from "./pages/Labels";
import Config from "./pages/Config";
import Operators from "./pages/Operators";
import OpenShift from "./pages/OpenShift";
import Flows from "./pages/Flows";
import VisualLab from "./pages/VisualLab";
import VisualLabScenario from "./pages/VisualLabScenario";
import Glossary from "./pages/Glossary";
import Troubleshooting from "./pages/Troubleshooting";
import Simulator from "./pages/Simulator";
import SimulatorScenarioPage from "./pages/SimulatorScenario";
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
          <Route path="/start" element={<StartHere />} />
          <Route path="/foundations" element={<Foundations />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/networking" element={<Networking />} />
          <Route path="/objects" element={<Objects />} />
          <Route path="/workloads" element={<Workloads />} />
          <Route path="/yaml" element={<Yaml />} />
          <Route path="/services" element={<Services />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/security" element={<Security />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/labels" element={<Labels />} />
          <Route path="/config" element={<Config />} />
          <Route path="/operators" element={<Operators />} />
          <Route path="/openshift" element={<OpenShift />} />
          <Route path="/flows" element={<Flows />} />
          <Route path="/visual-lab" element={<VisualLab />} />
          <Route path="/visual-lab/:scenarioId" element={<VisualLabScenario />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/troubleshooting" element={<Troubleshooting />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
