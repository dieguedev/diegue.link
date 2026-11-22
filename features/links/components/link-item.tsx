import { CornerDownRight, MousePointerClick } from 'lucide-react';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from '@/components/ui/item';
import type { LinkSummary } from '@/domain/services/url-service';
import { numberFormat } from '@/lib/utils/number-format';
import { CopyLinkButton } from '@/features/links/components/copy-link-button';
import { EditLinkDialog } from '@/features/links/components/edit-link-dialog';
import { DeleteLinkDialog } from '@/features/links/components/delete-link-dialog';

interface LinkItemProps {
  link: LinkSummary;
  createdAt: string;
}

export function LinkItem({ link, createdAt }: LinkItemProps) {
  return (
    <Item
      role="listitem"
      className="gap-3 bg-secondary-background shadow-shadow"
    >
      <ItemContent className="min-w-0">
        <ItemTitle className="line-clamp-none w-full min-w-0 font-heading text-base">
          <a
            href={`//${link.shortUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            title={link.shortUrl}
            className="truncate hover:underline"
          >
            {link.shortUrl}
          </a>
        </ItemTitle>
        <ItemDescription className="line-clamp-none flex min-w-0 items-center gap-1.5 text-foreground/70">
          <CornerDownRight aria-hidden className="size-3.5 shrink-0" />
          <span className="sr-only">Destino:</span>
          <a
            href={link.fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.fullUrl}
            className="truncate underline-offset-4 hover:text-foreground hover:underline"
          >
            {link.fullUrl}
          </a>
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <CopyLinkButton shortUrl={link.shortUrl} className="size-9" />
      </ItemActions>

      <ItemFooter className="border-t-2 border-border pt-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 items-center gap-1.5 rounded-base border-2 border-border bg-main px-2.5 font-heading text-main-foreground tabular-nums">
            <MousePointerClick aria-hidden className="size-4" />
            {numberFormat(link.clicks)}
            <span className="sr-only">clics</span>
          </span>
          <span className="truncate text-xs text-foreground/70 tabular-nums">
            {createdAt}
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          <EditLinkDialog link={link} />
          <DeleteLinkDialog link={link} />
        </div>
      </ItemFooter>
    </Item>
  );
}
