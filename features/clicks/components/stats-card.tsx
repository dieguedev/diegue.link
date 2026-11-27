import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface StatsCardProps {
  title: string;
  description?: string;
  isEmpty?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function StatsCard({
  title,
  description,
  isEmpty = false,
  className,
  children,
}: StatsCardProps) {
  const t = useTranslations('Clicks');

  return (
    <Card variant="secondary" className={cn('gap-4', className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-foreground/70">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="py-8 text-center text-sm text-foreground/70">
            {t('noData')}
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
