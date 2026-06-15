-- CreateTable
CREATE TABLE "PredictionRecord" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "group" TEXT,
    "stage" TEXT,
    "predictedHomeWin" DOUBLE PRECISION NOT NULL,
    "predictedDraw" DOUBLE PRECISION NOT NULL,
    "predictedAwayWin" DOUBLE PRECISION NOT NULL,
    "predictedHomeScore" INTEGER NOT NULL,
    "predictedAwayScore" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "confidenceLabel" TEXT NOT NULL,
    "recommendationLabel" TEXT NOT NULL,
    "recommendationReason" TEXT,
    "scorePredictionsJson" TEXT,
    "keyFactorsJson" TEXT,
    "riskFactorsJson" TEXT,
    "narrativeSummary" TEXT,
    "ensembleRuns" INTEGER NOT NULL DEFAULT 3,
    "voteAgreement" INTEGER,
    "actualHomeScore" INTEGER,
    "actualAwayScore" INTEGER,
    "actualResult" TEXT,
    "resultUpdatedAt" TIMESTAMP(3),
    "resultCorrect" BOOLEAN,
    "scoreCorrect" BOOLEAN,
    "scoreDiff" INTEGER,
    "accuracyScore" DOUBLE PRECISION,
    "isRisky" BOOLEAN NOT NULL DEFAULT false,
    "riskNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "predictionId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchStatus" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "MatchStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PredictionRecord_matchId_idx" ON "PredictionRecord"("matchId");

-- CreateIndex
CREATE INDEX "PredictionRecord_userId_idx" ON "PredictionRecord"("userId");

-- CreateIndex
CREATE INDEX "PredictionRecord_createdAt_idx" ON "PredictionRecord"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_matchId_idx" ON "Comment"("matchId");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MatchStatus_matchId_key" ON "MatchStatus"("matchId");

-- AddForeignKey
ALTER TABLE "PredictionRecord" ADD CONSTRAINT "PredictionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "PredictionRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
