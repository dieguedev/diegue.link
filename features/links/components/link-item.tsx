import { CornerDownRight, MousePointerClick } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from '@/components/ui/item';
import type { LinkSummary } from '@/domain/links/link-service';
import { numberFormat } from '@/lib/utils/number-format';
import { CopyLinkButton } from '@/features/links/components/copy-link-button';
import { EditLinkDialog } from '@/features/links/components/edit-link-dialog';
import { DeleteLinkDialog } from '@/features/links/components/delete-link-dialog';
import { LinkStatsButton } from '@/features/links/components/link-stats-button';

interface LinkItemProps {
  link: LinkSummary;
  createdAt: string;
}

export function LinkItem({ link, createdAt }: LinkItemProps) {
  const t = useTranslations('Links.list');

  return (
    <Item
      role="listitem"
      className="gap-3 bg-secondary-background shadow-shadow"
    >
      <ItemContent className="min-w-0">
        <ItemTitle className="line-clamp-none w-full min-w-0 font-heading text-base">
          <a
            href={`//${link.address}`}
            target="_blank"
            rel="noopener noreferrer"
            title={link.address}
            className="truncate link-underline"
          >
            {link.address}
          </a>
        </ItemTitle>
        <ItemDescription className="line-clamp-none flex min-w-0 items-center gap-1.5 text-foreground/70">
          <CornerDownRight aria-hidden className="size-3.5 shrink-0" />
          <span className="sr-only">{t('destinationLabel')}</span>
          <a
            href={link.fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.fullUrl}
            className="truncate link-underline hover:text-foreground"
          >
            {link.fullUrl}
          </a>
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <CopyLinkButton address={link.address} className="size-9" />
      </ItemActions>

      <ItemFooter className="border-t-2 border-border pt-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 items-center gap-1.5 rounded-base border-2 border-border bg-main px-2.5 font-heading text-main-foreground tabular-nums">
            <MousePointerClick aria-hidden className="size-4" />
            {numberFormat(link.clicks)}
            <span className="sr-only">{t('clicksLabel')}</span>
          </span>
          <span className="truncate text-xs text-foreground/70 tabular-nums">
            {createdAt}
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          <LinkStatsButton link={link} />
          <EditLinkDialog link={link} />
          <DeleteLinkDialog link={link} />
        </div>
      </ItemFooter>
    </Item>
  );
}
