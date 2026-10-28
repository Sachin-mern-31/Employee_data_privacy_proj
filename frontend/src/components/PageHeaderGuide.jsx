import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable Page Header with Built-in Feature Guide
 * Helps users and evaluators instantly understand the page purpose and how to test it.
 */
const PageHeaderGuide = ({
    title,
    subtitle,
    icon: Icon,
    purpose,
    testSteps = [],
    techBadge,
    nextStepText,
    nextStepUrl,
    actions
}) => {
    const [showGuide, setShowGuide] = useState(true);
    const navigate = useNavigate();

    return (
        <div className="space-y-3">
            {/* Main Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        {Icon && (
                            <div className="w-7 h-7 rounded-md bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 shrink-0">
                                <Icon className="w-4 h-4 text-slate-300" />
                            </div>
                        )}
                        <h1 className="text-base sm:text-lg font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                            {title}
                            {techBadge && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-normal">
                                    {techBadge}
                                </span>
                            )}
                        </h1>
                    </div>
                    {subtitle && (
                        <p className="text-xs text-slate-400 pl-9 sm:pl-9">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 pl-9 sm:pl-0">
                    <button
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className={`text-xs px-2.5 py-1.5 rounded-md border transition cursor-pointer flex items-center gap-1.5 ${
                            showGuide
                                ? 'bg-slate-800 text-slate-200 border-slate-700'
                                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                        title="Toggle Page Explanation"
                    >
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-medium">
                            {showGuide ? 'Hide Guide' : 'How It Works'}
                        </span>
                        {showGuide ? (
                            <ChevronUp className="w-3 h-3 text-slate-500" />
                        ) : (
                            <ChevronDown className="w-3 h-3 text-slate-500" />
                        )}
                    </button>
                    {actions}
                </div>
            </div>

            {/* Collapsible Explainer Box */}
            {showGuide && purpose && (
                <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800/90 text-xs space-y-2.5 animate-fadeIn">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold text-slate-200 mr-1.5">What this page shows:</span>
                                <span className="text-slate-300 leading-relaxed">{purpose}</span>
                            </div>
                        </div>
                    </div>

                    {testSteps.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                                    Quick Test Steps:
                                </span>
                                {testSteps.map((step, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 text-slate-300">
                                        <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center border border-slate-700">
                                            {idx + 1}
                                        </span>
                                        <span>{step}</span>
                                    </span>
                                ))}
                            </div>

                            {nextStepText && nextStepUrl && (
                                <button
                                    onClick={() => navigate(nextStepUrl)}
                                    className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer font-medium hover:underline shrink-0"
                                >
                                    <span>{nextStepText}</span>
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PageHeaderGuide;
