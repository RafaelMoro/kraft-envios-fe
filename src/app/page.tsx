import { Suspense } from "react";

import { Login } from "@/features/Login/Login";
import { LoadingLoginPage } from "@/features/Login/LoadingLoginPage";

export default function Home() {
  return (
    <Suspense fallback={<LoadingLoginPage />}>
      <Login />
    </Suspense>
  );
}
