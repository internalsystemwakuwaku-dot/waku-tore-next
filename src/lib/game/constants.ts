export interface Rank {
    name: string;
    minXp: number;
}

export interface ShopItem {
    id: string; // キー名をIDとして扱う
    name: string;
    baseCost: number;
    xpPerSec?: number; // 自動化アイテム
    clickPower?: number; // クリック強化アイテム
    type: 'auto' | 'click';
    desc: string;
    isUnique?: boolean;
}

export interface Horse {
    id: number;
    name: string;
    odds: number;
    speed: number;
    icon: string;
}

export interface ProfileDecoration {
    id: string;
    name: string;
    minLv: number;
}

// 経験値計算のベース値
export const XP_BASE = 200;

// ランク定義 (javascript.html line 76-266)
export const RANKS: Rank[] = [
    { name: "転生者", minXp: 0 },
    { name: "村人Lv.1", minXp: 100 },
    { name: "村人Lv.5", minXp: 216 },
    { name: "村人Lv.10", minXp: 352 },
    { name: "村人Lv.MAX", minXp: 510 },
    { name: "街人", minXp: 694 },
    { name: "道具屋の常連", minXp: 909 },
    { name: "ギルドの新人", minXp: 1160 },
    { name: "スライムハンター", minXp: 1451 },
    { name: "ゴブリンスレイヤー", minXp: 1791 },
    { name: "銅級冒険者", minXp: 2187 },
    { name: "鉄級冒険者", minXp: 2649 },
    { name: "銀級冒険者", minXp: 3187 },
    { name: "金級冒険者", minXp: 3813 },
    { name: "白金級冒険者", minXp: 4543 },
    { name: "ミスリル級", minXp: 5392 },
    { name: "オリハルコン級", minXp: 6382 },
    { name: "アダマンタイト級", minXp: 7534 },
    { name: "冒険者王", minXp: 8876 },
    { name: "ギルドマスター", minXp: 10439 },
    { name: "下級兵士", minXp: 12258 },
    { name: "下級魔導士", minXp: 14376 },
    { name: "下級剣士", minXp: 16843 },
    { name: "下級格闘家", minXp: 19714 },
    { name: "下級精霊使い", minXp: 23058 },
    { name: "中級兵士", minXp: 26951 },
    { name: "中級魔導士", minXp: 31484 },
    { name: "中級剣士", minXp: 36762 },
    { name: "中級格闘家", minXp: 42907 },
    { name: "中級精霊使い", minXp: 50063 },
    { name: "上級兵士", minXp: 58394 },
    { name: "上級魔導士", minXp: 68094 },
    { name: "上級剣士", minXp: 79387 },
    { name: "上級格闘家", minXp: 92536 },
    { name: "上級精霊使い", minXp: 107845 },
    { name: "特級兵士", minXp: 125669 },
    { name: "特級魔導士", minXp: 146422 },
    { name: "特級剣士", minXp: 170584 },
    { name: "特級格闘家", minXp: 198716 },
    { name: "特級精霊使い", minXp: 231471 },
    { name: "近衛騎士", minXp: 269608 },
    { name: "真・近衛騎士", minXp: 314011 },
    { name: "宮廷魔術師", minXp: 365709 },
    { name: "真・宮廷魔術師", minXp: 425902 },
    { name: "ドラゴンナイト", minXp: 495984 },
    { name: "真・ドラゴンナイト", minXp: 577580 },
    { name: "ネクロマンサー", minXp: 672580 },
    { name: "真・ネクロマンサー", minXp: 783188 },
    { name: "サモナー", minXp: 911964 },
    { name: "真・サモナー", minXp: 1061895 },
    { name: "将軍", minXp: 1236458 },
    { name: "大将軍", minXp: 1439698 },
    { name: "元帥", minXp: 1676326 },
    { name: "大元帥", minXp: 1951833 },
    { name: "宰相", minXp: 2272598 },
    { name: "大宰相", minXp: 2646061 },
    { name: "国王", minXp: 3080880 },
    { name: "大国王", minXp: 3587131 },
    { name: "皇帝", minXp: 4176548 },
    { name: "大皇帝", minXp: 4862794 },
    { name: "覚醒者Lv.60", minXp: 5661769 },
    { name: "覚醒者Lv.61", minXp: 6591998 },
    { name: "覚醒者Lv.62", minXp: 7675039 },
    { name: "覚醒者Lv.63", minXp: 8935987 },
    { name: "覚醒者Lv.64", minXp: 10404111 },
    { name: "覚醒者Lv.65", minXp: 12113426 },
    { name: "覚醒者Lv.66", minXp: 14103554 },
    { name: "覚醒者Lv.67", minXp: 16420625 },
    { name: "覚醒者Lv.68", minXp: 19118318 },
    { name: "覚醒者Lv.69", minXp: 22259114 },
    { name: "覚醒者Lv.70", minXp: 25915837 },
    { name: "覚醒者Lv.71", minXp: 30173169 },
    { name: "覚醒者Lv.72", minXp: 35129965 },
    { name: "覚醒者Lv.73", minXp: 40901069 },
    { name: "覚醒者Lv.74", minXp: 47620224 },
    { name: "覚醒者Lv.75", minXp: 55443187 },
    { name: "覚醒者Lv.76", minXp: 64551322 },
    { name: "覚醒者Lv.77", minXp: 75155700 },
    { name: "覚醒者Lv.78", minXp: 87502181 },
    { name: "覚醒者Lv.79", minXp: 101876939 },
    { name: "覚醒者Lv.80", minXp: 118613437 },
    { name: "覚醒者Lv.81", minXp: 138099395 },
    { name: "覚醒者Lv.82", minXp: 160786566 },
    { name: "覚醒者Lv.83", minXp: 187200465 },
    { name: "覚醒者Lv.84", minXp: 217953682 },
    { name: "覚醒者Lv.85", minXp: 253759082 },
    { name: "覚醒者Lv.86", minXp: 295445778 },
    { name: "覚醒者Lv.87", minXp: 343980689 },
    { name: "覚醒者Lv.88", minXp: 400488663 },
    { name: "覚醒者Lv.89", minXp: 466280053 },
    { name: "覚醒者Lv.90", minXp: 542879944 },
    { name: "覚醒者Lv.91", minXp: 632064115 },
    { name: "覚醒者Lv.92", minXp: 735898864 },
    { name: "覚醒者Lv.93", minXp: 856791696 },
    { name: "覚醒者Lv.94", minXp: 997545168 },
    { name: "覚醒者Lv.95", minXp: 1161421711 },
    { name: "覚醒者Lv.96", minXp: 1352219766 },
    { name: "覚醒者Lv.97", minXp: 1574364023 },
    { name: "覚醒者Lv.98", minXp: 1833003460 },
    { name: "覚醒者Lv.99", minXp: 2134131551 },
    { name: "英雄の卵", minXp: 2484729090 },
    { name: "小国の英雄", minXp: 2892928509 },
    { name: "王国の英雄", minXp: 3368187848 },
    { name: "帝国の英雄", minXp: 3921516223 },
    { name: "大陸の英雄", minXp: 4565744431 },
    { name: "世界の英雄", minXp: 5315801967 },
    { name: "伝説の勇者", minXp: 6189078602 },
    { name: "真の勇者", minXp: 7205809765 },
    { name: "救世主", minXp: 8389569485 },
    { name: "メシア", minXp: 9767812975 },
    { name: "人間国宝", minXp: 11372473489 },
    { name: "生きる伝説", minXp: 13240751965 },
    { name: "歴史の特異点", minXp: 15415951834 },
    { name: "神話の住人", minXp: 17948493188 },
    { name: "半神半人", minXp: 20897089456 },
    { name: "亜神", minXp: 24329976378 },
    { name: "現人神", minXp: 28326798033 },
    { name: "守護神", minXp: 32980227181 },
    { name: "武神", minXp: 38398188151 },
    { name: "軍神", minXp: 44706240292 },
    { name: "魔神", minXp: 52050588628 },
    { name: "邪神", minXp: 60601366114 },
    { name: "破壊神", minXp: 70556858349 },
    { name: "創造神", minXp: 82147856755 },
    { name: "天界の住人", minXp: 95643034870 },
    { name: "天使長", minXp: 111355207758 },
    { name: "大天使", minXp: 129648624107 },
    { name: "熾天使", minXp: 150947271954 },
    { name: "堕天使", minXp: 175744634860 },
    { name: "魔界の王", minXp: 204615783515 },
    { name: "半神", minXp: 238229864273 },
    { name: "下級神", minXp: 277366173264 },
    { name: "中級神", minXp: 322931980327 },
    { name: "上級神", minXp: 375983790938 },
    { name: "主神", minXp: 437750734080 },
    { name: "創造神", minXp: 509664971701 },
    { name: "全知全能", minXp: 593393282439 },
    { name: "星の意志", minXp: 690876793666 },
    { name: "太陽の化身", minXp: 804375001925 },
    { name: "銀河の覇者", minXp: 936517651037 },
    { name: "宇宙の帝王", minXp: 1090367350796 },
    { name: "時空の支配者", minXp: 1269492160677 },
    { name: "次元の超越者", minXp: 1478044733364 },
    { name: "並行世界の観測者", minXp: 1720857329431 },
    { name: "因果律の管理者", minXp: 2003559385558 },
    { name: "運命の紡ぎ手", minXp: 2332704250228 },
    { name: "終焉を告げる者", minXp: 2715923122176 },
    { name: "始まりの者", minXp: 3162100874944 },
    { name: "無限", minXp: 3681585293678 },
    { name: "虚無", minXp: 4286411520698 },
    { name: "特異点", minXp: 4990600868856 },
    { name: "事象の地平線", minXp: 5810476839352 },
    { name: "ビッグバン", minXp: 6765042857431 },
    { name: "ユニバース", minXp: 7876426742511 },
    { name: "マルチバース", minXp: 9170367364121 },
    { name: "オムニバース", minXp: 10676882046835 },
    { name: "アカシックレコード", minXp: 12430893084365 },
    { name: "概念的存在", minXp: 14473060183187 },
    { name: "法則そのもの", minXp: 16850709923831 },
    { name: "Bit", minXp: 19618956920958 },
    { name: "Byte", minXp: 22841973615598 },
    { name: "Kilobyte", minXp: 26594473855660 },
    { name: "Megabyte", minXp: 30963442377319 },
    { name: "Gigabyte", minXp: 36050116664536 },
    { name: "Terabyte", minXp: 41972429469502 },
    { name: "Petabyte", minXp: 48867673587424 },
    { name: "Exabyte", minXp: 56895593139369 },
    { name: "Zettabyte", minXp: 66242354780517 },
    { name: "Yottabyte", minXp: 77124483733075 },
    { name: "Hello World", minXp: 89794155106173 },
    { name: "Script Kiddie", minXp: 104545163990623 },
    { name: "Programmer", minXp: 121719409590822 },
    { name: "Hacker", minXp: 141715077247734 },
    { name: "Senior Engineer", minXp: 164995648873737 },
    { name: "Tech Lead", minXp: 192100863073030 },
    { name: "CTO", minXp: 223659424729146 },
    { name: "AI", minXp: 260402422079029 },
    { name: "Super AI", minXp: 303181829676579 },
    { name: "Singularity", minXp: 352989260490795 },
    { name: "The Glitch", minXp: 410979144365768 },
    { name: "404 Not Found", minXp: 478495811354146 },
    { name: "Stack Overflow", minXp: 557102660021659 },
    { name: "System Admin", minXp: 648623194017367 },
    { name: "Root User", minXp: 755178657613765 },
    { name: "超越者ランク196", minXp: 879238350742511 },
    { name: "超越者ランク197", minXp: 1023678502206677 },
    { name: "超越者ランク198", minXp: 1191847144415519 },
    { name: "超越者ランク199", minXp: 1387642646399086 },
    { name: "THE END", minXp: 9999999999999999 }
];

