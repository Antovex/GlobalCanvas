const Loading = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="flex items-center gap-4 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-lg p-4 sm:p-6">
                <div className="flex flex-col">
                    <div className="mt-2 flex items-center gap-3">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-100">
                            Loading data...
                        </div>

                        <div className="ml-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
                            <span
                                className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"
                                style={{ animationDelay: "0.2s" }}
                            />
                            <span
                                className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"
                                style={{ animationDelay: "0.4s" }}
                            />
                        </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-400">
                        This may take a moment for large datasets.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
