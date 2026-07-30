import { useEffect } from 'react';
import { AppShell, Box, Burger, Flex } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminFooter from '@/components/admin/layout/AdminFooter';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminTopHeader from '@/components/admin/layout/AdminTopHeader';
import {
  clearSession,
  getCurrentUser,
  getRefreshToken,
} from '@/utils/auth';
import { logout as logoutRequest } from '@/services/auth.api';

const layoutTokens = {
  headerHeight: 76,
  footerHeight: 46,
  sidebarWidth: 340,
  compactSidebarWidth: 72,
};

const AdminLayout = () => {
  const [
    desktopOpened,
    {
      close: closeDesktop,
      open: openDesktop,
      toggle: toggleDesktop,
    },
  ] = useDisclosure(true);
  const [
    mobileOpened,
    {
      close: closeMobile,
      toggle: toggleMobile,
    },
  ] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 61.99em)');
  const shouldAutoCollapseDesktop = useMediaQuery('(max-width: 86em)');
  const navigate = useNavigate();
  const user = getCurrentUser();

  const sidebarOpened = isMobile ? true : desktopOpened;
  const burgerOpened = isMobile ? mobileOpened : desktopOpened;
  const navbarWidth = isMobile
    ? 'min(320px, 100vw)'
    : desktopOpened
      ? layoutTokens.sidebarWidth
      : layoutTokens.compactSidebarWidth;

  useEffect(() => {
    if (isMobile) {
      return;
    }

    if (shouldAutoCollapseDesktop) {
      closeDesktop();
      return;
    }

    openDesktop();
  }, [closeDesktop, isMobile, openDesktop, shouldAutoCollapseDesktop]);

  const logout = async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await logoutRequest(refreshToken);
    } finally {
      clearSession();
      navigate('/', { replace: true });
    }
  };

  const toggleNavigation = () => {
    if (isMobile) {
      toggleMobile();
      return;
    }

    toggleDesktop();
  };

  return (
    <AppShell
      layout="alt"
      header={{ height: layoutTokens.headerHeight }}
      footer={{ height: layoutTokens.footerHeight }}
      navbar={{
        width: navbarWidth,
        breakpoint: 'md',
        collapsed: { mobile: !mobileOpened },
      }}
      padding={0}
    >
      <AppShell.Header
        bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-8))"
        style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
      >
        <Flex align="center" gap={16} px={{ base: 12, md: 24 }} h="100%">
          <Burger
            opened={burgerOpened}
            onClick={toggleNavigation}
            size="sm"
            aria-label={burgerOpened ? 'Collapse navigation' : 'Expand navigation'}
          />
          <Flex flex={1} mih={0}>
            <AdminTopHeader user={user} onLogout={logout} />
          </Flex>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar
        bg="dark.9"
        p={0}
        data-auto-collapsed={
          shouldAutoCollapseDesktop && !isMobile ? true : undefined
        }
        style={{ borderRight: '1px solid var(--mantine-color-dark-5)' }}
      >
        <AdminSidebar
          user={user}
          opened={sidebarOpened}
          onNavigate={closeMobile}
          onLogout={logout}
        />
      </AppShell.Navbar>

      <AppShell.Main
        bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))"
      >
        <Box
          w="100%"
          p={{ base: 'md', sm: '40px' }}
          pb={24}
          style={{ containerType: 'inline-size' }}
        >
          <Outlet />
        </Box>
      </AppShell.Main>

      <AppShell.Footer
        bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-8))"
        p={0}
        style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
      >
        <AdminFooter />
      </AppShell.Footer>
    </AppShell>
  );
};

export default AdminLayout;
