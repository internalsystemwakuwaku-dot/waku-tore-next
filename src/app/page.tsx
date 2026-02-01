'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useRace } from '@/hooks/useRace';
import { useOmikuji } from '@/hooks/useOmikuji';
import { useTrelloStore } from '@/stores/trelloStore';
import { signIn, signUp } from '@/lib/auth-client';
import { toast } from 'sonner';
import { RANKS, RACE_SCHEDULE, SHOP_ITEMS } from '@/lib/game/constants';

export default function Home() {
    // --- Placeholders for Global Functions & GM Object ---
    // (Original logic will be migrated in the next step. These prevent runtime errors for UI verification.)
    const {
        xp, totalXp, gold, level,
        addXp, addGold,
        calculateRank, calculateNextRankXp, toggleSound, toggleParticle,
        clickPower, autoXpPerSec, addBet, buyItem, inventory // Added buyItem, inventory
    } = useGameStore();

    const [activeTab, setActiveTab] = useState('tasks');

    const {
        result: omikujiResult,
        isDrawing: isOmikujiDrawing,
        drawOmikuji
    } = useOmikuji();

    const { raceStatus, nextRace, newspaper } = useRace();
    const { lists, cards, fetchData, loading: trelloLoading } = useTrelloStore();

    // ランク計算
    const currentRankName = calculateRank();
    const nextRankXp = calculateNextRankXp();

    // 次のランクまでの進捗率 (簡易計算: 実際は現在のランクのminXpからの相対値が良いが、まずは全体で)
    // ここでは「次のランクに必要なXP」を表示しているので、進捗バーの計算は工夫が必要
    // ひとまずシンプルに「現在のランクのminXp」を取得して計算
    // Storeには未実装なので、ここで簡易計算
    // ランク計算
    // XPバーの進捗計算
    const currentRankIndex = RANKS.findIndex(r => r.name === currentRankName);
    const currentRankMinXp = RANKS[currentRankIndex]?.minXp || 0;
    const nextRankMinXp = RANKS[currentRankIndex + 1]?.minXp || Infinity;

    // totalXpを使うべきだが、storeのaddXp実装でtotalXpも更新されている前提
    // 初心者はLv.0なので、totalXpがそのまま進捗になる場合もあるが、ランク制なので相対計算
    const progressPercent = nextRankMinXp === Infinity
        ? 100
        : Math.min(100, Math.max(0, ((totalXp - currentRankMinXp) / (nextRankMinXp - currentRankMinXp)) * 100));

    // Cookie Clicker Logic
    const clickCookie = (e: React.MouseEvent) => {
        addXp(clickPower, 'click');
        addGold(clickPower * 10);

        // パーティクル演出
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        // マウス位置または要素の中心
        const x = e.clientX || (rect.left + rect.width / 2);
        const y = e.clientY || (rect.top + rect.height / 2);
        createParticle(x, y, `+${clickPower} XP`);
        createParticle(x, y - 20, `+${clickPower * 10} Gold`, 'gold');
    };

    const createParticle = (x: number, y: number, text: string, colorClass: string = '') => {
        // SSR回避
        if (typeof document === 'undefined') return;

        const el = document.createElement('div');
        el.className = `click-particle ${colorClass}`;
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    };


    const toggleSidebar = (arg?: string) => console.log('toggleSidebar', arg);
    const toggleHeader = () => {
        const header = document.querySelector('header');
        header?.classList.toggle('minimized');
        const icon = document.getElementById('toggle-icon');
        if (icon) icon.textContent = header?.classList.contains('minimized') ? 'expand_more' : 'expand_less';
    };
    const GM = {
        pokeMascot: () => toast('にゃーん'),
        clickCookie: clickCookie,
        manualSave: () => toast.success('データは自動保存されています'),
        openRace: () => document.getElementById('race-modal')?.classList.remove('hidden'),
        placeBet: (horseId: number, horseName: string, odds: number) => {
            const amount = 1000;
            if (confirm(`${horseName} に ${amount}G 投票しますか？`)) {
                addBet({ horseId, horseName, odds, amount, raceId: nextRace?.id });
            }
        },
        openPastResults: () => toast.info('履歴機能は準備中です'),
        openGacha: () => document.getElementById('gacha-modal')?.classList.remove('hidden'),
        openMoneyRanking: () => document.getElementById('money-ranking-modal')?.classList.remove('hidden'),
        showOmikuji: () => document.getElementById('omikuji-modal')?.classList.remove('hidden'),
        pullGacha: () => toast.info('ガチャ機能実装中...'),
        showRankingWindow: () => toast.info('ランキング更新中...'),
        updateProfilePreview: () => console.log('GM.updateProfilePreview'),
        openShopModal: () => document.getElementById('shop-modal')?.classList.remove('hidden'),
    };
    const [rankingData, setRankingData] = useState<any[]>([]);

    const openRankingModal = () => {
        const mockData = [
            { id: 'user1', name: '佐藤 太郎', gold: 125000, xp: 5400, rank: 'GM' },
            { id: 'user2', name: '鈴木 花子', gold: 98000, xp: 4200, rank: 'SS' },
            { id: 'user3', name: '田中 一郎', gold: 75000, xp: 3500, rank: 'S' },
            { id: 'user4', name: '高橋 次郎', gold: 50000, xp: 2100, rank: 'A' },
            { id: 'me', name: 'あなた', gold: gold, xp: totalXp, rank: currentRankName }
        ];
        const sorted = mockData.sort((a, b) => b.gold - a.gold);
        setRankingData(sorted);
        document.getElementById('money-ranking-modal')?.classList.remove('hidden');
    };
    const loadData = async () => {
        toast.promise(fetchData(), {
            loading: 'Trelloデータを更新中...',
            success: 'データを更新しました',
            error: (err) => `エラー: ${err.message}`
        });
    };
    const openDashboard = () => console.log('openDashboard');
    const openMemoModal = () => console.log('openMemoModal');
    const openSettingsModal = () => {
        document.getElementById('settings-modal')?.classList.remove('hidden');
        // Load initial values from localStorage
        const theme = localStorage.getItem('theme') || 'default';
        const selectTheme = document.getElementById('select-theme') as HTMLSelectElement;
        if (selectTheme) selectTheme.value = theme;
    };

    const changeTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const theme = e.target.value;
        const body = document.body;
        // Reset classes but keep essential ones if any (none for now)
        body.className = '';
        if (theme !== 'default') {
            body.classList.add(`${theme}-mode`);
        }
        localStorage.setItem('theme', theme);
        toast.success('テーマを変更しました');
    };

    const toggleBgInput = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        const inputGroup = document.getElementById('bg-input-group');
        if (type === 'image' || type === 'video') {
            inputGroup?.classList.remove('hidden');
        } else {
            inputGroup?.classList.add('hidden');
            // Reset background
            const bgContainer = document.getElementById('bg-video-container');
            const video = document.getElementById('bg-video') as HTMLVideoElement;
            if (bgContainer) bgContainer.style.backgroundImage = 'none';
            if (video) { video.src = ''; video.style.display = 'none'; }
        }
    };

    const updateBgTransform = () => {
        const scale = (document.getElementById('bg-scale') as HTMLInputElement).value;
        const bgContainer = document.getElementById('bg-video-container');
        if (bgContainer) {
            bgContainer.style.transform = `scale(${scale})`;
        }
    };

    const updateBgUrl = () => {
        const url = (document.getElementById('bg-url') as HTMLInputElement).value;
        const type = (document.getElementById('bg-type') as HTMLSelectElement).value;
        const bgContainer = document.getElementById('bg-video-container');
        const video = document.getElementById('bg-video') as HTMLVideoElement;

        if (type === 'image') {
            if (bgContainer) {
                bgContainer.style.backgroundImage = `url('${url}')`;
                bgContainer.style.backgroundSize = 'cover';
                bgContainer.style.backgroundPosition = 'center';
            }
            if (video) video.style.display = 'none';
        } else if (type === 'video') {
            if (bgContainer) bgContainer.style.backgroundImage = 'none';
            if (video) {
                video.src = url;
                video.style.display = 'block';
                video.play().catch(e => console.error(e));
            }
        }
    };

    const resetBgParam = (p: string) => {
        if (p === 'scale') {
            (document.getElementById('bg-scale') as HTMLInputElement).value = '1.0';
            updateBgTransform();
        }
    };

    // --- On Mount: Load Settings ---
    useEffect(() => {
        // Load Theme
        const theme = localStorage.getItem('theme') || 'default';
        if (theme !== 'default') {
            document.body.classList.add(`${theme}-mode`);
        }
    }, []);

    const toggleBulkMode = (arg?: boolean) => console.log('toggleBulkMode', arg);
    const unlockAllLists = () => console.log('unlockAllLists');
    const lockAllLists = () => console.log('lockAllLists');
    const applyFilters = () => console.log('applyFilters');
    const toggleColumnMenu = (e: React.MouseEvent) => console.log('toggleColumnMenu');
    const handleSearchInput = () => console.log('handleSearchInput');
    const clearSearch = () => console.log('clearSearch');
    const openBulkAssignModal = () => console.log('openBulkAssignModal');
    const openBulkMoveModal = () => console.log('openBulkMoveModal');
    const togglePinFromModal = () => console.log('togglePinFromModal');
    const openMoveFromAssignment = () => console.log('openMoveFromAssignment');
    const clearDueDate = () => console.log('clearDueDate');
    const closeModal = () => document.querySelectorAll('.modal-overlay').forEach(el => el.classList.add('hidden'));
    const saveAssignment = () => console.log('saveAssignment');
    const closeCardLogModal = () => console.log('closeCardLogModal');
    const closeMoveModal = () => console.log('closeMoveModal');
    const submitMove = () => console.log('submitMove');
    const switchSettingsTab = (tab: string) => {
        document.querySelectorAll('.settings-tab').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.settings-content').forEach(el => el.classList.remove('active'));

        // Find by text content or index (simplified logic)
        // In real app, use logic to map tab name to ID
        if (tab === 'general') {
            document.querySelector('.settings-tab:nth-child(1)')?.classList.add('active');
            document.getElementById('settings-general')?.classList.add('active');
        } else {
            document.querySelector('.settings-tab:nth-child(2)')?.classList.add('active');
            // Game tab logic unimplemented
        }
    };
    const performLogout = () => console.log('performLogout');
    // --- Auth Logic ---
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const [loginFormData, setLoginFormData] = useState({ id: '', pass: '', name: '' });
    const [loginError, setLoginError] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    const performLogin = async () => {
        setLoginError('');
        setIsAuthLoading(true);

        // Demo Bypass Check
        if (loginFormData.id === 'demo' && loginFormData.pass === 'demo') {
            toast.success('デモモードで開始します');
            setIsLoginModalOpen(false);
            setIsAuthLoading(false);
            return;
        }

        try {
            const result = await signIn.email({
                email: loginFormData.id,
                password: loginFormData.pass,
            });

            if (result.error) {
                console.error(result.error);
                setLoginError(`ログイン失敗: ${result.error.message || '認証エラー'} (DB接続なし環境の可能性あり)`);
                // Auto-fallback
                // toast.info('デモモードで続行します');
                // setIsLoginModalOpen(false);
            } else {
                toast.success('ログインしました');
                setIsLoginModalOpen(false);
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setLoginError(`エラー: ${msg}`);
        } finally {
            setIsAuthLoading(false);
        }
    };

    const performSignUp = async () => {
        setLoginError('');
        setIsAuthLoading(true);

        try {
            const result = await signUp.email({
                email: loginFormData.id,
                password: loginFormData.pass,
                name: loginFormData.name || 'User',
            });

            if (result.error) {
                setLoginError(`登録失敗: ${result.error.message}`);
            } else {
                toast.success('アカウントを作成しました');
                setIsLoginModalOpen(false);
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setLoginError(`エラー: ${msg}`);
        } finally {
            setIsAuthLoading(false);
        }
    };
    const toggleBgmMinify = () => console.log('toggleBgmMinify');
    const stopBgm = () => console.log('stopBgm');
    const toggleBgm = (type: string) => console.log('toggleBgm', type);
    const changeBgmVolume = (val: string) => console.log('changeBgmVolume', val);
    const closeLevelUp = () => console.log('closeLevelUp');
    const closeSidebar = () => console.log('closeSidebar');
    const handleSidebarSearchInput = () => console.log('handleSidebarSearchInput');
    const switchMemoTab = (tab: string) => console.log('switchMemoTab', tab);
    const execAddMemo = () => console.log('execAddMemo');
    const closeMemoModal = () => console.log('closeMemoModal');
    const submitBulkAssign = () => console.log('submitBulkAssign');
    const setQuickFilter = (type: string) => console.log('setQuickFilter', type);

    // --- Shop Logic ---
    const handleBuyItem = (itemId: string) => {
        if (buyItem(itemId)) {
            // buyItem handles logic, checking result for optional UI updates
            // toast is handled in store if success
        } else {
            // toast error handled in store or consistent UI feedback
        }
    };

    return (
        <>
            <div id="rainbow-overlay" className="rainbow-overlay"></div>
            {/* おみくじモーダル */}
            <div id="omikuji-modal" className="modal-overlay hidden">
                <div className="modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <h3><span className="material-icons">casino</span> 運試しおみくじ</h3>
                    <div style={{ padding: '20px 0' }}>
                        {!omikujiResult ? (
                            <>
                                <p style={{ marginBottom: '20px' }}>今日の運勢を占いましょう！<br />XPやGoldが手に入るかも？</p>
                                <button className="btn-save" onClick={drawOmikuji} disabled={isOmikujiDrawing} style={{ fontSize: '1.2em', padding: '10px 30px' }}>
                                    {isOmikujiDrawing ? '抽選中...' : 'おみくじを引く'}
                                </button>
                            </>
                        ) : (
                            <div className="omikuji-result use-fade-in">
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: omikujiResult.result.color, marginBottom: '10px', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                                    {omikujiResult.result.label}
                                </div>
                                <div style={{ marginBottom: '20px', fontSize: '1.2em' }}>
                                    <span style={{ color: 'cyan', fontWeight: 'bold' }}>+{omikujiResult.xpBonus} XP</span> / <span style={{ color: 'gold', fontWeight: 'bold' }}>+{omikujiResult.goldBonus} G</span>
                                </div>
                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', marginBottom: '10px', textAlign: 'left' }}>
                                    <div style={{ fontSize: '11px', color: '#aaa' }}>ラッキーアイテム</div>
                                    <div style={{ fontWeight: 'bold' }}>{omikujiResult.item}</div>
                                </div>
                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
                                    <div style={{ fontSize: '11px', color: '#aaa' }}>話題のネタ ({omikujiResult.topic.category})</div>
                                    <div style={{ fontWeight: 'bold', color: omikujiResult.color }}>{omikujiResult.topic.title}</div>
                                    <div style={{ fontSize: '12px' }}>{omikujiResult.topic.desc}</div>
                                </div>
                                <button className="btn-save" onClick={drawOmikuji}>
                                    もう一度引く
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="modal-buttons" style={{ marginTop: '10px' }}>
                        <button className="btn-cancel" onClick={() => document.getElementById('omikuji-modal')?.classList.add('hidden')}>閉じる</button>
                    </div>
                </div>
            </div>
            <div id="desktop-mascot" className="hidden" onClick={() => GM.pokeMascot()}>🐱</div>
            <div id="xp-toast-container"
                style={{ position: 'fixed', bottom: '100px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none', zIndex: 4000 }}>
            </div>

            {/* レベルアップファンファーレ */}
            <div id="levelup-modal" className="levelup-overlay hidden" onClick={closeLevelUp}>
                <div className="levelup-box">
                    <h2>LEVEL UP!</h2>
                    <div style={{ fontSize: '60px' }}>🎉</div>
                    <div id="levelup-rank" className="levelup-rank">{currentRankName}</div>
                    <p>新しい機能が解放されました！</p>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>(クリックして閉じる)</div>
                </div>
            </div>

            {/* ランキングモーダル */}
            <div id="money-ranking-modal" className="modal-overlay hidden">
                <div className="modal" style={{ width: '400px', textAlign: 'center' }}>
                    <h3><span className="material-icons" style={{ color: '#f1c40f' }}>emoji_events</span> 長者ランキング</h3>
                    <div className="ranking-list" style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                        {rankingData.map((user, index) => (
                            <div key={user.id} className={`ranking-item rank-${index + 1}`}
                                style={{
                                    display: 'flex', alignItems: 'center', padding: '10px',
                                    borderBottom: '1px solid #eee',
                                    background: user.id === 'me' ? '#f0f8ff' : 'transparent'
                                }}>
                                <div className="rank-badge" style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: index < 3 ? 'var(--gold-color)' : '#ccc', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '10px'
                                }}>
                                    {index + 1}
                                </div>
                                <div className="rank-user-info" style={{ textAlign: 'left', flex: 1 }}>
                                    <div className="rank-name" style={{ fontWeight: 'bold' }}>{user.name}</div>
                                    <div className="rank-details" style={{ fontSize: '12px', color: '#888' }}>{user.rank}</div>
                                </div>
                                <div className="rank-money" style={{ fontWeight: 'bold', color: '#e67e22' }}>
                                    {user.gold.toLocaleString()} G
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="modal-buttons" style={{ marginTop: '20px' }}>
                        <button className="btn-save" onClick={() => document.getElementById('money-ranking-modal')?.classList.add('hidden')}>閉じる</button>
                    </div>
                </div>
            </div>

            {/* おみくじモーダル */}
            <div id="omikuji-modal" className="modal-overlay hidden">
                <div className="modal" style={{ textAlign: 'center' }}>
                    <h3>🔮 今日の運勢</h3>
                    <div id="omikuji-result" style={{ fontSize: '40px', margin: '20px 0', color: '#d32f2f', fontWeight: 'bold' }}></div>
                    <p id="omikuji-item" style={{ fontSize: '14px', marginBottom: '20px' }}></p>
                    <p id="omikuji-bonus" style={{ fontSize: '12px', color: '#f39c12', fontWeight: 'bold' }}></p>
                    <button className="btn-save"
                        onClick={() => document.getElementById('omikuji-modal')?.classList.add('hidden')}>閉じる</button>
                </div>
            </div>

            <div id="bgm-player" className="minimized" onClick={(e) => {
                const target = e.currentTarget;
                if (target.classList.contains('minimized')) toggleBgmMinify();
            }}>
                <div className="bgm-minimized-icon">
                    <span className="material-icons">headphones</span>
                </div>
                <div className="bgm-header-row">
                    <div className="bgm-header">☕ 集中BGM</div>
                    <button className="btn-bgm-minimize" onClick={(e) => { e.stopPropagation(); toggleBgmMinify(); }}><span
                        className="material-icons" style={{ fontSize: '16px' }}>remove</span></button>
                </div>
                <div className="bgm-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="bgm-btn active" id="btn-bgm-off" onClick={stopBgm}>
                        <span className="material-icons" style={{ fontSize: '16px' }}>volume_off</span> オフ
                    </div>
                    <div className="bgm-btn" onClick={() => toggleBgm('fire')}>
                        <span className="material-icons" style={{ fontSize: '16px' }}>local_fire_department</span> 焚き火
                    </div>
                    <div className="bgm-btn" onClick={() => toggleBgm('rain')}>
                        <span className="material-icons" style={{ fontSize: '16px' }}>umbrella</span> 雨の音
                    </div>
                    <div className="bgm-btn" onClick={() => toggleBgm('cafe')}>
                        <span className="material-icons" style={{ fontSize: '16px' }}>storefront</span> カフェ
                    </div>

                    {/* 解放BGM */}
                    <div className="bgm-btn hidden" id="bgm-deepsea" onClick={() => toggleBgm('deepsea')}>
                        <span className="material-icons" style={{ fontSize: '16px' }}>waves</span> Deep Sea
                    </div>
                    <div className="bgm-btn hidden" id="bgm-cyber" onClick={() => toggleBgm('cyber')}>
                        <span className="material-icons" style={{ fontSize: '16px' }}>memory</span> Cyber City
                    </div>

                    <input type="range" className="bgm-volume" min="0" max="1" step="0.1" defaultValue="0.3"
                        onInput={(e) => changeBgmVolume(e.currentTarget.value)} title="音量" />
                </div>
            </div>

            {isLoginModalOpen && (
                <div id="login-overlay">
                    <div className="login-box">
                        <h2>{isSignUpMode ? '新規登録' : 'ログイン'}</h2>
                        {isSignUpMode && (
                            <input
                                type="text"
                                className="login-input"
                                placeholder="名前"
                                value={loginFormData.name}
                                onChange={(e) => setLoginFormData({ ...loginFormData, name: e.target.value })}
                            />
                        )}
                        <input
                            type="text"
                            className="login-input"
                            placeholder="メールアドレス (ID)"
                            value={loginFormData.id}
                            onChange={(e) => setLoginFormData({ ...loginFormData, id: e.target.value })}
                        />
                        <input
                            type="password"
                            className="login-input"
                            placeholder="パスワード"
                            value={loginFormData.pass}
                            onChange={(e) => setLoginFormData({ ...loginFormData, pass: e.target.value })}
                        />

                        {isSignUpMode ? (
                            <button className="btn-login" onClick={performSignUp} disabled={isAuthLoading}>
                                {isAuthLoading ? '処理中...' : '登録して開始'}
                            </button>
                        ) : (
                            <button className="btn-login" onClick={performLogin} disabled={isAuthLoading}>
                                {isAuthLoading ? '処理中...' : 'ログイン'}
                            </button>
                        )}

                        <div style={{ marginTop: '10px', fontSize: '12px' }}>
                            <span
                                style={{ color: '#aaa', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => {
                                    setLoginError('');
                                    setIsSignUpMode(!isSignUpMode);
                                }}
                            >
                                {isSignUpMode ? 'ログインに戻る' : '新規アカウント作成はこちら'}
                            </span>
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <button
                                style={{ background: 'transparent', border: '1px dashed #f1c40f', color: '#f1c40f', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                onClick={() => {
                                    toast.info('デモモードで開始します');
                                    setIsLoginModalOpen(false);
                                }}
                            >
                                🧪 デモモード（ログイン不要）
                            </button>
                        </div>

                        {loginError && (
                            <div id="login-error" className="login-error" style={{ display: 'block', color: '#ff6b6b', marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                                {loginError}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div id="bg-video-container">
                <video autoPlay muted loop id="bg-video"></video>
                <div id="bg-overlay"></div>
            </div>

            <div id="loading" className="hidden">
                <div><span className="material-icons"
                    style={{ verticalAlign: 'middle', animation: 'spin 1s infinite linear' }}>refresh</span> データを取得中...</div>
            </div>

            <div id="toast">完了しました</div>

            <div id="context-menu" className="context-menu hidden">
                <div className="context-menu-item" id="ctx-open"><span className="material-icons"
                    style={{ fontSize: '16px' }}>open_in_new</span> Trelloを開く</div>
                <div className="context-menu-item" id="ctx-copy"><span className="material-icons"
                    style={{ fontSize: '16px' }}>content_copy</span> リンクをコピー</div>
                <div className="context-menu-divider"></div>
                <div className="context-menu-item" id="ctx-move"><span className="material-icons"
                    style={{ fontSize: '16px' }}>drive_file_move</span> 移動...</div>
                <div className="context-menu-item" id="ctx-assign"><span className="material-icons" style={{ fontSize: '16px' }}>edit</span>
                    担当設定...</div>
                <div className="context-menu-divider"></div>
                <div className="context-menu-item" id="ctx-pin"><span className="material-icons" style={{ fontSize: '16px' }}>push_pin</span>
                    ピン留め切り替え</div>
            </div>

            <div id="sidebar-overlay" className="sidebar-overlay hidden" onClick={closeSidebar}></div>
            <div id="sidebar-right" className="sidebar-right">
                <div className="sidebar-header">
                    <div className="sidebar-header-top">
                        <h3 id="sidebar-title"><span className="material-icons" style={{ color: '#0079bf' }}>today</span> 予定のカード</h3>
                        <button className="close-sidebar-btn" onClick={closeSidebar}>
                            <span className="material-icons">close</span>
                        </button>
                    </div>

                    <div className="search-container" style={{ width: '100%' }}>
                        <input type="text" id="sidebar-search-input" placeholder="店舗名で検索..."
                            onInput={handleSidebarSearchInput} />
                        <span id="sidebar-search-clear-btn" className="material-icons search-action-icon hidden"
                            onClick={clearSearch}>close</span>
                        <span id="sidebar-search-glass-icon" className="material-icons search-action-icon">search</span>
                    </div>
                </div>

                <div id="sidebar-content"></div>
            </div>

            <header>
                <div className="header-top">
                    <h1>
                        <span className="material-icons">schedule</span> わく☆とれ
                        <button className="btn-toggle-header" onClick={toggleHeader} title="メニューの開閉">
                            <span className="material-icons" id="toggle-icon">expand_less</span>
                        </button>
                    </h1>

                    <div className="game-status-bar" id="game-status-bar">
                        <div className="cookie-clicker-area">
                            <div className="btn-cookie" onClick={(e) => GM.clickCookie(e)} title="クリックしてXPゲット！">🍪</div>
                            <div className="auto-clicker-status">
                                <span id="click-power-disp">Click: +2 XP</span>
                                <span id="auto-xp-disp">Auto: 0 XP/s</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span className="game-level-badge" id="game-level">Lv.{level}</span>
                                <span className="game-rank-text" id="game-rank">{currentRankName}</span>
                                <span id="game-title" style={{ fontSize: '10px', color: '#555' }}></span>

                                <div className="game-btn-group">
                                    <button className="btn-game-mini" onClick={GM.openShopModal} title="自動化ショップ">
                                        <span className="material-icons" style={{ fontSize: '12px' }}>shopping_cart</span>
                                    </button>
                                    <button className="btn-game-mini" onClick={openRankingModal} title="ランキング">
                                        <span className="material-icons" style={{ fontSize: '12px' }}>leaderboard</span>
                                    </button>
                                    <button className="btn-game-mini" onClick={GM.manualSave} title="データを保存">
                                        <span className="material-icons" style={{ fontSize: '12px' }}>save</span>
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className="game-xp-container" title={`次のレベルまで: ${nextRankXp} XP`}>
                                    <div className="game-xp-bar" id="game-xp-bar" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                                <span className="game-xp-text" id="game-xp-text">{Math.floor(totalXp).toLocaleString()} / {nextRankMinXp === Infinity ? 'MAX' : nextRankMinXp.toLocaleString()} XP</span>
                            </div>
                        </div>
                    </div>

                    <div className="game-money-area">
                        <span id="game-money-disp">0</span>
                        <div style={{ display: 'flex', gap: '4px', marginLeft: '10px' }}>

                            <button id="btn-open-race" className="btn-race" onClick={GM.openRace} disabled title="開催時間外です">
                                競馬
                            </button>

                            <button className="btn-race"
                                style={{ background: 'linear-gradient(to bottom, #2c3e50, #34495e)', borderColor: '#1a252f' }}
                                onClick={GM.openPastResults}>
                                結果
                            </button>

                            <button className="btn-gacha" onClick={GM.openGacha} title="1回500円">
                                ガチャ
                            </button>

                            <button className="btn-race"
                                style={{ background: 'linear-gradient(to bottom, #f1c40f, #f39c12)', borderColor: '#d68910' }}
                                onClick={GM.openMoneyRanking} title="所持金ランキング">
                                長者
                            </button>
                        </div>
                    </div>

                    <div id="header-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: 'auto' }}>
                        <div className="quick-filters">
                            <button className="btn-quick-filter btn-today" onClick={() => toggleSidebar('today')}>本日予定</button>
                            <button className="btn-quick-filter btn-tomorrow" onClick={() => toggleSidebar('tomorrow')}>明日予定</button>
                            <button className="btn-quick-filter btn-nextMonday"
                                onClick={() => toggleSidebar('nextMonday')}>翌週月曜予定</button>

                            <button className="btn-quick-filter btn-overdue" onClick={() => setQuickFilter('overdue')}>期限切れ</button>
                            <button className="btn-quick-filter btn-due24h" onClick={() => setQuickFilter('due24h')}>24時間以内</button>
                            <button className="btn-quick-filter btn-due3d" onClick={() => setQuickFilter('due3d')}>3日以内</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="refresh-btn" onClick={loadData} title="更新">
                                    <span className="material-icons">sync</span>
                                </button>
                                <button className="btn-chart" onClick={openDashboard} title="ダッシュボード">
                                    <span className="material-icons">analytics</span>
                                </button>
                                <button className="btn-memo" onClick={openMemoModal} title="メモ帳">
                                    <span className="material-icons" style={{ fontSize: '16px' }}>edit_note</span>
                                </button>
                                <button className="btn-omikuji" onClick={GM.showOmikuji} title="今日の運勢">
                                    <span className="material-icons" style={{ fontSize: '16px' }}>casino</span>
                                </button>
                            </div>
                            <button className="btn-settings" onClick={openSettingsModal} title="設定">
                                <span className="material-icons" style={{ fontSize: '14px' }}>settings</span> 設定
                            </button>
                        </div>
                    </div>
                </div>

                <div className="filter-bar" id="filter-bar">
                    <button className="btn-bulk-mode" id="btn-bulk-mode" onClick={() => toggleBulkMode()}>
                        <span className="material-icons" style={{ fontSize: '16px' }}>checklist</span> 選択モード
                    </button>

                    <div style={{ display: 'flex', gap: '2px', marginRight: '10px' }}>
                        <button className="btn-quick-filter" onClick={unlockAllLists} title="全リストのロックを解除（移動可能に）">
                            <span className="material-icons" style={{ fontSize: '16px' }}>lock_open</span> 全解除
                        </button>
                        <button className="btn-quick-filter" onClick={lockAllLists} title="全リストをロック（移動不可に）">
                            <span className="material-icons" style={{ fontSize: '16px' }}>lock</span> 全ロック
                        </button>
                    </div>

                    <div className="filter-group">
                        <label>並び替え</label>
                        <select id="sort-mode" onChange={applyFilters}>
                            <option value="none">Trello順</option>
                            <option value="due-asc">期限が近い順</option>
                            <option value="updated-desc">更新日が新しい順</option>
                            <option value="name-asc">店舗名順</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>予約システム担当</label>
                        <select id="filter-system" onChange={applyFilters}>
                            <option value="">すべて</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>システム種別</label>
                        <select id="filter-systemType" onChange={applyFilters}>
                            <option value="">すべて</option>
                            <option value="中江式予約システム/アンケート">中江式予約システム/アンケート</option>
                            <option value="Mokare">Mokare</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Trelloラベル</label>
                        <select id="filter-trelloLabel" onChange={applyFilters}>
                            <option value="">すべて</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>構築担当</label>
                        <select id="filter-construction" onChange={applyFilters}>
                            <option value="">すべて</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>商談担当</label>
                        <select id="filter-sales" onChange={applyFilters}>
                            <option value="">すべて</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>MTG担当</label>
                        <select id="filter-mtg" onChange={applyFilters}>
                            <option value="">すべて</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>業種</label>
                        <select id="filter-industry" onChange={applyFilters}>
                            <option value="">すべて</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>都道府県</label>
                        <select id="filter-prefecture" onChange={applyFilters}>
                            <option value="">すべて</option>
                        </select>
                    </div>
                    <div className="filter-group" style={{ marginLeft: '10px', borderLeft: '1px solid #ddd', paddingLeft: '10px' }}>
                        <label>列の表示設定</label>
                        <div className="dropdown-container">
                            <button className="btn-toggle-menu" onClick={toggleColumnMenu}>
                                <span className="material-icons" style={{ fontSize: '14px' }}>view_column</span> 表示切替 ▼
                            </button>
                            <div id="column-menu" className="dropdown-menu hidden" onClick={(e) => e.stopPropagation()}></div>
                        </div>
                    </div>
                    <div className="search-container">
                        <input type="text" id="search-input" placeholder="店舗名で検索..." onInput={handleSearchInput} />
                        <span id="search-clear-btn" className="material-icons search-action-icon hidden"
                            onClick={clearSearch}>close</span>
                        <span id="search-glass-icon" className="material-icons search-action-icon">search</span>
                    </div>
                    <div style={{ fontSize: '12px', marginLeft: 'auto' }}><span id="total-count">0</span>件</div>
                </div>
            </header>

            <div id="error-msg" className="hidden"></div>
            <div id="error-msg" className="hidden"></div>

            {/* Trello Board Rendering */}
            <div id="board">
                {lists.map(list => (
                    <div key={list.id} className="list-wrapper">
                        <div className="list">
                            <div className="list-header">
                                <span className="list-header-name">{list.name}</span>
                            </div>
                            <div className="list-cards">
                                {cards
                                    .filter(card => card.idList === list.id)
                                    .sort((a, b) => a.pos - b.pos)
                                    .map(card => {
                                        // 期限切れチェック
                                        const isOverdue = card.due && new Date(card.due) < new Date() && !card.dueComplete;
                                        return (
                                            <div key={card.id} className={`trello-card ${isOverdue ? 'overdue' : ''}`}
                                                onClick={() => console.log('Open Card:', card.name)}>
                                                {card.labels && card.labels.length > 0 && (
                                                    <div className="card-labels">
                                                        {card.labels.map(label => (
                                                            <span key={label.id} className="card-label"
                                                                style={{ backgroundColor: label.color || '#b6c2cf' }}>
                                                                {label.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <span className="card-title">{card.name}</span>
                                                <div className="card-badges">
                                                    {card.desc && <span className="card-badge" title="説明あり"><span className="material-icons card-badge-icon">description</span></span>}
                                                    {card.checklists && card.checklists.length > 0 && (
                                                        <span className="card-badge" title="チェックリスト">
                                                            <span className="material-icons card-badge-icon">check_box</span>
                                                            {card.checklists.reduce((acc, cl) => acc + cl.checkItems.filter(i => i.state === 'complete').length, 0)}/
                                                            {card.checklists.reduce((acc, cl) => acc + cl.checkItems.length, 0)}
                                                        </span>
                                                    )}
                                                    {card.due && (
                                                        <span className={`card-badge ${new Date(card.due) < new Date() ? (card.dueComplete ? 'due-complete' : 'due-overdue') : ''}`}
                                                            style={{ color: card.dueComplete ? 'green' : (new Date(card.due) < new Date() ? 'red' : 'inherit') }}>
                                                            <span className="material-icons card-badge-icon">schedule</span>
                                                            {new Date(card.due).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div id="dashboard" className="hidden"></div>

            <div id="bulk-action-bar">
                <div style={{ fontWeight: 'bold' }}>
                    <span id="bulk-count">0</span>件 選択中
                    <button
                        style={{ marginLeft: '10px', background: 'transparent', border: '1px solid white', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => toggleBulkMode(false)}>キャンセル</button>
                </div>
                <div className="bulk-actions">
                    <button className="btn-bulk-action" onClick={openBulkAssignModal}>
                        <span className="material-icons">manage_accounts</span> 担当者一括設定
                    </button>
                    <button className="btn-bulk-action" onClick={openBulkMoveModal}>
                        <span className="material-icons">drive_file_move</span> 一括移動
                    </button>
                </div>
            </div>

            <div id="assignment-modal" className="modal-overlay hidden">
                <div className="modal">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3>設定</h3>
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={togglePinFromModal}>
                            <span id="modal-pin-icon" className="material-icons" style={{ color: '#ccc' }}>push_pin</span>
                        </button>
                    </div>
                    <p id="modal-card-name"
                        style={{ fontSize: '12px', color: '#666', marginBottom: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    </p>

                    <div className="modal-move-area">
                        <button className="btn-modal-move" onClick={openMoveFromAssignment}>
                            <span className="material-icons">drive_file_move</span> このカードを別のリストへ移動
                        </button>
                    </div>
                    <div className="form-group"
                        style={{ background: '#f0f8ff', padding: '10px', borderRadius: '4px', border: '1px solid #cceeff', marginBottom: '15px' }}>
                        <label style={{ color: '#0079bf' }}>期限日時 (Trello同期)</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input type="datetime-local" id="input-trello-due" style={{ flex: 1 }} />
                            <button type="button" onClick={clearDueDate}
                                style={{ border: '1px solid #eb5a46', background: '#fff', color: '#eb5a46', borderRadius: '4px', cursor: 'pointer', padding: '0 8px' }}
                                title="期限を削除">
                                <span className="material-icons" style={{ fontSize: '18px', verticalAlign: 'middle' }}>close</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>構築番号</label>
                            <select id="input-constructionNumber">
                                <option value="">(未設定)</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                                <label>システム種別 1</label>
                                <select id="input-systemType">
                                    <option value="">(未設定)</option>
                                    <option value="中江式予約システム/アンケート">中江式予約システム/アンケート</option>
                                    <option value="Mokare">Mokare</option>
                                </select>
                            </div>
                            <div>
                                <label>システム種別 2</label>
                                <select id="input-systemType2">
                                    <option value="">(未設定)</option>
                                    <option value="中江式予約システム/アンケート">中江式予約システム/アンケート</option>
                                    <option value="Mokare">Mokare</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="form-group"><label>リンク先URL</label><input type="text" id="input-customLink"
                        placeholder="https://..." /></div>
                    <div className="form-group"><label>メモ1</label><input type="text" id="input-memo1" /></div>
                    <div className="form-group"><label>メモ2</label><input type="text" id="input-memo2" /></div>
                    <div className="form-group"><label>メモ3</label><input type="text" id="input-memo3" /></div>
                    <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '15px 0' }} />

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>構築担当者</label>
                            <select id="input-construction">
                                <option value="">(未設定)</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>予約システム構築担当</label>
                            <select id="input-system">
                                <option value="">(未設定)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>商談担当</label>
                            <select id="input-sales">
                                <option value="">(未設定)</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>MTG担当者</label>
                            <select id="input-mtg">
                                <option value="">(未設定)</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-buttons">
                        <button className="btn-cancel" onClick={closeModal}>キャンセル</button>
                        <button className="btn-save" onClick={saveAssignment}>保存</button>
                    </div>
                </div>
            </div>

            <div id="card-log-modal" className="modal-overlay hidden">
                <div className="modal" style={{ width: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3><span className="material-icons">history</span> 操作履歴</h3>
                        <button className="btn-cancel" onClick={closeCardLogModal}
                            style={{ padding: '4px 8px', fontSize: '12px' }}>✕</button>
                    </div>
                    <p id="log-card-name" style={{ fontSize: '12px', color: '#666', marginBottom: '15px', fontWeight: 'bold' }}></p>

                    <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        <ul id="card-log-list" className="log-list">
                            <li style={{ padding: '20px', textAlign: 'center', color: '#999' }}>読み込み中...</li>
                        </ul>
                    </div>

                    <div className="modal-buttons">
                        <button className="btn-save" onClick={closeCardLogModal}>閉じる</button>
                    </div>
                </div>
            </div>

            <div id="move-modal" className="modal-overlay hidden">
                <div className="modal" style={{ width: '350px' }}>
                    <h3><span className="material-icons">drive_file_move</span> カードを移動</h3>
                    <p id="move-card-name"
                        style={{ fontSize: '12px', color: '#666', marginBottom: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    </p>

                    <div className="form-group">
                        <label>移動先のリストを選択</label>
                        <div id="move-list-container" className="move-list-container"></div>
                    </div>

                    <div className="modal-buttons">
                        <button className="btn-cancel" onClick={closeMoveModal}>キャンセル</button>
                        <button className="btn-save" onClick={submitMove}>移動</button>
                    </div>
                </div>
            </div>

            <div id="settings-modal" className="modal-overlay hidden">
                <div className="modal">
                    <h3><span className="material-icons">settings</span> 設定</h3>

                    <div className="settings-tabs">
                        <div className="settings-tab active" onClick={() => switchSettingsTab('general')}>一般</div>
                        <div className="settings-tab" onClick={() => switchSettingsTab('game')}>ゲーム設定</div>
                    </div>

                    <div id="settings-general" className="settings-content active">
                        <div className="form-group">
                            <label>表示テーマ</label>
                            <select id="select-theme" onChange={changeTheme}>
                                <option value="default">デフォルト (ライト)</option>
                                <option value="dark">ダークモード</option>
                                <option value="cat">猫モード 🐱</option>
                                <option value="dog">犬モード 🐶</option>
                                <option value="horse">馬モード (競馬風) 🏇</option>
                                <option value="dragon">ドラゴンモード 🐉</option>
                                <option value="neon">ネオンモード 🌃</option>
                                <option value="gaming">ゲーミングモード 🌈</option>
                                <option value="retro">レトロRPGモード 👾</option>
                                <option value="blueprint">設計図モード 📐</option>
                                <option value="japan">和風・浮世絵モード 🍵</option>
                            </select>
                        </div>
                        <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '15px 0' }} />
                        <h4>背景設定</h4>
                        <div className="form-group">
                            <label>背景タイプ</label>
                            <select id="bg-type" onChange={toggleBgInput}>
                                <option value="none">なし (デフォルト)</option>
                                <option value="image">画像 (URL)</option>
                                <option value="video">動画 (URL)</option>
                            </select>
                        </div>
                        <div id="bg-input-group" className="form-group hidden">
                            <label>URL</label>
                            <input type="text" id="bg-url" onInput={updateBgUrl} placeholder="https://..." />
                        </div>
                        <div className="form-group">
                            <label>背景の暗さ</label>
                            <input type="range" id="bg-opacity" min="0" max="0.9" step="0.1" defaultValue="0.0" style={{ width: '100%' }} />
                            <div style={{ textAlign: 'right', fontSize: '10px' }} id="opacity-val">0%</div>
                        </div>

                        <div className="form-group">
                            <label>背景サイズ (拡大/縮小)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input type="range" id="bg-scale" min="0.5" max="3.0" step="0.1" defaultValue="1.0" style={{ flex: 1 }}
                                    onInput={updateBgTransform} />
                                <button type="button" onClick={() => resetBgParam('scale')}
                                    style={{ border: '1px solid #ccc', background: '#fff', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', padding: '2px 6px' }}>リセット</button>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '10px' }} id="scale-val">100%</div>
                        </div>

                        <div className="form-group">
                            <label>位置調整 X (左右)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input type="range" id="bg-pos-x" min="-50" max="50" step="1" defaultValue="0" style={{ flex: 1 }}
                                    onInput={updateBgTransform} />
                                <button type="button" onClick={() => resetBgParam('x')}
                                    style={{ border: '1px solid #ccc', background: '#fff', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', padding: '2px 6px' }}>リセット</button>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '10px' }} id="pos-x-val">0%</div>
                        </div>

                        <div className="form-group">
                            <label>位置調整 Y (上下)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input type="range" id="bg-pos-y" min="-50" max="50" step="1" defaultValue="0" style={{ flex: 1 }}
                                    onInput={updateBgTransform} />
                                <button type="button" onClick={() => resetBgParam('y')}
                                    style={{ border: '1px solid #ccc', background: '#fff', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', padding: '2px 6px' }}>リセット</button>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '10px' }} id="pos-y-val">0%</div>
                        </div>

                        <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '15px 0' }} />
                        <button className="btn-logout" onClick={performLogout} title="ログアウト">
                            <span className="material-icons" style={{ fontSize: '16px' }}>logout</span> ログアウト
                        </button>
                    </div>

                    <div id="settings-game" className="settings-content">
                        <div className="form-group">
                            <label>ランキングプレート (Lv.80~)</label>
                            <select id="game-ranking-plate" onChange={GM.updateProfilePreview}>
                                <option value="">なし</option>
                                <option value="plate-galaxy">銀河</option>
                                <option value="plate-magma">マグマ</option>
                                <option value="plate-matrix">マトリックス</option>
                                <option value="plate-gold">黄金</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>名前エフェクト (Lv.50~)</label>
                            <select id="game-name-effect" onChange={GM.updateProfilePreview}>
                                <option value="">なし</option>
                                <option value="name-gaming">ゲーミング</option>
                                <option value="name-glitch">グリッチ</option>
                                <option value="name-burn">炎上</option>
                                <option value="name-neon">ネオン</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>ランクエンブレム (絵文字)</label>
                            <input type="text" id="game-rank-emblem" placeholder="例: ⚜️" onInput={GM.updateProfilePreview} />
                        </div>

                        <div className="form-group">
                            <label>ホバーアクション</label>
                            <select id="game-hover-action" onChange={GM.updateProfilePreview}>
                                <option value="">なし</option>
                                <option value="hover-shake">震える</option>
                                <option value="hover-pop">飛び出す</option>
                                <option value="hover-rotate">回転</option>
                                <option value="hover-flash">点滅</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>フレーバーテキスト</label>
                            <input type="text" id="game-flavor-text" placeholder="一言コメント" onInput={GM.updateProfilePreview} />
                        </div>
                        <div className="form-group">
                            <label>ユーザープロフィール装飾 (Lv.2~)</label>
                            <select id="game-profile-deco" onChange={GM.updateProfilePreview}>
                                <option value="">なし</option>
                            </select>
                            <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>プレビュー:</div>
                            <div id="profile-preview">
                                <span style={{ color: '#999' }}>(ここにプレビューが表示されます)</span>
                            </div>
                        </div>
                    </div>

                    <div className="modal-buttons">
                        <button className="btn-cancel"
                            onClick={() => document.getElementById('settings-modal')?.classList.add('hidden')}>閉じる</button>
                    </div>
                </div>
            </div>

            {/* 競馬モーダル */}
            <div id="race-modal" className="modal-overlay hidden">
                <div className="modal" style={{ maxWidth: '800px', width: '95%' }}>
                    <h3><span className="material-icons">flag</span> わくわく競馬場</h3>
                    <p style={{ marginBottom: '10px' }}>
                        {raceStatus === 'OPEN' && nextRace && `第${nextRace.m ? Math.floor(nextRace.m / 10) + 1 : 1}レース 投票受付中 (発走 ${nextRace.h}:${String(nextRace.m).padStart(2, '0')})`}
                        {raceStatus === 'RUNNING' && <span style={{ color: 'red', fontWeight: 'bold' }}>ただいまレース開催中！結果を待機しています...</span>}
                        {raceStatus === 'CLOSED' && '本日の全レース終了しました。明日の開催をお待ちください。'}
                    </p>

                    <div className="race-newspaper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {newspaper?.horses ? (
                            <table className="race-table">
                                <thead>
                                    <tr>
                                        <th>印</th>
                                        <th>馬名</th>
                                        <th>調子</th>
                                        <th>オッズ</th>
                                        <th>AI</th>
                                        <th>短評</th>
                                        <th>投票</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {newspaper.horses.map((horse: any, idx: number) => (
                                        <tr key={horse.id}>
                                            <td className={horse.mark.c}>{horse.mark.s}</td>
                                            <td>
                                                <div style={{ fontWeight: 'bold' }}>{horse.icon} {horse.name}</div>
                                            </td>
                                            <td>
                                                <span className={horse.condition.class}>{horse.condition.icon} {horse.condition.label}</span>
                                            </td>
                                            <td>{horse.baseOdds.toFixed(1)}</td>
                                            <td>{horse.aiProb}%</td>
                                            <td style={{ fontSize: '12px' }}>{horse.comment}</td>
                                            <td>
                                                <button className="btn-bet"
                                                    disabled={raceStatus !== 'OPEN'}
                                                    onClick={() => GM.placeBet(horse.id, horse.name, horse.baseOdds)}>
                                                    投票
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <p>現在表示できるデータがありません。</p>
                                <p style={{ fontSize: '12px', color: '#777' }}>レース開催時間（{RACE_SCHEDULE[0].h}:{RACE_SCHEDULE[0].m}〜）になると情報が表示されます。</p>
                            </div>
                        )}
                    </div>

                    <div className="modal-buttons" style={{ marginTop: '15px' }}>
                        <button className="btn-save" onClick={() => document.getElementById('race-modal')?.classList.add('hidden')}>閉じる</button>
                    </div>
                </div>
            </div>

            <div id="gacha-modal" className="modal-overlay hidden">
                <div className="modal" style={{ textAlign: 'center' }}>
                    <h3>🦄 名馬ガチャ (1回 500円)</h3>
                    <div id="gacha-animation-area"
                        style={{ minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button className="btn-save" onClick={GM.pullGacha} style={{ padding: '15px 30px', fontSize: '16px' }}>
                            引く！ (¥500)
                        </button>
                    </div>
                    <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
                        獲得した馬はコレクションに追加されます
                    </div>
                    <div className="modal-buttons">
                        <button className="btn-cancel"
                            onClick={() => document.getElementById('gacha-modal')?.classList.add('hidden')}>閉じる</button>
                    </div>
                </div>
            </div>

            <div id="money-ranking-modal" className="modal-overlay hidden">
                <div className="modal" style={{ width: '480px', maxWidth: '95vw', padding: '0', borderRadius: '12px', overflow: 'hidden' }}>

                    <div
                        style={{ background: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0', fontSize: '18px', color: '#2c3e50', fontFamily: "'Orbitron', sans-serif" }}>
                                🏆 所持金ランキング
                            </h3>
                            <span style={{ fontSize: '11px', color: '#7f8c8d' }}>Top Players & You</span>
                        </div>
                        <button onClick={GM.showRankingWindow}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0079bf', transition: 'transform 0.2s' }}
                            title="ランキングを更新">
                            <span className="material-icons" style={{ fontSize: '24px' }}>refresh</span>
                        </button>
                    </div>

                    <div id="ranking-list-body" style={{ height: '400px', overflowY: 'auto', background: '#fff', padding: '10px' }}>
                        <div
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#aaa', flexDirection: 'column' }}>
                            <span className="material-icons" style={{ fontSize: '40px', marginBottom: '10px' }}>hourglass_empty</span>
                            <span>データ読み込み中...</span>
                        </div>
                    </div>

                    <div className="modal-buttons"
                        style={{ padding: '12px 20px', background: '#f8f9fa', borderTop: '1px solid #eaeaea', textAlign: 'right', display: 'block' }}>
                        <button className="btn-cancel"
                            onClick={() => document.getElementById('money-ranking-modal')?.classList.add('hidden')}
                            style={{ padding: '8px 25px' }}>閉じる</button>
                    </div>
                </div>
            </div>

            <div id="dashboard-modal" className="modal-overlay hidden">
                <div className="modal" style={{ width: '800px', maxWidth: '90vw' }}>
                    <h3><span className="material-icons">analytics</span> 簡易ダッシュボード</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                        <div style={{ width: '350px', height: '300px' }}>
                            <canvas id="chart-workload"></canvas>
                        </div>
                        <div style={{ width: '350px', height: '300px' }}>
                            <canvas id="chart-list"></canvas>
                        </div>
                    </div>
                    <div className="modal-buttons">
                        <button className="btn-cancel"
                            onClick={() => document.getElementById('dashboard-modal')?.classList.add('hidden')}>閉じる</button>
                    </div>
                </div>
            </div>

            <div id="bulk-assign-modal" className="modal-overlay hidden">
                <div className="modal">
                    <h3><span className="material-icons">manage_accounts</span> 一括担当者設定</h3>
                    <p style={{ fontSize: '12px', color: '#eb5a46' }}>※ 変更したい項目のみ選択してください。未選択の項目は変更されません。</p>

                    <div className="form-group">
                        <label>システム種別 1</label>
                        <select id="bulk-systemType">
                            <option value="">(変更しない)</option>
                            <option value="中江式予約システム/アンケート">中江式予約システム/アンケート</option>
                            <option value="Mokare">Mokare</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>システム種別 2</label>
                        <select id="bulk-systemType2">
                            <option value="">(変更しない)</option>
                            <option value="中江式予約システム/アンケート">中江式予約システム/アンケート</option>
                            <option value="Mokare">Mokare</option>
                        </select>
                    </div>
                    <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '10px 0' }} />

                    <div className="form-group"><label>構築担当者</label><select id="bulk-construction">
                        <option value="">(変更しない)</option>
                    </select></div>
                    <div className="form-group"><label>予約システム構築担当</label><select id="bulk-system">
                        <option value="">(変更しない)</option>
                    </select></div>
                    <div className="form-group"><label>商談担当</label><select id="bulk-sales">
                        <option value="">(変更しない)</option>
                    </select></div>
                    <div className="form-group"><label>MTG担当者</label><select id="bulk-mtg">
                        <option value="">(変更しない)</option>
                    </select></div>

                    <div className="modal-buttons">
                        <button className="btn-cancel"
                            onClick={() => document.getElementById('bulk-assign-modal')?.classList.add('hidden')}>キャンセル</button>
                        <button className="btn-save" onClick={submitBulkAssign}>一括更新</button>
                    </div>
                </div>
            </div>

            <div id="memo-modal" className="modal-overlay hidden">
                <div className="modal">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0 }}><span className="material-icons">edit_note</span> メモ帳</h3>
                        <button className="btn-cancel" onClick={closeMemoModal} style={{ padding: '4px 8px', fontSize: '12px' }}>✕
                            閉じる</button>
                    </div>

                    <div className="memo-container">
                        <div className="memo-left-panel">
                            <div className="memo-tabs">
                                <div className="memo-tab active" id="tab-memo-personal" onClick={() => switchMemoTab('personal')}>個人メモ
                                </div>
                                <div className="memo-tab" id="tab-memo-shared" onClick={() => switchMemoTab('shared')}>全員へ共有</div>
                            </div>

                            <div id="card-memo-header-placeholder"></div>

                            <div className="form-group">
                                <label>内容</label>
                                <textarea id="memo-content" rows={6} placeholder="メモを入力..."
                                    style={{ resize: 'vertical' }}></textarea>
                            </div>

                            <div className="form-group">
                                <label>関係者タグ付け (クリックで選択)</label>
                                <div id="memo-user-selector" className="related-users-selector">
                                </div>
                            </div>

                            <div className="form-group">
                                <label>通知日時 (任意)</label>
                                <input type="datetime-local" id="memo-notify-time" />
                            </div>

                            <div style={{ marginTop: 'auto', textAlign: 'right' }}>
                                <button id="btn-add-memo" className="btn-save" onClick={execAddMemo} style={{ width: '100%' }}>
                                    <span className="material-icons"
                                        style={{ fontSize: '16px', verticalAlign: 'middle' }}>add_circle</span> 追加する
                                </button>
                            </div>
                        </div>

                        <div className="memo-center-panel">
                            <div
                                style={{ fontWeight: 'bold', fontSize: '12px', color: '#0079bf', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0079bf', paddingBottom: '5px' }}>
                                <span><span className="material-icons"
                                    style={{ fontSize: '16px', verticalAlign: 'middle' }}>assignment</span> 未完了タスク</span>
                                <span id="memo-count-unfinished"
                                    style={{ background: '#0079bf', color: 'white', padding: '1px 8px', borderRadius: '10px', fontSize: '11px' }}>0</span>
                            </div>
                            <ul id="memo-list-unfinished" className="memo-list">
                            </ul>
                        </div>

                        <div className="memo-right-panel">
                            <div
                                style={{ fontWeight: 'bold', fontSize: '12px', color: '#555', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #999', paddingBottom: '5px' }}>
                                <span><span className="material-icons"
                                    style={{ fontSize: '16px', verticalAlign: 'middle' }}>task_alt</span> 完了済み</span>
                                <span id="memo-count-finished"
                                    style={{ background: '#999', color: 'white', padding: '1px 8px', borderRadius: '10px', fontSize: '11px' }}>0</span>
                            </div>
                            <ul id="memo-list-finished" className="memo-list">
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
            {/* おみくじモーダル */}
            <div id="omikuji-modal" className="modal-overlay hidden">
                <div className="modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <h3><span className="material-icons">casino</span> 運試しおみくじ</h3>
                    <div style={{ padding: '20px 0' }}>
                        {!omikujiResult ? (
                            <>
                                <p style={{ marginBottom: '20px' }}>今日の運勢を占いましょう！<br />XPやGoldが手に入るかも？</p>
                                <button className="btn-save" onClick={drawOmikuji} disabled={isOmikujiDrawing} style={{ fontSize: '1.2em', padding: '10px 30px' }}>
                                    {isOmikujiDrawing ? '抽選中...' : 'おみくじを引く'}
                                </button>
                            </>
                        ) : (
                            <div className="omikuji-result use-fade-in">
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: omikujiResult.result.color, marginBottom: '10px', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                                    {omikujiResult.result.label}
                                </div>
                                <div style={{ marginBottom: '20px', fontSize: '1.2em' }}>
                                    <span style={{ color: 'cyan', fontWeight: 'bold' }}>+{omikujiResult.xpBonus} XP</span> / <span style={{ color: 'gold', fontWeight: 'bold' }}>+{omikujiResult.goldBonus} G</span>
                                </div>
                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', marginBottom: '10px', textAlign: 'left' }}>
                                    <div style={{ fontSize: '11px', color: '#aaa' }}>ラッキーアイテム</div>
                                    <div style={{ fontWeight: 'bold' }}>{omikujiResult.item}</div>
                                </div>
                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
                                    <div style={{ fontSize: '11px', color: '#aaa' }}>話題のネタ ({omikujiResult.topic.category})</div>
                                    <div style={{ fontWeight: 'bold', color: omikujiResult.color }}>{omikujiResult.topic.title}</div>
                                    <div style={{ fontSize: '12px' }}>{omikujiResult.topic.desc}</div>
                                </div>
                                <button className="btn-save" onClick={drawOmikuji}>
                                    もう一度引く
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="modal-buttons" style={{ marginTop: '10px' }}>
                        <button className="btn-cancel" onClick={() => document.getElementById('omikuji-modal')?.classList.add('hidden')}>閉じる</button>
                    </div>
                </div>
            </div>

            {/* ショップモーダル */}
            <div id="shop-modal" className="modal-overlay hidden">
                <div className="modal" style={{ maxWidth: '800px', width: '95%' }}>
                    <h3><span className="material-icons">store</span> アイテムショップ</h3>
                    <div className="shop-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table className="shop-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>アイテム</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>効果</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>価格</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>購入</th>
                                </tr>
                            </thead>
                            <tbody>
                                {SHOP_ITEMS.map((item) => {
                                    const count = inventory[item.id] || 0;
                                    const cost = Math.floor(item.baseCost * Math.pow(1.15, count));
                                    const isMaxed = item.isUnique && count > 0;
                                    const canBuy = !isMaxed && gold >= cost;

                                    return (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px' }}>
                                                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{item.desc}</div>
                                            </td>
                                            <td style={{ padding: '10px', fontSize: '13px' }}>
                                                {item.type === 'click' ? `クリック +${item.clickPower}` : `自動 +${item.xpPerSec}/秒`}
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: canBuy ? 'black' : '#aaa' }}>
                                                {isMaxed ? 'SOLD OUT' : `${cost.toLocaleString()} G`}
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                <button
                                                    className="btn-save"
                                                    style={{ opacity: canBuy ? 1 : 0.5, cursor: canBuy ? 'pointer' : 'not-allowed' }}
                                                    disabled={!canBuy}
                                                    onClick={() => handleBuyItem(item.id)}>
                                                    {isMaxed ? '済' : '購入'}
                                                </button>
                                                <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>所持: {count}</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="modal-buttons" style={{ marginTop: '15px' }}>
                        <button className="btn-cancel" onClick={() => document.getElementById('shop-modal')?.classList.add('hidden')}>閉じる</button>
                    </div>
                </div>
            </div>

            <div id="desktop-mascot" className="hidden" onClick={() => GM.pokeMascot()}>🐱</div>
        </>
    );
}
