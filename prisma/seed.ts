import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding data...')

    // Clear existing data
    try {
        await prisma.swipeLog.deleteMany()
        await prisma.event.deleteMany()
    } catch (e) {
        console.log("No data to clear or error clearing:", e)
    }

    const today = new Date()
    today.setHours(10, 0, 0, 0)

    const events = [
        {
            title: "桜島ナイトウォーク",
            descriptionShort: "溶岩なぎさ遊歩道をガイドと一緒に夜間散策。静寂に包まれた桜島の迫力を体感できるツアーです。",
            curatorNote: "観光客に大人気！対岸に見える鹿児島市街の夜景は息をのむ美しさです。",
            startAt: new Date(new Date().setDate(today.getDate() + 2)), // 2 days from now
            venueName: "桜島ビジターセンター",
            area: "桜島",
            lat: 31.5932,
            lng: 130.6010,
            priceText: "3000円",
            isFree: false,
            indoor: false,
            kidsOk: true,
            photogenic: true,
            englishSupport: true,
            status: "PUBLISHED",
            imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600",
        },
        {
            title: "鹿児島ラーメン王決定戦 2026",
            descriptionShort: "県内各地から選りすぐりの人気ラーメン店が集結。お気に入りの一杯を見つけよう！",
            curatorNote: "行列必須ですが並ぶ価値あり。全店舗食べ比べチケットがお得です。",
            startAt: new Date(new Date().setDate(today.getDate() + 1)),
            venueName: "天文館公園",
            area: "天文館",
            lat: 31.591,
            lng: 130.555,
            priceText: "入場無料 (ラーメン一杯900円)",
            isFree: true,
            indoor: false,
            foodDrink: true,
            social: true,
            kidsOk: true,
            status: "PUBLISHED",
            imageUrl: "https://images.unsplash.com/photo-1569937745353-3760e2279b37?auto=format&fit=crop&q=80&w=600",
        },
        {
            title: "薩摩切子カット体験ワークショップ",
            descriptionShort: "伝統工芸・薩摩切子のカット体験。世界に一つだけのオリジナルコースターを作れます。",
            curatorNote: "ご両親へのプレゼントや旅の思い出に。集中して作業する時間が心地よい。",
            startAt: new Date(new Date().setDate(today.getDate() + 3)),
            venueName: "磯工芸館",
            area: "磯エリア",
            lat: 31.618,
            lng: 130.575,
            priceText: "5000円",
            isFree: false,
            indoor: true,
            nearStation: false,
            parking: true,
            photogenic: true,
            status: "PUBLISHED",
            imageUrl: "https://images.unsplash.com/photo-1455132240292-1b1512411516?auto=format&fit=crop&q=80&w=600",
        },
        {
            title: "アミュ広場 フライデービアガーデン",
            descriptionShort: "駅直結の屋上で楽しむビアガーデン。鹿児島の食材を使ったBBQとお酒で乾杯。",
            curatorNote: "仕事帰りのリフレッシュに最適。18時半以降は地元の会社員で賑わいます。",
            startAt: new Date(new Date().setHours(18, 30, 0, 0)),
            venueName: "アミュプラザ鹿児島 屋上",
            area: "中央駅",
            lat: 31.583,
            lng: 130.542,
            priceText: "4000円",
            isFree: false,
            indoor: false,
            after18: true,
            nearStation: true,
            weekdayNight: true,
            foodDrink: true,
            social: true,
            status: "PUBLISHED",
            imageUrl: "https://images.unsplash.com/photo-1574565780287-3d90f23e4215?auto=format&fit=crop&q=80&w=600",
        },
        {
            title: "城山ホテル・絶景朝ヨガ",
            descriptionShort: "桜島と錦江湾を一望するテラスで、朝日を浴びながらヨガ体験。",
            curatorNote: "主婦の方や一人旅の方へ特におすすめ。最高の1日のスタートになります。",
            startAt: new Date(new Date().setHours(7, 0, 0, 0)),
            venueName: "城山ホテル鹿児島",
            area: "城山",
            lat: 31.597,
            lng: 130.551,
            priceText: "1500円",
            isFree: false,
            indoor: false,
            parking: true,
            photogenic: true,
            status: "PUBLISHED",
            imageUrl: "https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=600",
        },
        {
            title: "わくわくキッズ科学ラボ",
            descriptionShort: "スライム作りや空気砲など、楽しい科学実験にチャレンジ！5歳〜12歳対象。",
            curatorNote: "雨の日でも安心の屋内イベント。近くに授乳室やおむつ交換台も完備されています。",
            startAt: new Date(new Date().setDate(today.getDate() + 5)),
            venueName: "天文館図書館 交流スペース",
            area: "天文館",
            lat: 31.589,
            lng: 130.556,
            priceText: "無料",
            isFree: true,
            indoor: true,
            kidsOk: true,
            nursingRoom: true,
            diaperChanging: true,
            strollerOk: true,
            status: "PUBLISHED",
            imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=600",
        },
        {
            title: "黎明館企画展：島津家の歴史",
            descriptionShort: "薩摩藩島津家の700年の歴史を辿る特別展示。貴重な鎧や書状を公開。",
            curatorNote: "歴史好きなら絶対に行くべき。音声ガイド（英語対応）も充実しています。",
            startAt: new Date(new Date().setDate(today.getDate() + 4)),
            venueName: "黎明館",
            area: "市役所周辺",
            lat: 31.596,
            lng: 130.558,
            priceText: "800円 (中学生以下無料)",
            isFree: false,
            indoor: true,
            englishSupport: true,
            status: "PUBLISHED",
            imageUrl: "https://images.unsplash.com/photo-1588824147604-3694f7189115?auto=format&fit=crop&q=80&w=600",
        },
        {
            title: "ウォーターフロント週末マルシェ",
            descriptionShort: "地元の新鮮野菜やハンドメイド雑貨が並ぶ青空市場。ペット同伴OK。",
            curatorNote: "海風を感じながらの散歩にぴったり。キッチンカーも多数出店。",
            startAt: new Date(new Date().setDate(today.getDate() + 6)),
            venueName: "ウォーターフロントパーク",
            area: "ベイエリア",
            lat: 31.593,
            lng: 130.562,
            priceText: "入場無料",
            isFree: true,
            indoor: false,
            kidsOk: true,
            strollerOk: true,
            parking: true,
            status: "PUBLISHED",
            imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=600",
        },
        {
            title: "【シークレット】隠れ家ジャズ・ナイト",
            descriptionShort: "看板のない地下のバーで開催されるジャズセッション。",
            curatorNote: "偶然見つけた人だけの特別な夜。大人のデートに最適です。",
            startAt: new Date(new Date().setHours(21, 0, 0, 0)),
            venueName: "Jazz Spot Lileth",
            area: "天文館",
            lat: 31.588,
            lng: 130.554,
            priceText: "2500円 + ドリンク",
            isFree: false,
            indoor: true,
            after18: true,
            weekdayNight: true,
            wildcard: true,
            status: "PUBLISHED",
            imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=600",
        }
    ]

    for (const evt of events) {
        await prisma.event.create({
            data: evt
        })
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
