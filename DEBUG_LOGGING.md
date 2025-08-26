# Debug Logging System

This document describes the comprehensive debug logging system added to SocialAffluence for improved bug identification and troubleshooting.

## Overview

The debug logging system provides structured, configurable logging across the entire application with minimal performance impact. It includes context-aware logging, component filtering, and environment-based controls.

## Features

- **Centralized logging utility** with singleton pattern
- **Environment-based controls** (development vs production)
- **Component-specific filtering** to focus on specific areas
- **Multiple log levels** (ERROR, WARN, INFO, DEBUG, TRACE)
- **Performance timing utilities** for measuring operation duration
- **Structured context** with component names, operations, and metadata
- **JSON-formatted data logging** for complex objects

## Configuration

### Environment Variables

Set these in your `.env` file:

```bash
# Enable debug logging
DEBUG=true

# Set log level (ERROR=0, WARN=1, INFO=2, DEBUG=3, TRACE=4)
LOG_LEVEL=DEBUG

# Enable specific components (comma-separated, leave empty for all)
DEBUG_COMPONENTS=useYoloDetection,CameraMonitoring,Dashboard

# Node environment
NODE_ENV=development
```

### Browser Configuration

For client-side debugging, you can also enable logging via localStorage:

```javascript
// Enable debug logging in browser console
localStorage.setItem('debug', 'true');

// Refresh the page to apply changes
```

## Components with Debug Logging

### 1. Object Detection (useYoloDetection)
- Model loading and initialization
- TensorFlow.js backend setup
- Detection processing pipeline
- Performance timing
- Error handling and fallback scenarios

### 2. Camera Monitoring (CameraMonitoring)
- Camera stream acquisition
- Video element management
- Detection cycle execution
- Detection box processing
- Error handling

### 3. Dashboard (Dashboard)
- WebSocket message handling
- Detection data aggregation
- State updates and management
- Real-time data processing

### 4. Authentication (useAuth)
- Authentication status checks
- User login/logout flows
- API communication
- Session management

### 5. Server (Server)
- HTTP request/response logging
- Route handling
- Error handling
- Server startup and configuration

## Usage Examples

### Basic Logging

```typescript
import { debugLogger, createDebugContext } from '@shared/debug-logger';

const debugContext = createDebugContext('MyComponent');

// Info level logging
debugLogger.info(debugContext, 'Component initialized', { 
  initialState: someState 
});

// Debug level logging
debugLogger.debug(debugContext, 'Processing data', { 
  inputData: data 
});

// Error logging
debugLogger.error(debugContext, 'Operation failed', { 
  error: errorObject 
});
```

### Performance Timing

```typescript
// Start timing
debugLogger.time(debugContext, 'expensiveOperation');

// ... perform operation ...

// End timing and log duration
debugLogger.timeEnd(debugContext, 'expensiveOperation');
```

### Contextual Logging

```typescript
const operationContext = { 
  ...debugContext, 
  operation: 'dataProcessing',
  userId: user.id 
};

debugLogger.debug(operationContext, 'Starting data processing', {
  inputSize: data.length,
  timestamp: new Date().toISOString()
});
```

## Log Levels

1. **ERROR (0)**: Critical errors that may break functionality
2. **WARN (1)**: Warning conditions that should be investigated
3. **INFO (2)**: General information about application flow
4. **DEBUG (3)**: Detailed information for debugging
5. **TRACE (4)**: Very detailed information including data dumps

## Log Format

Logs follow this structured format:

```
[timestamp] LEVEL [component=MyComponent operation=someOperation] Message
Data: { "key": "value" }
```

Example:
```
[2023-12-01T10:30:45.123Z] DEBUG [component=useYoloDetection operation=detectObjects] Starting object detection
Data: {
  "imageSize": { "width": 1280, "height": 720 },
  "modelState": { "isModelLoaded": true, "hasModel": true, "hasError": false }
}
```

## Best Practices

1. **Use appropriate log levels**: Reserve ERROR for actual errors, INFO for important events
2. **Include relevant context**: Add operation names, user IDs, timestamps when relevant
3. **Log data structures**: Include input/output data for debugging complex transformations
4. **Time performance-critical operations**: Use time/timeEnd for bottleneck identification
5. **Filter by component**: Use DEBUG_COMPONENTS to focus on specific areas during debugging

## Performance Considerations

- Logging is disabled in production by default
- String formatting only occurs when logging is enabled
- JSON serialization is minimal and cached when possible
- Console operations are the only I/O performed

## Troubleshooting Common Issues

### Object Detection Issues
Enable logging for `useYoloDetection` to see:
- Model loading progress
- TensorFlow.js backend initialization
- Detection processing timing
- Prediction data and transformations

### Camera Issues
Enable logging for `CameraMonitoring` to see:
- Camera permission requests
- Stream acquisition details
- Video element state
- Detection cycle execution

### Real-time Data Issues
Enable logging for `Dashboard` to see:
- WebSocket message flow
- Data aggregation steps
- State update sequences

### Authentication Issues
Enable logging for `useAuth` to see:
- API request/response details
- Authentication state changes
- Session management

## Production Usage

In production environments:
- Set `DEBUG=false` or remove the environment variable
- Logging will be automatically disabled
- No performance impact from logging operations
- Critical errors will still be logged to console

## Extending the System

To add debug logging to new components:

1. Import the debug utilities:
```typescript
import { debugLogger, createDebugContext } from '@shared/debug-logger';
```

2. Create a debug context:
```typescript
const debugContext = createDebugContext('MyNewComponent');
```

3. Add logging at key points:
```typescript
debugLogger.info(debugContext, 'Important event occurred', { data });
```

4. Update the component list in this documentation