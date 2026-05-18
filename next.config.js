const strapiHost = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
const strapiHostname = new URL(strapiHost).hostname;

module.exports = {
	trailingSlash: true,
	output: 'standalone',
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: strapiHostname,
			},
			{
				protocol: 'https',
				hostname: strapiHostname,
			},
		],
	},
}
