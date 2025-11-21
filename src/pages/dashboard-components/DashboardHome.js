import React, { useEffect, useMemo, useState } from 'react';
import SetupCompany from './SetupCompany';
import Compose from './Compose';
import Inbox from './Inbox';
import Sent from './Sent';
import Important from './Important';
import CreateUser from './CreateUser';
import Permission from './Permission';
import Find from './Find';
import Settings from './Settings';
import AddFiles from './AddFileCategories';
import AddFileReference from './AddFileReference';
import AssignToUsers from './AssignToUsers';
import ThemeSelector from './ThemeSelector';
import ChangeUserRole from './ChangeUserRole';
import PasswordResetRequests from './PasswordResetRequests';

const DashboardHome = () => {
	const [active, setActive] = useState(null);
	const [inboxRefreshToggle, setInboxRefreshToggle] = useState(false);

	// local state derived from localStorage
	const draftsKey = 'draft_mails_v1';
	const sentKey = 'sent_mails_v1';
	const resetKey = 'password_reset_requests';

	// trigger re-read when storage changes elsewhere
	useEffect(() => {
		function onStorage(e) {
			if (!e.key || [draftsKey, sentKey, resetKey].includes(e.key)) {
				setInboxRefreshToggle(t => !t);
			}
		}
		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	}, []);

	const items = [
		{ key: 'setup', title: 'Setup Company', desc: 'Create and configure company details.', Comp: SetupCompany },
		{ key: 'compose', title: 'Compose Message', desc: 'Write and send a new message.', Comp: Compose },
		{ key: 'inbox', title: 'Inbox', desc: 'View received messages.', Comp: Inbox },
		{ key: 'sent', title: 'Sent', desc: 'Messages you have sent.', Comp: Sent },
		{ key: 'important', title: 'Important', desc: 'Flagged or important items.', Comp: Important },
		{ key: 'createUser', title: 'Create User', desc: 'Add a new user to the system.', Comp: CreateUser },
		{ key: 'permission', title: 'Permissions', desc: 'Manage user permissions.', Comp: Permission },
		{ key: 'find', title: 'Find', desc: 'Search across files and messages.', Comp: Find },
		{ key: 'settings', title: 'Settings', desc: 'Update dashboard preferences.', Comp: Settings },
		{ key: 'addFiles', title: 'File Categories', desc: 'Manage file categories.', Comp: AddFiles },
		{ key: 'addFileRef', title: 'File Reference', desc: 'Add or edit file references.', Comp: AddFileReference },
		{ key: 'assign', title: 'Assign To Users', desc: 'Assign tasks or files to users.', Comp: AssignToUsers },
		{ key: 'theme', title: 'Theme Selector', desc: 'Pick a theme for the dashboard.', Comp: ThemeSelector },
		{ key: 'changeRole', title: 'Change User Role', desc: 'Promote or demote users.', Comp: ChangeUserRole },
		{ key: 'passwordReset', title: 'Password Reset Requests', desc: 'Handle reset requests.', Comp: PasswordResetRequests },
	];

	const ActiveComp = active ? items.find(i => i.key === active)?.Comp : null;

	// read messages from localStorage and build a unified list
	const { messages, newCount, recentTen, resetRequests } = useMemo(() => {
		let drafts = [];
		let sent = [];
		try { drafts = JSON.parse(localStorage.getItem(draftsKey)) || []; } catch (e) { drafts = []; }
		try { sent = JSON.parse(localStorage.getItem(sentKey)) || []; } catch (e) { sent = []; }

		const normalized = [];
		drafts.forEach(d => normalized.push({
			id: d.id || `draft-${Math.random()}`,
			type: 'draft',
			to: d.to || '',
			content: d.content || '',
			ts: d.updatedAt ? new Date(d.updatedAt).getTime() : Date.now(),
			raw: d
		}));
		sent.forEach(s => normalized.push({
			id: s.id || `sent-${Math.random()}`,
			type: 'sent',
			to: s.to || '',
			content: s.description || s.content || '',
			ts: s.sentAt ? new Date(s.sentAt).getTime() : Date.now(),
			raw: s
		}));

		normalized.sort((a,b) => b.ts - a.ts);

		// last seen logic
		let lastSeen = null;
		try { lastSeen = localStorage.getItem('dashboard_last_inbox_seen'); } catch (e) { lastSeen = null; }
		const lastSeenTs = lastSeen ? new Date(lastSeen).getTime() : 0;
		const newMsgs = normalized.filter(m => m.ts > lastSeenTs);

		// last 10
		const recentTen = normalized.slice(0, 10);

		// password reset requests
		let resetRequests = [];
		try { resetRequests = JSON.parse(localStorage.getItem(resetKey)) || []; } catch (e) { resetRequests = []; }

		return { messages: normalized, newCount: newMsgs.length, recentTen, resetRequests };
	}, [inboxRefreshToggle]);

	return (
		<div className="p-4">
			<h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>

			{!active && (
				<div>
					<p className="mb-4 text-sm text-gray-600">Overview: new items, recent emails and password-reset requests.</p>

					<div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
						{/* New Emails box */}
						<div className="p-4 rounded-xl border shadow-sm bg-white">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="text-lg font-semibold">New Emails</h3>
									<p className="text-sm text-gray-600">Messages received since you last checked</p>
								</div>
								<div className="text-right">
									<div className="text-xl font-bold">{newCount}</div>
									<button
										onClick={() => {
											localStorage.setItem('dashboard_last_inbox_seen', new Date().toISOString());
											setInboxRefreshToggle(t => !t);
										}}
										className="mt-2 px-3 py-1 rounded border text-sm"
									>
										Mark seen
									</button>
								</div>
							</div>

							<div className="mt-3 space-y-2">
								{messages.slice(0,5).length === 0 && <div className="text-sm text-gray-500">No recent messages</div>}
								{messages.slice(0,5).map(m => (
									<div key={m.id} className="p-2 rounded hover:bg-gray-50 cursor-pointer flex items-start justify-between" onClick={() => setActive('inbox')}>
										<div className="min-w-0">
											<div className="font-medium truncate">{m.to || '—'}</div>
											<div className="text-xs text-gray-600 truncate">{(m.content || '').slice(0,100)}</div>
										</div>
										<div className="text-xs text-gray-500 ml-3">{new Date(m.ts).toLocaleString()}</div>
									</div>
								))}
							</div>
						</div>

						{/* Last 10 Emails box */}
						<div className="p-4 rounded-xl border shadow-sm bg-white">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="text-lg font-semibold">Last 10 Emails</h3>
									<p className="text-sm text-gray-600">Most recent messages across Drafts & Sent</p>
								</div>
								<div>
									<button onClick={() => setActive('inbox')} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Open Inbox</button>
								</div>
							</div>

							<div className="mt-3 divide-y">
								{recentTen.length === 0 && <div className="text-sm text-gray-500 p-2">No messages yet</div>}
								{recentTen.map(m => (
									<div key={m.id} className="py-2 flex items-center justify-between">
										<div className="min-w-0">
											<div className="font-medium truncate">{m.to || (m.raw && m.raw.username) || '—'}</div>
											<div className="text-xs text-gray-600 truncate">{(m.content || '').slice(0,120)}</div>
										</div>
										<div className="ml-4 text-xs text-gray-500">{new Date(m.ts).toLocaleString()}</div>
									</div>
								))}
							</div>
						</div>

						{/* Password reset requests box */}
						<div className="p-4 rounded-xl border shadow-sm bg-white">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="text-lg font-semibold">Password Reset Requests</h3>
									<p className="text-sm text-gray-600">Pending requests from users</p>
								</div>
								<div className="text-right">
									<div className="text-xl font-bold">{resetRequests.filter(r => !r.handled).length}</div>
									<button onClick={() => setActive('passwordReset')} className="mt-2 px-3 py-1 rounded border text-sm">Manage</button>
								</div>
							</div>

							<div className="mt-3 space-y-2">
								{resetRequests.length === 0 && <div className="text-sm text-gray-500">No requests</div>}
								{resetRequests.slice(0,5).map(r => (
									<div key={r.id} className="p-2 rounded hover:bg-gray-50">
										<div className="font-medium">{r.username || r.email}</div>
										<div className="text-xs text-gray-600">{(r.reason || '').slice(0,120)}</div>
										<div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()} • {r.handled ? 'Handled' : 'Pending'}</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{active && (
				<div>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-xl font-semibold">{items.find(i => i.key === active)?.title}</h3>
						<div>
							<button
								onClick={() => setActive(null)}
								className="px-3 py-1 border rounded mr-2 text-sm"
							>
								Back
							</button>
							<button
								onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
								className="px-3 py-1 bg-gray-100 rounded text-sm"
							>
								Scroll Top
							</button>
						</div>
					</div>
					<div className="p-2 border rounded bg-white">
						{ActiveComp ? <ActiveComp /> : <p>Component not found.</p>}
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardHome;

