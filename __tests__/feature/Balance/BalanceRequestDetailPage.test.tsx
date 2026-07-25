import { render, screen } from '@testing-library/react'
import axios, { AxiosResponse } from 'axios'

import { AppRouterContextProviderMock } from '@/features/AppRouterContextProviderMock'
import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'
import BalanceRequestDetailPage from '@/app/dashboard/requests/[requestId]/page'
import { BALANCE_REQUESTS_ADMIN_API_ENDPOINT } from '@/shared/constants/global.constants'
import { GetAdminBalanceRequestResponse } from '@/shared/types/balance.types'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

const REQUEST_ID = 'req/with space'

const detailResponse: GetAdminBalanceRequestResponse = {
  version: '1.0',
  data: {
    request: {
      id: REQUEST_ID,
      amount: 31.45,
      paymentReference: null,
      status: 'pending',
      decisionReason: null,
      decisionAt: null,
      createdAt: '2026-07-21T12:00:00.000Z',
      updatedAt: '2026-07-21T12:00:00.000Z',
      userEmail: 'user@kraft.test',
      userName: 'Regular User',
      adminInCharge: null
    }
  },
  message: null,
  error: null
}

const renderPage = () => {
  const push = jest.fn()
  const Page = BalanceRequestDetailPage({ params: { requestId: REQUEST_ID } })

  render(
    <QueryProviderWrapper>
      <AppRouterContextProviderMock router={{ push }}>{Page}</AppRouterContextProviderMock>
    </QueryProviderWrapper>
  )
}

describe('BalanceRequestDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the detail component and fetches the request with the URL-encoded requestId, no server-side auth gate', async () => {
    mockedAxios.get.mockResolvedValue({
      data: detailResponse,
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestResponse>)

    renderPage()

    expect(await screen.findByRole('heading', { name: /detalle de solicitud/i })).toBeInTheDocument()
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${BALANCE_REQUESTS_ADMIN_API_ENDPOINT}/${encodeURIComponent(REQUEST_ID)}`
    )
  })
})
