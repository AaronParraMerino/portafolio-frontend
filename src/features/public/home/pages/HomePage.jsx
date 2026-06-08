import Hero from '../components/Hero';
import HomeEventsSection from '../components/HomeEventsSection';
import FeaturedPortfolios from '../components/FeaturedPortfolios';
import RecentProjectsCarousel from '../components/projects/RecentProjectsCarousel';
import RecentProjectsHero from '../components/projects/RecentProjectsHero';
import useHomeEvents from '../hooks/useHomeEvents';
import useRecentProjects from '../hooks/useRecentProjects';

export default function HomePage() {
  const eventsState = useHomeEvents();
  const recentProjects = useRecentProjects();

  return (
    <>
      <Hero eventsState={eventsState} />
      <HomeEventsSection eventsState={eventsState} />
      <FeaturedPortfolios />
      <RecentProjectsHero projects={recentProjects.hero} />
      <RecentProjectsCarousel projects={recentProjects.recientes} />
    </>
  );
}