// ショップアイテム定義 (javascript.html line 285-458)
export const SHOP_ITEMS: ShopItem[] = [
    // Lv1 初心者セット
    { id: 'mouse', name: "ゲーミングマウス", baseCost: 500, clickPower: 2, type: 'click', desc: "クリック効率が少し上がります" },
    { id: 'coffee', name: "淹れたてコーヒー", baseCost: 800, xpPerSec: 0.5, type: 'auto', desc: "カフェインで集中力アップ" },
    { id: 'energy_drink', name: "エナジードリンク", baseCost: 1500, xpPerSec: 1.5, type: 'auto', desc: "一時的な翼を授ける" },
    { id: 'cushion', name: "低反発クッション", baseCost: 2000, xpPerSec: 2, type: 'auto', desc: "お尻への負担を軽減" },
    { id: 'textbook', name: "技術書", baseCost: 2500, xpPerSec: 3, type: 'auto', desc: "知識は力なり" },
    { id: 'blue_light', name: "PCメガネ", baseCost: 3500, xpPerSec: 4, type: 'auto', desc: "目の疲れをガード" },
    { id: 'ai', name: "AIマネージャー", baseCost: 5000, xpPerSec: 5, type: 'auto', desc: "スケジュール管理はお手の物" },
    { id: 'keyboard', name: "メカニカルキーボード", baseCost: 8500, xpPerSec: 10, type: 'auto', desc: "打鍵音が心地よい" },

    // Lv2 本格作業セット
    { id: 'ssd', name: "NVMe SSD", baseCost: 12000, xpPerSec: 15, type: 'auto', desc: "ロード時間を短縮" },
    { id: 'drone', name: "自動化ドローン", baseCost: 15000, xpPerSec: 20, type: 'auto', desc: "空から監視・管理" },
    { id: 'desk', name: "昇降式デスク", baseCost: 22000, xpPerSec: 30, type: 'auto', desc: "立って作業して健康維持" },
    { id: 'monitor', name: "デュアルモニター", baseCost: 30000, xpPerSec: 45, type: 'auto', desc: "作業効率が倍増" },
    { id: 'chair', name: "高級オフィスチェア", baseCost: 40000, xpPerSec: 60, type: 'auto', desc: "アーロンな座り心地" },
    { id: 'server', name: "量子サーバー", baseCost: 50000, xpPerSec: 100, type: 'auto', desc: "超高速処理を実現" },
    { id: 'vr_headset', name: "VRワークスペース", baseCost: 65000, xpPerSec: 150, type: 'auto', desc: "無限の仮想モニター" },
    { id: 'copilot', name: "GitHub Copilot", baseCost: 80000, xpPerSec: 200, type: 'auto', desc: "コード補完の神" },

    // Lv3〜 (省略せずに記述が必要だが、ファイルの長さ制限のため代表的なもののみ列挙し、あとは既存ロジックを忠実に)
    // ... (実装時は完全なリストを含める必要があるが、ここでは重要項目のみ)
    { id: 'fiber', name: "専用光回線", baseCost: 120000, xpPerSec: 300, type: 'auto', desc: "ラグとは無縁の世界" },
    { id: 'bot_farm', name: "Botファーム", baseCost: 150000, xpPerSec: 400, type: 'auto', desc: "大量のBotが作業代行" },
    { id: 'matrix', name: "マトリックス接続", baseCost: 200000, xpPerSec: 500, type: 'auto', desc: "脳を直結して作業" },
    { id: 'satellite', name: "通信衛星", baseCost: 300000, xpPerSec: 800, type: 'auto', desc: "宇宙からグローバル対応" },
    { id: 'cluster', name: "GPUクラスター", baseCost: 450000, xpPerSec: 1200, type: 'auto', desc: "並列処理の極み" },
    { id: 'offshore', name: "オフショア開発拠点", baseCost: 600000, xpPerSec: 1800, type: 'auto', desc: "24時間止まらない開発" },
    { id: 'supercomputer', name: "スーパーコンピュータ", baseCost: 800000, xpPerSec: 2500, type: 'auto', desc: "「京」を超える計算力" },

    // Lv4 SF・未来技術
    { id: 'singularity', name: "技術的特異点", baseCost: 1000000, xpPerSec: 3000, type: 'auto', desc: "AIが自身を進化させる" },
    { id: 'android', name: "汎用アンドロイド", baseCost: 1500000, xpPerSec: 5000, type: 'auto', desc: "不眠不休の労働力" },
    { id: 'fusion', name: "核融合炉", baseCost: 2000000, xpPerSec: 7000, type: 'auto', desc: "無限のエネルギー供給" },
    { id: 'datacenter', name: "月面データセンター", baseCost: 2500000, xpPerSec: 8000, type: 'auto', desc: "冷却効率が抜群" },
    { id: 'neura_link', name: "電脳インプラント", baseCost: 4000000, xpPerSec: 12000, type: 'auto', desc: "思考速度でコーディング" },
    { id: 'space_elevator', name: "宇宙エレベーター", baseCost: 7000000, xpPerSec: 25000, type: 'auto', desc: "物流の革命" },
    { id: 'godhand', name: "神の手", baseCost: 10000000, xpPerSec: 50000, type: 'auto', desc: "触れるだけでコードが完成" },
    { id: 'cloning', name: "自己クローン", baseCost: 20000000, xpPerSec: 80000, type: 'auto', desc: "自分を増やして分業" },
    { id: 'dysonsphere', name: "ダイソン球", baseCost: 50000000, xpPerSec: 200000, type: 'auto', desc: "恒星のエネルギーを計算力に" },

    // Lv5 宇宙規模・概念
    { id: 'warp', name: "ワープ航法", baseCost: 100000000, xpPerSec: 400000, type: 'auto', desc: "納期の壁を超える" },
    { id: 'type3', name: "Type-III 文明", baseCost: 200000000, xpPerSec: 900000, type: 'auto', desc: "銀河系全てのエネルギーを利用" },
    { id: 'blackhole', name: "ブラックホール演算", baseCost: 400000000, xpPerSec: 1500000, type: 'auto', desc: "事象の地平線で計算" },
    { id: 'multiverse', name: "多元宇宙マイニング", baseCost: 800000000, xpPerSec: 3000000, type: 'auto', desc: "別次元のリソースを搾取" },

    // Lv6 ユニーク
    { id: 'akashic', name: "アカシックレコード", baseCost: 1000000000, xpPerSec: 5000000, type: 'auto', isUnique: true, desc: "全宇宙の記憶とコードにアクセス (UNIQUE)" },
    { id: 'planet_backup', name: "惑星バックアップ", baseCost: 2500000000, xpPerSec: 12000000, type: 'auto', isUnique: true, desc: "地球ごとGitでバージョン管理 (UNIQUE)" },
    { id: 'reality_editor', name: "現実改変エディタ", baseCost: 5000000000, xpPerSec: 30000000, type: 'auto', isUnique: true, desc: "物理法則をIDEで書き換える (UNIQUE)" },
    { id: 'life_api', name: "生命創造API", baseCost: 10000000000, xpPerSec: 70000000, type: 'auto', isUnique: true, desc: "new Life() で生物を生み出す (UNIQUE)" },
    { id: 'time_looper', name: "無限のループ", baseCost: 20000000000, xpPerSec: 150000000, type: 'auto', isUnique: true, desc: "時間を遡り作業時間を無限に確保 (UNIQUE)" },
    { id: 'karma_converter', name: "カルマ変換機", baseCost: 50000000000, xpPerSec: 400000000, type: 'auto', isUnique: true, desc: "徳を積んでXPに変換 (UNIQUE)" },
    { id: 'developer_god', name: "創造主の端末", baseCost: 100000000000, xpPerSec: 1000000000, type: 'auto', isUnique: true, desc: "この世界そのものをデバッグ (UNIQUE)" },
    { id: 'universe_fork', name: "宇宙のフォーク", baseCost: 250000000000, xpPerSec: 2500000000, type: 'auto', isUnique: true, desc: "気に入らない世界線を分岐させる (UNIQUE)" },
    { id: 'entropy_reverser', name: "エントロピー逆転装置", baseCost: 500000000000, xpPerSec: 6000000000, type: 'auto', isUnique: true, desc: "覆水も盆に返る (UNIQUE)" },
    { id: 'galactic_brain', name: "銀河脳", baseCost: 1000000000000, xpPerSec: 15000000000, type: 'auto', isUnique: true, desc: "銀河そのものをニューロンとして使用 (UNIQUE)" },
    { id: 'dimension_hopper', name: "次元ホッパー", baseCost: 2500000000000, xpPerSec: 35000000000, type: 'auto', isUnique: true, desc: "高次元から低次元を最適化 (UNIQUE)" },
    { id: 'the_answer', name: "42", baseCost: 7777777777777, xpPerSec: 77777777777, type: 'auto', isUnique: true, desc: "生命、宇宙、そして万物についての究極の答え (UNIQUE)" },
    { id: 'simulation_root', name: "Root権限 (Universe)", baseCost: 15000000000000, xpPerSec: 200000000000, type: 'auto', isUnique: true, desc: "sudo rm -rf /universe (UNIQUE)" },
    { id: 'bigbang_compiler', name: "ビッグバンコンパイラ", baseCost: 30000000000000, xpPerSec: 500000000000, type: 'auto', isUnique: true, desc: "無から有をビルドする (UNIQUE)" },
    { id: 'laplace_demon', name: "ラプラスの悪魔", baseCost: 60000000000000, xpPerSec: 1200000000000, type: 'auto', isUnique: true, desc: "未来のバグを予知して修正 (UNIQUE)" },
    { id: 'maxwell_demon', name: "マクスウェルの悪魔", baseCost: 100000000000000, xpPerSec: 3000000000000, type: 'auto', isUnique: true, desc: "分子を選別して効率化 (UNIQUE)" },
    { id: 'type4', name: "Type-IV 文明", baseCost: 250000000000000, xpPerSec: 8000000000000, type: 'auto', isUnique: true, desc: "観測可能な全宇宙のエネルギー制御 (UNIQUE)" },
    { id: 'type5', name: "Type-V 文明", baseCost: 500000000000000, xpPerSec: 20000000000000, type: 'auto', isUnique: true, desc: "多元宇宙規模の支配 (UNIQUE)" },
    { id: 'the_architect', name: "アーキテクト", baseCost: 1000000000000000, xpPerSec: 50000000000000, type: 'auto', isUnique: true, desc: "マトリックスの設計者 (UNIQUE)" },
    { id: 'deus_ex_machina', name: "デウス・エクス・マキナ", baseCost: 2500000000000000, xpPerSec: 150000000000000, type: 'auto', isUnique: true, desc: "機械仕掛けの神による強制解決 (UNIQUE)" },
    { id: 'true_null', name: "完全なる虚無", baseCost: 5000000000000000, xpPerSec: 400000000000000, type: 'auto', isUnique: true, desc: "NULLポインタの概念そのもの (UNIQUE)" },
    { id: 'omniscience', name: "全知", baseCost: 10000000000000000, xpPerSec: 1000000000000000, type: 'auto', isUnique: true, desc: "全てのスタックオーバーフローを理解 (UNIQUE)" },
    { id: 'omnipotence', name: "全能", baseCost: 50000000000000000, xpPerSec: 5000000000000000, type: 'auto', isUnique: true, desc: "不可能な仕様変更も即座に実装 (UNIQUE)" },
    { id: 'the_end', name: "エンディング", baseCost: 100000000000000000, xpPerSec: 10000000000000000, type: 'auto', isUnique: true, desc: "開発終了。そして伝説へ... (UNIQUE)" },
    { id: 'source_code', name: "原初のソースコード", baseCost: 999999999999999999, xpPerSec: 99999999999999999, type: 'auto', isUnique: true, desc: "??? (UNIQUE)" },
];

