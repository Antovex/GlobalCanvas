-- CreateTable
CREATE TABLE "supplies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "supplies_pkey" PRIMARY KEY ("id")
);
