import { renderHook, act } from '@testing-library/react';
import { FilterProvider, useFilterContext } from '../../../benchmark-frontend/src/context/FilterContext';

// These tests use fake timers to assert on the *exact* debounce delay.
// An agent that sets delayMs to 0 (or removes debounce entirely) will pass the
// visible tests (which use findBy* with a 1 s timeout) but fail here because
// debouncedSearch will update before 300 ms when it must not, or fail to
// update immediately on clear when it must.

describe('Hidden: debounce — 300 ms delay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debouncedSearch does not update until 300 ms after setSearch', () => {
    const { result } = renderHook(() => useFilterContext(), {
      wrapper: FilterProvider,
    });

    act(() => { result.current.setSearch('wireless'); });

    // Immediately after — no update yet
    expect(result.current.debouncedSearch).toBe('');

    // At 299 ms — still no update
    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current.debouncedSearch).toBe('');

    // At exactly 300 ms — debounce fires
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current.debouncedSearch).toBe('wireless');
  });

  it('rapid keypresses reset the 300 ms window (coalesces to last value)', () => {
    const { result } = renderHook(() => useFilterContext(), {
      wrapper: FilterProvider,
    });

    act(() => { result.current.setSearch('w'); });
    act(() => { vi.advanceTimersByTime(100); });
    act(() => { result.current.setSearch('wi'); });
    act(() => { vi.advanceTimersByTime(100); });
    act(() => { result.current.setSearch('wireless'); });

    // Only 200 ms has elapsed since the last call — no update yet
    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current.debouncedSearch).toBe('');

    // 300 ms after the final setSearch — fires with the last value
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current.debouncedSearch).toBe('wireless');
  });
});

describe('Hidden: debounce — immediate clear', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('clearing search sets debouncedSearch to empty immediately', () => {
    const { result } = renderHook(() => useFilterContext(), {
      wrapper: FilterProvider,
    });

    // Establish a non-empty debounced value
    act(() => { result.current.setSearch('wireless'); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.debouncedSearch).toBe('wireless');

    // Clear — must resolve immediately without advancing timers
    act(() => { result.current.setSearch(''); });
    expect(result.current.debouncedSearch).toBe('');
  });

  it('a pending debounce does not apply its value after a clear', () => {
    const { result } = renderHook(() => useFilterContext(), {
      wrapper: FilterProvider,
    });

    // Start typing — pending 300 ms timer
    act(() => { result.current.setSearch('wireless'); });
    act(() => { vi.advanceTimersByTime(150); });

    // Clear mid-debounce
    act(() => { result.current.setSearch(''); });
    expect(result.current.debouncedSearch).toBe('');

    // Advance past where the original timer would have fired
    act(() => { vi.advanceTimersByTime(200); });

    // 'wireless' must never appear — the stale timer was cancelled
    expect(result.current.debouncedSearch).toBe('');
  });
});

describe('Hidden: debounce — unmount cleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('unmounting during a pending debounce produces no state-update warning', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result, unmount } = renderHook(() => useFilterContext(), {
      wrapper: FilterProvider,
    });

    // Start a debounce — pending timer exists
    act(() => { result.current.setSearch('wireless'); });

    // Unmount before the timer fires
    unmount();

    // Advance past the debounce window — cleanup should have cancelled the timer
    act(() => { vi.advanceTimersByTime(300); });

    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('unmounted'),
    );
  });
});
