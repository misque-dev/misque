import React from 'react';
import { FooterLink } from '../config/types';
import Link from 'next/link';

interface Props {
  title: string;
  links: FooterLink[];
}

export const FooterSection = ({ title, links }: Props) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              {...(link.external && {
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
