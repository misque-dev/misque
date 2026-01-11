// @ts-nocheck
import { default as __fd_glob_6 } from "../content/docs/meta.json?collection=meta"
import * as __fd_glob_5 from "../content/docs/packages/quran/index.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/packages/qibla/index.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/packages/prayer-times/index.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/packages/hijri/index.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/getting-started.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.doc("docs", "content/docs", {"getting-started.mdx": __fd_glob_0, "index.mdx": __fd_glob_1, "packages/hijri/index.mdx": __fd_glob_2, "packages/prayer-times/index.mdx": __fd_glob_3, "packages/qibla/index.mdx": __fd_glob_4, "packages/quran/index.mdx": __fd_glob_5, });

export const meta = await create.meta("meta", "content/docs", {"meta.json": __fd_glob_6, });