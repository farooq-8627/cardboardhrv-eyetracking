import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cardboardhrv.com";

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${baseUrl}/about`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/monitor`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
	];
}
