import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from "@/pages/Signup"
import Dashboard from './pages/Dashboard';

import InterviewDetail from './pages/InterviewDetail';
import NewInterview from "@/pages/NewInterview"
import ProtectedRoute from "@/components/ProtectedRoute"
import Landing from "@/pages/Landing"
import ProjectPage from "@/pages/ProjectPage"
import TermsPrivacy from "./pages/TermsPrivacy";
import Verify from './pages/Verify';

const App = () => {
    return (
        <Router>
            <Routes>
               <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/projects/:projectId" element={<ProjectPage />} />
                <Route path="/interviews/:interviewId" element={<InterviewDetail />} />
               // <Route path="/new-interview" element={<NewInterview />} /> 
                <Route path="/project/:projectId" element={<ProjectPage />} />
                <Route path="/projects/:projectId/new-interview" element={<NewInterview />} />
                 <Route path="*" element={<Login />} />
                 <Route path="/terms" element={<TermsPrivacy />} />
                 <Route path="/verify" element={<Verify />} />
            </Routes>
        </Router>
    );
};


export default App;