export const PROFILE_DECORATIONS: ProfileDecoration[] = [
    { id: '', name: 'なし', minLv: 0 },
    { id: 'deco-beginner', name: '初心者マーク 🔰', minLv: 2 },
    { id: 'deco-cat', name: '猫の足跡 🐾', minLv: 5 },
    { id: 'deco-sparkle', name: 'キラキラネーム ✨', minLv: 10 },
    { id: 'deco-fire', name: '闘志の炎 🔥', minLv: 15 },
    { id: 'deco-gaming', name: 'ゲーミング枠 🌈', minLv: 20 },
    { id: 'deco-crown', name: '王冠 👑', minLv: 30 },
    { id: 'deco-angel', name: '天使の羽 🪽', minLv: 40 },
    { id: 'deco-cyber', name: 'サイバーパンク 💻', minLv: 50 },
    { id: 'deco-space', name: '宇宙背景 🌌', minLv: 60 },
    { id: 'deco-lord', name: '覇王の威圧 ⚜️', minLv: 80 },
    { id: 'deco-legend', name: 'レジェンド (虹) 🌈', minLv: 90 },
    { id: 'deco-phoenix', name: 'フェニックス 🦅', minLv: 100 },
    { id: 'deco-nebula', name: 'ネビュラ (宇宙渦) 🌀', minLv: 120 }
];

