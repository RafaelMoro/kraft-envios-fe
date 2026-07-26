// TODO(landing epic, Story 2): delete this file. `/` becomes the public
// marketing landing page. This stub exists only so Story 1 can ship without
// leaving the site root broken. Do not add logic here.
import { redirect } from 'next/navigation'
import { LOGIN_ROUTE } from '@/shared/constants/global.constants'

export default function RootRedirect() {
  redirect(LOGIN_ROUTE)
}
