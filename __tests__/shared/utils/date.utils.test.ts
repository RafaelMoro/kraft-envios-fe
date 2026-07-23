import {
  formatDateToSpanish,
  getBusinessCalendarMonthYear,
  toBusinessDateRange,
} from '@/shared/utils/date.utils'

describe('formatDateToSpanish', () => {
  describe('Given a complete UTC instant', () => {
    it('When the instant is Mexico City local midnight, Then it renders "Feb 1, 12:00 am" regardless of host timezone', () => {
      const result = formatDateToSpanish('2026-02-01T06:00:00.000Z')

      expect(result).toEqual({
        fullDateTime: 'Feb 1, 12:00 am',
        date: 'Feb 1',
        time: '12:00 am',
      })
    })

    it('When the instant is one millisecond before Mexico City local midnight, Then it still renders January 31', () => {
      const result = formatDateToSpanish('2026-02-01T05:59:59.999Z')

      expect(result.date).toBe('Ene 31')
    })
  })

  describe('Given an offsetless or malformed timestamp', () => {
    it('When the timestamp has no offset, Then it returns the stable placeholder', () => {
      const result = formatDateToSpanish('2026-02-01T06:00:00.000')

      expect(result).toEqual({ fullDateTime: '--', date: '--', time: '--' })
    })

    it('When the timestamp is malformed, Then it returns the stable placeholder', () => {
      const result = formatDateToSpanish('not-a-date')

      expect(result).toEqual({ fullDateTime: '--', date: '--', time: '--' })
    })
  })
})

describe('getBusinessCalendarMonthYear', () => {
  describe('Given an instant near a UTC month boundary', () => {
    it('When Mexico City calendar day is still the prior month, Then it returns the Mexico City month/year', () => {
      const result = getBusinessCalendarMonthYear(new Date('2026-03-01T05:00:00.000Z'))

      expect(result).toEqual({ month: 2, year: 2026 })
    })
  })
})

describe('toBusinessDateRange', () => {
  describe('Given a valid single-day range spanning the 2021 Mexico City spring DST transition', () => {
    it('When converted, Then the next local midnight is 23 elapsed hours after the selected start midnight', () => {
      const result = toBusinessDateRange('2021-04-04', '2021-04-04')

      expect(result).not.toBeNull()
      const elapsedHours =
        (new Date(result!.endDate).getTime() - new Date(result!.startDate).getTime()) /
        (60 * 60 * 1000)
      expect(elapsedHours).toBe(23)
    })
  })

  describe('Given an ordinary valid range', () => {
    it('When converted, Then it returns complete UTC instants ending in Z', () => {
      const result = toBusinessDateRange('2026-02-01', '2026-02-01')

      expect(result).toEqual({
        startDate: '2026-02-01T06:00:00.000Z',
        endDate: '2026-02-02T06:00:00.000Z',
      })
    })
  })

  describe('Given invalid ranges', () => {
    it('When the end precedes the start, Then it returns null', () => {
      expect(toBusinessDateRange('2026-02-05', '2026-02-01')).toBeNull()
    })

    it('When a boundary is not a plain calendar date, Then it returns null', () => {
      expect(toBusinessDateRange('2026-02-01T00:00:00.000Z', '2026-02-05')).toBeNull()
    })

    it('When a boundary is malformed, Then it returns null', () => {
      expect(toBusinessDateRange('2026-02-30', '2026-03-01')).toBeNull()
    })
  })
})
