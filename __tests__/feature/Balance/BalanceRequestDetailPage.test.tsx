import { render, screen } from '@testing-library/react'
import axios, { AxiosResponse } from 'axios'
import { redirect } from 'next/navigation'

import { AppRouterContextProviderMock } from '@/features/AppRouterContextProviderMock'
import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'
import BalanceRequestDetailPage from '@/app/dashboard/requests/[requestId]/page'
import { BALANCE_REQUESTS_ADMIN_API_ENDPOINT } from '@/shared/constants/global.constants'
import { GetAdminBalanceRequestResponse } from '@/shared/types/balance.types'
import { LoginData } from '@/shared/types/login.types'
import { getAccessToken, getUserInfo } from '../../../src/shared/lib/auth.lib'

jest.mock('axios')
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  redirect: jest.fn()
}))
jest.mock('../../../src/shared/lib/auth.lib', () => ({
  getAccessToken: jest.fn(),
  getUserInfo: jest.fn()
}))

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>
const mockedGetUserInfo = getUserInfo as jest.MockedFunction<typeof getUserInfo>

const REQUEST_ID = 'req/with space'

const adminUserInfo: LoginData = {
  data: { user: { email: 'admin@kraft.test', name: 'Admin', lastName: 'User', role: ['admin'] } },
  error: null,
  message: null,
  success: true,
  version: '1.0'
}

const nonAdminUserInfo: LoginData = {
  data: { user: { email: 'user@kraft.test', name: 'Regular', lastName: 'User', role: ['user'] } },
  error: null,
  message: null,
  success: true,
  version: '1.0'
}

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

const renderPage = async () => {
  const push = jest.fn()
  const Page = await BalanceRequestDetailPage({ params: { requestId: REQUEST_ID } })

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

  it('redirects to the login route with the encoded return URL when no access token is present', async () => {
    mockedGetAccessToken.mockResolvedValue('')
    mockedGetUserInfo.mockResolvedValue(null)

    await renderPage()

    expect(mockedRedirect).toHaveBeenCalledWith('/?redirect=%2Fdashboard%2Frequests%2Freq%252Fwith%2520space')
    expect(mockedAxios.get).not.toHaveBeenCalled()
  })

  it('renders the detail heading and fetches the request for an admin user', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.get.mockResolvedValue({
      data: detailResponse,
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestResponse>)

    await renderPage()

    expect(await screen.findByRole('heading', { name: /detalle de solicitud/i })).toBeInTheDocument()
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${BALANCE_REQUESTS_ADMIN_API_ENDPOINT}/${encodeURIComponent(REQUEST_ID)}`
    )
    expect(mockedRedirect).not.toHaveBeenCalled()
  })

  it('renders the unauthorized screen with no axios call for a non-admin user', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(nonAdminUserInfo)

    await renderPage()

    expect(await screen.findByText(/acceso no autorizado/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /volver al panel/i })).toHaveAttribute('href', '/dashboard')
    expect(mockedAxios.get).not.toHaveBeenCalled()
  })

  it('renders the unauthorized screen when the user-info cookie is missing or unparseable', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(null)

    await renderPage()

    expect(await screen.findByText(/acceso no autorizado/i)).toBeInTheDocument()
    expect(mockedAxios.get).not.toHaveBeenCalled()
  })
})
