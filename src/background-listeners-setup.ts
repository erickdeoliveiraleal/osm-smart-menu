import { idempotentMigrations } from './storage/migrations';
import browser from 'webextension-polyfill';

browser.runtime.onInstalled.addListener(idempotentMigrations);
