import Topbar from '@/component/Topbar';
import Sidebar from '@/component/Sidebar';

export default function UserShell({ user, title, description, children, actions = null }) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex-1">
                <Topbar user={user} />

                <div className="space-y-6 p-6">
                    {title || description || actions ? (
                        <section className="rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-6 text-white shadow-lg">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    {title ? <h1 className="text-2xl font-bold">{title}</h1> : null}
                                    {description ? (
                                        <p className="mt-2 max-w-2xl text-sm text-blue-50">
                                            {description}
                                        </p>
                                    ) : null}
                                </div>
                                {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
                            </div>
                        </section>
                    ) : null}

                    {children}
                </div>
            </div>
        </div>
    );
}
