import type { Root } from 'fumadocs-core/page-tree';
import { SidebarProvider } from 'fumadocs-ui/components/sidebar/base';
import { TreeContextProvider } from 'fumadocs-ui/contexts/tree';
import type { HTMLAttributes, ReactNode } from 'react';

type HTMLDivElement = globalThis.HTMLDivElement;
import { cn } from '@misque/ui/lib/utils';
import ArticleLayout from '@/components/side-bar';
import { NavProvider } from './nav-provider';
import { Navbar } from '@/components/navigation/navbar';

export interface DocsLayoutProps {
  tree: Root;
  containerProps?: HTMLAttributes<HTMLDivElement>;
  children: ReactNode;
}

export function DocsLayout({
  children,
  tree,
  containerProps,
}: DocsLayoutProps): ReactNode {
  const variables = cn(
    '[--fd-tocnav-height:36px] md:[--fd-sidebar-width:268px] lg:[--fd-sidebar-width:286px] xl:[--fd-toc-width:286px] xl:[--fd-tocnav-height:0px]'
  );

  return (
    <TreeContextProvider tree={tree}>
      <SidebarProvider>
        <NavProvider>
          <Navbar />
          <main
            id="nd-docs-layout"
            {...containerProps}
            className={cn(
              'flex flex-1 flex-row pe-(--fd-layout-offset) pt-14',
              variables,
              containerProps?.className
            )}
            style={
              {
                '--fd-layout-offset':
                  'max(calc(50vw - var(--fd-layout-width) / 2), 0px)',
                ...containerProps?.style,
              } as object
            }
          >
            <div
              className={cn(
                '[--fd-tocnav-height:36px] navbar:mr-[268px] lg:mr-[286px]! xl:[--fd-toc-width:286px] xl:[--fd-tocnav-height:0px] '
              )}
            >
              <ArticleLayout />
            </div>
            {children}
          </main>
        </NavProvider>
      </SidebarProvider>
    </TreeContextProvider>
  );
}
