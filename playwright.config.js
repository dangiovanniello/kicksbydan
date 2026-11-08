import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:90000,expect:{timeout:20000},use:{baseURL:'http://127.0.0.1:5174',launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']}}});
