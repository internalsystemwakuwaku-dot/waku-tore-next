'use client';

import { useEffect, useState } from 'react';

export function TrelloBoard() {
    return (
        <div className="flex-1 overflow-x-auto overflow-y-hidden h-full">
            <div className="h-full flex px-4 pb-4 gap-4 items-start">
                {/* Placeholder: 未着手リスト */}
                <div className="w-[280px] flex-shrink-0 flex flex-col max-h-full bg-[var(--list-bg)] rounded-[var(--border-radius)] border border-[var(--border-color)]">
                    <div className="p-3 font-bold text-sm flex justify-between items-center text-[var(--text-color)]">
                        <span>未着手 (TODO)</span>
                        <span className="text-xs opacity-50">3</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 gap-2 flex flex-col min-h-0">
                        {/* Mock Cards */}
                        <div className="bg-[var(--card-bg)] p-3 rounded-[4px] shadow-sm border border-[var(--border-color)] cursor-pointer hover:bg-[var(--card-bg)]/80 text-[var(--text-color)]">
                            <span className="text-sm">ログイン機能を実装する</span>
                        </div>
                        <div className="bg-[var(--card-bg)] p-3 rounded-[4px] shadow-sm border border-[var(--border-color)] cursor-pointer hover:bg-[var(--card-bg)]/80 text-[var(--text-color)]">
                            <span className="text-sm">DBスキーマを設計する</span>
                        </div>
                        <div className="bg-[var(--card-bg)] p-3 rounded-[4px] shadow-sm border border-[var(--border-color)] cursor-pointer hover:bg-[var(--card-bg)]/80 text-[var(--text-color)]">
                            <span className="text-sm">READMEを書く</span>
                        </div>
                    </div>
                    <div className="p-2">
                        <button className="w-full py-1.5 text-sm text-[var(--sub-text)] hover:bg-[var(--primary-color)] hover:text-white rounded transition-colors text-left px-2">
                            + カードを追加
                        </button>
                    </div>
                </div>

                {/* Placeholder: 進行中リスト */}
                <div className="w-[280px] flex-shrink-0 flex flex-col max-h-full bg-[var(--list-bg)] rounded-[var(--border-radius)] border border-[var(--border-color)]">
                    <div className="p-3 font-bold text-sm flex justify-between items-center text-[var(--text-color)]">
                        <span>進行中 (DOING)</span>
                        <span className="text-xs opacity-50">1</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 gap-2 flex flex-col min-h-0">
                        <div className="bg-[var(--card-bg)] p-3 rounded-[4px] shadow-sm border border-[var(--border-color)] cursor-pointer hover:bg-[var(--card-bg)]/80 text-[var(--text-color)]">
                            <div className="flex gap-1 mb-1">
                                <span className="h-1 w-8 bg-red-400 rounded-full"></span>
                            </div>
                            <span className="text-sm">フロントエンド実装</span>
                        </div>
                    </div>
                    <div className="p-2">
                        <button className="w-full py-1.5 text-sm text-[var(--sub-text)] hover:bg-[var(--primary-color)] hover:text-white rounded transition-colors text-left px-2">
                            + カードを追加
                        </button>
                    </div>
                </div>

                {/* Placeholder: 完了リスト */}
                <div className="w-[280px] flex-shrink-0 flex flex-col max-h-full bg-[var(--list-bg)] rounded-[var(--border-radius)] border border-[var(--border-color)]">
                    <div className="p-3 font-bold text-sm flex justify-between items-center text-[var(--text-color)]">
                        <span>完了 (DONE)</span>
                        <span className="text-xs opacity-50">5</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 gap-2 flex flex-col min-h-0">
                        <div className="bg-[var(--card-bg)] p-3 rounded-[4px] shadow-sm border border-[var(--border-color)] cursor-pointer hover:bg-[var(--card-bg)]/80 text-[var(--text-color)] opacity-70">
                            <span className="text-sm line-through">要件定義</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
