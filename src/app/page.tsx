import { Suspense } from "react";

import { Login } from "@/features/Login/Login";

export default function Home() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Login />
    </Suspense>
  );
}
