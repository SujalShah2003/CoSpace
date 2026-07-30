import { useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import AmenitiesSection from '@/components/home/AmenitiesSection';
import AvailabilitySection from '@/components/home/AvailabilitySection';
import CallToActionSection from '@/components/home/CallToActionSection';
import HeroSection from '@/components/home/HeroSection';
import SpaceDetailsModal from '@/components/home/SpaceDetailsModal';
import SpacesSection from '@/components/home/SpacesSection';
import type { Space } from '@/components/home/data.temp';
import { useSpaces } from '@/hooks/useSpaces';
import { isAuthenticated } from '@/utils/auth';

const HomePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 350);
  const [spaceType, setSpaceType] = useState<string | null>('All spaces');
  const [capacity, setCapacity] = useState<number | string>(1);
  const {
    spaces,
    hasMore,
    loadMore,
    loadingMore,
  } = useSpaces(true, 6, {
    search: debouncedQuery,
    minCapacity: Number(capacity) || 1,
    type:
      spaceType && spaceType !== 'All spaces'
        ? spaceType
        : undefined,
  });
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);

  const filteredSpaces = spaces.filter(
    (space) => space.status !== 'unavailable',
  );

  const showSpaces = () => {
    document.querySelector('#spaces')?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearFilters = () => {
    setQuery('');
    setSpaceType('All spaces');
    setCapacity(1);
  };

  const handleBook = (space: Space) => {
    if (!isAuthenticated()) {
      navigate('/signin', { state: { returnTo: '/admin' } });
      return;
    }

    navigate(`/admin/bookings/new?space=${space.id}`);
  };

  return (
    <>
      <HeroSection
        query={query}
        spaceType={spaceType}
        capacity={capacity}
        onQueryChange={setQuery}
        onSpaceTypeChange={setSpaceType}
        onCapacityChange={setCapacity}
        onShowSpaces={showSpaces}
      />
      <SpacesSection
        spaces={filteredSpaces}
        onClearFilters={clearFilters}
        onViewDetails={setSelectedSpace}
        onBook={handleBook}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={() => void loadMore()}
      />
      <AvailabilitySection spaces={spaces} />
      <AmenitiesSection />
      <CallToActionSection onShowSpaces={showSpaces} />
      <SpaceDetailsModal
        space={selectedSpace}
        opened={selectedSpace !== null}
        onClose={() => setSelectedSpace(null)}
      />
    </>
  );
};

export default HomePage;
