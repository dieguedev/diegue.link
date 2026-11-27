'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import debounce from 'debounce';
import { DotLoader } from '@/components/ui/dot-loader';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';

const DEBOUNCE_MS = 500;

export function LinksSearch() {
  const t = useTranslations('Links.search');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');
  const [isPending, startTransition] = useTransition();

  const search = (query: string) => {
    const params = new URLSearchParams(searchParams);
    const trimmed = query.trim();
    if (trimmed) params.set('q', trimmed);
    else params.delete('q');
    // Una búsqueda nueva siempre empieza en la primera página
    params.delete('page');

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  // El debounce se crea una vez; la ref le da siempre la versión actual de `search`
  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  });

  const debouncedSearch = useMemo(
    () => debounce((query: string) => searchRef.current(query), DEBOUNCE_MS),
    [],
  );

  useEffect(() => () => debouncedSearch.clear(), [debouncedSearch]);

  const handleChange = (query: string) => {
    setValue(query);
    debouncedSearch(query);
  };

  const handleClear = () => {
    debouncedSearch.clear();
    setValue('');
    search('');
  };

  return (
    <InputGroup>
      <InputGroupAddon>
        <Search aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={event => handleChange(event.target.value)}
        placeholder={t('placeholder')}
        aria-label={t('label')}
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      {(isPending || value) && (
        <InputGroupAddon align="inline-end">
          {isPending ? (
            <DotLoader label={t('pending')} className="px-2" />
          ) : (
            <InputGroupButton
              size="icon-xs"
              onClick={handleClear}
              aria-label={t('clear')}
              title={t('clear')}
            >
              <X />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
