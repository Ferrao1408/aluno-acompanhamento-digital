
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { StudentProvider } from "./contexts/StudentContext";
import { ClassProvider } from "./contexts/ClassContext";

// Layouts
import AppLayout from "./components/layout/AppLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import StudentList from "./pages/students/StudentList";
import StudentForm from "./pages/students/StudentForm";
import StudentDetail from "./pages/students/StudentDetail";
import ObservationList from "./pages/observations/ObservationList";
import UserList from "./pages/users/UserList";
import ReportPage from "./pages/reports/ReportPage";
import NotFound from "./pages/NotFound";
import ClassList from "./pages/classes/ClassList";
import ClassForm from "./pages/classes/ClassForm";
import ClassDetail from "./pages/classes/ClassDetail";

// Pedagogical pages
import PedagogicalPlanList from "./pages/pedagogical/PedagogicalPlanList";
import PedagogicalPlanForm from "./pages/pedagogical/PedagogicalPlanForm";
import PedagogicalPlanDetail from "./pages/pedagogical/PedagogicalPlanDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents refetching data when window gets focus
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StudentProvider>
        <ClassProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Student Routes */}
                  <Route path="/students" element={<StudentList />} />
                  <Route path="/students/new" element={<StudentForm />} />
                  <Route path="/students/:id" element={<StudentDetail />} />
                  <Route path="/students/edit/:id" element={<StudentForm />} />
                  
                  {/* Class Routes */}
                  <Route path="/classes" element={<ClassList />} />
                  <Route path="/classes/new" element={<ClassForm />} />
                  <Route path="/classes/:id" element={<ClassDetail />} />
                  <Route path="/classes/edit/:id" element={<ClassForm />} />
                  
                  {/* Pedagogical Routes */}
                  <Route path="/pedagogical" element={<PedagogicalPlanList />} />
                  <Route path="/pedagogical/new" element={<PedagogicalPlanForm />} />
                  <Route path="/pedagogical/:id" element={<PedagogicalPlanDetail />} />
                  <Route path="/pedagogical/edit/:id" element={<PedagogicalPlanForm />} />
                  
                  {/* Observation Routes */}
                  <Route path="/observations" element={<ObservationList />} />
                  
                  {/* User Routes */}
                  <Route path="/users" element={<UserList />} />
                  
                  {/* Report Routes */}
                  <Route path="/reports" element={<ReportPage />} />
                </Route>
                
                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ClassProvider>
      </StudentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
