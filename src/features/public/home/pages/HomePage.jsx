import Hero from '../components/Hero';
import HomeEventsSection from '../components/HomeEventsSection';
import FeaturedPortfolios from '../components/FeaturedPortfolios';
import useHomeEvents from '../hooks/useHomeEvents';

export default function HomePage() {
  const eventsState = useHomeEvents();

  return (
    <>
      <Hero eventsState={eventsState} />
      <HomeEventsSection eventsState={eventsState} />
      <FeaturedPortfolios />
    </>
  );
}
