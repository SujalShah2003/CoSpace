import { useMemo, useState } from 'react';
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
  const {
    spaces,
    hasMore,
    loadMore,
    loadingMore,
  } = useSpaces(true, 6);
  const [query, setQuery] = useState('');
  const [spaceType, setSpaceType] = useState<string | null>('All spaces');
  const [capacity, setCapacity] = useState<number | string>(1);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);

  const filteredSpaces = useMemo(
    () => spaces.filter((space) => {
      if (space.status === 'unavailable') return false;
      const matchesQuery = `${space.name} ${space.type}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesType = spaceType === 'All spaces' || space.type === spaceType;
      const requestedCapacity = typeof capacity === 'number' ? capacity : 1;

      return matchesQuery && matchesType && space.capacity >= requestedCapacity;
    }),
    [capacity, query, spaceType, spaces],
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
