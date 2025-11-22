import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <Home />
        </AuthProvider>
    );
}

export default App;
