# SmartGuard - Camera Surveillance System

## Overview

SmartGuard is a modern camera surveillance system built with React and Express that provides real-time video monitoring, AI-powered detection, and live analytics. The application features a responsive dashboard for monitoring multiple cameras, detecting people and vehicles, and providing real-time alerts through WebSocket connections.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Real-time Communication**: WebSocket connection for live updates

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Build Tool**: Vite for development and esbuild for production
- **Session Management**: PostgreSQL-based session storage
- **Real-time Features**: WebSocket server for live camera feeds and alerts

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle migrations with schema validation
- **In-Memory Storage**: Fallback storage implementation for development

## Key Components

### Frontend Components
- **Dashboard**: Main surveillance interface with camera grid and metrics
- **Camera Monitoring**: Live video feed with AI detection overlays
- **Metrics Cards**: Real-time statistics for cameras, detections, and alerts
- **Analytics Dashboard**: Charts and graphs for detection trends
- **Recent Alerts**: Live alert feed with timestamp and severity

### Backend Services
- **WebSocket Server**: Real-time communication for camera feeds and system updates
- **Storage Layer**: Abstract storage interface with memory and database implementations
- **Route Handlers**: API endpoints for camera management and data retrieval

### Camera System Features
- **Live Video Streaming**: Real-time camera feed access
- **COCO-SSD AI Detection**: TensorFlow.js-powered object detection for persons and vehicles
- **Real-time Processing**: 1 FPS analysis with confidence scores and bounding boxes
- **Alert System**: Real-time notifications for security events
- **Multi-Camera Support**: Grid view for multiple camera feeds
- **Recording Controls**: Start/stop recording functionality
- **Fallback Detection**: Simulation mode when YOLO model unavailable

## Data Flow

1. **Camera Feed**: Browser accesses device camera → Canvas processing → AI detection
2. **Detection Processing**: AI analysis → Bounding boxes → Detection counts
3. **Real-time Updates**: WebSocket broadcasts → Dashboard updates → Live metrics
4. **Alert Generation**: Detection events → Alert system → Real-time notifications
5. **Data Persistence**: Detection logs → Database storage → Analytics dashboard

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **ws**: WebSocket library for real-time communication
- **connect-pg-simple**: PostgreSQL session store

### AI Dependencies
- **@tensorflow/tfjs**: TensorFlow.js for client-side machine learning
- **@tensorflow/tfjs-backend-webgl**: WebGL backend for GPU acceleration
- **@tensorflow/tfjs-converter**: Model conversion utilities
- **@tensorflow-models/coco-ssd**: COCO-SSD object detection model

### UI Dependencies
- **@radix-ui/react-***: Comprehensive UI component library
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library for UI elements
- **class-variance-authority**: Type-safe variant styling

### Development Dependencies
- **vite**: Modern build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Neon serverless PostgreSQL
- **WebSocket**: Development WebSocket server

### Production Build
- **Frontend**: Vite build → Static assets in `dist/public`
- **Backend**: esbuild bundle → Single Node.js file in `dist`
- **Database**: Drizzle migrations → Production schema
- **Deployment**: Single process serving both frontend and API

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment flag (development/production)
- **Session Storage**: PostgreSQL-based session management

## Changelog

Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Integrated COCO-SSD object detection using TensorFlow.js with fallback mode

## User Preferences

Preferred communication style: Simple, everyday language.