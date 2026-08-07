-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "heroProductId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SiteSettings_heroProductId_fkey" FOREIGN KEY ("heroProductId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
