export enum QueryMatchMedia {
  isMobileTablet = '(max-width: 1024px)',
  isDesktop = '(min-width: 1024px)'
}

export const mockMatchMedia = (overrides: Partial<Record<QueryMatchMedia, boolean>>) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => {
      return {
        matches: overrides[query as QueryMatchMedia] || false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    }),
  });
}