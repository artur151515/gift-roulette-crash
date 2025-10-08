import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CaseCard } from '@/components/CaseCard';
import { cn } from '@/lib/utils';
import { getCases } from '@/api/cases.ts';
import { useQuery } from '@tanstack/react-query';
import type { CaseType } from '@/types';
import type { CasesResponse, CaseSummary } from '@/types/new/cases';

const tabs = [
    { id: 'paid' as CaseType, label: 'Paid', icon: '💎' },
    { id: 'free' as CaseType, label: 'Free', icon: '🎁' },
];

export const CasesPage = () => {
    const [activeTab, setActiveTab] = useState<CaseType>('paid');

    const { data, isLoading, isError } = useQuery<CasesResponse, Error>({
        queryKey: ['cases', 1, 10],
        queryFn: () => getCases(),
    });

    if (isLoading) return <p>Загрузка...</p>;
    if (isError) return <p>Ошибка загрузки</p>;

    const cases: CaseSummary[] = data?.cases || [];

    return (
        <div className="flex-1 pb-20">
            {/* Header */}
            <div className="p-4">
                <h1 className="text-2xl font-bold text-foreground mb-6">Cases</h1>
                {/* Tabs */}
                <div className="flex bg-card rounded-xl p-1 mb-6">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'default' : 'ghost'}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex-1 rounded-lg font-semibold transition-all',
                                activeTab === tab.id
                                    ? 'btn-primary shadow-md'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Cases Grid */}
            <div className="px-4">
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                        ))}
                    </div>
                ) : cases.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {cases.map((caseItem) => (
                            <CaseCard key={caseItem.id} case={caseItem} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 space-y-3">
                        <div className="text-4xl mb-4">📦</div>
                        <h3 className="text-lg font-semibold text-foreground">
                            No cases available
                        </h3>
                        <p className="text-muted-foreground">
                            Check back later for new cases!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};