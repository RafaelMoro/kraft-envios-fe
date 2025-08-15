import withFlowbiteReact from "flowbite-react/plugin/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['jose']
};

export default withFlowbiteReact(nextConfig);