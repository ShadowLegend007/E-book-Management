import Hero from '../components/home/Hero'
import PageTransition from '../components/PageTransition';
import RecommendedBooks from '../components/home/RecommendedBooks';
import TrendingNotes from '../components/home/TrendingNotes';
import DepartmentScroller from '../components/home/DepartmentScroller';
import FooterCTA from '../components/home/FooterCTA';

const Home = () => {
    return (
        <PageTransition className="min-h-screen bg-[#030303] relative overflow-hidden">


            <div className="relative z-10">
                <Hero />
                <DepartmentScroller />
                <RecommendedBooks />
                <TrendingNotes />
                <FooterCTA />
            </div>
        </PageTransition>
    );
};

export default Home;
