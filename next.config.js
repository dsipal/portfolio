/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    loader: "default",
    domains: ["localhost","res.cloudinary.com"],
  },
  //basePath: process.env.BASE_PATH || '',
};
