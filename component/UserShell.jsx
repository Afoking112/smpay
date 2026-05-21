import Topbar from '@/component/Topbar';
import Sidebar from '@/component/Sidebar';

export default function UserShell({ user, title, description, children, actions = null }) {
    return (
        <div className="app-shell-bg app-shell-grid min-h-screen pb-24 text-white lg:pb-8">
            <div className="mx-auto flex max-w-[1540px] gap-0 px-0 lg:px-4">
                <Sidebar />

                <div className="min-w-0 flex-1 px-4 pt-4 sm:px-6 lg:px-0 lg:pt-6">
                    <div className="mx-auto max-w-[1180px] space-y-6">
                        <Topbar user={user} />

                        {title || description || actions ? (
                            <section className="app-card-hero rounded-[2rem] p-6 sm:p-8">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                        {title ? <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1> : null}
                                        {description ? (
                                            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#b7c6d7] sm:text-base">
                                                {description}
                                            </p>
                                        ) : null}
                                    </div>
                                    {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
                                </div>
                            </section>
                        ) : null}

                        <div className="space-y-6">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