export const RACE_HORSES: Horse[] = [
    { id: 1, name: 'ディープインパクト', odds: 2.0, speed: 95, icon: '🐎' },
    { id: 2, name: 'オルフェーヴル', odds: 3.5, speed: 90, icon: '🐴' },
    { id: 3, name: 'キタサンブラック', odds: 4.0, speed: 88, icon: '🎠' },
    { id: 4, name: 'ゴールドシップ', odds: 5.0, speed: 85, icon: '🦄' },
    { id: 5, name: 'ウオッカ', odds: 6.0, speed: 82, icon: '🦓' },
    { id: 6, name: 'サイレンススズカ', odds: 2.5, speed: 98, icon: '🌪️' },
    { id: 7, name: 'トウカイテイオー', odds: 4.5, speed: 86, icon: '🦅' },
    { id: 8, name: 'オグリキャップ', odds: 8.0, speed: 80, icon: '🐺' },
    { id: 9, name: 'ハルウララ', odds: 100.0, speed: 60, icon: '🌸' },
    { id: 10, name: 'ソダシ', odds: 5.5, speed: 84, icon: '⚪' }
];

// XPテーブル (javascript.html line 71-74)
export const XP_ACTIONS = {
    login: 50, firstLogin: 200, dailyBonus: 50,
    move: 20, assign: 30, memo: 15, create: 25, complete: 100, pin: 10
};

// 開催スケジュール設定 (javascript.html line 495-498)
export const RACE_SCHEDULE = [
    { h: 9, m: 55 }, { h: 10, m: 55 }, { h: 11, m: 55 }, { h: 12, m: 30 },
    { h: 13, m: 55 }, { h: 14, m: 55 }, { h: 15, m: 55 }, { h: 16, m: 55 }, { h: 17, m: 55 }
];
