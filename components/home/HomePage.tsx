import Disclosure from './Disclosure';
import Hero from './Hero';
import PlatformSearch from './PlatformSearch';
import RecentlyReviewed from './RecentlyReviewed';
import HighRisk from './HighRisk';
import BrowseByMarket from './BrowseByMarket';
import Methodology from './Methodology';
import Reviewers from './Reviewers';
import Guides from './Guides';
import HomeFooter from './HomeFooter';

/**
 * Homepage shell. Ten named section slots in reading order; each is an
 * independent component, built out one at a time in later prompts.
 */
export default function HomePage() {
  return (
    <main className="home">
      <Disclosure />
      <Hero />
      <PlatformSearch />
      <RecentlyReviewed />
      <HighRisk />
      <BrowseByMarket />
      <Methodology />
      <Reviewers />
      <Guides />
      <HomeFooter />
    </main>
  );
}
