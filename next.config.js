module.exports = {
	trailingSlash: true,
	output: 'standalone',
	images: {
		remotePatterns: [
			{ protocol: 'http',  hostname: 'localhost' },
			{ protocol: 'http',  hostname: 'strapi' },
			{ protocol: 'https', hostname: 'res.cloudinary.com' },
			{ protocol: 'https', hostname: '*.devinsipal.com' },
		],
	},
}
