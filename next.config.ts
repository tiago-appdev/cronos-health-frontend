/** @type {import('next').NextConfig} */
const nextConfig = {
	// Enable standalone output for better deployment
	output: "standalone",
	eslint: {
		ignoreDuringBuilds: true,
	},

	// Optimize images
	images: {
		domains: ["localhost"],
	},

	// Environment variables
	env: {
		API_URL: process.env.NEXT_PUBLIC_API_URL,
	},

	// Disable telemetry in production
	telemetry: {
		disabled: true,
	},
};

module.exports = nextConfig;
