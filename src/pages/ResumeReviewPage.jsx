import Header from '../components/Header';
import ResumeReview from '../components/ResumeReview';

const ResumeReviewPage = () => {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <Header />
            <main>
                <ResumeReview />
            </main>
        </div>
    );
};

export default ResumeReviewPage;
