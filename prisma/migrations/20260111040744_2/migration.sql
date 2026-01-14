/*
  Warnings:

  - The primary key for the `_ProfilePermissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_ProfilePermissions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_ProfilePermissions" DROP CONSTRAINT "_ProfilePermissions_AB_pkey";

-- CreateTable
CREATE TABLE "DaysOfMedicalCare" (
    "id" UUID NOT NULL,
    "doctorId" UUID NOT NULL,
    "serviceDayId" UUID NOT NULL,

    CONSTRAINT "DaysOfMedicalCare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceDays" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "ServiceDays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Especiality_admin" (
    "id" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "especialityId" UUID NOT NULL,

    CONSTRAINT "Especiality_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Especiality" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '---',
    "description" TEXT,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Especiality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" UUID NOT NULL,
    "fisrtName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDay" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "identityNumber" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scheduling" (
    "id" UUID NOT NULL,
    "hours" TEXT NOT NULL,
    "patientId" UUID NOT NULL,
    "doctorId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "observation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "Scheduling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" UUID NOT NULL,
    "schedulingId" UUID NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalHistory" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "consultationId" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicines" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "consultationId" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exames" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "file" TEXT,
    "consultationId" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Exames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "doctorId" UUID,
    "consultationId" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "identityNumber" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "supplierId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Especiality_name_key" ON "Especiality"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_identityNumber_key" ON "Patient"("identityNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_phone_key" ON "Patient"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_schedulingId_key" ON "Consultation"("schedulingId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalHistory_consultationId_key" ON "MedicalHistory"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "Medicines_consultationId_key" ON "Medicines"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "Exames_consultationId_key" ON "Exames"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_consultationId_key" ON "Procedure"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_email_key" ON "Supplier"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_identityNumber_key" ON "Supplier"("identityNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_phone_key" ON "Supplier"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "_ProfilePermissions_AB_unique" ON "_ProfilePermissions"("A", "B");

-- AddForeignKey
ALTER TABLE "DaysOfMedicalCare" ADD CONSTRAINT "DaysOfMedicalCare_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DaysOfMedicalCare" ADD CONSTRAINT "DaysOfMedicalCare_serviceDayId_fkey" FOREIGN KEY ("serviceDayId") REFERENCES "ServiceDays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Especiality_admin" ADD CONSTRAINT "Especiality_admin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Especiality_admin" ADD CONSTRAINT "Especiality_admin_especialityId_fkey" FOREIGN KEY ("especialityId") REFERENCES "Especiality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scheduling" ADD CONSTRAINT "Scheduling_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scheduling" ADD CONSTRAINT "Scheduling_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_schedulingId_fkey" FOREIGN KEY ("schedulingId") REFERENCES "Scheduling"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalHistory" ADD CONSTRAINT "MedicalHistory_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicines" ADD CONSTRAINT "Medicines_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exames" ADD CONSTRAINT "Exames_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
