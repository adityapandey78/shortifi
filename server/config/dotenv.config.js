import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Resolve the current file path and directory (ES module compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the .env file located one level above this file
dotenv.config({ path: join(__dirname, '..', '.env') });

// Indicate that dotenv initialization completed
console.log('dotenv loaded');
