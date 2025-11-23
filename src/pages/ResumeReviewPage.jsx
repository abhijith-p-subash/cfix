import Header from '../components/Header';
import ResumeReview from '../components/ResumeReview';
import Footer from '../components/Footer';

const ResumeReviewPage = () => {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <Header />
            <main>
                <ResumeReview />
            </main>
            <Footer />
        </div>
    );
};

export default ResumeReviewPage;
