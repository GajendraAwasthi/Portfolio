import { getPortfolioData, visiblePortfolioData } from '@/lib/data-service';
import PortfolioClient from './PortfolioClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Dynamic server rendering for live CMS updates

export default async function HomePage() {
  const data = visiblePortfolioData(await getPortfolioData());

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${data.profile.name} ${data.profile.surnameGradient}`,
    jobTitle: data.profile.headlineTyping?.[0] || 'Cybersecurity Pioneer & Developer',
    description: data.profile.description,
    url: 'https://gajendraawasthi.com.np',
    sameAs: [
      data.profile.socialLinks?.linkedin,
      data.profile.socialLinks?.github,
      data.profile.socialLinks?.tryhackme,
      data.profile.socialLinks?.facebook,
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <PortfolioClient data={data} />
    </>
  );
}
