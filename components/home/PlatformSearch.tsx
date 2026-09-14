import Section from './Section';
import SearchBox from './SearchBox';

/**
 * The primary action of the homepage. Server-rendered section wrapper; the
 * combobox (label, input, typeahead) lives in SearchBox, which is also
 * server-rendered to HTML and enhanced client-side.
 */
export default function PlatformSearch() {
  return (
    <Section id="platform-search" className="home-section--platform-search">
      <SearchBox />
    </Section>
  );
}
