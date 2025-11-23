import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import CreateRoadmap from './pages/CreateRoadmap';
import ResumeReviewPage from './pages/ResumeReviewPage';
import NotFound from './pages/NotFound';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create" element={<CreateRoadmap />} />
                    <Route path="/resume-review" element={<ResumeReviewPage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
