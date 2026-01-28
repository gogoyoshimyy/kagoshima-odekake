-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "descriptionShort" TEXT,
    "curatorNote" TEXT,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME,
    "durationMin" INTEGER,
    "venueName" TEXT NOT NULL,
    "area" TEXT,
    "address" TEXT,
    "lat" REAL,
    "lng" REAL,
    "priceText" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "indoor" BOOLEAN NOT NULL DEFAULT false,
    "kidsOk" BOOLEAN NOT NULL DEFAULT false,
    "strollerOk" BOOLEAN NOT NULL DEFAULT false,
    "nursingRoom" BOOLEAN NOT NULL DEFAULT false,
    "diaperChanging" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "after18" BOOLEAN NOT NULL DEFAULT false,
    "nearStation" BOOLEAN NOT NULL DEFAULT false,
    "foodDrink" BOOLEAN NOT NULL DEFAULT false,
    "weekdayNight" BOOLEAN NOT NULL DEFAULT false,
    "social" BOOLEAN NOT NULL DEFAULT false,
    "photogenic" BOOLEAN NOT NULL DEFAULT false,
    "discount" BOOLEAN NOT NULL DEFAULT false,
    "englishSupport" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "bookingUrl" TEXT,
    "sourceUrl" TEXT,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "wildcard" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SwipeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "anonId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SwipeLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
