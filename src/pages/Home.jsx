import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Target, Rocket, TrendingUp, ArrowRight } from 'lucide-react';

const Home = () => {
    return (
        <div className="relative min-h-screen bg-background font-sans text-foreground overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
            </div>

            <Header />

            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Plan Your Career <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Journey with AI
                            </span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                            Get a personalized career roadmap powered by advanced AI. Transform your career aspirations into actionable steps with expert guidance tailored to your goals.
                        </p>

                        <div className="mt-10 flex justify-center">
                            <Link
                                to="/create"
                                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:scale-105"
                            >
                                Start Your Journey
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>

                        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Target className="h-4 w-4" />
                                </div>
                                <span>Personalized Roadmaps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Rocket className="h-4 w-4" />
                                </div>
                                <span>Actionable Steps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <span>Career Growth</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="border-t py-8 text-center text-sm text-muted-foreground bg-background/50 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <p>© 2024 CareerFix.AI - Powered by AI to build better careers</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
