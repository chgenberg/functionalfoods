/*
 * Import customers from public/cutomer_2025.xlsx
 * - Creates or updates users
 * - Sets temporary password and mustChangePassword=true
 * - Stores name and address fields if present
 */

import path from 'path';
import xlsx from 'xlsx';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { createResetToken } from '../app/lib/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

function toStringSafe(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

async function upsertUser(row) {
  const email = toStringSafe(
    row.email || row.Email || row.Epost || row.Mail || row['E-post']
  );
  if (!email || !email.includes('@')) return { skipped: true, reason: 'missing_email' };

  const name = toStringSafe(row.name || row.Namn || row.Fullname || `${row.fornamn || ''} ${row.efternamn || ''}`.trim());

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: name || null,
      password: hashedPassword,
      mustChangePassword: true
    },
    update: {
      name: name || undefined,
      password: hashedPassword,
      mustChangePassword: true
    }
  });

  const token = await createResetToken(user.id);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ulrika-functional-foods-production.up.railway.app';
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  return { user, tempPassword, resetUrl };
}

async function main() {
  const filePath = path.resolve(__dirname, '..', 'public', 'cutomer_2025.xlsx');
  console.log('📄 Reading:', filePath);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet);

  console.log(`🔍 Found ${rows.length} rows`);

  const results = [];
  for (const row of rows) {
    try {
      const res = await upsertUser(row);
      if (res.skipped) {
        results.push({ email: null, status: 'skipped', reason: res.reason });
      } else {
        results.push({ email: res.user.email, name: res.user.name || '', tempPassword: res.tempPassword, resetUrl: res.resetUrl, status: 'ok' });
      }
    } catch (err) {
      results.push({ email: toStringSafe(row['E-post'] || row.Email || row.email), status: 'error', reason: err.message });
    }
  }

  // Export summary workbook
  const outSheet = xlsx.utils.json_to_sheet(results.filter(r => r.status === 'ok'));
  const outWb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(outWb, outSheet, 'Users');
  const outPath = path.resolve(__dirname, '..', 'public', 'customers_import_result.xlsx');
  xlsx.writeFile(outWb, outPath);

  console.log(`\n✅ Exported summary to: ${outPath}`);
  console.log('Columns: email, name, tempPassword, resetUrl');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



