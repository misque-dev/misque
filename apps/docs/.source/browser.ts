// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"getting-started.mdx": () => import("../content/docs/getting-started.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "packages/hijri/index.mdx": () => import("../content/docs/packages/hijri/index.mdx?collection=docs"), "packages/prayer-times/index.mdx": () => import("../content/docs/packages/prayer-times/index.mdx?collection=docs"), "packages/qibla/index.mdx": () => import("../content/docs/packages/qibla/index.mdx?collection=docs"), "packages/quran/index.mdx": () => import("../content/docs/packages/quran/index.mdx?collection=docs"), }),
};
export default browserCollections;