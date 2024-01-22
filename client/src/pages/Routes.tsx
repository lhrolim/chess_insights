import MetaTags from "@components/MetaTags";

import BestGames from "./BestGames";

export const routes = {
  "/": () => (
    <MetaTags route="/" description="View Dashboard">
    </MetaTags>
  ),
  "/best": () => (
    <MetaTags
      route="/best"
      titlePrefix="Best Games - "
      description="View your best games played recently"
    >
      <BestGames />
    </MetaTags>
  )
};

