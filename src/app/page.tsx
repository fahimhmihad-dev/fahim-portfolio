import PortfolioHome from "@/components/portfolio-home";
import { getPortfolioPayload } from "@/lib/data";

export default async function HomePage() {
  const data = await getPortfolioPayload();
  return <PortfolioHome data={data} />;
}
