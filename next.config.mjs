import withFlowbiteReact from "flowbite-react/plugin/nextjs";

if (process.env.NEXT_PUBLIC_BUSINESS_TIMEZONE !== 'America/Mexico_City') {
  throw new Error('NEXT_PUBLIC_BUSINESS_TIMEZONE must be America/Mexico_City')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['jose']
};

export default withFlowbiteReact(nextConfig);