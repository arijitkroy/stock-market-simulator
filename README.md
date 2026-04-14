# StockSim Pro: Advanced Financial Trading Terminal

StockSim Pro is a production-grade, real-time stock market simulation platform designed for high-fidelity trading practice. It provides users with a professional-grade environment to track global equities, execute trades with virtual capital, and monitor portfolio performance through sophisticated data visualization.

## Core Features

### 1. Real-Time Market Intelligence
Utilizes direct integration with global financial data providers to deliver live price updates and historical performance charts. The terminal supports a wide range of assets including US Equities, Indian Equities (NSE), and Cryptocurrencies.

### 2. Integrated Portfolio Management
Comprehensive dashboard providing a real-time overview of net worth, cash liquidity, and active asset allocations. Features include:
- Real-time Profit and Loss (P/L) tracking.
- Average cost basis calculation per holding.
- Performance color-coding for rapid visual assessment of market positions.

### 3. High-Efficiency Trading Interface
A specialized trading terminal optimized for rapid execution:
- Interactive historical charts powered by Recharts.
- Robust search engine for identifying global symbols.
- Quick Sell functionality allowing users to liquidate positions directly from the dashboard.
- Virtual capital management starting with a default liquidity of ₹1,00,000.

### 4. Enterprise-Grade Security
Implemented with Firebase Authentication for secure, persistent user sessions. The platform utilizes Google OAuth for frictionless onboarding while maintaining backend security through Firebase Admin SDK verification.

## Technology Stack

### Frontend
- **Framework**: Next.js (Pages Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Visualization**: Recharts

### Backend & Infrastructure
- **Server**: Next.js API Routes (Node.js)
- **Authentication**: Firebase Auth (Google OAuth 2.0)
- **Database**: Firebase Firestore
- **Data Source**: Yahoo Finance Reference API

## Deployment

This platform is optimized for deployment on Vercel. 

### Live Application
[Insert Vercel Deployment Link Here]

## Technical Architecture

The application is structured for scalability and low-latency interaction:
- **Global Layout**: Handled in `_app.js` with persistent Navigation and Footer components.
- **Middleware**: API requests are protected by a verification layer in `lib/auth.js`.
- **Market Interface**: Real-time logic consolidated in `lib/market.js` to abstract provider complexities.
- **Responsive Design**: Mobile-first architecture ensuring full terminal functionality across all device form factors.