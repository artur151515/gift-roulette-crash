import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { CasesPage } from '@/pages/CasesPage';
import { CaseDetailsPage } from '@/pages/CaseDetailsPage';
import { CrashPage } from '@/pages/CrashPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ReferralPage } from '@/pages/ReferralPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';

export const AppRouter = () => {
	return (
		<Routes>
			<Route path="/" element={<AppShell />}>
				<Route index element={<Navigate to="/cases" replace />} />
				<Route path="cases" element={<CasesPage />} />
				<Route path="cases/:id" element={<CaseDetailsPage />} />
				<Route path="leaderboard" element={<LeaderboardPage />} />
				<Route path="referral" element={<ReferralPage />} />
				<Route path="profile" element={<ProfilePage />} />
				<Route path="*" element={<Navigate to="/cases" replace />} />
			</Route>
		</Routes>
	);
};