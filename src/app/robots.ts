import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  // Replace this with your actual production domain
  const baseUrl = 'https://www.raobahadur.in'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/'], // Add paths here you don't want indexed
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
