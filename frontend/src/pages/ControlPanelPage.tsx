import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/utils/api';
import { Shield, User, LogOut, CheckCircle, Trash } from 'lucide-react';

const ControlPanelPage = () => {
    const { user, logout } = useAuth();
    const [publicResponse, setPublicResponse] = useState<string>('');
    const [adminResponse, setAdminResponse] = useState<string>('');
    const [publicError, setPublicError] = useState<string>('');
    const [adminError, setAdminError] = useState<string>('');
    const [publicLoading, setPublicLoading] = useState(false);
    const [adminLoading, setAdminLoading] = useState(false);

    // Test public endpoint (anyone can access)
    const testPublicEndpoint = async () => {
        setPublicError('');
        setPublicResponse('');
        setPublicLoading(true);

        try {
            const response = await apiRequest('/posts', {
                method: 'GET',
            });

            if (response.ok) {
                const data = await response.json();
                setPublicResponse(`Success! Retrieved ${data.length} posts`);
            } else {
                setPublicError(`Error: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            setPublicError(err instanceof Error ? err.message : 'Request failed');
        } finally {
            setPublicLoading(false);
        }
    };

    // Test admin-only endpoint
    const testAdminEndpoint = async () => {
        setAdminError('');
        setAdminResponse('');
        setAdminLoading(true);

        try {
            const response = await apiRequest('/user', {
                method: 'GET',
            });

            if (response.ok) {
                const data = await response.json();
                setAdminResponse(`Admin access granted! Retrieved ${data.length} users`);
            } else if (response.status === 403) {
                setAdminError('Access denied: Admin privileges required (403 Forbidden)');
            } else if (response.status === 401) {
                setAdminError('Unauthorized: Your session may have expired');
            } else {
                setAdminError(`Error: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            // Don't let this kick us out - just show the error
            if (err instanceof Error && err.message === 'Unauthorized') {
                setAdminError('✗ Session expired - please log in again');
            } else {
                setAdminError(err instanceof Error ? err.message : 'Request failed');
            }
        } finally {
            setAdminLoading(false);
        }
    };

    // test debug endpoint
    const deleteJwtToken = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-zinc-800 to-zinc-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-zinc-700 rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-zinc-200">Auth Control Panel</h1>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                        <button
                            onClick={deleteJwtToken}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash size={18} />
                            Delete Tokens
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="bg-zinc-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            {user?.isAdmin ? (
                                <Shield className="text-purple-600" size={24} />
                            ) : (
                                <User className="text-blue-600" size={24} />
                            )}
                            <h2 className="text-xl font-semibold text-zinc-200">
                                {user?.isAdmin ? 'Admin User' : 'Regular User'}
                            </h2>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex">
                                <span className="font-medium text-zinc-200 w-32">User ID:</span>
                                <span className="text-zinc-200">{user?.userId}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium text-zinc-200 w-32">Email:</span>
                                <span className="text-zinc-200">{user?.email}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium text-zinc-200 w-32">Display Name:</span>
                                <span className="text-zinc-200">{user?.displayName || 'Not set'}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium text-zinc-200 w-32">Admin Status:</span>
                                <span className={`font-medium ${user?.isAdmin ? 'text-purple-600' : 'text-blue-600'}`}>
                                    {user?.isAdmin ? 'Admin' : 'Regular User'}
                                </span>
                            </div>
                            <div className="flex">
                                <span className="font-medium text-zinc-200 w-32">Account Created:</span>
                                <span className="text-zinc-200">
                                    {user?.timeCreated ? new Date(user.timeCreated).toLocaleDateString() : 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* API Test Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Public Endpoint Test */}
                    <div className="bg-zinc-600 rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="text-green-600" size={24} />
                            <h3 className="text-lg font-semibold text-zinc-300">Public Endpoint</h3>
                        </div>
                        <p className="text-sm text-zinc-200 mb-4">
                            This endpoint can be accessed by any authenticated user.
                        </p>
                        <button
                            onClick={testPublicEndpoint}
                            disabled={publicLoading}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {publicLoading ? 'Testing...' : 'Test GET /api/posts'}
                        </button>

                        {publicResponse && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-700">{publicResponse}</p>
                            </div>
                        )}
                        {publicError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{publicError}</p>
                            </div>
                        )}
                    </div>

                    {/* Admin Endpoint Test */}
                    <div className="bg-zinc-600 rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="text-purple-600" size={24} />
                            <h3 className="text-lg font-semibold text-zinc-300">Admin Only Endpoint</h3>
                        </div>
                        <p className="text-sm text-zinc-200 mb-4">
                            This endpoint requires admin privileges. Regular users will see an error.
                        </p>
                        <button
                            onClick={testAdminEndpoint}
                            disabled={adminLoading}
                            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {adminLoading ? 'Testing...' : 'Test GET /api/user (Admin Only)'}
                        </button>

                        {adminResponse && (
                            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                <p className="text-sm text-purple-700">{adminResponse}</p>
                            </div>
                        )}
                        {adminError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{adminError}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlPanelPage;