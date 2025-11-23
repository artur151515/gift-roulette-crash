import { Skeleton } from '@/components/ui/skeleton';
import { CaseCard } from '@/components/CaseCard';
import { getCases } from '@/api/cases.ts';
import { useQuery } from '@tanstack/react-query';
import type { CasesResponse } from '@/types/cases.ts';

export const CasesPage = () => {
    const { data, isLoading, isError } = useQuery<CasesResponse, Error>({
        queryKey: ['cases'],
        queryFn: () => getCases(),
    });

    if (isLoading) {
        return (
            <div className="flex-1 pb-20 p-4">
                <h1 className="text-2xl font-bold text-foreground mb-6">Кейсы</h1>
                <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 pb-20 p-4">
                <h1 className="text-2xl font-bold text-foreground mb-6">Кейсы</h1>
                <div className="text-center py-12 space-y-3">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Ошибка загрузки
                    </h3>
                    <p className="text-muted-foreground">
                        Не удалось загрузить кейсы. Попробуйте позже.
                    </p>
                </div>
            </div>
        );
    }

    const cases = data?.cases || [];

    return (
        <div className="flex-1 pb-20">
            <div className="p-4">
                <h1 className="text-3xl font-bold text-foreground mb-6">Кейсы</h1>
                
                {cases.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {cases.map((caseItem) => (
                            <CaseCard key={caseItem.id} case={caseItem} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 space-y-3">
                        <div className="text-4xl mb-4">📦</div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Кейсов пока нет
                        </h3>
                        <p className="text-muted-foreground">
                            Загляните позже!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};