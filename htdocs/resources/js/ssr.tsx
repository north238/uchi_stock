import ReactDOMServer from "react-dom/server";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { route } from "../../vendor/tightenco/ziggy";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
      resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob("./Pages/**/*.tsx")),
    setup: ({ App, props }) => {
      global.route = ((name: any, params: any, absolute: any) =>
        route(name, params, absolute, {
          // @ts-expect-error -- page.props.ziggy はPageProps型に定義されていない
          ...page.props.ziggy,
          // @ts-expect-error -- page.props.ziggy はPageProps型に定義されていない
          location: new URL(page.props.ziggy.location),
        })) as typeof route;

      return <App {...props} />;
    },
  })
);
