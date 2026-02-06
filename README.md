This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

First, create a `.env.local` file in the root directory and configure the required environment variables. You can use `.env.example` as a template:

```bash
cp .env.example .env.local
```

Then, update the values in `.env.local`:

- `BACKEND_URI`: URL of your backend API server
- `SESSION_SECRET_KEY`: A secure random string for JWT encryption (generate using a secure method)
- `NEXT_PUBLIC_LOCAL_STORAGE`: Local storage key prefix (default: KRAFT_ENVIOS_LOCAL)
- `FRONTEND_URI`: URL of your frontend application
- `NEXT_PUBLIC_GET_SAT_PRODUCT_URI`: SAT Product API endpoint URL
- `NEXT_PUBLIC_DEFAULT_EMAIL`: This is the default email used to be filled in the external APIs

**Important:** Never commit your `.env.local` file to version control. It contains sensitive information.

### Development Server

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
